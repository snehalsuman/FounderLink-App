import {
  createStartup, getAllStartups, getStartupById,
  updateStartup, deleteStartup, approveStartup, rejectStartup,
  followStartup, isFollowingStartup, getStartupsByFounder,
} from './startupApi';

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
const mockGet  = api.get  as jest.MockedFunction<typeof api.get>;
const mockPut  = api.put  as jest.MockedFunction<typeof api.put>;
const mockDel  = api.delete as jest.MockedFunction<typeof api.delete>;

const formData = {
  name: 'TechCorp', industry: 'FinTech', description: 'A desc',
  problemStatement: 'A problem', solution: 'A solution',
  fundingGoal: 500000, stage: 'MVP', location: 'Bangalore',
};
const startup = { id: 1, ...formData, founderId: 10, isApproved: false, isRejected: false, createdAt: '2024-01-01' };

beforeEach(() => jest.clearAllMocks());

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('startupApi – normal working', () => {
  it('createStartup posts to /startups', async () => {
    mockPost.mockResolvedValueOnce({ data: startup });
    await createStartup(formData);
    expect(mockPost).toHaveBeenCalledWith('/startups', formData);
  });

  it('getAllStartups gets /startups with page and size', async () => {
    mockGet.mockResolvedValueOnce({ data: { content: [startup], totalPages: 1, totalElements: 1 } });
    await getAllStartups(0, 10);
    expect(mockGet).toHaveBeenCalledWith('/startups?page=0&size=10');
  });

  it('getStartupById gets /startups/:id', async () => {
    mockGet.mockResolvedValueOnce({ data: startup });
    await getStartupById(1);
    expect(mockGet).toHaveBeenCalledWith('/startups/1');
  });

  it('updateStartup puts to /startups/:id', async () => {
    mockPut.mockResolvedValueOnce({ data: startup });
    await updateStartup(1, formData);
    expect(mockPut).toHaveBeenCalledWith('/startups/1', formData);
  });

  it('deleteStartup deletes /startups/:id', async () => {
    mockDel.mockResolvedValueOnce({ data: undefined });
    await deleteStartup(1);
    expect(mockDel).toHaveBeenCalledWith('/startups/1');
  });

  it('approveStartup puts to /startups/:id/approve', async () => {
    mockPut.mockResolvedValueOnce({ data: startup });
    await approveStartup(1);
    expect(mockPut).toHaveBeenCalledWith('/startups/1/approve');
  });

  it('rejectStartup puts to /startups/:id/reject', async () => {
    mockPut.mockResolvedValueOnce({ data: startup });
    await rejectStartup(1);
    expect(mockPut).toHaveBeenCalledWith('/startups/1/reject');
  });

  it('followStartup posts to /startups/:id/follow', async () => {
    mockPost.mockResolvedValueOnce({ data: undefined });
    await followStartup(1);
    expect(mockPost).toHaveBeenCalledWith('/startups/1/follow');
  });

  it('isFollowingStartup gets /startups/:id/is-following', async () => {
    mockGet.mockResolvedValueOnce({ data: { following: true } });
    await isFollowingStartup(1);
    expect(mockGet).toHaveBeenCalledWith('/startups/1/is-following');
  });

  it('getStartupsByFounder gets /startups/founder/:founderId', async () => {
    mockGet.mockResolvedValueOnce({ data: [startup] });
    await getStartupsByFounder(10);
    expect(mockGet).toHaveBeenCalledWith('/startups/founder/10');
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('startupApi – boundary values', () => {
  it('getAllStartups defaults to page=0 and size=10', async () => {
    mockGet.mockResolvedValueOnce({ data: { content: [], totalPages: 0, totalElements: 0 } });
    await getAllStartups();
    expect(mockGet).toHaveBeenCalledWith('/startups?page=0&size=10');
  });

  it('getAllStartups with page=0 and size=1 uses correct query', async () => {
    mockGet.mockResolvedValueOnce({ data: {} });
    await getAllStartups(0, 1);
    expect(mockGet).toHaveBeenCalledWith('/startups?page=0&size=1');
  });

  it('getStartupById with id=0 constructs URL /startups/0', async () => {
    mockGet.mockResolvedValueOnce({ data: null });
    await getStartupById(0);
    expect(mockGet).toHaveBeenCalledWith('/startups/0');
  });

  it('getStartupsByFounder with large founderId', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    await getStartupsByFounder(999999);
    expect(mockGet).toHaveBeenCalledWith('/startups/founder/999999');
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('startupApi – exception handling', () => {
  it('getStartupById rejects with 404 when not found', async () => {
    const err = Object.assign(new Error('Not Found'), {
      response: { status: 404, data: { message: 'Startup not found' } },
    });
    mockGet.mockRejectedValueOnce(err);
    await expect(getStartupById(99)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('createStartup rejects with 400 for invalid data', async () => {
    const err = Object.assign(new Error('Bad Request'), {
      response: { status: 400, data: { message: 'Validation error' } },
    });
    mockPost.mockRejectedValueOnce(err);
    await expect(createStartup(formData)).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('approveStartup rejects with 403 for unauthorized user', async () => {
    const err = Object.assign(new Error('Forbidden'), {
      response: { status: 403, data: { message: 'Not allowed' } },
    });
    mockPut.mockRejectedValueOnce(err);
    await expect(approveStartup(1)).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('deleteStartup rejects with 500 on server error', async () => {
    const err = Object.assign(new Error('Server Error'), {
      response: { status: 500 },
    });
    mockDel.mockRejectedValueOnce(err);
    await expect(deleteStartup(1)).rejects.toMatchObject({ response: { status: 500 } });
  });

  it('followStartup rejects on network failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));
    await expect(followStartup(1)).rejects.toThrow('Network Error');
  });
});