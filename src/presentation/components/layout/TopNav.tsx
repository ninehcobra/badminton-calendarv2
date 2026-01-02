'use client'

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import { getVietnameseTierName } from '@/presentation/components/ui/RankBadge';
import { openSidebar } from '@/presentation/store/slices/uiSlice';

import { useGetProfileQuery } from '@/presentation/store/api/profilesApi';

export const TopNav = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: profile } = useGetProfileQuery(user?.id || '', { skip: !user?.id });

    const dispatch = useAppDispatch();

    // Default to first letter of email if no metadata
    const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

    return (
        <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-30 transition-all duration-300">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={() => dispatch(openSidebar())}
                    className="md:hidden text-gray-400 hover:text-white p-2 -ml-2"
                >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                </button>

                {/* Search Bar */}
                <div className="relative w-96 hidden md:block group">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lịch, bạn bè..."
                        className="w-full bg-white/5 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-tik-cyan/50 focus:bg-white/10 transition-all placeholder-gray-500 text-sm border border-transparent focus:border-tik-cyan/30"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3 text-gray-500 w-4 h-4 group-focus-within:text-tik-cyan transition-colors" />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                <button className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group">
                    <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-tik-red rounded-full shadow-[0_0_8px_rgba(255,0,80,0.5)] animate-pulse"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-tik-cyan mt-0.5 opacity-80">
                            {getVietnameseTierName(profile?.rank_tier || 'Unranked')}
                        </p>
                    </div>
                    <Link href="/profile" className="block w-10 h-10 rounded-full bg-gradient-to-tr from-tik-cyan to-tik-red p-[2px] hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-tik-cyan/20">
                        <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden relative">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-white text-lg">{displayName[0]?.toUpperCase()}</span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};
