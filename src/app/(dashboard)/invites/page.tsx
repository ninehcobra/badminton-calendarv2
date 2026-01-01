'use client'

import React from 'react';
import { useGetInvitesQuery, useRespondToInviteMutation } from '@/presentation/store/api/eventsApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faCalendarAlt, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

export default function InvitesPage() {
    const { data: invites, isLoading } = useGetInvitesQuery();
    const [respondToInvite, { isLoading: isResponding }] = useRespondToInviteMutation();

    const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
        try {
            await respondToInvite({ id, status }).unwrap();
            toast.success(status === 'accepted' ? 'Đã tham gia kèo!' : 'Đã từ chối lời mời');
        } catch (error) {
            console.error('Failed to respond:', error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Đang tải lời mời...</div>;
    }

    if (!invites || invites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
                <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Không có lời mời nào</h3>
                <p className="text-gray-500">Hiện tại bạn chưa nhận được lời mời tham gia lịch đấu nào.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-white mb-8">
                Lời mời tham gia <span className="text-tik-cyan">({invites.length})</span>
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {invites.map((invite) => (
                    <div
                        key={invite.id}
                        className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden hover:border-tik-cyan transition-colors group shadow-lg"
                    >
                        <div className="p-5 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-tik-cyan transition-colors truncate">
                                    {invite.events.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Mời bởi: <span className="text-gray-300">User ID: {invite.events.created_by.slice(0, 8)}...</span>
                                </p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-tik-red" />
                                    <span>
                                        {format(new Date(invite.events.start_time), 'HH:mm dd/MM', { locale: vi })}
                                    </span>
                                </div>
                                {invite.events.location && (
                                    <div className="flex items-center gap-2 truncate">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-tik-cyan" />
                                        <span className="truncate">{invite.events.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => handleRespond(invite.id, 'accepted')}
                                    disabled={isResponding}
                                    className="flex-1 bg-tik-cyan text-black py-2 rounded-lg font-bold text-sm hover:bg-[#00d8d0] transition-colors flex items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                    Tham gia
                                </button>
                                <button
                                    onClick={() => handleRespond(invite.id, 'declined')}
                                    disabled={isResponding}
                                    className="flex-1 bg-[#333] text-white py-2 rounded-lg font-bold text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 border border-transparent transition-all flex items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
