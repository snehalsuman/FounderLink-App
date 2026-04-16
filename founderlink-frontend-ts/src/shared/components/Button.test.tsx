import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('Button – normal working', () => {
  it('renders children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  it('renders with success variant', () => {
    render(<Button variant="success">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-success');
  });

  it('renders leftIcon when not loading', () => {
    render(<Button leftIcon={<span data-testid="left-icon">★</span>}>With Icon</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders rightIcon when not loading', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth=true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('my-custom');
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('Button – boundary values', () => {
  it('renders with sm size class', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('py-1.5');
  });

  it('renders with lg size class', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('py-3');
  });

  it('renders with empty children without crashing', () => {
    render(<Button>{''}</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render rightIcon when isLoading is true', () => {
    render(
      <Button isLoading rightIcon={<span data-testid="right-icon">→</span>}>
        Loading
      </Button>
    );
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('shows spinner (Loader2) instead of leftIcon when isLoading', () => {
    render(
      <Button isLoading leftIcon={<span data-testid="left-icon">★</span>}>
        Loading
      </Button>
    );
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    // spinner uses svg from lucide
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('Button – exception handling', () => {
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when button is disabled', () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not fire onClick when button is loading', () => {
    const onClick = jest.fn();
    render(<Button isLoading onClick={onClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders without crashing when no props are passed', () => {
    render(<Button />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});