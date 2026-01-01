'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faPlusSquare,
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
        // { name: 'Tạo Lịch', href: '/events/new', icon: faPlusSquare }, // Hidden as we use Modal
        { name: 'Lời Mời', href: '/invites', icon: faEnvelopeOpenText },
        { name: 'Bảng Xếp Hạng', href: '/leaderboard', icon: faTrophy },
        { name: 'Cài Đặt', href: '/settings', icon: faCog },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#121212] border-r border-[#2f2f2f] flex flex-col z-50">
            <div className="h-16 flex items-center justify-center border-b border-[#2f2f2f]">
                <h1 className="text-2xl font-bold text-tik-cyan drop-shadow-[0_0_5px_rgba(0,242,234,0.5)]">
                    Badminton
                    <span className="text-tik-red inline-block ml-1">Cal</span>
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
                                        isActive
                                            ? "text-tik-cyan bg-[#1f1f1f]"
                                            : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                                    )}
                                >
                                    <FontAwesomeIcon icon={item.icon} className={clsx("w-5 h-5", isActive && "drop-shadow-[0_0_5px_rgba(0,242,234,0.5)]")} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-[#2f2f2f]">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-tik-red hover:bg-[#1f1f1f] transition-all duration-200"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
                    <span className="font-medium">Đăng Xuất</span>
                </button>
            </div>
        </aside>
    );
};
