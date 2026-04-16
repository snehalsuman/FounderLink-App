describe('Browse Startups', () => {
  beforeEach(() => {
    cy.loginAs('nazim@gmail.com', '123456');
    cy.visit('/investor/startups');
  });

  it('renders the page heading and search bar', () => {
    cy.contains('Browse Startups').should('be.visible');
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('renders stage filter buttons', () => {
    cy.contains('button', 'All').should('be.visible');
    cy.contains('button', 'IDEA').should('be.visible');
    cy.contains('button', 'MVP').should('be.visible');
    cy.contains('button', 'Early Traction').should('be.visible');
    cy.contains('button', 'SCALING').should('be.visible');
  });

  it('shows startup cards after loading', () => {
    cy.get('.animate-pulse').should('not.exist');
    cy.get('body').then(($body) => {
      if ($body.text().includes('No startups found')) {
        cy.contains('No startups found').should('be.visible');
      } else {
        cy.get('[data-testid="startup-card"], .card').should('have.length.greaterThan', 0);
      }
    });
  });

  it('filters by search text', () => {
    cy.get('input[placeholder*="Search"]').type('Tech');
    cy.wait(500);
    cy.get('.animate-pulse').should('not.exist');
  });

  it('filters by stage when a stage button is clicked', () => {
    cy.contains('button', 'MVP').click();
    cy.contains('button', 'MVP').should('have.class', 'bg-accent');
    cy.contains('button', 'All').should('not.have.class', 'bg-accent');
  });

  it('resets to All stage when All button is clicked', () => {
    cy.contains('button', 'IDEA').click();
    cy.contains('button', 'All').click();
    cy.contains('button', 'All').should('have.class', 'bg-accent');
  });

  it('shows pagination controls when there are multiple pages', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Next page"]').length) {
        cy.get('button[aria-label="Next page"]').should('be.visible');
        cy.get('button[aria-label="Previous page"]').should('be.disabled');
      }
    });
  });

  it('navigates to startup detail on card click', () => {
    cy.get('.animate-pulse').should('not.exist');
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No startups found')) {
        cy.get('.card').first().click();
        cy.url().should('match', /\/startups\/\d+/);
      }
    });
  });
});
