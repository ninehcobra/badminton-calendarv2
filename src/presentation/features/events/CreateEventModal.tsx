'use client'

import React, { useState, useEffect } from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useCreateEventMutation, useInviteParticipantsMutation, useCreateEventOptionsMutation } from '@/presentation/store/api/eventsApi';
import { useLazySearchProfilesQuery, Profile } from '@/presentation/store/api/profilesApi';
import { useAppSelector } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
}

interface Option {
    startTime: string;
    endTime: string;
}

export const CreateEventModal = ({ isOpen, onClose, selectedDate }: CreateEventModalProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
    const [createOptions, { isLoading: isCreatingOptions }] = useCreateEventOptionsMutation();
    const [inviteParticipants, { isLoading: isInviting }] = useInviteParticipantsMutation();

    // Search State
    const [searchTrigger, { data: searchResults }] = useLazySearchProfilesQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [invitedUsers, setInvitedUsers] = useState<Profile[]>([]);

    // Mode State
    const [mode, setMode] = useState<'direct' | 'vote'>('direct');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    // Direct Mode Time
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Vote Mode Options
    const [options, setOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (selectedDate && isOpen) {
            const start = new Date(selectedDate);
            start.setHours(19, 0, 0, 0);

            const end = new Date(selectedDate);
            end.setHours(21, 0, 0, 0);

            const formatForInput = (d: Date) => {
                const pad = (n: number) => n < 10 ? '0' + n : n;
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            const defaultStart = formatForInput(start);
            const defaultEnd = formatForInput(end);

            setStartTime(defaultStart);
            setEndTime(defaultEnd);

            // Initialize with one option in vote mode
            setOptions([{ startTime: defaultStart, endTime: defaultEnd }]);
        }
    }, [selectedDate, isOpen]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchTrigger(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, searchTrigger]);

    const handleAddUser = (profile: Profile) => {
        if (!invitedUsers.find(u => u.id === profile.id)) {
            setInvitedUsers([...invitedUsers, profile]);
        }
        setSearchTerm('');
    };

    const handleRemoveUser = (id: string) => {
        setInvitedUsers(invitedUsers.filter(u => u.id !== id));
    };

    const addOption = () => {
        setOptions([...options, { startTime, endTime }]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (mode === 'vote' && options.length < 2) {
            toast.error('Cần ít nhất 2 lựa chọn để tạo bình chọn!');
            return;
        }

        try {
            // 1. Create Event
            const eventPayload = {
                title,
                description,
                location,
                event_type: mode,
                // If direct, use specific time. If vote, use first option's time as placeholder or null (if DB allows)
                // DB says start_time nullable? checking schema...
                // Schema: start_time timestamp with time zone, -- Nullable if it's a vote type initially
                // So we can send null or the first option time as a range hint.
                // Let's send the first option time as tentative range for displaying in calendar month view.
                start_time: mode === 'direct' ? new Date(startTime).toISOString() : new Date(options[0].startTime).toISOString(),
                end_time: mode === 'direct' ? new Date(endTime).toISOString() : new Date(options[0].endTime).toISOString(),
                created_by: user.id,
                status: 'planning' as const
            };

            const event = await createEvent(eventPayload).unwrap();

            // 2. Create Options (if vote mode)
            if (mode === 'vote') {
                const optionsPayload = options.map(opt => ({
                    event_id: event.id,
                    start_time: new Date(opt.startTime).toISOString(),
                    end_time: new Date(opt.endTime).toISOString(),
                }));
                await createOptions(optionsPayload).unwrap();
            }

            // 3. Invite Participants
            if (invitedUsers.length > 0) {
                await inviteParticipants({
                    event_id: event.id,
                    user_ids: invitedUsers.map(u => u.id)
                }).unwrap();
            }

            toast.success(mode === 'direct' ? 'Tạo lịch thành công!' : 'Tạo bình chọn thành công!');

            // Reset
            setTitle('');
            setDescription('');
            setLocation('');
            setInvitedUsers([]);
            onClose();
        } catch (error) {
            console.error('Failed to create:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'direct' ? "Tạo Lịch Thi Đấu" : "Tạo Bình Chọn"}>
            <div className="flex bg-black/40 p-1.5 rounded-xl mb-6 border border-white/10 relative">
                <button
                    type="button"
                    onClick={() => setMode('direct')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg text-sm font-bold transition-all relative z-10",
                        mode === 'direct' ? "text-black bg-tik-cyan shadow-[0_0_15px_rgba(0,242,234,0.4)]" : "text-gray-400 hover:text-white"
                    )}
                >
                    Chốt Kèo Luôn
                </button>
                <button
                    type="button"
                    onClick={() => setMode('vote')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg text-sm font-bold transition-all relative z-10",
                        mode === 'vote' ? "text-black bg-tik-cyan shadow-[0_0_15px_rgba(0,242,234,0.4)]" : "text-gray-400 hover:text-white"
                    )}
                >
                    Tạo Bình Chọn
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Tiêu đề (Sân / Kèo)"
                    placeholder="Ví dụ: Sân Cầu Giấy - Kèo giao lưu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-black/20 focus:bg-black/40"
                />

                {mode === 'direct' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-300 ml-1">Bắt đầu</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-tik-cyan focus:ring-1 focus:ring-tik-cyan/50 transition-all font-sans text-sm [color-scheme:dark]"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-300 ml-1">Kết thúc</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-tik-cyan focus:ring-1 focus:ring-tik-cyan/50 transition-all font-sans text-sm [color-scheme:dark]"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="text-sm font-bold text-tik-cyan flex justify-between items-center bg-tik-cyan/10 px-3 py-2 rounded-lg">
                            <span>Các lựa chọn giờ ({options.length})</span>
                            <button type="button" onClick={addOption} className="text-xs font-bold hover:underline">
                                + Thêm
                            </button>
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="datetime-local"
                                            className="flex-1 px-2 py-1.5 text-xs rounded bg-transparent border border-white/10 text-white focus:border-tik-cyan focus:outline-none [color-scheme:dark]"
                                            value={opt.startTime}
                                            onChange={(e) => updateOption(idx, 'startTime', e.target.value)}
                                            required
                                        />
                                        <span className="text-gray-500 font-bold">-</span>
                                        <input
                                            type="datetime-local"
                                            className="flex-1 px-2 py-1.5 text-xs rounded bg-transparent border border-white/10 text-white focus:border-tik-cyan focus:outline-none [color-scheme:dark]"
                                            value={opt.endTime}
                                            onChange={(e) => updateOption(idx, 'endTime', e.target.value)}
                                            required
                                        />
                                        <button type="button" onClick={() => removeOption(idx)} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {options.length === 0 && <p className="text-xs text-gray-500 italic text-center py-2">Chưa có lựa chọn nào. Hãy thêm khung giờ!</p>}
                        </div>
                        <div className="flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-tik-cyan" />
                                Thêm khung giờ
                            </button>
                        </div>
                    </div>
                )}

                <Input
                    label="Địa điểm"
                    placeholder="Sân cầu lông..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-black/20 focus:bg-black/40"
                />

                {/* Invite Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300 ml-1">Mời bạn (tìm theo tên)</label>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Nhập tên người dùng..."
                            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-tik-cyan focus:bg-black/40 focus:ring-1 focus:ring-tik-cyan/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-tik-cyan transition-colors" />

                        {searchTerm.length >= 2 && searchResults && searchResults.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-48 overflow-y-auto custom-scrollbar backdrop-blur-xl">
                                {searchResults.map(profile => (
                                    <div
                                        key={profile.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                                        onClick={() => handleAddUser(profile)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tik-cyan to-blue-500 flex items-center justify-center font-bold text-xs text-black shadow-lg">
                                            {profile.display_name.charAt(0)}
                                        </div>
                                        <div className="text-sm text-white font-medium">
                                            {profile.display_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {invitedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            {invitedUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-2 bg-gradient-to-r from-tik-cyan/20 to-blue-500/20 border border-tik-cyan/30 px-3 py-1.5 rounded-full text-xs text-tik-cyan font-bold shadow-sm animate-in fade-in zoom-in duration-200">
                                    <span>{u.display_name}</span>
                                    <button type="button" onClick={() => handleRemoveUser(u.id)} className="text-tik-cyan/70 hover:text-red-400 transition-colors ml-1">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Input
                    label="Mô tả / Ghi chú"
                    placeholder="Trình độ, tiền sân, v.v..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/20 focus:bg-black/40"
                />

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white font-bold transition-colors hover:bg-white/5"
                    >
                        Hủy
                    </button>
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-tik-cyan to-blue-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all px-8 rounded-xl"
                        isLoading={isCreating || isInviting || isCreatingOptions}
                    >
                        {mode === 'direct' ? "Tạo Lịch Ngay" : "Tạo Bình Chọn"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
