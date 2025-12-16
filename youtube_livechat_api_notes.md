# YouTube Live Chat API Notes

## API Endpoint
```
GET https://www.googleapis.com/youtube/v3/liveChat/messages
```

## Required Parameters
- `liveChatId`: The ID of the chat (from liveBroadcast resource's snippet.liveChatId)
- `part`: Resource parts to include (id, snippet, authorDetails)

## Optional Parameters
- `maxResults`: 200-2000 (default 500)
- `pageToken`: For pagination (use nextPageToken from previous response)
- `profileImageSize`: 16-720 (default 88)

## Response Structure
```json
{
  "kind": "youtube#liveChatMessageListResponse",
  "nextPageToken": "string",
  "pollingIntervalMillis": "unsigned integer",
  "items": [liveChatMessage resources]
}
```

## Key Points
1. Use `nextPageToken` for subsequent requests
2. Respect `pollingIntervalMillis` to avoid rate limits
3. Messages ordered oldest to newest
4. First request returns chat history

## Flow to Get Live Chat
1. Get video ID from channel
2. Get liveBroadcast details to find liveChatId
3. Poll liveChatMessages with liveChatId
4. Use nextPageToken for new messages
5. Wait pollingIntervalMillis between requests

## Authentication
- Requires YouTube Data API v3 key
- Some operations may require OAuth 2.0
