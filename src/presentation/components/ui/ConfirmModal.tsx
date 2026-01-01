import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isDestructive = false,
    isLoading = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <p className="text-gray-300">{message}</p>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded text-sm font-bold text-white transition-all shadow-lg ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-tik-cyan text-black hover:brightness-110 shadow-[0_0_10px_rgba(0,242,234,0.3)]'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
