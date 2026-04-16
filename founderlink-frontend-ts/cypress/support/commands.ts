// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

interface LoginResponseBody {
  status: number;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    userId: number;
    role: string;
    email: string;
    name: string;
  };
}

/**
 * Login via API directly (bypasses UI, faster for setting up test state)
 * Usage: cy.loginAs('founder@test.com', 'password123')
 */
Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.request<LoginResponseBody>(
    'POST',
    `${Cypress.env('apiUrl') || 'http://localhost:8080'}/auth/login`,
    {
      email,
      password,
    }
  ).then(({ body }) => {
    const data = body.data;
    window.localStorage.setItem('token', data.token);
    window.localStorage.setItem('refreshToken', data.refreshToken);
    window.localStorage.setItem(
      'user',
      JSON.stringify({ userId: data.userId, role: data.role, email: data.email, name: data.name })
    );
  });
});

/**
 * Clear auth state
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

export {};
