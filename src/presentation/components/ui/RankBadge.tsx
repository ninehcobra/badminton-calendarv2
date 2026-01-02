import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem, faCrown, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

type Tier = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Challenger' | 'Unranked';

export const TIER_TRANSLATIONS: Record<string, string> = {
    'Unranked': 'Chưa phân hạng',
    'Iron': 'Sắt',
    'Bronze': 'Đồng',
    'Silver': 'Bạc',
    'Gold': 'Vàng',
    'Platinum': 'Bạch Kim',
    'Diamond': 'Kim Cương',
    'Master': 'Cao Thủ',
    'Grandmaster': 'Đại Cao Thủ',
    'Challenger': 'Thách Đấu'
};

export const getVietnameseTierName = (tier: string) => {
    const base = tier?.split(' ')[0] || 'Unranked';
    const division = tier?.split(' ')[1] || '';
    const vnName = TIER_TRANSLATIONS[base] || base;
    return division ? `${vnName} ${division}` : vnName;
};

interface RankBadgeProps {
    tier: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string; // Allow custom classNames for positioning/sizing if needed
}

export const RankBadge: React.FC<RankBadgeProps> = ({ tier, size = 'md', className = '' }) => {
    // Normalize tier string (e.g., "Iron IV" -> "Iron" or "Sắt IV" -> "Iron")
    const getBaseTier = (t: string): Tier => {
        if (!t || t === 'Unranked') return 'Unranked';

        // Handle Vietnamese base names
        if (t.startsWith('Sắt')) return 'Iron';
        if (t.startsWith('Đồng')) return 'Bronze';
        if (t.startsWith('Bạc')) return 'Silver';
        if (t.startsWith('Vàng')) return 'Gold';
        if (t.startsWith('Bạch Kim')) return 'Platinum';
        if (t.startsWith('Kim Cương')) return 'Diamond';
        if (t.startsWith('Cao Thủ')) return 'Master';
        if (t.startsWith('Đại Cao Thủ')) return 'Grandmaster';
        if (t.startsWith('Thách Đấu')) return 'Challenger';

        // Fallback to English splitting
        return (t.split(' ')[0] || 'Unranked') as Tier;
    };

    const baseTier = getBaseTier(tier);

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-6 h-6';
            case 'md': return 'w-12 h-12';
            case 'lg': return 'w-24 h-24';
            case 'xl': return 'w-32 h-32';
            default: return 'w-12 h-12';
        }
    };

    // Define colors and styles for each tier
    const getTierStyle = () => {
        switch (baseTier) {
            case 'Iron':
                return {
                    color: '#717171', // Iron Gray
                    shadow: 'drop-shadow-[0_0_5px_rgba(113,113,113,0.5)]',
                    gradient: 'from-gray-600 to-gray-800'
                };
            case 'Bronze':
                return {
                    color: '#CD7F32', // Bronze
                    shadow: 'drop-shadow-[0_0_8px_rgba(205,127,50,0.5)]',
                    gradient: 'from-orange-700 to-yellow-900'
                };
            case 'Silver':
                return {
                    color: '#C0C0C0', // Silver
                    shadow: 'drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]',
                    gradient: 'from-gray-300 to-gray-500'
                };
            case 'Gold':
                return {
                    color: '#FFD700', // Gold
                    shadow: 'drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]',
                    gradient: 'from-yellow-300 to-yellow-600'
                };
            case 'Platinum':
                return {
                    color: '#00FA9A', // Platinum Green/Teal
                    shadow: 'drop-shadow-[0_0_10px_rgba(0,250,154,0.6)]',
                    gradient: 'from-teal-300 to-teal-600'
                };
            case 'Diamond':
                return {
                    color: '#B9F2FF', // Diamond Blue
                    shadow: 'drop-shadow-[0_0_12px_rgba(185,242,255,0.7)]',
                    gradient: 'from-cyan-300 to-blue-500'
                };
            case 'Master':
                return {
                    color: '#EB4C4C',
                    shadow: 'drop-shadow-[0_0_15px_rgba(235,76,76,0.8)]',
                    gradient: 'from-purple-500 to-pink-600'
                };
            case 'Grandmaster':
                return {
                    color: '#FF4500',
                    shadow: 'drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]',
                    gradient: 'from-red-500 to-orange-600'
                };
            case 'Challenger':
                return {
                    color: '#00FFFF',
                    shadow: 'drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]',
                    gradient: 'from-cyan-400 to-blue-600'
                };
            default:
                return {
                    color: '#333333',
                    shadow: '',
                    gradient: 'from-gray-700 to-gray-800'
                };
        }
    };

    const style = getTierStyle();

    // Render SVG Badge
    return (
        <div className={`relative flex items-center justify-center ${getSizeClasses()} ${className}`} title={tier}>
            {/* Background Shield/Shape */}
            <svg viewBox="0 0 100 100" className={`w-full h-full ${style.shadow} transition-all duration-300 hover:scale-110`}>
                <defs>
                    <linearGradient id={`${baseTier}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={`stop-${style.gradient.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" style={{ color: 'inherit' }} /> {/* Fallback color logic might be needed if using tailwind classes within SVG defs isn't direct */}
                    </linearGradient>
                </defs>

                {/* Shield Body */}
                <path
                    d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z"
                    fill="currentColor"
                    className={`text-transparent bg-gradient-to-br ${style.gradient}`}
                    style={{ fill: style.color, opacity: 0.2 }}
                />
                <path
                    d="M50 8 L87 22 V48 C87 70 50 88 50 88 C50 88 13 70 13 48 V22 L50 8 Z"
                    fill="none"
                    stroke={style.color}
                    strokeWidth="3"
                />

                {/* Inner Icon based on Tier */}
                {/* This is a simplified representation. For real LoL icons we'd need complex paths or images */}
                <g transform="translate(30, 30) scale(0.4)">
                    {/* Placeholder for tier specific icon */}
                    {['Master', 'Grandmaster', 'Challenger'].includes(baseTier) ? (
                        <path d="M50 0 L100 50 L50 100 L0 50 Z" fill={style.color} />
                    ) : (
                        <circle cx="50" cy="50" r="40" fill={style.color} fillOpacity="0.5" />
                    )}
                </g>
            </svg>

            {/* Center Icon (FontAwesome fallback for visual pop) */}
            <div className={`absolute inset-0 flex items-center justify-center text-white drop-shadow-md pointer-events-none`}>
                {['Diamond', 'Master', 'Grandmaster', 'Challenger'].includes(baseTier) ? (
                    <FontAwesomeIcon icon={faCrown} className={size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-lg' : 'text-3xl'} style={{ color: '#fff' }} />
                ) : (
                    <FontAwesomeIcon icon={faGem} className={size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-base' : 'text-2xl'} style={{ color: '#fff' }} />
                )}
            </div>

            {/* Division Number or Full Rank Name */}
            {(() => {
                // Check if it's a high tier (no division)
                const isHighTier = ['Master', 'Grandmaster', 'Challenger', 'Cao Thủ', 'Đại Cao Thủ', 'Thách Đấu'].includes(tier);

                if (isHighTier) {
                    return (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-[8px] md:text-[10px] text-white bg-black/70 px-1.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 tracking-tighter z-10 shadow-lg">
                            {tier}
                        </div>
                    );
                }

                // Standard tiers with division (e.g., "Sắt IV")
                if (tier.includes(' ')) {
                    return (
                        <div className="absolute -bottom-2 font-black text-[10px] md:text-xs text-white bg-black/50 px-1 rounded backdrop-blur-sm border border-white/10">
                            {tier.split(' ')[1]}
                        </div>
                    );
                }

                return null;
            })()}
        </div>
    );
};
