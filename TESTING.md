# Testing Guide - API Flooding Prevention

## Overview

This test suite ensures that the application does not flood the backend with duplicate API requests. The tests specifically validate the fix for the scenario where 30,000+ requests were being made to the same endpoint.

## Critical Tests

### 1. API Flooding Prevention Test (`src/__tests__/api-flooding.test.ts`)

**Purpose**: Validates that 30,000 simultaneous requests for the same userId only result in ONE API call.

**Key Test**:
```typescript
it('CRITICAL: should prevent flooding when 30,000 requests are made for the same userId', async () => {
  // Makes 30,000 requests
  // Verifies only ONE API call is made
})
```

**What it tests**:
- Service-level request deduplication
- Prevents backend flooding
- Ensures all requests share the same promise

### 2. SongsService Tests (`src/services/__tests__/SongsService.test.ts`)

**Purpose**: Tests request deduplication at the service layer.

**Key Tests**:
- Multiple simultaneous requests → ONE API call
- Different userIds → Separate API calls
- Error handling → Cache clearing
- Sequential requests → New requests after completion

### 3. PlaylistsService Tests (`src/services/__tests__/PlaylistsService.test.ts`)

**Purpose**: Tests request deduplication for playlists endpoints.

## Running Tests

```bash
# Run all tests
npm test

# Run only critical flooding tests
npm test -- src/__tests__/api-flooding.test.ts

# Run service tests
npm test -- src/services/__tests__/

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage
```

## Test Results

All critical tests should pass:
- ✅ 30,000 requests → 1 API call
- ✅ 100 simultaneous requests → 1 API call
- ✅ Different userIds → Separate calls
- ✅ Error handling works correctly

## What These Tests Prevent

1. **Backend Flooding**: Prevents thousands of duplicate requests
2. **Performance Issues**: Ensures efficient API usage
3. **Cost Reduction**: Reduces unnecessary API calls
4. **Stability**: Prevents backend overload

## Implementation Details

The tests validate:
- Service-level `pendingRequests` Map for deduplication
- React Cache at repository level
- Proper cache clearing after request completion
- Error handling that clears cache

## CI/CD Integration

These tests should be run:
- Before every commit
- In CI/CD pipeline
- Before production deployment

If any of these tests fail, it indicates a regression in the flooding prevention mechanism.

