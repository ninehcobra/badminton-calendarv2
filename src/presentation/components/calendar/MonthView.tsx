'use client'

import React from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { clsx } from 'clsx';

export const MonthView = () => {
    const { viewDate } = useAppSelector((state) => state.calendar);
    const date = new Date(viewDate);

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const days = [];
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const dayList = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const rows: Date[][] = [];
    let daysInRow: Date[] = [];

    dayList.forEach((day: Date, index: number) => {
        daysInRow.push(day);
        if ((index + 1) % 7 === 0) {
            rows.push(daysInRow);
            daysInRow = [];
        }
    });

    return (
        <div className="flex flex-col h-full border border-[#2f2f2f] rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg">
            {/* Header Days */}
            <div className="grid grid-cols-7 border-b border-[#2f2f2f] bg-[#1f1f1f]">
                {weekDays.map((dayName) => (
                    <div key={dayName} className="py-3 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-rows-5"> {/* Fixed 5 or 6 rows? Flex is safer */}
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-7 border-b border-[#2f2f2f] last:border-b-0 h-[120px] lg:h-[140px]">
                        {row.map((day, dayIndex) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isDayToday = isToday(day);
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={clsx(
                                        "relative p-2 border-r border-[#2f2f2f] last:border-r-0 transition-colors hover:bg-[#252525] group cursor-pointer",
                                        !isCurrentMonth && "bg-[#121212] text-gray-600"
                                    )}
                                >
                                    {/* Date Number */}
                                    <div className="flex justify-center">
                                        <span className={clsx(
                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mt-1",
                                            isDayToday
                                                ? "bg-tik-red text-white shadow-[0_0_10px_rgba(255,0,80,0.8)]"
                                                : "text-gray-300 group-hover:text-white"
                                        )}>
                                            {format(day, dateFormat)}
                                        </span>
                                    </div>

                                    {/* Event Slot Placeholders */}
                                    <div className="mt-2 space-y-1">
                                        {/* Example Event */}
                                        {isDayToday && (
                                            <div className="px-2 py-1 text-xs rounded bg-tik-cyan/20 border border-tik-cyan/50 text-tik-cyan truncate font-medium">
                                                Event placeholder
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Button on Hover */}
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="w-6 h-6 rounded bg-[#333] hover:bg-tik-cyan hover:text-black flex items-center justify-center text-white text-xs">
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
