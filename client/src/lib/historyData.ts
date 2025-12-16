export interface YearlyStats {
  year: number;
  totalDraws: number;
  mostFrequent: { number: string; count: number }[];
  digitFrequency: {
    digit: number;
    count: number;
  }[];
  draws: {
    date: string;
    firstPrize: string;
    lastTwo: string;
    frontThree: string[];
    backThree: string[];
  }[];
}

// Mock data generator for demonstration
const generateYearlyData = (year: number): YearlyStats => {
  const draws = [];
  const digitCounts = Array(10).fill(0);
  const numberCounts = new Map<string, number>();

  // Generate 24 draws (2 per month)
  for (let i = 1; i <= 24; i++) {
    const month = Math.ceil(i / 2);
    const day = i % 2 === 1 ? "01" : "16";
    const date = `${day}/${month.toString().padStart(2, '0')}/${year + 543}`; // Thai Year
    
    // Random winning numbers
    const firstPrize = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const lastTwo = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const frontThree = [
      Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    ];
    const backThree = [
      Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    ];

    draws.push({ date, firstPrize, lastTwo, frontThree, backThree });

    // Update stats
    const d1 = parseInt(lastTwo[0]);
    const d2 = parseInt(lastTwo[1]);
    digitCounts[d1]++;
    digitCounts[d2]++;
    
    numberCounts.set(lastTwo, (numberCounts.get(lastTwo) || 0) + 1);
  }

  const mostFrequent = Array.from(numberCounts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const digitFrequency = digitCounts.map((count, digit) => ({ digit, count }));

  return {
    year,
    totalDraws: 24,
    mostFrequent,
    digitFrequency,
    draws: draws.reverse() // Newest first
  };
};

export const historicalData: Record<number, YearlyStats> = {
  2025: generateYearlyData(2025),
  2024: generateYearlyData(2024),
  2023: generateYearlyData(2023),
  2022: generateYearlyData(2022),
  2021: generateYearlyData(2021),
};
