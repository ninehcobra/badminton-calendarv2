'use client'

import React, { useState } from 'react';
import { useAppSelector } from '@/presentation/hooks/redux';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { CreateEventModal } from '@/presentation/features/events/CreateEventModal';
import { EventDetailModal } from '@/presentation/features/events/EventDetailModal';
import { Event } from '@/presentation/store/api/eventsApi';
import { WeekView } from './WeekView';
import { DayView } from './DayView';

export const CalendarWrapper = () => {
    const { viewMode } = useAppSelector((state) => state.calendar);

    // Create Event State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // View Event State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsCreateModalOpen(true);
    };

    const handleEventClick = (event: Event) => {
        setSelectedEventId(event.id);
        setIsDetailModalOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedDate(new Date());
        setIsCreateModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between shrink-0 px-1">
                <h2 className="text-3xl font-bold text-white">Lịch Thi Đấu</h2>
                <button
                    onClick={handleCreateClick}
                    className="px-4 py-2 bg-tik-cyan text-black font-bold rounded-lg hover:bg-[#00d8d0] transition-colors shadow-[0_0_10px_rgba(0,242,234,0.4)]"
                >
                    + Tạo Lịch Mới
                </button>
            </div>

            <CalendarHeader />



            <div className="flex-1 overflow-hidden">
                {viewMode === 'month' && (
                    <MonthView
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
                {viewMode === 'week' && (
                    <WeekView
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
                {viewMode === 'day' && (
                    <DayView
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
            </div>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                selectedDate={selectedDate}
            />

            <EventDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                eventId={selectedEventId}
            />
        </div>
    );
};
