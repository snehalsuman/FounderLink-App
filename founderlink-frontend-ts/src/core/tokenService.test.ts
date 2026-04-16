import tokenService from './tokenService';

// ─── helpers ─────────────────────────────────────────────────────────────────
const mockUser = { userId: 1, role: 'ROLE_FOUNDER', email: 'alice@example.com', name: 'Alice' };

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('tokenService – normal working', () => {
  it('setToken stores token in localStorage', () => {
    tokenService.setToken('abc.def.ghi');
    expect(localStorage.getItem('token')).toBe('abc.def.ghi');
  });

  it('getToken returns the stored token', () => {
    localStorage.setItem('token', 'stored-token');
    expect(tokenService.getToken()).toBe('stored-token');
  });

  it('setRefreshToken stores refresh token', () => {
    tokenService.setRefreshToken('refresh-xyz');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-xyz');
  });

  it('getRefreshToken returns the stored refresh token', () => {
    localStorage.setItem('refreshToken', 'my-refresh');
    expect(tokenService.getRefreshToken()).toBe('my-refresh');
  });

  it('setUser stores user as JSON', () => {
    tokenService.setUser(mockUser);
    expect(JSON.parse(localStorage.getItem('user') || 'null')).toEqual(mockUser);
  });

  it('getUser returns parsed user object', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    expect(tokenService.getUser()).toEqual(mockUser);
  });

  it('clearAll removes token, refreshToken and user', () => {
    tokenService.setToken('t');
    tokenService.setRefreshToken('r');
    tokenService.setUser(mockUser);
    tokenService.clearAll();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('tokenService – boundary values', () => {
  it('getToken returns null when localStorage is empty', () => {
    expect(tokenService.getToken()).toBeNull();
  });

  it('getRefreshToken returns null when not set', () => {
    expect(tokenService.getRefreshToken()).toBeNull();
  });

  it('getUser returns null when key is absent', () => {
    expect(tokenService.getUser()).toBeNull();
  });

  it('setToken with empty string stores empty string', () => {
    tokenService.setToken('');
    expect(localStorage.getItem('token')).toBe('');
  });

  it('setUser with minimal user object stores correctly', () => {
    const minimal = { userId: 0, role: '', email: '', name: '' };
    tokenService.setUser(minimal);
    expect(tokenService.getUser()).toEqual(minimal);
  });

  it('removeToken removes only token and refreshToken keys', () => {
    tokenService.setToken('t');
    tokenService.setRefreshToken('r');
    tokenService.setUser(mockUser);
    tokenService.removeToken();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).not.toBeNull(); // user untouched
  });

  it('removeUser removes only user key', () => {
    tokenService.setToken('t');
    tokenService.setUser(mockUser);
    tokenService.removeUser();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).not.toBeNull(); // token untouched
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('tokenService – exception handling', () => {
  it('getUser returns null when stored value is "null" string', () => {
    localStorage.setItem('user', 'null');
    expect(tokenService.getUser()).toBeNull();
  });

  it('getUser returns null when stored value is corrupt JSON', () => {
    localStorage.setItem('user', '{bad json');
    expect(() => tokenService.getUser()).toThrow(); // JSON.parse throws
  });

  it('clearAll is idempotent — calling twice does not throw', () => {
    expect(() => {
      tokenService.clearAll();
      tokenService.clearAll();
    }).not.toThrow();
  });

  it('getToken after clearAll returns null', () => {
    tokenService.setToken('t');
    tokenService.clearAll();
    expect(tokenService.getToken()).toBeNull();
  });
});
