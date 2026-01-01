'use client'

import React from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';

export const CalendarWrapper = () => {
    const { viewMode } = useAppSelector((state) => state.calendar);

    return (
        <div className="flex flex-col h-full">
            <CalendarHeader />

            <div className="flex-1">
                {viewMode === 'month' && <MonthView />}
                {viewMode === 'week' && <div className="text-white text-center p-10">Week View Loading...</div>}
                {viewMode === 'day' && <div className="text-white text-center p-10">Day View Loading...</div>}
            </div>
        </div>
    );
};
