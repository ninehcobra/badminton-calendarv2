'use client'

import React from 'react';
import { useGetLeaderboardQuery } from '@/presentation/store/api/profilesApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faCrown } from '@fortawesome/free-solid-svg-icons';
import { getRankTier } from '@/domain/utils/eloCalculator';
import Link from 'next/link';
import { RankBadge } from '@/presentation/components/ui/RankBadge';
import { RankHelpModal } from '@/presentation/features/leaderboard/RankHelpModal';
import { useState } from 'react';

export default function LeaderboardPage() {
    const { data: profiles, isLoading } = useGetLeaderboardQuery();
    const [showHelp, setShowHelp] = useState(false);

    if (isLoading) {
        return <div className="text-center text-gray-500 p-10">Đang tải bảng xếp hạng...</div>;
    }


    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4 px-2 md:px-0">
                <div className="p-2 md:p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/50">
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-lg md:text-2xl" />
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">Bảng Xếp Hạng</h2>
                    <p className="text-xs md:text-sm text-gray-400">Top 50 Vợt Thủ Xuất Sắc Nhất</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#202020] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-colors shadow-lg hover:shadow-cyan-500/20 hover:border-tik-cyan"
                        title="Cách tính điểm"
                    >
                        <FontAwesomeIcon icon={faTrophy} className="text-[10px] md:text-xs" /> ?
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-[#1a1a1a] border border-[#333] rounded-xl md:rounded-2xl shadow-xl flex flex-col">
                <div className="overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-[#252525] sticky top-0 z-10">
                            <tr>
                                <th className="p-3 md:p-4 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-wider w-12 md:w-20 text-center">Rank</th>
                                <th className="p-3 md:p-4 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-wider">Vợt Thủ</th>
                                <th className="p-3 md:p-4 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-wider text-right whitespace-nowrap">ELO</th>
                                <th className="p-3 md:p-4 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-wider text-right w-16 md:w-auto">Tier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2f2f2f]">
                            {profiles?.map((profile, index) => {
                                const rank = index + 1;
                                const isTop1 = rank === 1;
                                const isTop2 = rank === 2;
                                const isTop3 = rank === 3;

                                const rankIcon = isTop1 ? faCrown : (isTop2 || isTop3) ? faMedal : null;
                                const rankColor = isTop1 ? 'text-yellow-500' : isTop2 ? 'text-gray-300' : isTop3 ? 'text-orange-500' : 'text-gray-500';

                                return (
                                    <tr key={profile.id} className="hover:bg-[#252525] transition-colors group">
                                        <td className="p-2 md:p-4 text-center">
                                            {rankIcon ? (
                                                <FontAwesomeIcon icon={rankIcon} className={`w-4 h-4 md:w-5 md:h-5 ${rankColor} drop-shadow-md`} />
                                            ) : (
                                                <span className="font-bold text-gray-500 text-sm md:text-lg">#{rank}</span>
                                            )}
                                        </td>
                                        <td className="p-2 md:p-4">
                                            <Link href={`/profile/${profile.id}`} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity max-w-[140px] md:max-w-none">
                                                <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full p-[2px] ${isTop1 ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gray-700'}`}>
                                                    <div className="w-full h-full rounded-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
                                                        {profile.avatar_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-white text-[10px] md:text-xs">{profile.display_name?.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-sm md:text-base truncate ${isTop1 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {profile.display_name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="p-2 md:p-4 text-right font-mono font-bold text-tik-cyan text-sm md:text-lg">
                                            {profile.rank_score}
                                        </td>
                                        <td className="p-2 md:p-4 text-right">
                                            <div className="flex justify-end transform scale-75 md:scale-100 origin-right">
                                                <RankBadge tier={profile.rank_tier || getRankTier(profile.rank_score)} size="md" />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <RankHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
