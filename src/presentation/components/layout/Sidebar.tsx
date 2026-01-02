'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faEnvelopeOpenText,
    faCog,
    faSignOutAlt,
    faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { clsx } from 'clsx';
import { useAppDispatch } from '@/presentation/hooks/redux';
import { logoutUser } from '@/presentation/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/login');
    };

    const navItems = [
        { name: 'Lịch Thi Đấu', href: '/dashboard', icon: faCalendarAlt },
        { name: 'Lời Mời', href: '/invites', icon: faEnvelopeOpenText },
        { name: 'Bảng Xếp Hạng', href: '/leaderboard', icon: faTrophy },
        { name: 'Cài Đặt', href: '/settings', icon: faCog },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 backdrop-blur-xl bg-opacity-80">
            <div className="h-24 flex items-center justify-center border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tik-cyan/20 to-tik-red/20 border border-white/5 flex items-center justify-center p-2 shadow-lg shadow-tik-cyan/5 group-hover:scale-110 transition-transform duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/bc-logo.png" alt="BC Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-wider text-white leading-none">BADMINTON</span>
                        <span className="text-xs font-bold text-tik-cyan tracking-widest">CALENDAR</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-6">
                <ul className="space-y-2 px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === '/dashboard' && pathname?.startsWith('/events'));
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden",
                                        isActive
                                            ? "text-black bg-gradient-to-r from-tik-cyan to-blue-500 shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <FontAwesomeIcon icon={item.icon} className={clsx("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-black")} />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-tik-red hover:bg-tik-red/10 transition-all duration-300 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-tik-red/20 transition-colors">
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="font-medium text-sm">Đăng Xuất</span>
                </button>
            </div>
        </aside>
    );
};
