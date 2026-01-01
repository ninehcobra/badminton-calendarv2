'use client'

import React from 'react';
import { CalendarWrapper } from '@/presentation/components/calendar/CalendarWrapper';

export default function DashboardPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex-1 w-full rounded-xl flex flex-col overflow-hidden">
                <CalendarWrapper />
            </div>
        </div>
    );
}
