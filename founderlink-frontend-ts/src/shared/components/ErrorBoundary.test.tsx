import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// suppress console.error noise from intentional throws
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => (console.error as jest.Mock).mockRestore());

// helper — a component that throws
const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test render error');
  return <div>Child content</div>;
};

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('ErrorBoundary – normal working', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('does not show the error UI when children render normally', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('renders multiple children without error', () => {
    render(
      <ErrorBoundary>
        <span>A</span>
        <span>B</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('ErrorBoundary – boundary values', () => {
  it('shows error UI heading when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows the error message from the thrown error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test render error')).toBeInTheDocument();
  });

  it('shows "Reload Page" button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('wrapping null child renders without crashing', () => {
    render(<ErrorBoundary>{null}</ErrorBoundary>);
    // no crash, no error UI
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('ErrorBoundary – exception handling', () => {
  it('catches error from deeply nested component', () => {
    const DeepThrow: React.FC = () => {
      throw new Error('Deep error');
    };
    render(
      <ErrorBoundary>
        <div>
          <div>
            <DeepThrow />
          </div>
        </div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Deep error')).toBeInTheDocument();
  });

  it('error message falls back to generic text when error has no message', () => {
    const NoMessageError: React.FC = () => {
      const err = new Error();
      err.message = '';
      throw err;
    };
    render(
      <ErrorBoundary>
        <NoMessageError />
      </ErrorBoundary>
    );
    // Falls back to "An unexpected error occurred."
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
  });

  it('componentDidCatch is called on error (console.error mock captures it)', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalled();
  });
});