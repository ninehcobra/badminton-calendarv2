import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlayerDraggable } from './PlayerDraggable';
import { Profile } from '@/presentation/store/api/profilesApi';

interface TeamDropZoneProps {
    id: string; // 'pool' | 'team_a' | 'team_b'
    title: string;
    players: Profile[];
    bgClass?: string;
    disableHover?: boolean;
}

export const TeamDropZone = ({ id, title, players, bgClass = 'bg-[#1a1a1a]', disableHover }: TeamDropZoneProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                flex-1 rounded-xl p-1.5 border transition-all min-h-[80px] flex flex-col gap-1
                ${bgClass}
                ${isOver ? 'border-tik-cyan ring-2 ring-tik-cyan/20 bg-tik-cyan/5' : 'border-[#333]'}
            `}
        >
            <h3 className={`text-[10px] font-bold uppercase mb-1 text-center tracking-wider ${id === 'team_a' ? 'text-green-400' : id === 'team_b' ? 'text-red-400' : 'text-gray-500'}`}>
                {title} <span className="text-gray-600 ml-1">({players.length})</span>
            </h3>

            <div className="flex flex-col gap-1 flex-grow">
                {players.map(p => (
                    <PlayerDraggable key={p.id} player={p} disableHover={disableHover} />
                ))}
                {players.length === 0 && (
                    <div className="flex-grow flex items-center justify-center text-gray-700 text-[10px] italic border border-dashed border-[#2a2a2a] rounded-lg min-h-[40px]">
                        Kéo thả
                    </div>
                )}
            </div>
        </div>
    );
};
