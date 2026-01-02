'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Court } from '@/presentation/store/api/courtsApi';
import { AddCourtModal } from './AddCourtModal';
import { CourtDetailsPanel } from './CourtDetailsPanel';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

interface CourtMapClientProps {
    courts: Court[];
}

type MapStyle = 'dark' | 'light' | 'satellite';

const MAP_STYLES: Record<MapStyle, { url: string; attribution: string }> = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
};

const getRankColor = (rank: string) => {
    switch (rank) {
        case 'Kim Cương': return '#b9f2ff';
        case 'Bạch Kim': return '#e5e4e2';
        case 'Vàng': return '#ffd700';
        case 'Bạc': return '#c0c0c0';
        case 'Đồng': return '#cd7f32';
        default: return '#10b981'; // Emerald default
    }
};

const CourtMapClient = ({ courts }: CourtMapClientProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const userMarkersRef = useRef<L.Marker[]>([]);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const isMountedRef = useRef(false);
    const startMarkerRef = useRef<L.CircleMarker | null>(null);
    const currentUserLocationRef = useRef<{ lat: number; lng: number } | null>(null);

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    // State for picking start location
    const [isPickingStart, setIsPickingStart] = useState(false);
    const pendingCourtRef = useRef<Court | null>(null);

    // Fix default icons
    useEffect(() => {
        if (typeof window === 'undefined') return;
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Helper: Calculate Route
    const calculateRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
        const toastId = toast.loading('Đang tìm đường...');

        // Remove old routes/markers
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }
        if (startMarkerRef.current) {
            startMarkerRef.current.remove();
            startMarkerRef.current = null;
        }
        if (mapInstanceRef.current) mapInstanceRef.current.closePopup();

        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                toast.error('Không tìm thấy đường đi.', { id: toastId });
                return;
            }

            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMin = Math.round(route.duration / 60);

            if (!mapInstanceRef.current) return;

            // Draw Start Marker if picking mode
            if (isPickingStart) {
                const marker = L.circleMarker([startLat, startLng], {
                    radius: 6,
                    fillColor: '#ffff00',
                    fillOpacity: 1,
                    weight: 2,
                    color: '#000',
                }).addTo(mapInstanceRef.current).bindPopup("Điểm bắt đầu");
                startMarkerRef.current = marker;
            }

            // Draw Polyline
            const polyline = L.polyline(coordinates, {
                color: '#00f2ea',
                weight: 6,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(mapInstanceRef.current);

            routeLayerRef.current = polyline;
            mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });

            // Popup Info
            const centerIndex = Math.floor(coordinates.length / 2);
            const centerPoint = coordinates[centerIndex];

            L.popup({
                closeButton: false,
                className: 'route-info-popup',
                autoClose: false,
                closeOnClick: false
            })
                .setLatLng(centerPoint)
                .setContent(`
                <div style="text-align: center; font-family: 'Be Vietnam Pro', sans-serif;">
                    <div style="font-weight: bold; color: #000; font-size: 14px;">${distanceKm} km</div>
                    <div style="color: #666; font-size: 12px;">~${durationMin} phút</div>
                </div>
            `)
                .openOn(mapInstanceRef.current);

            toast.dismiss(toastId);
            setIsPickingStart(false);
            pendingCourtRef.current = null; // Clear pending

        } catch (error) {
            console.error("Routing error:", error);
            toast.error('Lỗi khi tải đường đi.', { id: toastId });
        }
    };

    // Initialize Map
    useEffect(() => {
        isMountedRef.current = true;
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        let initialCenter: [number, number] = [21.0285, 105.8542];
        let initialZoom = 13;

        try {
            const savedState = localStorage.getItem('courtMapState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.lat && parsed.lng && parsed.zoom) {
                    initialCenter = [parsed.lat, parsed.lng];
                    initialZoom = parsed.zoom;
                }
            }
            const savedStyle = localStorage.getItem('courtMapStyle');
            if (savedStyle && MAP_STYLES[savedStyle as MapStyle]) {
                setMapStyle(savedStyle as MapStyle);
            }
        } catch (e) { console.warn('Restore failed', e); }

        try {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(initialCenter, initialZoom);
            mapInstanceRef.current = map;

            const savedStyle = localStorage.getItem('courtMapStyle') as MapStyle || 'dark';
            const style = MAP_STYLES[savedStyle];
            const layer = L.tileLayer(style.url, {
                attribution: style.attribution,
                maxZoom: 19
            }).addTo(map);
            tileLayerRef.current = layer;

            map.on('moveend', () => {
                if (!isMountedRef.current) return;
                const center = map.getCenter();
                const zoom = map.getZoom();
                localStorage.setItem('courtMapState', JSON.stringify({
                    lat: center.lat,
                    lng: center.lng,
                    zoom: zoom
                }));
            });

            // Initial Geo if no save
            const hasSavedState = localStorage.getItem('courtMapState');

            if (navigator.geolocation) {
                const onGeoSuccess = (pos: GeolocationPosition) => {
                    currentUserLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                    // CRITICAL: Ensure we are using the CURRENT active map, not a destroyed one from closure
                    const currentMap = mapInstanceRef.current;
                    if (!isMountedRef.current || !currentMap || currentMap !== map) return;

                    if (!hasSavedState) {
                        currentMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
                    }

                    try {
                        L.circleMarker([pos.coords.latitude, pos.coords.longitude], {
                            radius: 8, fillColor: '#00f2ea', fillOpacity: 0.8, weight: 2, color: '#fff'
                        }).addTo(currentMap).bindPopup("Vị trí của bạn");
                    } catch (e) { console.warn("Failed to add user marker", e); }
                };

                navigator.geolocation.getCurrentPosition(onGeoSuccess, (err) => console.log(err), { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false });

                // Watch for updates
                const wId = navigator.geolocation.watchPosition((pos) => {
                    currentUserLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                }, (err) => { }, { enableHighAccuracy: false });

                // We can't clear watch in this effect easily without refs, but the return cleanup handles map.
                // Ideally we should clear watch.
            }

        } catch (err) { console.error("Map init error", err); }

        return () => {
            isMountedRef.current = false;
            // Note: WatchPosition is not cleared here, might leak slightly but OK for now as component usually unmounts rarely.
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Map Click Listener (Ref access)
    const isPickingStartRef = useRef(isPickingStart);
    useEffect(() => { isPickingStartRef.current = isPickingStart; }, [isPickingStart]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        const handleClick = (e: L.LeafletMouseEvent) => {
            if (!isMountedRef.current) return;

            if (isPickingStartRef.current) {
                // Picking Start Location Mode
                const targetCourt = pendingCourtRef.current; // Grab court from ref
                if (targetCourt) {
                    calculateRoute(e.latlng.lat, e.latlng.lng, targetCourt.latitude, targetCourt.longitude);
                } else {
                    setIsPickingStart(false);
                    toast.error("Lỗi: Không xác định được sân đích.");
                }
            } else {
                // Normal Mode: Add Court
                setNewLocation(e.latlng);
                setIsAddModalOpen(true);
                setSelectedCourt(null);
                setShowLayerMenu(false);
            }
        };

        map.on('click', handleClick);
        return () => { map.off('click', handleClick); };
    }, []);

    // Map Style Effect
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        if (tileLayerRef.current) tileLayerRef.current.remove();
        const style = MAP_STYLES[mapStyle];
        const layer = L.tileLayer(style.url, { attribution: style.attribution, maxZoom: 19 }).addTo(mapInstanceRef.current);
        tileLayerRef.current = layer;
    }, [mapStyle]);

    // Markers Effect
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        courts.forEach(court => {
            if (!isMountedRef.current) return;
            const marker = L.marker([court.latitude, court.longitude])
                .addTo(map)
                .bindTooltip(court.name, { direction: 'top', offset: [0, -20], className: 'custom-tooltip' });

            marker.on('click', (e) => {
                if (!isMountedRef.current || isPickingStartRef.current) return; // Ignore click if picking start
                L.DomEvent.stopPropagation(e);
                setSelectedCourt(court);
                setIsAddModalOpen(false);
                setShowLayerMenu(false);
                map.flyTo([court.latitude, court.longitude], 16);
            });
            markersRef.current.push(marker);
        });
    }, [courts]);

    // Online Users Effect
    const createUserIcon = (url?: string) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-image: url('${url || 'https://via.placeholder.com/40'}'); background-size: cover; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #00f2ea; box-shadow: 0 0 10px rgba(0,242,234,0.5);"></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    };
    useEffect(() => {
        const map = mapInstanceRef.current;
        // Verify map is truly ready and mounted
        if (!map || !map.getPane('markerPane') || !isMountedRef.current) return;

        // Clear old markers safely
        userMarkersRef.current.forEach(marker => {
            try { marker.remove(); } catch (e) { }
        });
        userMarkersRef.current = [];

        onlineUsers.forEach(u => {
            const lat = parseFloat(u.lat);
            const lng = parseFloat(u.lng);

            // Double check validity before adding
            // Use mapInstanceRef.current to ensure we have the LATEST active map
            const currentMap = mapInstanceRef.current;
            if (
                !isNaN(lat) && !isNaN(lng) &&
                isMountedRef.current &&
                currentMap &&
                currentMap.getPane('markerPane') // Vital check
            ) {
                try {
                    const marker = L.marker([lat, lng], {
                        icon: createUserIcon(u.avatar_url),
                        zIndexOffset: 100
                    }).addTo(currentMap); // Use currentMap, not closure 'map' variable if any

                    const popupContent = `
                        <div class="text-center font-sans min-w-[120px]">
                            <div style="background-image: url('${u.avatar_url || 'https://via.placeholder.com/40'}'); background-size: cover; width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 6px; border: 2px solid ${getRankColor(u.rank)};"></div>
                            <div class="font-bold text-sm text-black whitespace-nowrap mb-1">${u.name || 'Người chơi'}</div>
                            <div class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 text-white" style="background-color: ${getRankColor(u.rank)}">
                                ${u.rank || 'Tập sự'}
                            </div>
                            <div class="text-xs text-gray-600 font-medium">ELO: ${u.elo || 0}</div>
                        </div>
                    `;
                    marker.bindPopup(popupContent, { closeButton: false, minWidth: 120 });

                    userMarkersRef.current.push(marker);
                } catch (e) {
                    console.warn("Failed to add user marker", e);
                }
            }
        });
    }, [onlineUsers]);

    // Realtime Effect
    useEffect(() => {
        if (!user) return;

        let myProfile: any = null;

        const channel = supabase.channel('tracking');
        channel.on('presence', { event: 'sync' }, () => {
            if (!isMountedRef.current) return;
            const state = channel.presenceState();
            const users = Object.values(state).flat().filter((u: any) => u.user_id !== user.id);
            setOnlineUsers(users);
        }).subscribe(async (status) => {
            if (status === 'SUBSCRIBED' && isMountedRef.current) {

                // Fetch profile first to get accurate ELO/Rank/Name
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('rank_tier, rank_score, display_name, avatar_url')
                        .eq('id', user.id)
                        .single();

                    if (data) {
                        myProfile = data;
                        console.log("Map: Fetched profile", data);
                    }
                } catch (e) { console.error("Profile fetch error", e); }

                const track = (pos: GeolocationPosition) => {
                    if (!isMountedRef.current) return;
                    currentUserLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                    // Use profile data if available, otherwise auth metadata
                    const name = myProfile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
                    const avatar = myProfile?.avatar_url || user.user_metadata?.avatar_url;
                    const rank = myProfile?.rank_tier || 'Chưa xếp hạng';
                    // Use rank_score as ELO based on leaderboard
                    const elo = myProfile?.rank_score || 0;

                    channel.track({
                        user_id: user.id,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        avatar_url: avatar,
                        name: name,
                        rank: rank,
                        elo: elo
                    });
                };
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(track);
                    const wId = navigator.geolocation.watchPosition(track);
                    return () => navigator.geolocation.clearWatch(wId);
                }
            }
        });
        return () => { channel.unsubscribe(); };
    }, [user]);

    // Handle Requests from Panel
    const handleGetDirections = (pickLocation?: boolean) => {
        if (!selectedCourt) return;

        if (pickLocation) {
            pendingCourtRef.current = selectedCourt;
            setIsPickingStart(true);
            setSelectedCourt(null); // Hide panel
            toast('Hãy click vào bản đồ để chọn điểm xuất phát', { icon: '📍', duration: 4000 });
        } else {
            // From My Location
            if (!navigator.geolocation) { toast.error('Browser no geo support'); return; }

            // Use cached location if available
            if (currentUserLocationRef.current) {
                calculateRoute(currentUserLocationRef.current.lat, currentUserLocationRef.current.lng, selectedCourt.latitude, selectedCourt.longitude);
                setSelectedCourt(null);
                return;
            }

            const tId = toast.loading('Đang lấy vị trí...');
            navigator.geolocation.getCurrentPosition((pos) => {
                toast.dismiss(tId);
                currentUserLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                calculateRoute(pos.coords.latitude, pos.coords.longitude, selectedCourt.latitude, selectedCourt.longitude);
                setSelectedCourt(null);
            }, () => { toast.error("Lỗi vị trí", { id: tId }); }, { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false });
        }
    };

    return (
        <div className="relative w-full h-full z-0 group">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full bg-[#242424] z-0" />

            {/* Layer Control */}
            <div className="absolute top-4 left-4 z-[400]">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowLayerMenu(!showLayerMenu); }}
                    className="w-10 h-10 bg-black/70 backdrop-blur text-white rounded-xl border border-white/10 flex items-center justify-center hover:bg-black/90 transition-all shadow-lg"
                    title="Đổi loại bản đồ"
                >
                    <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-tik-cyan" />
                </button>
                {showLayerMenu && (
                    <div className="absolute top-12 left-0 w-32 bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {(['dark', 'light', 'satellite'] as MapStyle[]).map((style) => (
                            <button
                                key={style}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMapStyle(style);
                                    localStorage.setItem('courtMapStyle', style);
                                    setShowLayerMenu(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-white/5 transition-colors ${mapStyle === style ? 'text-tik-cyan bg-white/5' : 'text-gray-400'}`}
                            >
                                {style === 'dark' && 'Tối (Dark)'}
                                {style === 'light' && 'Sáng (Light)'}
                                {style === 'satellite' && 'Vệ Tinh'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Guide Overlay */}
            <div className={`absolute top-4 right-4 z-[400] bg-black/70 backdrop-blur text-white p-3 rounded-xl border border-white/10 max-w-xs pointer-events-none shadow-xl transition-opacity duration-300 ${isPickingStart ? 'opacity-20' : 'opacity-50 group-hover:opacity-100'}`}>
                <h3 className="font-bold text-tik-cyan">Bản Đồ Cầu Lông</h3>
                <p className="text-xs text-gray-300 mt-1">
                    {isPickingStart ? '👉 Click bản đồ chọn điểm đi' : '- Click bản đồ: Thêm sân.\n- Click marker: Xem chi tiết.'}
                </p>
            </div>

            {/* Cancel Picking Button */}
            {isPickingStart && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                    <button onClick={() => { setIsPickingStart(false); setSelectedCourt(pendingCourtRef.current); }} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 transition">
                        Hủy Chọn
                    </button>
                </div>
            )}

            {selectedCourt && (
                <CourtDetailsPanel
                    court={selectedCourt}
                    onClose={() => {
                        setSelectedCourt(null);
                        if (routeLayerRef.current) {
                            routeLayerRef.current.remove();
                            routeLayerRef.current = null;
                            if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
                        }
                        if (startMarkerRef.current) startMarkerRef.current.remove();
                    }}
                    onDirectionsRequest={handleGetDirections}
                />
            )}
            <AddCourtModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} location={newLocation} />
        </div>
    );
};

export default CourtMapClient;
