export interface NumberStat {
  number: string;
  count: number;
}

export interface DigitStat {
  digit: number;
  zero: number;
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
  eight: number;
  nine: number;
}

export const digitStats = [
  {
    position: "Tens",
    stats: [33, 26, 26, 18, 18, 24, 30, 22, 17, 26]
  },
  {
    position: "Units",
    stats: [18, 22, 26, 30, 24, 24, 26, 32, 18, 20]
  }
];

export const totalDigitStats = [51, 48, 52, 48, 42, 48, 56, 54, 35, 46];

export const frequencyStats: NumberStat[] = [
  { number: "03", count: 8 },
  { number: "17", count: 6 }, { number: "24", count: 6 }, { number: "67", count: 6 }, { number: "72", count: 6 },
  { number: "05", count: 5 }, { number: "06", count: 5 }, { number: "61", count: 5 },
  { number: "19", count: 4 }, { number: "38", count: 4 }, { number: "46", count: 4 }, { number: "50", count: 4 },
  { number: "52", count: 4 }, { number: "63", count: 4 }, { number: "64", count: 4 }, { number: "79", count: 4 },
  { number: "83", count: 4 }, { number: "94", count: 4 }, { number: "96", count: 4 }, { number: "97", count: 4 },
  { number: "02", count: 3 }, { number: "04", count: 3 }, { number: "07", count: 3 }, { number: "09", count: 3 },
  { number: "11", count: 3 }, { number: "12", count: 3 }, { number: "15", count: 3 }, { number: "16", count: 3 },
  { number: "23", count: 3 }, { number: "26", count: 3 }, { number: "27", count: 3 }, { number: "29", count: 3 },
  { number: "31", count: 3 }, { number: "43", count: 3 }, { number: "53", count: 3 }, { number: "59", count: 3 },
  { number: "60", count: 3 }, { number: "65", count: 3 }, { number: "86", count: 3 }, { number: "87", count: 3 },
  { number: "91", count: 3 }, { number: "93", count: 3 }, { number: "95", count: 3 },
  { number: "00", count: 2 }, { number: "18", count: 2 }, { number: "22", count: 2 }, { number: "25", count: 2 },
  { number: "28", count: 2 }, { number: "30", count: 2 }, { number: "32", count: 2 }, { number: "34", count: 2 },
  { number: "35", count: 2 }, { number: "37", count: 2 }, { number: "40", count: 2 }, { number: "41", count: 2 },
  { number: "42", count: 2 }, { number: "44", count: 2 }, { number: "47", count: 2 }, { number: "51", count: 2 },
  { number: "55", count: 2 }, { number: "56", count: 2 }, { number: "57", count: 2 }, { number: "58", count: 2 },
  { number: "62", count: 2 }, { number: "69", count: 2 }, { number: "71", count: 2 }, { number: "73", count: 2 },
  { number: "75", count: 2 }, { number: "78", count: 2 }, { number: "88", count: 2 }, { number: "90", count: 2 },
  { number: "98", count: 2 },
  { number: "08", count: 1 }, { number: "10", count: 1 }, { number: "14", count: 1 }, { number: "20", count: 1 },
  { number: "21", count: 1 }, { number: "36", count: 1 }, { number: "45", count: 1 }, { number: "68", count: 1 },
  { number: "70", count: 1 }, { number: "74", count: 1 }, { number: "76", count: 1 }, { number: "77", count: 1 },
  { number: "81", count: 1 }, { number: "82", count: 1 }, { number: "84", count: 1 }, { number: "85", count: 1 },
  { number: "89", count: 1 }, { number: "92", count: 1 }
];

export const getTopFrequent = (limit: number = 5) => {
  return [...frequencyStats].sort((a, b) => b.count - a.count).slice(0, limit);
};

export const getAllNumbers = () => {
  // Generate 00-99
  const all = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
  const statsMap = new Map(frequencyStats.map(s => [s.number, s.count]));
  
  return all.map(num => ({
    number: num,
    count: statsMap.get(num) || 0
  }));
};
