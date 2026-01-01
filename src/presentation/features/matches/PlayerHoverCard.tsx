import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Profile } from '@/presentation/store/api/profilesApi';
import { RankBadge } from '@/presentation/components/ui/RankBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faChartLine, faMedal } from '@fortawesome/free-solid-svg-icons';

interface PlayerHoverCardProps {
    player: Profile;
    children: React.ReactNode;
    disabled?: boolean;
}

export const PlayerHoverCard = ({ player, children, disabled }: PlayerHoverCardProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (disabled) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Calculate best position (default top centered)
            setPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-block"
            >
                {children}
            </div>
            {isVisible && <TooltipContent player={player} x={position.x} y={position.y} />}
        </>
    );
};

const TooltipContent = ({ player, x, y }: { player: Profile, x: number, y: number }) => {
    // Portal to body to avoid overflow hidden
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-200"
            style={{ left: x, top: y }}
        >
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-4 w-64 mb-2 relative">
                {/* Arrow */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-b border-r border-[#333] rotate-45"></div>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-[#333] pb-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#252525] border border-[#333] flex items-center justify-center overflow-hidden">
                        {player.avatar_url ? (
                            <img src={player.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-gray-500">{player.display_name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight">{player.display_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <RankBadge tier={player.rank_tier} size="sm" className="w-4 h-4" />
                            <span className="text-tik-cyan font-mono font-bold text-xs">{player.rank_score} Elo</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#252525] p-2 rounded border border-[#333] text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1">
                            <FontAwesomeIcon icon={faTrophy} /> Rank
                        </div>
                        <div className="text-white font-bold text-xs">{player.rank_tier}</div>
                    </div>
                    {/* Placeholder stats as we might not have them in Profile yet, or just show basic info */}
                    <div className="bg-[#252525] p-2 rounded border border-[#333] text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1">
                            <FontAwesomeIcon icon={faChartLine} /> ID
                        </div>
                        <div className="text-gray-400 font-mono text-[10px] truncate max-w-full px-1">
                            #{player.id.slice(0, 8)}...
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
