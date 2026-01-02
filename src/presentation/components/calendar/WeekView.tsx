'use client'

import React, { useMemo } from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import { useGetEventsQuery } from '@/presentation/store/api/eventsApi';
import {
    startOfWeek, endOfWeek, eachDayOfInterval, format,
    isSameDay, isToday, addDays, getHours, getMinutes, differenceInMinutes,
    startOfDay, setHours
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { clsx } from 'clsx';
import { Event } from '@/presentation/store/api/eventsApi';

interface WeekViewProps {
    onEventClick?: (event: Event) => void;
    onDateClick?: (date: Date) => void;
}

export const WeekView = ({ onEventClick, onDateClick }: WeekViewProps) => {
    const { viewDate } = useAppSelector((state) => state.calendar);
    const { data: events } = useGetEventsQuery();
    const date = new Date(viewDate);

    // Calculate Week Range (Mon - Sun)
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });

    const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Filter events for this week to avoid unnecessary processing
    const weekEvents = useMemo(() => {
        if (!events) return [];
        return events.filter(e => {
            const eDate = new Date(e.start_time);
            return eDate >= startDate && eDate <= endDate;
        });
    }, [events, startDate, endDate]);

    // Helper to position events
    const getEventStyle = (event: Event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);

        const startMinutes = getHours(start) * 60 + getMinutes(start);
        const durationMinutes = differenceInMinutes(end, start);

        return {
            top: `${(startMinutes / 1440) * 100}%`,
            height: `${Math.max((durationMinutes / 1440) * 100, 2.5)}%`, // Min height for visibility
        };
    };

    return (
        <div className="flex flex-col h-full border border-[#2f2f2f] rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg">
            {/* Single Scrollable Container for both Header and Body to ensure Grid Alignment */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">

                {/* Header: Days (Sticky) */}
                <div className="grid grid-cols-8 border-b border-[#2f2f2f] bg-[#1f1f1f] sticky top-0 z-20 shadow-md">
                    <div className="p-3 text-center border-r border-[#2f2f2f] bg-[#1a1a1a]">
                        <span className="text-xs text-gray-500 font-bold">GMT+7</span>
                    </div>
                    {weekDays.map((day) => {
                        const isTodayDay = isToday(day);
                        return (
                            <div key={day.toISOString()} className="py-3 text-center border-r border-[#2f2f2f] last:border-r-0 bg-[#1f1f1f]">
                                <div className="text-xs font-semibold text-gray-400 uppercase">{format(day, 'EEE', { locale: vi })}</div>
                                <div className={clsx(
                                    "text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1",
                                    isTodayDay ? "bg-tik-red text-white shadow-lg shadow-tik-red/50" : "text-white"
                                )}>
                                    {format(day, 'dd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Grid Body */}
                <div className="grid grid-cols-8 min-h-[1000px]">

                    {/* Time Column */}
                    <div className="border-r border-[#2f2f2f] bg-[#1a1a1a]">
                        {hours.map(hour => (
                            <div key={hour} className="h-[60px] text-xs text-gray-500 text-center relative -top-2">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day) => (
                        <div key={day.toISOString()}
                            className="relative border-r border-[#333] last:border-r-0 bg-[#121212]/50 hover:bg-[#1a1a1a] transition-colors group"
                            onClick={() => onDateClick?.(day)}
                        >
                            {/* Hour Lines */}
                            {hours.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-[#2f2f2f]/30 w-full absolute" style={{ top: hour * 60 }} />
                            ))}

                            {/* Current Time Indicator (if today) */}
                            {isToday(day) && (
                                <div
                                    className="absolute w-full h-[2px] bg-red-500 z-10 pointer-events-none"
                                    style={{ top: `${(getHours(new Date()) * 60 + getMinutes(new Date())) / 1440 * 100}%` }}
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1 absolute" />
                                </div>
                            )}

                            {/* Events */}
                            {weekEvents.filter(e => isSameDay(new Date(e.start_time), day)).map(event => (
                                <div
                                    key={event.id}
                                    style={getEventStyle(event)}
                                    onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                                    className={clsx(
                                        "absolute w-[95%] left-[2.5%] rounded px-2 py-1 text-xs cursor-pointer overflow-hidden transition-all hover:z-20 hover:scale-[1.02] hover:shadow-lg",
                                        event.status === 'confirmed' ? "bg-tik-cyan/20 border-l-4 border-tik-cyan text-tik-cyan" :
                                            event.status === 'cancelled' ? "bg-red-500/20 border-l-4 border-red-500 text-red-400" :
                                                "bg-yellow-500/20 border-l-4 border-yellow-500 text-yellow-400"
                                    )}
                                >
                                    <div className="font-bold truncate">{event.title}</div>
                                    <div className="text-[10px] opacity-80">
                                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                                    </div>
                                    {event.location && <div className="text-[10px] truncate opacity-70 italic">{event.location}</div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
