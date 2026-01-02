'use client'

import React from 'react';
import { CalendarWrapper } from '@/presentation/components/calendar/CalendarWrapper';

export default function DashboardPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col gap-1 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Lịch Thi Đấu</h1>
                <p className="text-gray-400 text-sm">Quản lý và theo dõi các trận đấu sắp tới của bạn.</p>
            </div>

            <div className="flex-1 w-full rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-2xl bg-[#0a0a0a]/50 backdrop-blur-sm">
                <CalendarWrapper />
            </div>
        </div>
    );
}
