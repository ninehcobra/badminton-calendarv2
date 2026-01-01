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
    if (score < 1200) return 'Iron IV'; // 1000 - 1200
    if (score < 1400) return 'Bronze';
    if (score < 1600) return 'Silver';
    if (score < 1800) return 'Gold';
    if (score < 2000) return 'Platinum';
    if (score < 2200) return 'Diamond';
    return 'Challenger';
};
