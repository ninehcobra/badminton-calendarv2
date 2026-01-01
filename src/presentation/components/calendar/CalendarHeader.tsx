'use client'

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/presentation/hooks/redux';
import { setViewDate, setViewMode, CalendarViewMode } from '@/presentation/store/slices/calendarSlice';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { clsx } from 'clsx';

export const CalendarHeader = () => {
    const dispatch = useAppDispatch();
    const { viewDate, viewMode } = useAppSelector((state) => state.calendar);
    const date = new Date(viewDate);

    const handleNext = () => {
        if (viewMode === 'month') dispatch(setViewDate(addMonths(date, 1).toISOString()));
        else if (viewMode === 'week') dispatch(setViewDate(addWeeks(date, 1).toISOString()));
        else dispatch(setViewDate(addDays(date, 1).toISOString()));
    };

    const handlePrev = () => {
        if (viewMode === 'month') dispatch(setViewDate(subMonths(date, 1).toISOString()));
        else if (viewMode === 'week') dispatch(setViewDate(subWeeks(date, 1).toISOString()));
        else dispatch(setViewDate(subDays(date, 1).toISOString()));
    };

    const handleToday = () => {
        dispatch(setViewDate(new Date().toISOString()));
    };

    const viewModes: { label: string; value: CalendarViewMode }[] = [
        { label: 'Tháng', value: 'month' },
        { label: 'Tuần', value: 'week' },
        { label: 'Ngày', value: 'day' },
    ];

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToday}
                    className="px-4 py-2 text-sm font-semibold border border-[#333] rounded-lg hover:bg-[#1f1f1f] transition-colors"
                >
                    Hôm nay
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1f1f1f] text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                    </button>
                    <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1f1f1f] text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                    {format(date, 'MMMM yyyy', { locale: vi })}
                </h2>
            </div>

            <div className="flex bg-[#1f1f1f] rounded-lg p-1">
                {viewModes.map((mode) => (
                    <button
                        key={mode.value}
                        onClick={() => dispatch(setViewMode(mode.value))}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            viewMode === mode.value
                                ? "bg-[#333] text-white shadow-sm"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
