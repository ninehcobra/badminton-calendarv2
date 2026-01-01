import React from 'react';
import { Profile } from '@/presentation/store/api/profilesApi';
import { RankBadge } from '@/presentation/components/ui/RankBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { PlayerHoverCard } from './PlayerHoverCard';

interface MatchHistoryViewProps {
    matches: any[];
    participants: Profile[];
}

export const MatchHistoryView = ({ matches, participants }: MatchHistoryViewProps) => {
    // Helper to get player details
    const getPlayer = (id: string) => participants.find(p => p.id === id);

    return (
        <div className="h-full flex flex-col gap-4 max-w-4xl mx-auto w-full p-2">
            <div className="bg-[#202020] rounded-xl p-4 border border-[#333] flex-grow flex flex-col overflow-hidden">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase text-sm border-b border-[#333] pb-2">
                    <FontAwesomeIcon icon={faHistory} className="text-tik-cyan" /> Lịch Sử Đấu ({matches.length})
                </h3>

                <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {matches.map((m, idx) => (
                        <div key={idx} className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] relative group hover:border-[#444] transition-colors">
                            {/* Match Number */}
                            <div className="absolute top-2 left-2 text-[10px] text-gray-600 font-mono">#{matches.length - idx}</div>

                            <div className="flex items-center justify-between mt-4">
                                {/* Team A */}
                                <div className="flex-1 flex flex-col gap-1 items-end">
                                    <div className="flex flex-wrap justify-end gap-1">
                                        {m.team_a_ids?.map((pid: string) => {
                                            const p = getPlayer(pid);
                                            if (!p) return null;
                                            return (
                                                <PlayerHoverCard key={pid} player={p}>
                                                    <div className="flex items-center gap-1 bg-[#252525] px-2 py-1 rounded text-[10px] text-gray-300 border border-[#333] cursor-help transition-colors hover:bg-[#333] w-[110px] justify-between">
                                                        <span className="truncate flex-1 text-left">{p.display_name}</span>
                                                        <RankBadge tier={p.rank_tier || 'Unranked'} size="sm" className="w-3 h-3 shrink-0" />
                                                    </div>
                                                </PlayerHoverCard>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="mx-4 flex flex-col items-center">
                                    <div className="flex items-center gap-3 text-xl font-black font-mono">
                                        <span className={m.score_a > m.score_b ? 'text-green-400' : 'text-gray-400'}>{m.score_a}</span>
                                        <span className="text-gray-600 text-xs">-</span>
                                        <span className={m.score_b > m.score_a ? 'text-green-400' : 'text-gray-400'}>{m.score_b}</span>
                                    </div>
                                    {m.set_scores && <div className="text-[9px] text-gray-500 mt-0.5">{m.set_scores}</div>}
                                </div>

                                {/* Team B */}
                                <div className="flex-1 flex flex-col gap-1 items-start">
                                    <div className="flex flex-wrap justify-start gap-1">
                                        {m.team_b_ids?.map((pid: string) => {
                                            const p = getPlayer(pid);
                                            if (!p) return null;
                                            return (
                                                <PlayerHoverCard key={pid} player={p}>
                                                    <div className="flex items-center gap-1 bg-[#252525] px-2 py-1 rounded text-[10px] text-gray-300 border border-[#333] cursor-help transition-colors hover:bg-[#333] w-[110px] justify-between">
                                                        <RankBadge tier={p.rank_tier || 'Unranked'} size="sm" className="w-3 h-3 shrink-0" />
                                                        <span className="truncate flex-1 text-right">{p.display_name}</span>
                                                    </div>
                                                </PlayerHoverCard>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[9px] text-gray-600 text-center mt-2 border-t border-[#222] pt-1">
                                Elo change: <span className="text-yellow-500 font-bold">+/- {m.elo_change}</span>
                            </div>
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-10">
                            <FontAwesomeIcon icon={faTrophy} className="text-gray-700 text-4xl mb-2" />
                            <p className="text-gray-500 text-xs italic">Chưa có trận đấu nào diễn ra.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
