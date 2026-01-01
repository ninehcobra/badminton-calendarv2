'use client'

import React from 'react';
import { CalendarWrapper } from '@/presentation/components/calendar/CalendarWrapper';

export default function DashboardPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-3xl font-bold text-white">Lịch Thi Đấu</h2>
                <button className="px-4 py-2 bg-tik-cyan text-black font-bold rounded-lg hover:bg-[#00d8d0] transition-colors shadow-[0_0_10px_rgba(0,242,234,0.4)]">
                    + Tạo Lịch Mới
                </button>
            </div>

            <div className="flex-1 w-full rounded-xl flex flex-col overflow-hidden">
                <CalendarWrapper />
            </div>
        </div>
    );
}
