'use client'

import React from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import { useGetProfileQuery, useGetMatchHistoryQuery, MatchResult } from '@/presentation/store/api/profilesApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faTrophy, faFeather, faEdit } from '@fortawesome/free-solid-svg-icons';
import { RankBadge } from '@/presentation/components/ui/RankBadge';

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const { data: profile, isLoading } = useGetProfileQuery(user?.id || '', {
        skip: !user
    });
    const { data: matches, isLoading: isLoadingMatches } = useGetMatchHistoryQuery(user?.id || '', {
        skip: !user
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Đang tải hồ sơ...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-gray-400">Không tìm thấy thông tin người dùng.</div>;
    }

    // Calculate Stats
    const totalMatches = matches?.length || 0;
    const wins = matches?.filter((m: MatchResult) => {
        const isTeamA = m.team_a_ids.includes(user?.id || '');
        return (isTeamA && m.winner_team === 'A') || (!isTeamA && m.winner_team === 'B');
    }).length || 0;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative bg-[#1a1a1a] rounded-2xl p-8 border border-[#333] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <FontAwesomeIcon icon={faFeather} className="text-9xl text-white transform rotate-45" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-tik-cyan to-tik-red">
                            <div className="w-full h-full rounded-full bg-[#121212] overflow-hidden">
                                {profile.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gray-800">
                                        {profile.display_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-[#333] p-2 rounded-full border border-gray-600 hover:bg-tik-cyan hover:text-black hover:border-tik-cyan transition-all shadow-lg">
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold text-white tracking-wide">
                            {profile.display_name}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="bg-[#252525] px-3 py-1 rounded-full text-sm text-gray-400 border border-[#333]">
                                @{user?.email?.split('@')[0]}
                            </span>
                            <div className="flex items-center gap-2 bg-[#252525] px-3 py-1 rounded-full border border-[#333]">
                                <span className="text-gray-400 text-sm">Rank:</span>
                                <RankBadge tier={profile.rank_tier || 'Unranked'} size="sm" />
                                <span className="font-bold text-tik-cyan">{profile.rank_tier || 'Unranked'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Score Card */}
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] hover:border-tik-cyan transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                            <FontAwesomeIcon icon={faTrophy} className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rank Score</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{profile.rank_score || 0}</p>
                    <p className="text-sm text-gray-500">Điểm xếp hạng</p>
                </div>

                {/* Games Played Card */}
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] hover:border-tik-red transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
                            <FontAwesomeIcon icon={faFeather} className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Matches</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{totalMatches}</p>
                    <p className="text-sm text-gray-500">Trận đã đấu (Gần đây)</p>
                </div>

                {/* Win Rate Card */}
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] hover:border-green-500 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                            <FontAwesomeIcon icon={faMedal} className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Win Rate</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{winRate}%</p>
                    <p className="text-sm text-gray-500">Tỉ lệ thắng (Gần đây)</p>
                </div>
            </div>

            {/* Recent History */}
            <div className="mt-8 bg-[#1a1a1a] rounded-2xl p-6 border border-[#333]">
                <h3 className="text-xl font-bold text-white mb-4">Lịch sử đấu gần đây</h3>
                {isLoadingMatches ? (
                    <div className="text-center py-10 text-gray-500">Đang tải lịch sử...</div>
                ) : !matches || matches.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic border-2 border-dashed border-[#333] rounded-xl">
                        Chưa có dữ liệu trận đấu
                    </div>
                ) : (
                    <div className="space-y-3">
                        {matches.map((match: MatchResult) => {
                            const isTeamA = match.team_a_ids.includes(user?.id || '');
                            const isWinner = (isTeamA && match.winner_team === 'A') || (!isTeamA && match.winner_team === 'B');
                            const eloDiff = isWinner ? `+${match.elo_change}` : `-${match.elo_change}`;

                            return (
                                <div key={match.id} className="flex items-center justify-between p-4 bg-[#202020] rounded-xl border border-[#333] hover:border-gray-500 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-12 rounded-full ${isWinner ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{match.events?.title || 'Trận đấu xếp hạng'}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(match.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Tỉ số</p>
                                            <p className="text-xl font-bold text-white tracking-widest">
                                                <span className={isTeamA ? 'text-tik-cyan' : 'text-gray-400'}>{match.score_a}</span>
                                                <span className="mx-2 text-gray-600">-</span>
                                                <span className={!isTeamA ? 'text-tik-cyan' : 'text-gray-400'}>{match.score_b}</span>
                                            </p>
                                        </div>

                                        <div className={`text-right min-w-[60px] ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                                            <p className="text-xl font-bold">{eloDiff}</p>
                                            <p className="text-[10px] uppercase font-bold">ELO</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
