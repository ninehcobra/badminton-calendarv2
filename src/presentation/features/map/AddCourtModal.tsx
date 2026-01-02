'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useAddCourtMutation } from '@/presentation/store/api/courtsApi';
import { useAppSelector } from '@/presentation/hooks/redux';
import { toast } from 'react-hot-toast';

interface AddCourtModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: {
        lat: number;
        lng: number;
    } | null;
}

export const AddCourtModal = ({ isOpen, onClose, location }: AddCourtModalProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const [addCourt, { isLoading }] = useAddCourtMutation();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (location) {
            // Optional: Reverse geocoding could go here to auto-fill address
            setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !location) return;

        try {
            await addCourt({
                name,
                address,
                description,
                latitude: location.lat,
                longitude: location.lng,
                created_by: user.id
            }).unwrap();

            toast.success('Thêm sân thành công!');
            setName('');
            setAddress('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Failed to add court:', error);
            toast.error('Có lỗi xảy ra khi thêm sân.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm Sân Cầu Lông Mới">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 mb-4">
                    <p className="text-sm text-blue-400">
                        Bạn đang thêm địa điểm tại tọa độ: <br />
                        <span className="font-mono font-bold text-white">
                            {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                        </span>
                    </p>
                </div>

                <Input
                    label="Tên sân"
                    placeholder="Ví dụ: Sân Cầu Lông Cầu Giấy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    label="Địa chỉ (chi tiết)"
                    placeholder="Số 123 đường ABC..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả</label>
                    <textarea
                        className="w-full px-4 py-2 rounded-lg bg-[#252525] border border-[#333] text-white focus:outline-none focus:border-tik-cyan transition-colors min-h-[100px]"
                        placeholder="Giá sân, số lượng sân, tiện ích..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

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
                        isLoading={isLoading}
                    >
                        Thêm Sân
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
