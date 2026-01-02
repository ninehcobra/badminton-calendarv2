export const calculateEloChange = (
    teamAElo: number,
    teamBElo: number,
    actualScoreA: 0 | 0.5 | 1, // 1 = Win, 0 = Lose, 0.5 = Draw
    kFactor: number = 32
): number => {
    const expectedScoreA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const ratingChange = kFactor * (actualScoreA - expectedScoreA);
    return Math.round(ratingChange);
};

export const getRankTier = (score: number): string => {
    // Iron (< 1200)
    if (score < 1050) return 'Sắt IV';
    if (score < 1100) return 'Sắt III';
    if (score < 1150) return 'Sắt II';
    if (score < 1200) return 'Sắt I';

    // Bronze (1200 - 1399) - 50 per tier
    if (score < 1250) return 'Đồng IV';
    if (score < 1300) return 'Đồng III';
    if (score < 1350) return 'Đồng II';
    if (score < 1400) return 'Đồng I';

    // Silver (1400 - 1599)
    if (score < 1450) return 'Bạc IV';
    if (score < 1500) return 'Bạc III';
    if (score < 1550) return 'Bạc II';
    if (score < 1600) return 'Bạc I';

    // Gold (1600 - 1799)
    if (score < 1650) return 'Vàng IV';
    if (score < 1700) return 'Vàng III';
    if (score < 1750) return 'Vàng II';
    if (score < 1800) return 'Vàng I';

    // Platinum (1800 - 1999)
    if (score < 1850) return 'Bạch Kim IV';
    if (score < 1900) return 'Bạch Kim III';
    if (score < 1950) return 'Bạch Kim II';
    if (score < 2000) return 'Bạch Kim I';

    // Diamond (2000 - 2199)
    if (score < 2050) return 'Kim Cương IV';
    if (score < 2100) return 'Kim Cương III';
    if (score < 2150) return 'Kim Cương II';
    if (score < 2200) return 'Kim Cương I';

    // Master (2200 - 2499)
    if (score < 2500) return 'Cao Thủ';

    // Grandmaster (2500 - 2799)
    if (score < 2800) return 'Đại Cao Thủ';

    // Challenger (2800+)
    return 'Thách Đấu';
};
