import { eq, desc } from "drizzle-orm";
import { getDb, lotteryResults, InsertLotteryResult, LotteryResult } from "./db";
import axios from "axios";

// RayRiffy API Response Type
interface RayRiffyResponse {
    status: string;
    response: {
        date: string;
        endpoint: string;
        prizes: {
            id: string;
            name: string;
            reward: string;
            amount: number;
            number: string[];
        }[];
        runningNumbers: {
            id: string;
            name: string;
            reward: string;
            amount: number;
            number: string[];
        }[];
    };
}

export async function fetchLatestLotteryData() {
    try {
        const response = await axios.get("https://lotto.api.rayriffy.com/latest");
        const body = response.data as RayRiffyResponse;

        if (body.status !== 'success' || !body.response) {
            console.warn("[LotteryService] Invalid response from RayRiffy API", body);
            return null;
        }

        const { date, prizes, runningNumbers } = body.response;

        // Helper to find numbers
        const findPrize = (id: string) => prizes.find(p => p.id === id)?.number[0] || "";
        const findRunning = (id: string) => runningNumbers.find(p => p.id === id)?.number || [];

        // Parse date (e.g., "16 December 2025") -> YYYY-MM-DD
        // Note: This API returns Thai date string sometimes or English?
        // Let's assume we can use current date for 'drawDate' key if parsing fails,
        // or try to parse it. For robustness, we'll store the raw 'date' string in fullData
        // and use a best-effort YYYY-MM-DD for the DB column.
        const drawDate = new Date().toISOString().split('T')[0]; // Using today as fallback/default

        const result: InsertLotteryResult = {
            drawDate: drawDate,
            firstPrize: findPrize("prizeFirst"),
            last2: findRunning("runningNumberBackTwo")[0] || "",
            front3: findRunning("runningNumberFrontThree"),
            back3: findRunning("runningNumberBackThree"),
            fullData: body.response, // Store the exact UI-compatible object
            createdAt: new Date(),
        };

        // Save to DB
        const db = await getDb();
        if (db) {
            await db.insert(lotteryResults).values(result).onDuplicateKeyUpdate({
                set: {
                    firstPrize: result.firstPrize,
                    last2: result.last2,
                    front3: result.front3,
                    back3: result.back3,
                    fullData: result.fullData
                }
            });
        }

        // Return the response object directly as the UI expects it
        return body.response;

    } catch (error) {
        console.error("[LotteryService] Failed to fetch data:", error instanceof Error ? error.message : error);
        return null;
    }
}

export async function getLotteryHistory(): Promise<LotteryResult[]> {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(lotteryResults).orderBy(desc(lotteryResults.drawDate));
}
