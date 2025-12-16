import { callDataApi } from "./_core/dataApi";

// Thai Lottery official channel ID
const LOTTERY_CHANNEL_ID = "UCPMzWdBjLMM5dLPbNJUJBvw";

interface YouTubeVideo {
  type: string;
  video?: {
    videoId: string;
    title: string;
    isLiveNow?: boolean;
    thumbnails?: Array<{ url: string; width: number; height: number }>;
  };
}

interface YouTubeChannelResponse {
  contents?: YouTubeVideo[];
}

interface YouTubeChatMessage {
  id: string;
  authorName: string;
  authorPhoto: string;
  message: string;
  timestamp: string;
  isYouTube: boolean;
}

// Cache for live video info
let cachedLiveVideoId: string | null = null;
let cachedLiveChatId: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get the current live video from the Thai Lottery channel
 */
export async function getLiveVideoId(): Promise<string | null> {
  // Check cache first
  if (cachedLiveVideoId && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedLiveVideoId;
  }

  try {
    // Use the Data API to get channel videos with live_now filter
    const response = await callDataApi("Youtube/get_channel_videos", {
      query: {
        id: LOTTERY_CHANNEL_ID,
        filter: "live_now",
        hl: "th",
        gl: "TH",
      },
    }) as YouTubeChannelResponse;

    if (response?.contents && response.contents.length > 0) {
      const liveVideo = response.contents.find(
        (item) => item.type === "video" && item.video?.isLiveNow
      );
      
      if (liveVideo?.video?.videoId) {
        cachedLiveVideoId = liveVideo.video.videoId;
        cacheTimestamp = Date.now();
        return cachedLiveVideoId;
      }
    }

    // If no live video, try to get the latest stream
    const latestResponse = await callDataApi("Youtube/get_channel_videos", {
      query: {
        id: LOTTERY_CHANNEL_ID,
        filter: "streams_latest",
        hl: "th",
        gl: "TH",
      },
    }) as YouTubeChannelResponse;

    if (latestResponse?.contents && latestResponse.contents.length > 0) {
      const latestStream = latestResponse.contents[0];
      if (latestStream?.video?.videoId) {
        cachedLiveVideoId = latestStream.video.videoId;
        cacheTimestamp = Date.now();
        return cachedLiveVideoId;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching live video:", error);
    return null;
  }
}

/**
 * Get live chat messages from YouTube
 * Note: YouTube Live Chat API requires OAuth for real-time chat access
 * This is a simplified version that fetches available data
 */
export async function getYouTubeLiveChat(): Promise<YouTubeChatMessage[]> {
  try {
    const videoId = await getLiveVideoId();
    
    if (!videoId) {
      return [];
    }

    // Note: Full YouTube Live Chat API requires OAuth authentication
    // For now, we'll return mock data based on the live video status
    // In production, you would need to implement OAuth flow
    
    return [];
  } catch (error) {
    console.error("Error fetching YouTube live chat:", error);
    return [];
  }
}

/**
 * Get current live stream status
 */
export async function getLiveStreamStatus(): Promise<{
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
}> {
  try {
    const response = await callDataApi("Youtube/get_channel_videos", {
      query: {
        id: LOTTERY_CHANNEL_ID,
        filter: "live_now",
        hl: "th",
        gl: "TH",
      },
    }) as YouTubeChannelResponse;

    if (response?.contents && response.contents.length > 0) {
      const liveVideo = response.contents.find(
        (item) => item.type === "video" && item.video?.isLiveNow
      );
      
      if (liveVideo?.video) {
        return {
          isLive: true,
          videoId: liveVideo.video.videoId,
          title: liveVideo.video.title,
          thumbnail: liveVideo.video.thumbnails?.[0]?.url || null,
        };
      }
    }

    // Get latest stream if not live
    const latestResponse = await callDataApi("Youtube/get_channel_videos", {
      query: {
        id: LOTTERY_CHANNEL_ID,
        filter: "streams_latest",
        hl: "th",
        gl: "TH",
      },
    }) as YouTubeChannelResponse;

    if (latestResponse?.contents && latestResponse.contents.length > 0) {
      const latestStream = latestResponse.contents[0];
      if (latestStream?.video) {
        return {
          isLive: false,
          videoId: latestStream.video.videoId,
          title: latestStream.video.title,
          thumbnail: latestStream.video.thumbnails?.[0]?.url || null,
        };
      }
    }

    return {
      isLive: false,
      videoId: null,
      title: null,
      thumbnail: null,
    };
  } catch (error) {
    console.error("Error fetching live stream status:", error);
    return {
      isLive: false,
      videoId: null,
      title: null,
      thumbnail: null,
    };
  }
}

/**
 * Search for Thai Lottery related live streams
 */
export async function searchLotteryStreams(): Promise<Array<{
  videoId: string;
  title: string;
  channelTitle: string;
  isLive: boolean;
  thumbnail: string | null;
}>> {
  try {
    const response = await callDataApi("Youtube/search", {
      query: {
        q: "ถ่ายทอดสด หวย สลากกินแบ่งรัฐบาล",
        hl: "th",
        gl: "TH",
      },
    }) as { contents?: Array<{ type: string; video?: { videoId: string; title: string; channelTitle: string; isLiveNow?: boolean; thumbnails?: Array<{ url: string }> } }> };

    if (response?.contents) {
      return response.contents
        .filter((item) => item.type === "video" && item.video)
        .map((item) => ({
          videoId: item.video!.videoId,
          title: item.video!.title,
          channelTitle: item.video!.channelTitle || "Unknown",
          isLive: item.video!.isLiveNow || false,
          thumbnail: item.video!.thumbnails?.[0]?.url || null,
        }))
        .slice(0, 10);
    }

    return [];
  } catch (error) {
    console.error("Error searching lottery streams:", error);
    return [];
  }
}
