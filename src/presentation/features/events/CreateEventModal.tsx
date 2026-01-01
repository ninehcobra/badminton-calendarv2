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
            <div className="flex bg-[#252525] p-1 rounded-lg mb-6 border border-[#333]">
                <button
                    type="button"
                    onClick={() => setMode('direct')}
                    className={clsx(
                        "flex-1 py-1.5 rounded-md text-sm font-medium transition-all",
                        mode === 'direct' ? "bg-tik-cyan text-black shadow-lg" : "text-gray-400 hover:text-white"
                    )}
                >
                    Chốt Kèo Luôn
                </button>
                <button
                    type="button"
                    onClick={() => setMode('vote')}
                    className={clsx(
                        "flex-1 py-1.5 rounded-md text-sm font-medium transition-all",
                        mode === 'vote' ? "bg-tik-cyan text-black shadow-lg" : "text-gray-400 hover:text-white"
                    )}
                >
                    Tạo Bình Chọn
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Tiêu đề (Sân / Kèo)"
                    placeholder="Ví dụ: Sân Cầu Giấy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                {mode === 'direct' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Bắt đầu</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 rounded-lg bg-[#252525] border border-[#333] text-white focus:outline-none focus:border-tik-cyan transition-colors"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Kết thúc</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 rounded-lg bg-[#252525] border border-[#333] text-white focus:outline-none focus:border-tik-cyan transition-colors"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 flex justify-between items-center">
                            <span>Các lựa chọn giờ ({options.length})</span>
                            <button type="button" onClick={addOption} className="text-xs text-tik-cyan hover:underline">
                                + Thêm lựa chọn
                            </button>
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="datetime-local"
                                        className="flex-1 px-2 py-1.5 text-xs rounded bg-[#252525] border border-[#333] text-white focus:border-tik-cyan"
                                        value={opt.startTime}
                                        onChange={(e) => updateOption(idx, 'startTime', e.target.value)}
                                        required
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="datetime-local"
                                        className="flex-1 px-2 py-1.5 text-xs rounded bg-[#252525] border border-[#333] text-white focus:border-tik-cyan"
                                        value={opt.endTime}
                                        onChange={(e) => updateOption(idx, 'endTime', e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => removeOption(idx)} className="text-gray-500 hover:text-red-500 p-1">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                            {options.length === 0 && <p className="text-xs text-gray-500 italic">Chưa có lựa chọn nào</p>}
                        </div>
                        <div className="flex justify-center border-t border-[#333] pt-2">
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-2 text-sm text-gray-300 hover:text-tik-cyan transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
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
                />

                {/* Invite Section (Same as before) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Mời bạn (tìm theo tên)</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nhập tên người dùng..."
                            className="w-full px-4 py-2 pl-10 rounded-lg bg-[#252525] border border-[#333] text-white focus:outline-none focus:border-tik-cyan transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-500" />

                        {searchTerm.length >= 2 && searchResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[#252525] border border-[#333] rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {searchResults.map(profile => (
                                    <div
                                        key={profile.id}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#333] cursor-pointer"
                                        onClick={() => handleAddUser(profile)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-tik-cyan/20 text-tik-cyan flex items-center justify-center font-bold text-xs">
                                            {profile.display_name.charAt(0)}
                                        </div>
                                        <div className="text-sm text-white">
                                            {profile.display_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {invitedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {invitedUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-2 bg-[#333] px-3 py-1 rounded-full text-xs text-white">
                                    <span>{u.display_name}</span>
                                    <button type="button" onClick={() => handleRemoveUser(u.id)} className="text-gray-400 hover:text-red-400">
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
                />

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-medium transition-colors"
                    >
                        Hủy
                    </button>
                    <Button
                        type="submit"
                        className="bg-tik-cyan text-black hover:bg-[#00d8d0]"
                        isLoading={isCreating || isInviting || isCreatingOptions}
                    >
                        {mode === 'direct' ? "Tạo Lịch" : "Tạo Bình Chọn"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
