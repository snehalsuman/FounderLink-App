import authReducer, {
  setCredentials,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from './authSlice';
import type { AuthState } from '../../types';

// mock tokenService so tests don't touch real localStorage
jest.mock('../../core/tokenService', () => ({
  __esModule: true,
  default: {
    getToken: jest.fn(() => null),
    getUser: jest.fn(() => null),
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    setUser: jest.fn(),
    clearAll: jest.fn(),
  },
}));

import tokenService from '../../core/tokenService';

const emptyState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const credentials = {
  token: 'access.token.here',
  refreshToken: 'refresh.token.here',
  userId: 1,
  role: 'ROLE_FOUNDER',
  email: 'alice@example.com',
  name: 'Alice',
};

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('authSlice – normal working', () => {
  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(emptyState);
  });

  it('setCredentials sets token, user, and isAuthenticated', () => {
    const state = authReducer(emptyState, setCredentials(credentials));
    expect(state.token).toBe('access.token.here');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'alice@example.com',
      name: 'Alice',
    });
  });

  it('setCredentials calls tokenService.setToken', () => {
    authReducer(emptyState, setCredentials(credentials));
    expect(tokenService.setToken).toHaveBeenCalledWith('access.token.here');
  });

  it('setCredentials calls tokenService.setRefreshToken', () => {
    authReducer(emptyState, setCredentials(credentials));
    expect(tokenService.setRefreshToken).toHaveBeenCalledWith('refresh.token.here');
  });

  it('logout clears token, user, and isAuthenticated', () => {
    const loggedIn: AuthState = {
      token: 'some-token',
      user: { userId: 1, role: 'ROLE_FOUNDER', email: 'alice@example.com', name: 'Alice' },
      isAuthenticated: true,
    };
    const state = authReducer(loggedIn, logout());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout calls tokenService.clearAll', () => {
    authReducer(emptyState, logout());
    expect(tokenService.clearAll).toHaveBeenCalled();
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('authSlice – boundary values', () => {
  it('selectCurrentUser returns null from empty state', () => {
    const rootState = { auth: emptyState } as any;
    expect(selectCurrentUser(rootState)).toBeNull();
  });

  it('selectIsAuthenticated returns false from empty state', () => {
    const rootState = { auth: emptyState } as any;
    expect(selectIsAuthenticated(rootState)).toBe(false);
  });

  it('setCredentials with userId 0 stores user correctly', () => {
    const state = authReducer(emptyState, setCredentials({ ...credentials, userId: 0 }));
    expect(state.user?.userId).toBe(0);
  });

  it('setCredentials with empty name stores empty name', () => {
    const state = authReducer(emptyState, setCredentials({ ...credentials, name: '' }));
    expect(state.user?.name).toBe('');
  });

  it('logout on already-empty state does not throw', () => {
    expect(() => authReducer(emptyState, logout())).not.toThrow();
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('authSlice – exception handling', () => {
  it('unknown action returns existing state unchanged', () => {
    const state: AuthState = {
      token: 'existing-token',
      user: { userId: 5, role: 'ROLE_INVESTOR', email: 'b@b.com', name: 'Bob' },
      isAuthenticated: true,
    };
    const next = authReducer(state, { type: 'unknown/action' });
    expect(next).toEqual(state);
  });

  it('selectCurrentUser returns null when user field is null', () => {
    const rootState = {
      auth: { token: 'tok', user: null, isAuthenticated: true },
    } as any;
    expect(selectCurrentUser(rootState)).toBeNull();
  });

  it('multiple setCredentials calls use latest values', () => {
    let state = authReducer(emptyState, setCredentials(credentials));
    state = authReducer(state, setCredentials({ ...credentials, token: 'new-token', userId: 99 }));
    expect(state.token).toBe('new-token');
    expect(state.user?.userId).toBe(99);
  });
});
