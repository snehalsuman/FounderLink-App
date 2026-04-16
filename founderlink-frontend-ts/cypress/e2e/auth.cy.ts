describe('Authentication flows', () => {
  beforeEach(() => {
    cy.logout();
  });

  describe('Login page', () => {
    beforeEach(() => cy.visit('/login'));

    it('renders the login form', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('shows validation errors on empty submit', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('shows error for invalid email format', () => {
      cy.get('input[type="email"]').type('not-an-email');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Invalid email').should('be.visible');
    });

    it('shows error for short password', () => {
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.contains('at least 6 characters').should('be.visible');
    });

    it('has a link to the register page', () => {
      cy.contains(/register|sign up/i).click();
      cy.url().should('include', '/register');
    });
  });

  describe('Register page', () => {
    beforeEach(() => cy.visit('/register'));

    it('renders the registration form', () => {
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('shows validation errors on empty submit', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
    });

    it('shows error when role is not selected', () => {
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains(/role/i).should('be.visible');
    });

    it('has a link back to the login page', () => {
      cy.contains(/login|sign in/i).click();
      cy.url().should('include', '/login');
    });
  });

  describe('Route protection', () => {
    it('redirects unauthenticated user from /founder/dashboard to /login', () => {
      cy.visit('/founder/dashboard');
      cy.url().should('include', '/login');
    });

    it('redirects unauthenticated user from /investor/dashboard to /login', () => {
      cy.visit('/investor/dashboard');
      cy.url().should('include', '/login');
    });

    it('shows 404 for unknown routes', () => {
      cy.visit('/this-page-does-not-exist');
      cy.contains('404').should('be.visible');
    });
  });
});
