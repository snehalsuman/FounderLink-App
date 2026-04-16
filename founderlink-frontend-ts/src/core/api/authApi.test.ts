import { login, register, refreshToken } from './authApi';

// mock the axios instance
jest.mock('./axiosConfig', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from './axiosConfig';
const mockPost = api.post as jest.MockedFunction<typeof api.post>;

const loginData = { email: 'alice@example.com', password: 'password1' };
const registerData = {
  name: 'Alice', email: 'alice@example.com',
  password: 'password1', role: 'ROLE_FOUNDER' as const,
};
const loginResponse = {
  status: 200,
  data: {
    token: 'access.token',
    refreshToken: 'refresh.token',
    userId: 1,
    role: 'ROLE_FOUNDER',
    email: 'alice@example.com',
    name: 'Alice',
  },
};

beforeEach(() => jest.clearAllMocks());

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('authApi – normal working', () => {
  it('login calls POST /auth/login with credentials', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    await login(loginData);
    expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
  });

  it('login returns response data', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    const result = await login(loginData);
    expect((result as any).data).toEqual(loginResponse);
  });

  it('register calls POST /auth/register with user data', async () => {
    mockPost.mockResolvedValueOnce({ data: { message: 'Registered' } });
    await register(registerData);
    expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData);
  });

  it('refreshToken calls POST /auth/refresh with token payload', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    await refreshToken({ refreshToken: 'old-refresh' });
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' });
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('authApi – boundary values', () => {
  it('login with empty email and password still calls the API', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    await login({ email: '', password: '' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: '', password: '' });
  });

  it('register with minimum-length password (6 chars) calls the API', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const data = { ...registerData, password: 'abc123' };
    await register(data);
    expect(mockPost).toHaveBeenCalledWith('/auth/register', data);
  });

  it('refreshToken with empty object calls the API', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    await refreshToken({});
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {});
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('authApi – exception handling', () => {
  it('login rejects with 401 error from server', async () => {
    const err = Object.assign(new Error('Unauthorized'), {
      response: { status: 401, data: { message: 'Invalid credentials' } },
    });
    mockPost.mockRejectedValueOnce(err);
    await expect(login(loginData)).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it('register rejects with 409 when email already exists', async () => {
    const err = Object.assign(new Error('Conflict'), {
      response: { status: 409, data: { message: 'Email already in use' } },
    });
    mockPost.mockRejectedValueOnce(err);
    await expect(register(registerData)).rejects.toMatchObject({
      response: { status: 409 },
    });
  });

  it('refreshToken rejects with 401 when refresh token is invalid', async () => {
    const err = Object.assign(new Error('Unauthorized'), {
      response: { status: 401, data: { message: 'Invalid refresh token' } },
    });
    mockPost.mockRejectedValueOnce(err);
    await expect(refreshToken({ refreshToken: 'bad' })).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it('login rejects with network error when server is unreachable', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));
    await expect(login(loginData)).rejects.toThrow('Network Error');
  });
});