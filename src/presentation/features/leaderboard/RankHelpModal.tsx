'use client'

import React from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrophy, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { RankBadge } from '@/presentation/components/ui/RankBadge';

interface RankHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RankHelpModal = ({ isOpen, onClose }: RankHelpModalProps) => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    // Rank Data
    const ranks = [
        { name: 'Sắt (IV - I)', range: '0 - 1199', color: 'text-gray-400', tier: 'Iron IV' },
        { name: 'Đồng (IV - I)', range: '1200 - 1399', color: 'text-orange-400', tier: 'Bronze' },
        { name: 'Bạc (IV - I)', range: '1400 - 1599', color: 'text-gray-300', tier: 'Silver' },
        { name: 'Vàng (IV - I)', range: '1600 - 1799', color: 'text-yellow-400', tier: 'Gold' },
        { name: 'Bạch Kim (IV - I)', range: '1800 - 1999', color: 'text-cyan-400', tier: 'Platinum' },
        { name: 'Kim Cương (IV - I)', range: '2000 - 2199', color: 'text-blue-400', tier: 'Diamond' },
        { name: 'Thách Đấu', range: '2200+', color: 'text-red-500', tier: 'Challenger' },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-[#333] shadow-2xl transform transition-all relative overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#202020] shrink-0">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                        Hệ thống Xếp hạng
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-400 text-sm mb-4 bg-[#252525] p-3 rounded border border-[#333] italic">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-tik-cyan" />
                        Điểm Elo được tính dựa trên kết quả thi đấu. Thắng đội mạnh hơn sẽ được cộng nhiều điểm hơn.
                        <br /><br />
                        <span className="text-tik-cyan">*</span> Các bậc từ Sắt đến Kim Cương được chia thành 4 đoàn (IV, III, II, I), mỗi đoàn khoảng 50 điểm.
                    </p>

                    <div className="space-y-2">
                        {ranks.map((rank, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[#252525] p-3 rounded border border-[#333] hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center">
                                        <RankBadge tier={rank.tier} size="md" />
                                    </div>
                                    <span className={`font-bold ${rank.color}`}>{rank.name}</span>
                                </div>
                                <span className="font-mono text-gray-400 font-bold bg-[#151515] px-2 py-1 rounded text-xs border border-[#333]">
                                    {rank.range}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
