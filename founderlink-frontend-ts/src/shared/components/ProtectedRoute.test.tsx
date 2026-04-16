import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import authReducer from '../../store/slices/authSlice';
import ProtectedRoute from './ProtectedRoute';
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

const renderWithRouter = (
  ui: React.ReactElement,
  { store, initialEntries = ['/protected'] }: { store: ReturnType<typeof makeStore>; initialEntries?: string[] } = { store: makeStore() }
) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route path="/protected" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to /login when not authenticated', () => {
    const store = makeStore();
    renderWithRouter(
      <ProtectedRoute><div>Secret Content</div></ProtectedRoute>,
      { store }
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with valid token', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeToken = `header.${payload}.signature`;
    localStorage.setItem('token', fakeToken);

    const store = makeStore({
      isAuthenticated: true,
      token: fakeToken,
      user: { userId: 1, role: 'ROLE_FOUNDER', email: 'f@test.com', name: 'Founder' },
    });

    renderWithRouter(
      <ProtectedRoute><div>Secret Content</div></ProtectedRoute>,
      { store }
    );
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when role is not allowed', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeToken = `header.${payload}.signature`;
    localStorage.setItem('token', fakeToken);

    const store = makeStore({
      isAuthenticated: true,
      token: fakeToken,
      user: { userId: 1, role: 'ROLE_INVESTOR', email: 'i@test.com', name: 'Investor' },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><div>Founder Only</div></ProtectedRoute>,
      { store }
    );
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Founder Only')).not.toBeInTheDocument();
  });

  it('renders children when user role matches allowed roles', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeToken = `header.${payload}.signature`;
    localStorage.setItem('token', fakeToken);

    const store = makeStore({
      isAuthenticated: true,
      token: fakeToken,
      user: { userId: 1, role: 'ROLE_FOUNDER', email: 'f@test.com', name: 'Founder' },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ROLE_FOUNDER', 'ROLE_ADMIN']}><div>Admin or Founder</div></ProtectedRoute>,
      { store }
    );
    expect(screen.getByText('Admin or Founder')).toBeInTheDocument();
  });
});
