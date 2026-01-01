'use client'

import React, { useMemo } from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import { useGetEventsQuery } from '@/presentation/store/api/eventsApi';
import {
    format, isToday, getHours, getMinutes, differenceInMinutes, isSameDay
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { clsx } from 'clsx';
import { Event } from '@/presentation/store/api/eventsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faUser } from '@fortawesome/free-solid-svg-icons';

interface DayViewProps {
    onEventClick?: (event: Event) => void;
    onDateClick?: (date: Date) => void;
}

export const DayView = ({ onEventClick, onDateClick }: DayViewProps) => {
    const { viewDate } = useAppSelector((state) => state.calendar);
    const { data: events } = useGetEventsQuery();
    const date = new Date(viewDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Filter events for this day
    const dayEvents = useMemo(() => {
        if (!events) return [];
        return events.filter(e => isSameDay(new Date(e.start_time), date));
    }, [events, date]);

    // Helper to position events
    const getEventStyle = (event: Event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);

        const startMinutes = getHours(start) * 60 + getMinutes(start);
        const durationMinutes = differenceInMinutes(end, start);

        return {
            top: `${(startMinutes / 1440) * 100}%`,
            height: `${Math.max((durationMinutes / 1440) * 100, 3)}%`, // Higher min-height for DayView
        };
    };

    return (
        <div className="flex flex-col h-full border border-[#2f2f2f] rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg">
            {/* Header: Current Day */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f2f2f] bg-[#1f1f1f]">
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "text-2xl font-bold w-12 h-12 rounded-xl flex items-center justify-center",
                        isToday(date) ? "bg-tik-red text-white shadow-lg shadow-tik-red/50" : "bg-[#252525] text-white"
                    )}>
                        {format(date, 'dd')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase">{format(date, 'EEEE', { locale: vi })}</h2>
                        <p className="text-gray-400 text-sm">Tháng {format(date, 'MM, yyyy')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-tik-cyan font-bold">{dayEvents.length} sự kiện</p>
                </div>
            </div>

            {/* Scrollable Time Grid */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
                <div className="grid grid-cols-[80px_1fr] min-h-[1200px]"> {/* Taller for DayView */}

                    {/* Time Column */}
                    <div className="border-r border-[#2f2f2f] bg-[#1a1a1a]">
                        {hours.map(hour => (
                            <div key={hour} className="h-[80px] text-sm text-gray-500 text-center relative -top-3 pt-2">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Day Column */}
                    <div
                        className="relative bg-[#121212]/50 hover:bg-[#1a1a1a] transition-colors"
                        onClick={() => onDateClick?.(date)}
                    >
                        {/* Hour Lines */}
                        {hours.map(hour => (
                            <div key={hour} className="h-[80px] border-b border-[#2f2f2f]/30 w-full absolute" style={{ top: `${(hour / 24) * 100}%`, height: `${(1 / 24) * 100}%` }} />
                        ))}

                        {/* Current Time Indicator (if today) */}
                        {isToday(date) && (
                            <div
                                className="absolute w-full h-[2px] bg-red-500 z-10 pointer-events-none flex items-center"
                                style={{ top: `${(getHours(new Date()) * 60 + getMinutes(new Date())) / 1440 * 100}%` }}
                            >
                                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <div className="ml-2 text-xs text-red-500 font-bold bg-[#1a1a1a] px-1 rounded">Hiện tại</div>
                            </div>
                        )}

                        {/* Events */}
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                style={getEventStyle(event)}
                                onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                                className={clsx(
                                    "absolute w-[95%] left-[2.5%] rounded-lg p-3 cursor-pointer overflow-hidden transition-all hover:z-20 hover:scale-[1.01] hover:shadow-xl border",
                                    event.status === 'confirmed' ? "bg-tik-cyan/10 border-tik-cyan text-tik-cyan shadow-[0_0_10px_rgba(0,242,234,0.1)]" :
                                        event.status === 'cancelled' ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                                            "bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-lg leading-tight">{event.title}</div>
                                    <span className={clsx("text-xs px-2 py-0.5 rounded font-bold uppercase border",
                                        event.status === 'confirmed' ? "bg-tik-cyan/20 border-tik-cyan text-tik-cyan" :
                                            event.status === 'cancelled' ? "bg-red-500/20 border-red-500 text-red-500" :
                                                "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                                    )}>
                                        {event.status === 'planning' ? 'Đang tạo' : event.status === 'confirmed' ? 'Đã Chốt' : 'Hủy'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                                    <div className="flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            <span className="truncate max-w-[200px]">{event.location}</span>
                                        </div>
                                    )}
                                </div>
                                {event.description && (
                                    <div className="mt-2 text-xs opacity-70 line-clamp-2 border-t border-white/10 pt-2">
                                        {event.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
