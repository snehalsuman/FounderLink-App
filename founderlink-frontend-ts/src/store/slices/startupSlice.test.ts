import { configureStore } from '@reduxjs/toolkit';
import startupReducer, {
  fetchStartups,
  setCurrentPage,
  selectStartups,
  selectStartupLoading,
  selectStartupError,
  selectTotalPages,
  selectCurrentPage,
} from './startupSlice';
import type { StartupState } from '../../types';

// mock the API
jest.mock('../../core/api/startupApi', () => ({
  getAllStartups: jest.fn(),
}));

import { getAllStartups } from '../../core/api/startupApi';
const mockGetAllStartups = getAllStartups as jest.MockedFunction<typeof getAllStartups>;

const makeStore = () =>
  configureStore({ reducer: { startups: startupReducer } });

const sampleStartup = {
  id: 1, name: 'TechCorp', industry: 'FinTech', description: 'Desc',
  problemStatement: 'PS', solution: 'Sol', fundingGoal: 500000,
  stage: 'MVP', location: 'Bangalore', founderId: 10,
  isApproved: true, isRejected: false, createdAt: '2024-01-01',
};

const emptyState: StartupState = {
  items: [], totalPages: 0, totalElements: 0,
  currentPage: 0, loading: false, error: null,
};

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('startupSlice – normal working', () => {
  it('returns the initial state', () => {
    expect(startupReducer(undefined, { type: '@@INIT' })).toEqual(emptyState);
  });

  it('setCurrentPage updates currentPage', () => {
    const state = startupReducer(emptyState, setCurrentPage(3));
    expect(state.currentPage).toBe(3);
  });

  it('fetchStartups.fulfilled populates items and pagination', async () => {
    const store = makeStore();
    mockGetAllStartups.mockResolvedValueOnce({
      data: { content: [sampleStartup], totalPages: 5, totalElements: 42 },
    } as any);

    await store.dispatch(fetchStartups({ page: 0, size: 10 }));
    const state = store.getState().startups;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('TechCorp');
    expect(state.totalPages).toBe(5);
    expect(state.totalElements).toBe(42);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('selectStartups returns items from state', () => {
    const rootState = { startups: { ...emptyState, items: [sampleStartup] } } as any;
    expect(selectStartups(rootState)).toHaveLength(1);
  });

  it('selectStartupLoading returns loading flag', () => {
    const rootState = { startups: { ...emptyState, loading: true } } as any;
    expect(selectStartupLoading(rootState)).toBe(true);
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('startupSlice – boundary values', () => {
  it('fetchStartups with no params defaults to page 0, size 10', async () => {
    const store = makeStore();
    mockGetAllStartups.mockResolvedValueOnce({
      data: { content: [], totalPages: 0, totalElements: 0 },
    } as any);

    await store.dispatch(fetchStartups(undefined));
    expect(mockGetAllStartups).toHaveBeenCalledWith(0, 10);
  });

  it('fetchStartups.fulfilled with empty content sets items to []', async () => {
    const store = makeStore();
    mockGetAllStartups.mockResolvedValueOnce({
      data: { content: [], totalPages: 0, totalElements: 0 },
    } as any);

    await store.dispatch(fetchStartups({}));
    expect(store.getState().startups.items).toEqual([]);
  });

  it('setCurrentPage with page 0 sets to 0', () => {
    const state = startupReducer({ ...emptyState, currentPage: 5 }, setCurrentPage(0));
    expect(state.currentPage).toBe(0);
  });

  it('selectCurrentPage returns 0 from initial state', () => {
    const rootState = { startups: emptyState } as any;
    expect(selectCurrentPage(rootState)).toBe(0);
  });

  it('selectTotalPages returns 0 when no data loaded', () => {
    const rootState = { startups: emptyState } as any;
    expect(selectTotalPages(rootState)).toBe(0);
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('startupSlice – exception handling', () => {
  it('fetchStartups.pending sets loading to true and clears error', async () => {
    const store = makeStore();
    mockGetAllStartups.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );

    const promise = store.dispatch(fetchStartups({}));
    const pendingState = store.getState().startups;
    expect(pendingState.loading).toBe(true);
    expect(pendingState.error).toBeNull();
    promise.catch(() => {}); // suppress unhandled
  });

  it('fetchStartups.rejected sets error message and clears loading', async () => {
    const store = makeStore();
    mockGetAllStartups.mockRejectedValueOnce({
      response: { data: { message: 'Service unavailable' } },
    });

    await store.dispatch(fetchStartups({}));
    const state = store.getState().startups;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Service unavailable');
  });

  it('fetchStartups.rejected uses fallback message when no response data', async () => {
    const store = makeStore();
    mockGetAllStartups.mockRejectedValueOnce(new Error('Network Error'));

    await store.dispatch(fetchStartups({}));
    expect(store.getState().startups.error).toBe('Failed to load startups');
  });

  it('selectStartupError returns error string', () => {
    const rootState = { startups: { ...emptyState, error: 'fetch failed' } } as any;
    expect(selectStartupError(rootState)).toBe('fetch failed');
  });
});