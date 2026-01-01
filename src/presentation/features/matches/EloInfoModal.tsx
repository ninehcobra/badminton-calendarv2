import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { RankBadge, TIER_TRANSLATIONS } from '@/presentation/components/ui/RankBadge';

interface EloInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TIER_RANGES = [
    { name: 'Iron', min: 0, max: 1000 },
    { name: 'Bronze', min: 1000, max: 1200 },
    { name: 'Silver', min: 1200, max: 1400 },
    { name: 'Gold', min: 1400, max: 1600 },
    { name: 'Platinum', min: 1600, max: 1800 },
    { name: 'Diamond', min: 1800, max: 2000 },
    { name: 'Master', min: 2000, max: 2200 },
    { name: 'Grandmaster', min: 2200, max: 2500 },
    { name: 'Challenger', min: 2500, max: 9999 },
];

export const EloInfoModal = ({ isOpen, onClose }: EloInfoModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cách Tính Điểm & Bảng Xếp Hạng">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-gray-300 text-sm">

                {/* Intro */}
                <div className="space-y-2">
                    <p>
                        Hệ thống sử dụng thuật toán <strong className="text-tik-cyan">Elo Rating</strong> để tính điểm sau mỗi trận đấu.
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-gray-400">
                        <li>Thắng đối thủ Rank cao hơn được <span className="text-green-400">nhiều điểm</span>.</li>
                        <li>Thua đối thủ Rank cao hơn bị trừ <span className="text-gray-500">ít điểm</span>.</li>
                        <li>Thắng đối thủ Rank thấp hơn được <span className="text-gray-500">ít điểm</span>.</li>
                        <li>Thua đối thủ Rank thấp hơn bị trừ <span className="text-red-400">nhiều điểm</span>.</li>
                    </ul>
                </div>

                {/* Rank Table */}
                <div>
                    <h3 className="text-white font-bold mb-3 uppercase border-l-4 border-tik-cyan pl-2">Bảng Xếp Hạng</h3>
                    <div className="bg-[#202020] rounded-lg overflow-hidden border border-[#333]">
                        <table className="w-full text-left">
                            <thead className="bg-[#151515] text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="p-3">Rank</th>
                                    <th className="p-3">Khoảng Điểm (Elo)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {TIER_RANGES.map((tier) => (
                                    <tr key={tier.name} className="hover:bg-[#2a2a2a] transition-colors">
                                        <td className="p-3 flex items-center gap-2">
                                            <RankBadge tier={tier.name} size="sm" className="w-5 h-5 scale-90" />
                                            <span className="font-bold text-gray-200">{TIER_TRANSLATIONS[tier.name]}</span>
                                        </td>
                                        <td className="p-3 font-mono text-tik-cyan font-bold">
                                            {tier.min} - {tier.max === 9999 ? '+' : tier.max}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Formula Note */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-xs">
                    <strong className="uppercase">Công thức:</strong> Điểm thay đổi = K * (Kết quả thực tế - Dự đoán).
                    <br />
                    Trong đó K-factor là hệ số thay đổi (mặc định 32).
                </div>
            </div>
        </Modal>
    );
};
