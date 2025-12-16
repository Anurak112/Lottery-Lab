import { create } from 'zustand';

export interface LotteryResult {
  date: string;
  first: string;
  last2: string;
  front3: string[];
  back3: string[];
  back2: string;
}

export interface LotteryStats {
  hotNumbers: { number: string; count: number }[];
  coldNumbers: { number: string; count: number }[];
  numberFrequency: Record<string, number>;
}

interface LotteryState {
  // Latest Result
  latestResult: LotteryResult | null;
  setLatestResult: (result: LotteryResult) => void;
  
  // Historical Results
  historicalResults: LotteryResult[];
  setHistoricalResults: (results: LotteryResult[]) => void;
  addHistoricalResult: (result: LotteryResult) => void;
  
  // Statistics
  stats: LotteryStats | null;
  setStats: (stats: LotteryStats) => void;
  
  // Loading States
  isLoadingLatest: boolean;
  isLoadingHistorical: boolean;
  isLoadingStats: boolean;
  setLoadingLatest: (loading: boolean) => void;
  setLoadingHistorical: (loading: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
  
  // Error States
  error: string | null;
  setError: (error: string | null) => void;
  
  // Selected Year for Historical View
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  
  // Number Checker
  checkedNumbers: string[];
  addCheckedNumber: (number: string) => void;
  removeCheckedNumber: (number: string) => void;
  clearCheckedNumbers: () => void;
  
  // Lucky Numbers
  luckyNumbers: string[];
  setLuckyNumbers: (numbers: string[]) => void;
  generateLuckyNumbers: () => void;
}

const currentYear = new Date().getFullYear() + 543; // Buddhist Era

export const useLotteryStore = create<LotteryState>((set, get) => ({
  // Latest Result
  latestResult: null,
  setLatestResult: (latestResult) => set({ latestResult }),
  
  // Historical Results
  historicalResults: [],
  setHistoricalResults: (historicalResults) => set({ historicalResults }),
  addHistoricalResult: (result) => set((state) => ({
    historicalResults: [result, ...state.historicalResults]
  })),
  
  // Statistics
  stats: null,
  setStats: (stats) => set({ stats }),
  
  // Loading States
  isLoadingLatest: false,
  isLoadingHistorical: false,
  isLoadingStats: false,
  setLoadingLatest: (isLoadingLatest) => set({ isLoadingLatest }),
  setLoadingHistorical: (isLoadingHistorical) => set({ isLoadingHistorical }),
  setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
  
  // Error States
  error: null,
  setError: (error) => set({ error }),
  
  // Selected Year
  selectedYear: currentYear,
  setSelectedYear: (selectedYear) => set({ selectedYear }),
  
  // Number Checker
  checkedNumbers: [],
  addCheckedNumber: (number) => set((state) => ({
    checkedNumbers: state.checkedNumbers.includes(number)
      ? state.checkedNumbers
      : [...state.checkedNumbers, number]
  })),
  removeCheckedNumber: (number) => set((state) => ({
    checkedNumbers: state.checkedNumbers.filter((n) => n !== number)
  })),
  clearCheckedNumbers: () => set({ checkedNumbers: [] }),
  
  // Lucky Numbers
  luckyNumbers: [],
  setLuckyNumbers: (luckyNumbers) => set({ luckyNumbers }),
  generateLuckyNumbers: () => {
    const numbers: string[] = [];
    // Generate 6-digit number
    numbers.push(String(Math.floor(Math.random() * 1000000)).padStart(6, '0'));
    // Generate 3-digit numbers
    numbers.push(String(Math.floor(Math.random() * 1000)).padStart(3, '0'));
    numbers.push(String(Math.floor(Math.random() * 1000)).padStart(3, '0'));
    // Generate 2-digit number
    numbers.push(String(Math.floor(Math.random() * 100)).padStart(2, '0'));
    set({ luckyNumbers: numbers });
  },
}));
