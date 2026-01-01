'use client'

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Profile } from '@/presentation/store/api/profilesApi';
import { useFinishMatchMutation } from '@/presentation/store/api/eventsApi';
import { PlayerDraggable } from './PlayerDraggable';
import { TeamDropZone } from './TeamDropZone';
import { EloInfoModal } from './EloInfoModal';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faSave, faHistory } from '@fortawesome/free-solid-svg-icons';
import { calculateEloChange } from '@/domain/utils/eloCalculator';
import { PlayerHoverCard } from './PlayerHoverCard';

interface MatchManagerProps {
    eventId: string;
    participants: Profile[];
    currentMatches: any[];
    onMatchFinished: () => void;
}

export const MatchManager = ({ eventId, participants, currentMatches, onMatchFinished }: MatchManagerProps) => {
    // ---- State ----
    const [pool, setPool] = useState<Profile[]>([]);
    const [teamA, setTeamA] = useState<Profile[]>([]);
    const [teamB, setTeamB] = useState<Profile[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activePlayer, setActivePlayer] = useState<Profile | null>(null);

    // Form Stats
    const [scoreA, setScoreA] = useState<number>(0);
    const [scoreB, setScoreB] = useState<number>(0);
    const [setScores, setSetScores] = useState<string>('');
    const [showEloInfo, setShowEloInfo] = useState(false);

    // API
    const [finishMatch, { isLoading: isSubmitting }] = useFinishMatchMutation();

    // Refs for safe access inside effects without triggering re-renders
    const teamARef = React.useRef(teamA);
    const teamBRef = React.useRef(teamB);
    const poolRef = React.useRef(pool);

    useEffect(() => {
        teamARef.current = teamA;
        teamBRef.current = teamB;
        poolRef.current = pool;
    }, [teamA, teamB, pool]);

    // Smart Sync: Update player data and handle new joiners
    useEffect(() => {
        if (!participants || participants.length === 0) return;

        const newMap = new Map(participants.map(p => [p.id, p]));

        // 1. Update existing players in all lists with new data
        setTeamA(prev => prev.map(p => newMap.get(p.id) || p));
        setTeamB(prev => prev.map(p => newMap.get(p.id) || p));

        // 2. Re-calculate Pool to include new joiners and update existing
        // We use Refs to check current state of Teams to avoid adding team members back to pool
        setPool(prev => {
            const currentTeamAIds = new Set(teamARef.current.map(p => p.id));
            const currentTeamBIds = new Set(teamBRef.current.map(p => p.id));

            // Filter participants:
            // - If in Pool (prev), update data.
            // - If NOT in Pool AND NOT in Team A AND NOT in Team B -> New Joiner -> Add to Pool.
            // - If in Pool but no longer in Participants -> Remove (left event).

            return participants.filter(p => {
                // Keep if not in teams
                return !currentTeamAIds.has(p.id) && !currentTeamBIds.has(p.id);
            });
        });

    }, [participants]);

    // ---- DnD Sensors ----
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // ---- Handlers ----
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActivePlayer(active.data.current?.player);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: Pre-sort or visualized placement logic could go here
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActivePlayer(null);

        if (!over) return;

        const playerId = active.id as string;
        const targetContainer = over.id as string; // 'pool', 'team_a', 'team_b'

        // Helper to find and remove player from any list
        const removePlayer = (pid: string) => {
            setPool(prev => prev.filter(p => p.id !== pid));
            setTeamA(prev => prev.filter(p => p.id !== pid));
            setTeamB(prev => prev.filter(p => p.id !== pid));
        };

        const player = active.data.current?.player as Profile;
        if (!player) return;

        // Optimistic Update
        removePlayer(playerId);

        if (targetContainer === 'team_a') setTeamA(prev => [...prev, player]);
        else if (targetContainer === 'team_b') setTeamB(prev => [...prev, player]);
        else setPool(prev => [...prev, player]); // Default to pool
    };

    const handleSaveMatch = async () => {
        if (teamA.length === 0 || teamB.length === 0) {
            toast.error('Vui lòng xếp đủ người 2 đội!');
            return;
        }

        const teamAElo = teamA.reduce((acc, p) => acc + p.rank_score, 0) / teamA.length;
        const teamBElo = teamB.reduce((acc, p) => acc + p.rank_score, 0) / teamB.length;
        const resultA = scoreA > scoreB ? 1 : scoreA < scoreB ? 0 : 0.5;
        const eloChange = calculateEloChange(teamAElo, teamBElo, resultA as any);

        try {
            await finishMatch({
                event_id: eventId,
                team_a: teamA.map(p => p.id),
                team_b: teamB.map(p => p.id),
                score_a: scoreA,
                score_b: scoreB,
                elo_change: Math.abs(eloChange),
                set_scores: setScores
            }).unwrap();

            toast.success('Đã lưu kết quả!');

            // Reset for next match (Scores only)
            setScoreA(0); setScoreB(0); setSetScores('');

            // Do NOT clear teams. Players stay on court for next match.
            // onMatchFinished triggers refetch, which updates `participants` prop.
            onMatchFinished();
        } catch (err) {
            toast.error('Lỗi khi lưu kết quả');
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                {/* LEFT: Player Pool */}
                <div className="lg:col-span-1 bg-[#202020] rounded-xl p-4 border border-[#333] flex flex-col h-full overflow-hidden">
                    <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                        <span>Kho Cầu Thủ</span>
                        <span className="bg-[#333] px-2 py-0.5 rounded text-xs text-gray-400">{pool.length}</span>
                    </h3>
                    <TeamDropZone id="pool" title="" players={pool} bgClass="bg-transparent" disableHover={!!activeId} />
                </div>

                {/* CENTER: Match Court */}
                <div className="lg:col-span-2 flex flex-col gap-2 min-h-0">
                    {/* Court Area */}
                    <div className="flex-grow bg-[#151515] rounded-xl p-3 border border-[#333] relative overflow-hidden flex flex-col min-h-0">
                        {/* Background Decor */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none flex flex-col">
                            <div className="flex-1 border-b-2 border-white/20"></div>
                            <div className="flex-1"></div>
                            {/* Simple court markings */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2"></div>
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/10 -translate-x-1/2"></div>
                        </div>

                        <div className="relative z-10 flex flex-col h-full gap-3">
                            <div className="flex-1 flex gap-2 min-h-0">
                                <TeamDropZone id="team_a" title="TEAM A" players={teamA} disableHover={!!activeId} />
                                <div className="flex items-center justify-center">
                                    <span className="text-xl font-black text-gray-600 italic">VS</span>
                                </div>
                                <TeamDropZone id="team_b" title="TEAM B" players={teamB} disableHover={!!activeId} />
                            </div>

                            {/* Scoring Control Panel */}
                            <div className="bg-[#252525] p-2 rounded-xl border border-tik-cyan/20 shadow-lg shrink-0">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-center group active:scale-95 transition-transform">
                                        <input
                                            type="number"
                                            value={scoreA}
                                            onChange={e => setScoreA(parseInt(e.target.value) || 0)}
                                            className="w-16 h-10 bg-[#1a1a1a] text-center text-xl font-bold text-green-400 border border-green-500/30 rounded focus:ring-1 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 w-40">
                                        <input
                                            value={setScores}
                                            onChange={e => setSetScores(e.target.value)}
                                            placeholder="21-19, 15-21..."
                                            className="w-full bg-[#1a1a1a] text-[10px] text-center text-white py-1 px-2 rounded border border-[#333] focus:border-tik-cyan outline-none"
                                        />
                                        <button
                                            onClick={handleSaveMatch}
                                            disabled={isSubmitting}
                                            className="w-full py-1.5 bg-gradient-to-r from-tik-cyan to-blue-600 text-white font-bold uppercase text-[10px] rounded shadow hover:shadow-cyan-500/20 transition-all active:scale-95"
                                        >
                                            {isSubmitting ? '...' : 'Lưu'}
                                        </button>
                                    </div>
                                    <div className="text-center group active:scale-95 transition-transform">
                                        <input
                                            type="number"
                                            value={scoreB}
                                            onChange={e => setScoreB(parseInt(e.target.value) || 0)}
                                            className="w-16 h-10 bg-[#1a1a1a] text-center text-xl font-bold text-red-400 border border-red-500/30 rounded focus:ring-1 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="mt-1 text-center">
                                    <button onClick={() => setShowEloInfo(true)} className="text-[9px] text-tik-cyan hover:underline flex items-center justify-center gap-1 mx-auto opacity-70 hover:opacity-100">
                                        <FontAwesomeIcon icon={faInfoCircle} /> Tính điểm & Rank
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: History */}
                <div className="lg:col-span-1 bg-[#202020] rounded-xl p-4 border border-[#333] flex flex-col h-full overflow-hidden">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faHistory} className="text-gray-400" /> Lịch Sử Trận
                    </h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {currentMatches.map((m, idx) => (
                            <div key={idx} className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-xs">
                                <div className="flex justify-between font-bold mb-1">
                                    <span className={m.score_a > m.score_b ? 'text-green-400' : 'text-gray-400'}>{m.score_a}</span>
                                    <span className="text-gray-600">-</span>
                                    <span className={m.score_b > m.score_a ? 'text-green-400' : 'text-gray-400'}>{m.score_b}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mb-2 text-center">{m.set_scores}</div>

                                {/* Players */}
                                <div className="flex flex-col gap-1">
                                    {/* Team A */}
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        {m.team_a_ids?.map((pid: string) => {
                                            const p = participants.find(part => part.id === pid);
                                            if (!p) return null;
                                            return (
                                                <PlayerHoverCard key={pid} player={p}>
                                                    <span className="bg-[#252525] px-1.5 py-0.5 rounded text-[9px] text-gray-300 border border-[#333] cursor-help hover:border-gray-500 truncate w-[100px] block text-center">
                                                        {p.display_name}
                                                    </span>
                                                </PlayerHoverCard>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[8px] text-gray-600 text-center">VS</div>
                                    {/* Team B */}
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        {m.team_b_ids?.map((pid: string) => {
                                            const p = participants.find(part => part.id === pid);
                                            if (!p) return null;
                                            return (
                                                <PlayerHoverCard key={pid} player={p}>
                                                    <span className="bg-[#252525] px-1.5 py-0.5 rounded text-[9px] text-gray-300 border border-[#333] cursor-help hover:border-gray-500 truncate w-[100px] block text-center">
                                                        {p.display_name}
                                                    </span>
                                                </PlayerHoverCard>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="text-[9px] text-gray-600 mt-2 text-center italic border-t border-[#222] pt-1">
                                    Elo change: +/- {m.elo_change}
                                </div>
                            </div>
                        ))}
                        {currentMatches.length === 0 && (
                            <p className="text-gray-600 text-xs italic text-center mt-10">Chưa có trận đấu nào.</p>
                        )}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activePlayer ? <PlayerDraggable player={activePlayer} /> : null}
            </DragOverlay>

            <EloInfoModal isOpen={showEloInfo} onClose={() => setShowEloInfo(false)} />
        </DndContext>
    );
};
