import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import useAuth from './useAuth';
import { AuthState } from '../../types';

const makeStore = (authState: Partial<AuthState> = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        ...authState,
      },
    },
  });

const wrapper = (store: ReturnType<typeof makeStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });

describe('useAuth', () => {
  it('returns unauthenticated state when no user', () => {
    const store = makeStore();
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isFounder).toBe(false);
    expect(result.current.isInvestor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isCoFounder).toBe(false);
  });

  it('returns correct flags for ROLE_FOUNDER', () => {
    const store = makeStore({
      isAuthenticated: true,
      user: { userId: 1, role: 'ROLE_FOUNDER', email: 'founder@test.com', name: 'Founder' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isFounder).toBe(true);
    expect(result.current.isInvestor).toBe(false);
    expect(result.current.userId).toBe(1);
    expect(result.current.role).toBe('ROLE_FOUNDER');
  });

  it('returns correct flags for ROLE_INVESTOR', () => {
    const store = makeStore({
      isAuthenticated: true,
      user: { userId: 2, role: 'ROLE_INVESTOR', email: 'investor@test.com', name: 'Investor' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isInvestor).toBe(true);
    expect(result.current.isFounder).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('returns correct flags for ROLE_ADMIN', () => {
    const store = makeStore({
      isAuthenticated: true,
      user: { userId: 3, role: 'ROLE_ADMIN', email: 'admin@test.com', name: 'Admin' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isFounder).toBe(false);
  });

  it('returns correct flags for ROLE_COFOUNDER', () => {
    const store = makeStore({
      isAuthenticated: true,
      user: { userId: 4, role: 'ROLE_COFOUNDER', email: 'co@test.com', name: 'CoFounder' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isCoFounder).toBe(true);
    expect(result.current.isFounder).toBe(false);
  });
});
