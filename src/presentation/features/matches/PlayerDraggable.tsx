import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RankBadge } from '@/presentation/components/ui/RankBadge';
import { Profile } from '@/presentation/store/api/profilesApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { PlayerHoverCard } from './PlayerHoverCard';

interface PlayerDraggableProps {
    player: Profile;
    disableHover?: boolean;
}

export const PlayerDraggable = ({ player, disableHover }: PlayerDraggableProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: player.id,
        data: { player } // Pass data for drops
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999, // Ensure it floats above others
    } : undefined;

    return (
        <PlayerHoverCard player={player} disabled={isDragging || disableHover}>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`
                    flex items-center gap-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing border select-none
                    ${isDragging ? 'bg-tik-cyan/20 border-tik-cyan shadow-lg opacity-80' : 'bg-[#252525] border-[#333] hover:border-gray-500'}
                    transition-colors touch-none
                `}
            >
                <FontAwesomeIcon icon={faGripVertical} className="text-gray-600 text-[10px]" />
                <RankBadge tier={player.rank_tier || 'Unranked'} size="sm" className="w-4 h-4 scale-75" />
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-200 truncate max-w-[100px]">{player.display_name}</span>
                    <span className="text-[9px] text-gray-500 font-mono leading-none">{player.rank_score} Elo</span>
                </div>
            </div>
        </PlayerHoverCard>
    );
};
