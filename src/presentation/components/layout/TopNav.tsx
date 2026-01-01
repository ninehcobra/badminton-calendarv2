'use client'

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';

export const TopNav = () => {
    const { user } = useAppSelector((state) => state.auth);
    // Default to first letter of email if no metadata
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url;

    return (
        <header className="h-16 bg-[#121212]/80 backdrop-blur-md border-b border-[#2f2f2f] flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-40">
            {/* Search Bar - Placeholder */}
            <div className="relative w-96 hidden md:block">
                <input
                    type="text"
                    placeholder="Tìm kiếm lịch, bạn bè..."
                    className="w-full bg-[#2f2f2f] text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-tik-cyan placeholder-gray-500 text-sm"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-2.5 text-gray-500 w-4 h-4" />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-tik-red rounded-full"></span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-tik-cyan">Rank: Unranked</p>
                    </div>
                    <Link href="/profile" className="block w-10 h-10 rounded-full bg-gradient-to-tr from-tik-cyan to-tik-red p-[2px] hover:scale-105 transition-transform cursor-pointer">
                        <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-white text-lg">{displayName[0].toUpperCase()}</span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};
