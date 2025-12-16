# YouTube Live Chat API Integration Notes

## Steps to Fetch Live Chat Messages:

### 1. Get Live Video ID
- Search for live events from channel: `GET /youtube/v3/search?part=snippet&channelId={CHANNEL_ID}&order=date&type=video&eventType=live`
- Find item where `snippet.liveBroadcastContent` is "live"
- Extract `id.videoId`

### 2. Get Live Chat ID
- Request video details: `GET /youtube/v3/videos?part=liveStreamingDetails,snippet&id={VIDEO_ID}`
- Extract `liveStreamingDetails.activeLiveChatId`

### 3. Fetch Live Chat Messages
- Request chat messages: `GET /youtube/v3/liveChat/messages?liveChatId={LIVE_CHAT_ID}&part=snippet,authorDetails`
- Poll using `nextPageToken` and `pollingIntervalMillis` from response

## Key Points:
- All API requests require a YouTube Data API key (no OAuth required for reading)
- Need to poll periodically using `pollingIntervalMillis` from response
- Response includes `nextPageToken` for pagination

## Thai Lottery Channel:
- Channel: Thai Lottery (สำนักงานสลากกินแบ่งรัฐบาล)
- Channel ID: UCPMzWdBjLMM5dLPbNJUJBvw (checksiamlotto)
