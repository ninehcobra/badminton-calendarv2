'use client'

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Profile } from '@/presentation/store/api/profilesApi';
import { useFinishMatchMutation } from '@/presentation/store/api/eventsApi';
import { PlayerDraggable } from './PlayerDraggable';
import { TeamDropZone } from './TeamDropZone';
import { EloInfoModal } from './EloInfoModal';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faSave, faHistory } from '@fortawesome/free-solid-svg-icons';
import { calculateEloChange } from '@/domain/utils/eloCalculator';

interface MatchManagerProps {
    eventId: string;
    participants: Profile[];
    currentMatches: any[];
    onMatchFinished: () => void;
}

export const MatchManager = ({ eventId, participants, currentMatches, onMatchFinished }: MatchManagerProps) => {
    // ---- State ----
    const [pool, setPool] = useState<Profile[]>([]);
    const [teamA, setTeamA] = useState<Profile[]>([]);
    const [teamB, setTeamB] = useState<Profile[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activePlayer, setActivePlayer] = useState<Profile | null>(null);

    // Form Stats
    const [scoreA, setScoreA] = useState<number>(0);
    const [scoreB, setScoreB] = useState<number>(0);
    const [setScores, setSetScores] = useState<string>('');
    const [showEloInfo, setShowEloInfo] = useState(false);

    // API
    const [finishMatch, { isLoading: isSubmitting }] = useFinishMatchMutation();

    // Smart Sync: Update player data when participants change (e.g. after Elo update)
    // without resetting their positions (Pool vs Team).
    useEffect(() => {
        if (!participants || participants.length === 0) return;

        // Create a map for fast lookup of new player data
        const newPlayerDataMap = new Map(participants.map(p => [p.id, p]));

        // Update Team A with new data
        setTeamA(prev => prev.map(p => newPlayerDataMap.get(p.id) || p));

        // Update Team B with new data
        setTeamB(prev => prev.map(p => newPlayerDataMap.get(p.id) || p));

        // Update Pool:
        // 1. Get IDs currently in teams (to exclude them from pool)
        // Note: We use the *current* state of teams for exclusion. 
        // But since we are inside useEffect, we should rely on the *latest* classification.
        // Actually, since this effect runs when `participants` changes, we need to know who was where *before* the update?
        // No, we trust the current `teamA` and `teamB` state contains the IDs of people on court.

        setPool(prevPool => {
            // We want to reconstruct the pool from the NEW `participants` list,
            // EXCLUDING anyone who is currently in Team A or Team B.

            const currentTeamAIds = new Set(teamA.map(p => p.id));
            const currentTeamBIds = new Set(teamB.map(p => p.id));

            return participants.filter(p => !currentTeamAIds.has(p.id) && !currentTeamBIds.has(p.id));
        });

    }, [participants, teamA, teamB]); // Dependencies: re-run if participants change OR if teams change? 
    // Wait, if teams change, we don't want to reset pool logic necessarily. 
    // But if we drag drop, `teamA` changes. If we include `teamA` in dep, this effect runs.
    // If this runs on drag, it will reset pool based on `participants` prop.
    // `participants` prop is STALE vs local state during drag? No, prop doesn't change during drag.

    // Better approach:
    // Only run this when `participants` reference changes (fetching new data).
    // But we need access to current `teamA` vs `pool` distribution.
    // If we include `teamA` in deps, every drag triggers this.
    // Is that bad?
    // 1. Drag P1 to Team A. `teamA` updates. Effect runs.
    // 2. `participants` (prop) is unchanged.
    // 3. Effect filters `participants` (all) excluding `teamA` (P1). Result: P1 is out of pool.
    // This actually effectively manages the pool removal logic too!
    // So we might not even need the `handleDragEnd` manual `setPool` if this effect is fast enough?
    // No, `handleDragEnd` is immediate. Effect is next render. usage of `prev` state in `setPool` in `handleDragEnd` handles it.
    // But this effect blindly overwrites `pool` based on "Participants - Teams".
    // This is actually robust. It ensures Pool is always "Everyone - Teams".

    // One edge case: `teamA` update in `handleDragEnd`.
    // `setTeamA` -> Re-render -> Effect runs.
    // Effect calculates `pool` = `participants` - `teamA` - `teamB`.
    // This matches what we want.
    // So this Single Effect can force-sync state.

    // However, what if `teamA` and `teamB` in the dependency array are "stale" inside the effect callback?
    // No, they are in deps.

    // Let's refine the effect to be safe.
    // Actually, `activeId` might complicate things? No.

    // CAUTION: Infinite loop risk if `setTeamA` triggers effect which calls `setTeamA`.
    // The `setTeamA` inside effect maps using `newPlayerDataMap`.
    // If nothing changed in `participants`, the mapped result is identical to `prev` (if referentially same or value same).
    // But `map` returns new array. `setTeamA` receives new array.
    // This WILL trigger re-render and re-effect. Infinite Loop!

    // FIX: Only update `teamA`/`teamB` if `participants` actually changed content vs current.
    // OR: Separate the logic.
    // 1. `useEffect` on `[participants]`.
    //    When `participants` changes (refetch):
    //      - Update `teamA` with new stats.
    //      - Update `teamB` with new stats.
    //      - Update `pool` with new stats.
}, [participants]); // Only re-run when `participants` prop changes.

// ---- DnD Sensors ----
const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

// ---- Handlers ----
const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActivePlayer(active.data.current?.player);
};

const handleDragOver = (event: DragOverEvent) => {
    // Optional: Pre-sort or visualized placement logic could go here
};

const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActivePlayer(null);

    if (!over) return;

    const playerId = active.id as string;
    const targetContainer = over.id as string; // 'pool', 'team_a', 'team_b'

    // Helper to find and remove player from any list
    const removePlayer = (pid: string) => {
        setPool(prev => prev.filter(p => p.id !== pid));
        setTeamA(prev => prev.filter(p => p.id !== pid));
        setTeamB(prev => prev.filter(p => p.id !== pid));
    };

    const player = active.data.current?.player as Profile;
    if (!player) return;

    // Optimistic Update
    removePlayer(playerId);

    if (targetContainer === 'team_a') setTeamA(prev => [...prev, player]);
    else if (targetContainer === 'team_b') setTeamB(prev => [...prev, player]);
    else setPool(prev => [...prev, player]); // Default to pool
};

const handleSaveMatch = async () => {
    if (teamA.length === 0 || teamB.length === 0) {
        toast.error('Vui lòng xếp đủ người 2 đội!');
        return;
    }

    const teamAElo = teamA.reduce((acc, p) => acc + p.rank_score, 0) / teamA.length;
    const teamBElo = teamB.reduce((acc, p) => acc + p.rank_score, 0) / teamB.length;
    const resultA = scoreA > scoreB ? 1 : scoreA < scoreB ? 0 : 0.5;
    const eloChange = calculateEloChange(teamAElo, teamBElo, resultA as any);

    try {
        await finishMatch({
            event_id: eventId,
            team_a: teamA.map(p => p.id),
            team_b: teamB.map(p => p.id),
            score_a: scoreA,
            score_b: scoreB,
            elo_change: Math.abs(eloChange),
            set_scores: setScores
        }).unwrap();

        toast.success('Đã lưu kết quả!');

        // Reset for next match (Scores only)
        setScoreA(0); setScoreB(0); setSetScores('');

        // Do NOT clear teams. Players stay on court for next match.
        // onMatchFinished triggers refetch, which updates `participants` prop.
        onMatchFinished();
    } catch (err) {
        toast.error('Lỗi khi lưu kết quả');
    }
};

return (
    <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
    >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            {/* LEFT: Player Pool */}
            <div className="lg:col-span-1 bg-[#202020] rounded-xl p-4 border border-[#333] flex flex-col h-full overflow-hidden">
                <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                    <span>Kho Cầu Thủ</span>
                    <span className="bg-[#333] px-2 py-0.5 rounded text-xs text-gray-400">{pool.length}</span>
                </h3>
                <TeamDropZone id="pool" title="" players={pool} bgClass="bg-transparent" disableHover={!!activeId} />
            </div>

            {/* CENTER: Match Court */}
            <div className="lg:col-span-2 flex flex-col gap-2 min-h-0">
                {/* Court Area */}
                <div className="flex-grow bg-[#151515] rounded-xl p-3 border border-[#333] relative overflow-hidden flex flex-col min-h-0">
                    {/* Background Decor */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex flex-col">
                        <div className="flex-1 border-b-2 border-white/20"></div>
                        <div className="flex-1"></div>
                        {/* Simple court markings */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/10 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full gap-3">
                        <div className="flex-1 flex gap-2 min-h-0">
                            <TeamDropZone id="team_a" title="TEAM A" players={teamA} disableHover={!!activeId} />
                            <div className="flex items-center justify-center">
                                <span className="text-xl font-black text-gray-600 italic">VS</span>
                            </div>
                            <TeamDropZone id="team_b" title="TEAM B" players={teamB} disableHover={!!activeId} />
                        </div>

                        {/* Scoring Control Panel */}
                        <div className="bg-[#252525] p-2 rounded-xl border border-tik-cyan/20 shadow-lg shrink-0">
                            <div className="flex items-center justify-center gap-4">
                                <div className="text-center group active:scale-95 transition-transform">
                                    <input
                                        type="number"
                                        value={scoreA}
                                        onChange={e => setScoreA(parseInt(e.target.value) || 0)}
                                        className="w-16 h-10 bg-[#1a1a1a] text-center text-xl font-bold text-green-400 border border-green-500/30 rounded focus:ring-1 focus:ring-green-500 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-40">
                                    <input
                                        value={setScores}
                                        onChange={e => setSetScores(e.target.value)}
                                        placeholder="21-19, 15-21..."
                                        className="w-full bg-[#1a1a1a] text-[10px] text-center text-white py-1 px-2 rounded border border-[#333] focus:border-tik-cyan outline-none"
                                    />
                                    <button
                                        onClick={handleSaveMatch}
                                        disabled={isSubmitting}
                                        className="w-full py-1.5 bg-gradient-to-r from-tik-cyan to-blue-600 text-white font-bold uppercase text-[10px] rounded shadow hover:shadow-cyan-500/20 transition-all active:scale-95"
                                    >
                                        {isSubmitting ? '...' : 'Lưu'}
                                    </button>
                                </div>
                                <div className="text-center group active:scale-95 transition-transform">
                                    <input
                                        type="number"
                                        value={scoreB}
                                        onChange={e => setScoreB(parseInt(e.target.value) || 0)}
                                        className="w-16 h-10 bg-[#1a1a1a] text-center text-xl font-bold text-red-400 border border-red-500/30 rounded focus:ring-1 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-1 text-center">
                                <button onClick={() => setShowEloInfo(true)} className="text-[9px] text-tik-cyan hover:underline flex items-center justify-center gap-1 mx-auto opacity-70 hover:opacity-100">
                                    <FontAwesomeIcon icon={faInfoCircle} /> Tính điểm & Rank
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: History */}
            <div className="lg:col-span-1 bg-[#202020] rounded-xl p-4 border border-[#333] flex flex-col h-full overflow-hidden">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHistory} className="text-gray-400" /> Lịch Sử Trận
                </h3>
                <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {currentMatches.map((m, idx) => (
                        <div key={idx} className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-xs">
                            <div className="flex justify-between font-bold mb-1">
                                <span className={m.score_a > m.score_b ? 'text-green-400' : 'text-gray-400'}>{m.score_a}</span>
                                <span className="text-gray-600">-</span>
                                <span className={m.score_b > m.score_a ? 'text-green-400' : 'text-gray-400'}>{m.score_b}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mb-2 text-center">{m.set_scores}</div>

                            {/* Players */}
                            <div className="flex flex-col gap-1">
                                {/* Team A */}
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {m.team_a?.map((pid: string) => {
                                        const p = participants.find(part => part.id === pid);
                                        if (!p) return null;
                                        return (
                                            <PlayerHoverCard key={pid} player={p}>
                                                <span className="bg-[#252525] px-1.5 py-0.5 rounded text-[9px] text-gray-300 border border-[#333] cursor-help hover:border-gray-500 truncate max-w-[80px]">
                                                    {p.display_name}
                                                </span>
                                            </PlayerHoverCard>
                                        );
                                    })}
                                </div>
                                <div className="text-[8px] text-gray-600 text-center">VS</div>
                                {/* Team B */}
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {m.team_b?.map((pid: string) => {
                                        const p = participants.find(part => part.id === pid);
                                        if (!p) return null;
                                        return (
                                            <PlayerHoverCard key={pid} player={p}>
                                                <span className="bg-[#252525] px-1.5 py-0.5 rounded text-[9px] text-gray-300 border border-[#333] cursor-help hover:border-gray-500 truncate max-w-[80px]">
                                                    {p.display_name}
                                                </span>
                                            </PlayerHoverCard>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="text-[9px] text-gray-600 mt-2 text-center italic border-t border-[#222] pt-1">
                                Elo change: +/- {m.elo_change}
                            </div>
                        </div>
                    ))}
                    {currentMatches.length === 0 && (
                        <p className="text-gray-600 text-xs italic text-center mt-10">Chưa có trận đấu nào.</p>
                    )}
                </div>
            </div>
        </div>

        <DragOverlay>
            {activePlayer ? <PlayerDraggable player={activePlayer} /> : null}
        </DragOverlay>

        <EloInfoModal isOpen={showEloInfo} onClose={() => setShowEloInfo(false)} />
    </DndContext>
);
};
