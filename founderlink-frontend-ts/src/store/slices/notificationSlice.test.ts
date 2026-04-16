import notificationReducer, { setUnreadCount, decrementUnread } from './notificationSlice';
import type { NotificationState } from '../../types';

const initialState: NotificationState = { unreadCount: 0 };

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('notificationSlice – normal working', () => {
  it('returns initial state with unreadCount 0', () => {
    expect(notificationReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setUnreadCount sets the count', () => {
    const state = notificationReducer(initialState, setUnreadCount(5));
    expect(state.unreadCount).toBe(5);
  });

  it('setUnreadCount overwrites existing count', () => {
    let state = notificationReducer(initialState, setUnreadCount(10));
    state = notificationReducer(state, setUnreadCount(3));
    expect(state.unreadCount).toBe(3);
  });

  it('decrementUnread reduces count by 1 when count > 0', () => {
    const state = notificationReducer({ unreadCount: 5 }, decrementUnread());
    expect(state.unreadCount).toBe(4);
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('notificationSlice – boundary values', () => {
  it('decrementUnread does NOT go below 0', () => {
    const state = notificationReducer({ unreadCount: 0 }, decrementUnread());
    expect(state.unreadCount).toBe(0);
  });

  it('setUnreadCount with 0 sets count to 0', () => {
    const state = notificationReducer({ unreadCount: 10 }, setUnreadCount(0));
    expect(state.unreadCount).toBe(0);
  });

  it('setUnreadCount with 1 — decrementUnread brings it to 0', () => {
    let state = notificationReducer(initialState, setUnreadCount(1));
    state = notificationReducer(state, decrementUnread());
    expect(state.unreadCount).toBe(0);
  });

  it('setUnreadCount with large number (999)', () => {
    const state = notificationReducer(initialState, setUnreadCount(999));
    expect(state.unreadCount).toBe(999);
  });

  it('multiple decrementUnread calls stop at 0', () => {
    let state = notificationReducer(initialState, setUnreadCount(2));
    state = notificationReducer(state, decrementUnread());
    state = notificationReducer(state, decrementUnread());
    state = notificationReducer(state, decrementUnread()); // extra call
    expect(state.unreadCount).toBe(0);
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('notificationSlice – exception handling', () => {
  it('unknown action returns state unchanged', () => {
    const state = { unreadCount: 7 };
    expect(notificationReducer(state, { type: 'unknown/action' })).toEqual(state);
  });

  it('setUnreadCount with negative number stores the value (no guard)', () => {
    // The reducer doesn't guard against negatives — this documents the current behavior
    const state = notificationReducer(initialState, setUnreadCount(-1));
    expect(state.unreadCount).toBe(-1);
  });
});