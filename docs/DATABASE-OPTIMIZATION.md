# Database Load Optimization

## Problem Identified
Multiple components were running independent polling intervals, causing excessive database calls:

### Before Optimization:
- **RefereePanel**: 1 second interval = 3,600 queries/hour
- **LiveScoreboard**: 10 second interval = 360 queries/hour
- **Statistics**: 15 second interval = 240 queries/hour
- **useRealtimeSubscriptions fallback**: 10 second interval = 360 queries/hour

**Total with all components open**: ~4,560 queries/hour per user
**With 10 concurrent users**: ~45,600 queries/hour

## Solution Implemented

### 1. Centralized Real-time Updates
- **Primary**: Supabase real-time subscriptions (WebSocket-based, instant updates)
- **Fallback**: Single polling hook at 30-second intervals (only if real-time fails)
- **Component-level polling**: Removed completely

### 2. Changes Made

#### Removed Polling From:
✅ `LiveScoreboard.tsx` - Removed 10-second polling
✅ `Statistics.tsx` - Removed 15-second polling  
✅ `RefereePanel.tsx` - Removed 1-second polling (kept storage event listeners)

#### Updated Fallback:
✅ `useRealtimeSubscriptions.ts` - Increased fallback from 10s to 30s

#### Added Manual Refresh:
✅ `LiveScoreboard.tsx` - Added refresh button with loading state
✅ `Statistics.tsx` - Added refresh button with loading state

### After Optimization:

**With Real-time Working** (preferred):
- 0 polling queries (only WebSocket subscriptions)
- Instant updates across all clients
- **~100% reduction in database load**

**With Real-time Failed** (fallback):
- 30 second fallback interval = 120 queries/hour
- Manual refresh available
- **~97% reduction in database load** (from 4,560 to 120)

**With 10 concurrent users**:
- Before: ~45,600 queries/hour
- After: ~1,200 queries/hour (fallback mode)
- After: ~0 queries/hour (real-time mode)
- **~97-100% reduction**

## How It Works

### Real-time Flow:
```
Referee updates score
  ↓
Data saved to Supabase
  ↓
Supabase broadcasts change via WebSocket
  ↓
All connected clients receive update instantly
  ↓
UI updates automatically (0-100ms latency)
```

### Fallback Flow (if real-time unavailable):
```
Referee updates score
  ↓
Data saved to Supabase
  ↓
useRealtimeSubscriptions polls every 30 seconds
  ↓
All clients refresh data
  ↓
UI updates (max 30 second delay)
```

### Manual Refresh:
- Users can click "Refresh" button for immediate update
- Button shows loading spinner during refresh
- Disabled while loading to prevent spam

## Performance Benefits

### Database Load:
- **97-100% reduction** in queries
- Reduced server costs
- Better scalability
- Faster response times

### User Experience:
- Instant updates with real-time
- Cleaner, more predictable update pattern
- Manual refresh option for control
- No performance degradation with more users

### Developer Experience:
- Single source of truth for updates
- Easier to debug (one polling mechanism)
- Better logging and monitoring
- Centralized error handling

## Configuration

### Enable Real-time (Recommended):
1. Run SQL in Supabase dashboard:
   ```sql
   ALTER TABLE "teams" REPLICA IDENTITY FULL;
   ALTER TABLE "matches" REPLICA IDENTITY FULL;
   ALTER TABLE "courts" REPLICA IDENTITY FULL;
   ALTER TABLE "referees" REPLICA IDENTITY FULL;
   ALTER TABLE "zones" REPLICA IDENTITY FULL;
   
   ALTER PUBLICATION supabase_realtime ADD TABLE "teams";
   ALTER PUBLICATION supabase_realtime ADD TABLE "matches";
   ALTER PUBLICATION supabase_realtime ADD TABLE "courts";
   ALTER PUBLICATION supabase_realtime ADD TABLE "referees";
   ALTER PUBLICATION supabase_realtime ADD TABLE "zones";
   ```

2. Real-time subscriptions automatically enabled via `useRealtimeSubscriptions` hook

### Adjust Fallback Interval:
Edit `src/hooks/useRealtimeSubscriptions.ts`:
```typescript
}, 30000); // Change this value (in milliseconds)
```

### Monitor Status:
Check browser console for logs:
- `[REALTIME] ✅ Successfully subscribed` = Real-time working
- `[REALTIME] Starting fallback polling` = Using fallback

## Testing

### Verify Optimization:
1. Open browser DevTools → Network tab
2. Filter by "fetch" or "XHR"
3. Count requests over 1 minute
4. Should see minimal requests (only initial load + fallback if real-time disabled)

### Verify Real-time:
1. Open LiveScoreboard in two browser tabs
2. Update score in RefereePanel
3. Both LiveScoreboard tabs should update instantly
4. Check console for `[REALTIME] ✅` message

### Test Manual Refresh:
1. Open LiveScoreboard or Statistics
2. Click "Refresh" button
3. Button should show spinner and disable during refresh
4. Data should update immediately

## Maintenance

### If Updates Seem Slow:
1. Check console for real-time subscription status
2. Verify Supabase real-time is enabled (see Configuration)
3. Check network connectivity
4. Use manual refresh button as temporary solution

### If Errors Occur:
- Hook automatically falls back to 30-second polling
- Check console for error messages
- Verify Supabase connection
- Manual refresh always available

## Future Improvements

### Potential Enhancements:
- [ ] Add connection status indicator in UI
- [ ] Implement exponential backoff for fallback
- [ ] Add "Last updated" timestamp
- [ ] Offline mode with local storage
- [ ] Selective subscriptions (only active matches)
- [ ] Batch updates for better performance

### Monitoring:
- [ ] Track real-time vs fallback usage
- [ ] Monitor query count in Supabase dashboard
- [ ] Alert on subscription failures
- [ ] Log performance metrics
