export interface LotteryPrize {
  id: string;
  name: string;
  reward: string;
  amount: number;
  number: string[];
}

export interface LotteryResult {
  date: string;
  endpoint: string;
  prizes: LotteryPrize[];
  runningNumbers: LotteryPrize[];
}

export interface ApiResponse {
  status: string;
  response: LotteryResult;
}

export async function getLatestLottery(): Promise<LotteryResult | null> {
  try {
    const response = await fetch('https://lotto.api.rayriffy.com/latest');
    const data: ApiResponse = await response.json();
    
    if (data.status === 'success') {
      return data.response;
    }
    return null;
  } catch (error) {
    console.error('Error fetching lottery data:', error);
    return null;
  }
}

export async function checkLottery(number: string): Promise<{ isWin: boolean; prizes: string[] }> {
  const result = await getLatestLottery();
  if (!result) return { isWin: false, prizes: [] };

  const wonPrizes: string[] = [];

  // Check standard prizes
  result.prizes.forEach(prize => {
    if (prize.number.includes(number)) {
      wonPrizes.push(`${prize.name} (${prize.reward} บาท)`);
    }
  });

  // Check running numbers (3 digits, 2 digits)
  result.runningNumbers.forEach(prize => {
    if (prize.id === 'runningNumberFrontThree') {
      if (prize.number.includes(number.substring(0, 3))) {
        wonPrizes.push(`${prize.name} (${prize.reward} บาท)`);
      }
    } else if (prize.id === 'runningNumberBackThree') {
      if (prize.number.includes(number.substring(3))) {
        wonPrizes.push(`${prize.name} (${prize.reward} บาท)`);
      }
    } else if (prize.id === 'runningNumberBackTwo') {
      if (prize.number.includes(number.substring(4))) {
        wonPrizes.push(`${prize.name} (${prize.reward} บาท)`);
      }
    }
  });

  return {
    isWin: wonPrizes.length > 0,
    prizes: wonPrizes
  };
}
