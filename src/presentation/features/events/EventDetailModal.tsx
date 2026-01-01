import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faAlignLeft, faUser, faCheckCircle, faCheck, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faRegularCircle } from '@fortawesome/free-regular-svg-icons';
import { useAppSelector } from '@/presentation/hooks/redux';
import {
    Event,
    useGetEventOptionsQuery,
    useVoteOptionMutation,
    useUnvoteOptionMutation,
    useFinalizeEventMutation
} from '@/presentation/store/api/eventsApi';
import { toast } from 'react-hot-toast';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
}

export const EventDetailModal = ({ isOpen, onClose, event }: EventDetailModalProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: options, isLoading: isLoadingOptions } = useGetEventOptionsQuery(event?.id || '', {
        skip: !event || event.event_type !== 'vote'
    });

    const [voteOption, { isLoading: isVoting }] = useVoteOptionMutation();
    const [unvoteOption, { isLoading: isUnvoting }] = useUnvoteOptionMutation();
    const [finalizeEvent, { isLoading: isFinalizing }] = useFinalizeEventMutation();

    if (!event) return null;

    const isCreator = user?.id === event.created_by;
    const isVotingEvent = event.event_type === 'vote' && event.status === 'planning';

    const handleVote = async (optionId: string, hasVoted: boolean) => {
        if (!user) return;
        try {
            if (hasVoted) {
                await unvoteOption({ option_id: optionId, user_id: user.id }).unwrap();
            } else {
                await voteOption({ option_id: optionId, user_id: user.id }).unwrap();
            }
        } catch (error) {
            console.error('Failed to vote:', error);
            toast.error('Có lỗi xảy ra khi bình chọn');
        }
    };

    const handleFinalize = async (optionId: string, startTime: string, endTime: string) => {
        try {
            await finalizeEvent({
                event_id: event.id,
                start_time: startTime,
                end_time: endTime
            }).unwrap();
            toast.success('Đã chốt lịch thành công!');
            onClose();
        } catch (error) {
            console.error('Failed to finalize:', error);
            toast.error('Không thể chốt lịch');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết lịch đấu">
            <div className="space-y-6">
                <div className="border-l-4 border-tik-cyan pl-4">
                    <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold uppercase ${event.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                        event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        }`}>
                        {event.status === 'planning' ? (event.event_type === 'vote' ? 'Đang Bình Chọn' : 'Đang lên kèo') :
                            event.status === 'confirmed' ? 'Đã chốt' : 'Đã hủy'}
                    </span>
                </div>

                <div className="space-y-4 text-gray-300">
                    {!isVotingEvent ? (
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-tik-cyan mt-1" />
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Thời gian</p>
                                <p>
                                    {event.start_time ? format(new Date(event.start_time), 'EEEE, dd/MM/yyyy', { locale: vi }) : 'Chưa chốt'}
                                </p>
                                {event.start_time && event.end_time && (
                                    <p className="text-white font-bold text-lg">
                                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FontAwesomeIcon icon={faClock} className="text-tik-cyan" />
                                    Bình chọn khung giờ
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {options?.length || 0} lựa chọn
                                </span>
                            </div>

                            {isLoadingOptions ? (
                                <p className="text-sm text-gray-500">Đang tải bình chọn...</p>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {options?.map(opt => {
                                        const hasVoted = opt.votes.some(v => v.user_id === user?.id);
                                        const voteCount = opt.votes.length;

                                        return (
                                            <div key={opt.id} className={`group relative flex items-center justify-between p-3 rounded-lg border transition-all ${hasVoted ? 'bg-tik-cyan/10 border-tik-cyan' : 'bg-[#1a1a1a] border-[#333] hover:border-gray-500'}`}>
                                                <div className="flex items-center gap-3 md:gap-4 flex-1">
                                                    <button
                                                        onClick={() => handleVote(opt.id, hasVoted)}
                                                        disabled={isVoting || isUnvoting}
                                                        className={`text-2xl transition-colors ${hasVoted ? 'text-tik-cyan' : 'text-gray-600 hover:text-gray-400'}`}
                                                    >
                                                        <FontAwesomeIcon icon={hasVoted ? faCheckCircle : faRegularCircle} />
                                                    </button>

                                                    <div>
                                                        <p className="font-bold text-white text-sm md:text-base">
                                                            {format(new Date(opt.start_time), 'HH:mm')} - {format(new Date(opt.end_time), 'HH:mm')}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {format(new Date(opt.start_time), 'dd/MM/yyyy', { locale: vi })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Avatar Pile */}
                                                    <div className="flex -space-x-2">
                                                        {opt.votes.slice(0, 3).map((v, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] text-white overflow-hidden">
                                                                {/* Placeholder for avatar, would load profile if joined */}
                                                                <span className="font-bold">?</span>
                                                            </div>
                                                        ))}
                                                        {voteCount > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[8px] text-white">
                                                                +{voteCount - 3}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-8 text-center font-bold text-white">
                                                        {voteCount}
                                                    </div>

                                                    {isCreator && (
                                                        <button
                                                            onClick={() => handleFinalize(opt.id, opt.start_time, opt.end_time)}
                                                            disabled={isFinalizing}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-tik-red hover:bg-red-600 text-white p-2 rounded-md text-xs font-bold shadow-lg"
                                                            title="Chốt giờ này"
                                                        >
                                                            <FontAwesomeIcon icon={faTrophy} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {event.location && (
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-tik-red mt-1" />
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Địa điểm</p>
                                <p className="text-white">{event.location}</p>
                            </div>
                        </div>
                    )}

                    {event.description && (
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faAlignLeft} className="w-5 h-5 text-gray-500 mt-1" />
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Ghi chú</p>
                                <p className="whitespace-pre-wrap">{event.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3 pt-4 border-t border-[#333]">
                        <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Người tạo</p>
                            <p className="text-xs text-gray-500">{event.created_by}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};
