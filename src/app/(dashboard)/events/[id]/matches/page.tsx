'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetEventsQuery, useGetEventParticipantsQuery, useGetEventMatchesQuery } from '@/presentation/store/api/eventsApi';
import { MatchManager } from '@/presentation/features/matches/MatchManager';
import { MatchHistoryView } from '@/presentation/features/matches/MatchHistoryView';
import { useAppSelector } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MatchPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const { event } = useGetEventsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            event: data?.find(e => e.id === eventId)
        }),
    });

    const { data: participants, isLoading: isLoadingParticipants, refetch: refetchParticipants } = useGetEventParticipantsQuery(eventId);
    const { data: matches, refetch: refetchMatches } = useGetEventMatchesQuery(eventId);

    const { user } = useAppSelector(state => state.auth);

    if (!event) return <div className="p-10 text-white">Không tìm thấy sự kiện...</div>;

    const isHost = user?.id === event.created_by;

    const handleMatchFinished = () => {
        refetchMatches();
        refetchParticipants();
    };

    return (
        <div className="h-screen bg-[#121212] pt-14 px-2 pb-1 overflow-hidden flex flex-col">
            <div className="w-full h-full flex flex-col gap-1">
                {/* Header */}
                <div className="flex items-center justify-between py-1 bg-[#1a1a1a] px-2 rounded border border-[#333] shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="w-6 h-6 rounded-full bg-[#202020] text-gray-400 hover:text-white flex items-center justify-center transition-colors text-xs border border-[#333]">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <h1 className="text-xs font-bold text-white uppercase flex items-center gap-1">
                                {event.title}
                                <span className="text-gray-500 font-normal">|</span>
                                <span className="text-tik-cyan font-normal">
                                    {isHost ? 'Quản lý thi đấu' : 'Lịch sử đấu'}
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow min-h-0">
                    {isLoadingParticipants ? (
                        <div className="flex justify-center items-center h-64">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-tik-cyan text-3xl" />
                        </div>
                    ) : (
                        isHost ? (
                            <MatchManager
                                eventId={eventId}
                                participants={participants || []}
                                currentMatches={matches || []}
                                onMatchFinished={handleMatchFinished}
                            />
                        ) : (
                            <MatchHistoryView
                                matches={matches || []}
                                participants={participants || []}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
