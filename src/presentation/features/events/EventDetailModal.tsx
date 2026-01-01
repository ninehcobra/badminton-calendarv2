import React, { useState } from 'react';
import { RankBadge } from '@/presentation/components/ui/RankBadge';
import { Modal } from '@/presentation/components/ui/Modal';
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock, faMapMarkerAlt, faAlignLeft, faUser,
    faCheckCircle, faCheck, faTrophy, faGamepad,
    faExchangeAlt, faArrowRight, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { faCircle as faRegularCircle } from '@fortawesome/free-regular-svg-icons';
import { useAppSelector } from '@/presentation/hooks/redux';
import {
    Event,
    useGetEventOptionsQuery,
    useVoteOptionMutation,
    useUnvoteOptionMutation,
    useFinalizeEventMutation,
    useGetEventParticipantsQuery,
    useFinishMatchMutation,
    useJoinEventMutation,
    useUpdateEventMutation,
    useGetEventMatchesQuery,
    useDeleteEventMutation
} from '@/presentation/store/api/eventsApi';
import { toast } from 'react-hot-toast';
import { calculateEloChange } from '@/domain/utils/eloCalculator';
import { useEffect } from 'react';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
}

export const EventDetailModal = ({ isOpen, onClose, event }: EventDetailModalProps) => {
    const { user } = useAppSelector((state) => state.auth);

    // API Hooks
    const { data: options, isLoading: isLoadingOptions } = useGetEventOptionsQuery(event?.id || '', {
        skip: !event || event.event_type !== 'vote'
    });
    // Fetch all participants (invited & accepted) to check status? No, getEventParticipants now returns profiles.
    // We need to check if current user is in participants list.
    const { data: participants, refetch: refetchParticipants } = useGetEventParticipantsQuery(event?.id || '', {
        skip: !event
    });
    const { data: eventMatches, refetch: refetchMatches } = useGetEventMatchesQuery(event?.id || '', {
        skip: !event
    });

    // Mutations
    const [voteOption, { isLoading: isVoting }] = useVoteOptionMutation();
    const [unvoteOption, { isLoading: isUnvoting }] = useUnvoteOptionMutation();
    const [finalizeEvent, { isLoading: isFinalizing }] = useFinalizeEventMutation();
    const [finishMatch, { isLoading: isFinishing }] = useFinishMatchMutation();
    const [joinEvent, { isLoading: isJoining }] = useJoinEventMutation();
    const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
    const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

    // Local State
    const [isResultMode, setIsResultMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Match Input State
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [setScores, setSetScores] = useState(''); // e.g., "21-19, 15-21, 21-18"

    // Edit Input State
    const [editTitle, setEditTitle] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editDesc, setEditDesc] = useState('');

    useEffect(() => {
        if (event) {
            setEditTitle(event.title);
            setEditLocation(event.location || '');
            setEditDesc(event.description || '');
        }
    }, [event]);

    const isCreator = user?.id === event?.created_by;
    if (!event) return null;

    const isVotingEvent = event.event_type === 'vote' && event.status === 'planning';
    const canUpdateResult = event.status === 'confirmed' && isCreator;
    const isParticipant = participants?.some(p => p.id === user?.id);

    const handleVote = async (optionId: string, hasVoted: boolean) => { /* ... existing ... */
        if (!user) return;
        try {
            if (hasVoted) await unvoteOption({ option_id: optionId, user_id: user.id }).unwrap();
            else await voteOption({ option_id: optionId, user_id: user.id }).unwrap();
        } catch (error) { toast.error('Có lỗi xảy ra'); }
    };

    const handleFinalize = async (optionId: string, startTime: string, endTime: string) => { /* ... existing ... */
        try {
            await finalizeEvent({ event_id: event.id, start_time: startTime, end_time: endTime }).unwrap();
            toast.success('Đã chốt lịch thành công!'); onClose();
        } catch (error) { toast.error('Không thể chốt lịch'); }
    };

    const handleJoin = async () => {
        if (!user) return;
        try {
            await joinEvent({ event_id: event.id, user_id: user.id }).unwrap();
            toast.success('Đã tham gia sự kiện!');
            refetchParticipants();
        } catch (err) { toast.error('Không thể tham gia'); }
    };

    const handleUpdateEvent = async () => {
        try {
            await updateEvent({ event_id: event.id, title: editTitle, location: editLocation, description: editDesc }).unwrap();
            toast.success('Cập nhật thành công! Email đã được gửi.');
            setIsEditMode(false);
        } catch (err) { toast.error('Lỗi cập nhật'); }
    };

    // Confirm Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ... (existing code)

    const handleDeleteEvent = () => {
        setShowDeleteConfirm(true);
    };

    const onConfirmDelete = async () => {
        try {
            await deleteEvent(event.id).unwrap();
            toast.success('Đã xóa sự kiện thành công');
            setShowDeleteConfirm(false);
            onClose();
        } catch (err) {
            toast.error('Không thể xóa sự kiện');
        }
    };

    const togglePlayerTeam = (playerId: string) => { /* ... existing ... */
        if (teamA.includes(playerId)) { setTeamA(prev => prev.filter(id => id !== playerId)); setTeamB(prev => [...prev, playerId]); }
        else if (teamB.includes(playerId)) { setTeamB(prev => prev.filter(id => id !== playerId)); }
        else { setTeamA(prev => [...prev, playerId]); }
    };

    const handleFinishMatch = async () => {
        if (teamA.length === 0 || teamB.length === 0) { toast.error('Chọn thành viên 2 đội'); return; }

        const teamAElo = participants?.filter(p => teamA.includes(p.id)).reduce((acc, p) => acc + p.rank_score, 0)! / teamA.length || 1000;
        const teamBElo = participants?.filter(p => teamB.includes(p.id)).reduce((acc, p) => acc + p.rank_score, 0)! / teamB.length || 1000;
        const resultA = scoreA > scoreB ? 1 : scoreA < scoreB ? 0 : 0.5;
        const eloChange = calculateEloChange(teamAElo, teamBElo, resultA as any);

        try {
            await finishMatch({
                event_id: event.id,
                team_a: teamA,
                team_b: teamB,
                score_a: scoreA,
                score_b: scoreB,
                elo_change: eloChange > 0 ? eloChange : -eloChange,
                set_scores: setScores
            }).unwrap();

            toast.success('Đã lưu kết quả trận đấu!');
            // Reset form for next match
            setTeamA([]); setTeamB([]); setScoreA(0); setScoreB(0); setSetScores('');
            refetchMatches();
        } catch (err) { toast.error('Có lỗi xảy ra'); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Chỉnh sửa sự kiện" : "Chi tiết lịch đấu"}>
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                {/* Header */}
                <div className="border-l-4 border-tik-cyan pl-4 flex flex-col gap-2">
                    {!isEditMode ? (
                        <>
                            <h2 className="text-2xl font-bold text-white uppercase">{event.title}</h2>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${event.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500' : event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'}`}>
                                    {event.status === 'planning' ? 'Đang tạo kèo' : event.status === 'confirmed' ? 'Đã Chốt' : 'Đã Hủy'}
                                </span>
                                {isCreator && <span className="bg-blue-500/20 text-blue-400 border border-blue-500 px-2 py-1 rounded text-xs font-bold">Host</span>}
                            </div>
                        </>
                    ) : (
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-[#333] text-white p-2 rounded border border-gray-600 w-full font-bold text-xl" placeholder="Tiêu đề sự kiện" />
                    )}
                </div>

                {/* Actions Bar */}
                <div className="flex gap-2 border-b border-[#333] pb-4 flex-wrap">
                    {!isEditMode && !isResultMode && (
                        <>
                            {!isParticipant && (
                                <button onClick={handleJoin} disabled={isJoining} className="bg-tik-cyan text-black px-4 py-1.5 rounded-lg font-bold text-sm hover:shadow-[0_0_10px_rgba(0,242,234,0.4)] transition-all">
                                    {isJoining ? '...' : 'Tham Gia Ngay'}
                                </button>
                            )}
                            {isCreator && (
                                <>
                                    <button onClick={() => setIsEditMode(true)} className="bg-[#333] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#444] border border-gray-600 transition-all">
                                        <FontAwesomeIcon icon={faAlignLeft} className="mr-2" /> Sửa
                                    </button>
                                    <button onClick={handleDeleteEvent} disabled={isDeleting} className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/20 border border-red-500/50 transition-all ml-2">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </>
                            )}
                            {canUpdateResult && (
                                <button onClick={() => setIsResultMode(true)} className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all">
                                    <FontAwesomeIcon icon={faTrophy} className="mr-2" /> Quản lý Trận Đấu
                                </button>
                            )}
                        </>
                    )}
                    {isResultMode && (
                        <button onClick={() => setIsResultMode(false)} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                            <FontAwesomeIcon icon={faArrowRight} className="rotate-180" /> Quay lại
                        </button>
                    )}
                    {isEditMode && (
                        <div className="flex gap-2 ml-auto">
                            <button onClick={() => setIsEditMode(false)} className="text-gray-400 text-sm hover:text-white">Hủy</button>
                            <button onClick={handleUpdateEvent} disabled={isUpdating} className="bg-tik-cyan text-black px-4 py-1.5 rounded-lg font-bold text-sm">
                                {isUpdating ? 'Đang lưu...' : 'Lưu & Thông Báo'}
                            </button>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT AREA */}
                {isEditMode ? (
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <label className="text-gray-500 text-xs uppercase font-bold">Địa điểm</label>
                            <input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-[#252525] text-white p-2 rounded border border-[#333] mt-1" />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase font-bold">Mô tả / Ghi chú</label>
                            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-[#252525] text-white p-2 rounded border border-[#333] mt-1 h-24" />
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs italic">
                            * Không thể thay đổi thời gian khi đã tạo. Hãy hủy và tạo mới nếu cần đổi giờ.
                        </div>
                    </div>
                ) : isResultMode ? (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        {/* Existing Matches List */}
                        <div className="mt-2">
                            <h3 className="text-white font-bold mb-2 text-sm uppercase text-gray-400">Danh sách trận đấu đã xong ({eventMatches?.length || 0})</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {eventMatches?.map((m: any, idx: number) => (
                                    <div key={idx} className="bg-[#202020] p-2 rounded border border-[#333] flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-gray-500">#{eventMatches.length - idx}</span>
                                            <div className="flex gap-2 font-bold">
                                                <span className={m.score_a > m.score_b ? 'text-green-400' : 'text-white'}>{m.score_a}</span>
                                                <span className="text-gray-600">-</span>
                                                <span className={m.score_b > m.score_a ? 'text-green-400' : 'text-white'}>{m.score_b}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-tik-cyan">{m.set_scores}</span>
                                    </div>
                                ))}
                                {(!eventMatches || eventMatches.length === 0) && <p className="text-gray-600 text-xs italic">Chưa có trận nào.</p>}
                            </div>
                        </div>

                        {/* New Match Form */}
                        <div className="bg-[#252525] p-4 rounded-xl border border-tik-cyan/20">
                            <h3 className="text-tik-cyan font-bold mb-4 flex items-center gap-2 border-b border-tik-cyan/20 pb-2">
                                <FontAwesomeIcon icon={faGamepad} /> Nhập kết quả trận mới
                            </h3>
                            {/* Team Selection Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Team A */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-center text-green-400">Team A (Thắng?)</p>
                                    <input type="number" value={scoreA} onChange={e => setScoreA(parseInt(e.target.value) || 0)} className="w-full bg-[#1a1a1a] text-center text-white border border-green-500/50 rounded py-1 font-bold text-xl" />
                                    <div className="min-h-[60px] bg-[#1a1a1a] rounded p-1 border border-[#333] space-y-1">
                                        {teamA.map(id => {
                                            const p = participants?.find(prof => prof.id === id);
                                            return (
                                                <div key={id} onClick={() => togglePlayerTeam(id)} className="text-xs p-1 bg-green-500/20 text-green-200 rounded cursor-pointer flex items-center gap-1 group">
                                                    <RankBadge tier={p?.rank_tier || 'Unranked'} size="sm" className="w-4 h-4 scale-75" />
                                                    <span className="truncate">{p?.display_name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Team B */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-center text-red-400">Team B</p>
                                    <input type="number" value={scoreB} onChange={e => setScoreB(parseInt(e.target.value) || 0)} className="w-full bg-[#1a1a1a] text-center text-white border border-red-500/50 rounded py-1 font-bold text-xl" />
                                    <div className="min-h-[60px] bg-[#1a1a1a] rounded p-1 border border-[#333] space-y-1">
                                        {teamB.map(id => {
                                            const p = participants?.find(prof => prof.id === id);
                                            return (
                                                <div key={id} onClick={() => togglePlayerTeam(id)} className="text-xs p-1 bg-red-500/20 text-red-200 rounded cursor-pointer flex items-center gap-1 group">
                                                    <RankBadge tier={p?.rank_tier || 'Unranked'} size="sm" className="w-4 h-4 scale-75" />
                                                    <span className="truncate">{p?.display_name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Player Pool */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {participants?.filter(p => !teamA.includes(p.id) && !teamB.includes(p.id)).map(p => (
                                    <button key={p.id} onClick={() => togglePlayerTeam(p.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 bg-[#333] hover:bg-gray-600 text-gray-300 rounded border border-gray-600">
                                        <RankBadge tier={p.rank_tier || 'Unranked'} size="sm" className="w-3 h-3" />
                                        {p.display_name}
                                    </button>
                                ))}
                            </div>

                            {/* Set Scores Input */}
                            <div className="mb-4">
                                <label className="text-[10px] text-gray-500 uppercase font-bold">Tỉ số chi tiết (Séc 1, Séc 2...)</label>
                                <input value={setScores} onChange={e => setSetScores(e.target.value)} placeholder="VD: 21-19, 18-21, 21-15" className="w-full bg-[#1a1a1a] text-sm text-white p-2 rounded border border-[#333]" />
                            </div>

                            <button onClick={handleFinishMatch} disabled={isFinishing} className="w-full py-2 bg-gradient-to-r from-tik-cyan to-blue-500 text-black font-bold rounded hover:shadow-lg transition-all">
                                {isFinishing ? 'Đang lưu...' : 'Lưu Kết Quả Trận Đấu'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // VIEW DETAILS MODE
                    <div className="space-y-4 text-gray-300">
                        {/* Time & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#202020] p-3 rounded border border-[#333]">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> Thời gian</p>
                                <p className="text-white font-bold">{event.start_time ? format(new Date(event.start_time), 'HH:mm dd/MM') : 'TBA'}</p>
                            </div>
                            <div className="bg-[#202020] p-3 rounded border border-[#333]">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FontAwesomeIcon icon={faMapMarkerAlt} /> Địa điểm</p>
                                <p className="text-white font-bold truncate" title={event.location}>{event.location || 'Chưa chốt'}</p>
                            </div>
                        </div>

                        {/* Voting Section (only if planning & vote type) */}
                        {isVotingEvent && (
                            <div className="bg-[#202020] p-3 rounded border border-[#333]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold uppercase text-tik-cyan">Bình chọn giờ</p>
                                    <span className="text-[10px] text-gray-500">{options?.length} lựa chọn</span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {options?.map(opt => {
                                        const hasVoted = opt.votes.some(v => v.user_id === user?.id);
                                        return (
                                            <div key={opt.id} className={`flex justify-between items-center p-2 rounded border ${hasVoted ? 'bg-tik-cyan/10 border-tik-cyan' : 'bg-[#1a1a1a] border-[#333]'}`}>
                                                <div className="text-xs">
                                                    <p className="text-white font-bold">{format(new Date(opt.start_time), 'HH:mm')} - {format(new Date(opt.end_time), 'HH:mm')}</p>
                                                    <p className="text-[10px] text-gray-500">{format(new Date(opt.start_time), 'dd/MM')}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold">{opt.votes.length} vote</span>
                                                    <button onClick={() => handleVote(opt.id, hasVoted)} className={`w-6 h-6 rounded-full flex items-center justify-center border ${hasVoted ? 'bg-tik-cyan text-black border-tik-cyan' : 'border-gray-500 text-gray-500 hover:border-white'}`}>
                                                        {hasVoted && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                                    </button>
                                                    {isCreator && <button onClick={() => handleFinalize(opt.id, opt.start_time, opt.end_time)} className="text-[10px] bg-tik-red text-white px-2 py-1 rounded hover:bg-red-600">Chốt</button>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Participants List */}
                        <div>
                            <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Người tham gia ({participants?.length || 0})</p>
                            <div className="flex flex-wrap gap-2">
                                {participants?.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 bg-[#252525] px-2 py-1 rounded-full border border-[#333]">
                                        <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-[8px] font-bold text-white">
                                            {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.display_name?.charAt(0)}
                                        </div>
                                        <span className="text-xs text-gray-300">{p.display_name}</span>
                                    </div>
                                ))}
                                {(!participants || participants.length === 0) && <p className="text-gray-600 text-xs italic">Chưa có ai tham gia.</p>}
                            </div>
                        </div>
                    </div>
                )}
                {/* Confirm Delete Modal */}
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={onConfirmDelete}
                    title="Xóa Sự Kiện"
                    message="Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa Ngay"
                    isDestructive={true}
                    isLoading={isDeleting}
                />
            </div>
        </Modal>
    );
};
