import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StartupCard from './StartupCard';
import type { Startup } from '../../types';

// mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => mockUseAuth(),
}));

const sampleStartup: Startup = {
  id: 42,
  name: 'TechCorp',
  industry: 'FinTech',
  description: 'Building the next generation of finance.',
  problemStatement: 'Banks are slow.',
  solution: 'Instant transfers.',
  fundingGoal: 500000,
  stage: 'MVP',
  location: 'Bangalore',
  founderId: 10,
  isApproved: true,
  isRejected: false,
  createdAt: '2024-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ isInvestor: false, isCoFounder: false });
});

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('StartupCard – normal working', () => {
  it('renders startup name', () => {
    render(<StartupCard startup={sampleStartup} />);
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  it('renders startup description', () => {
    render(<StartupCard startup={sampleStartup} />);
    expect(screen.getByText('Building the next generation of finance.')).toBeInTheDocument();
  });

  it('renders industry', () => {
    render(<StartupCard startup={sampleStartup} />);
    expect(screen.getByText('FinTech')).toBeInTheDocument();
  });

  it('renders location when provided', () => {
    render(<StartupCard startup={sampleStartup} />);
    expect(screen.getByText('Bangalore')).toBeInTheDocument();
  });

  it('renders funding goal as a localised number', () => {
    render(<StartupCard startup={sampleStartup} />);
    // JSDOM uses en-US locale; the raw number should appear formatted
    expect(screen.getByText('500,000')).toBeInTheDocument();
  });

  it('renders stage badge with correct text', () => {
    render(<StartupCard startup={sampleStartup} />);
    expect(screen.getByText('MVP')).toBeInTheDocument();
  });

  it('navigates to founder edit page when user is founder', () => {
    mockUseAuth.mockReturnValue({ isInvestor: false, isCoFounder: false });
    render(<StartupCard startup={sampleStartup} />);
    fireEvent.click(screen.getByText('TechCorp').closest('div')!.parentElement!);
    expect(mockNavigate).toHaveBeenCalledWith('/founder/startups/42/edit');
  });

  it('navigates to investor detail page when user is investor', () => {
    mockUseAuth.mockReturnValue({ isInvestor: true, isCoFounder: false });
    render(<StartupCard startup={sampleStartup} />);
    fireEvent.click(document.querySelector('.card-hover')!);
    expect(mockNavigate).toHaveBeenCalledWith('/investor/startups/42');
  });

  it('navigates to co-founder detail page when user is co-founder', () => {
    mockUseAuth.mockReturnValue({ isInvestor: false, isCoFounder: true });
    render(<StartupCard startup={sampleStartup} />);
    fireEvent.click(document.querySelector('.card-hover')!);
    expect(mockNavigate).toHaveBeenCalledWith('/cofounder/startups/42');
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('StartupCard – boundary values', () => {
  it('does not render location span when location is empty string', () => {
    const noLocation = { ...sampleStartup, location: '' };
    const { container } = render(<StartupCard startup={noLocation} />);
    // The MapPin icon span is only rendered when location is truthy
    const spans = container.querySelectorAll('.flex.items-center.gap-1\\.5');
    // Only industry and funding spans remain; location span is absent
    const texts = Array.from(spans).map((s) => s.textContent);
    expect(texts.some((t) => t?.includes('Bangalore'))).toBe(false);
  });

  it('renders EARLY_TRACTION stage as "Early Traction"', () => {
    const earlyTraction = { ...sampleStartup, stage: 'EARLY_TRACTION' };
    render(<StartupCard startup={earlyTraction} />);
    expect(screen.getByText('Early Traction')).toBeInTheDocument();
  });

  it('renders unknown stage with fallback badge-blue class', () => {
    const unknownStage = { ...sampleStartup, stage: 'UNKNOWN_STAGE' };
    render(<StartupCard startup={unknownStage} />);
    const badge = screen.getByText('UNKNOWN_STAGE');
    expect(badge.className).toContain('badge-blue');
  });

  it('renders fundingGoal of 0', () => {
    const zeroGoal = { ...sampleStartup, fundingGoal: 0 };
    render(<StartupCard startup={zeroGoal} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('StartupCard – exception handling', () => {
  it('renders without crashing when description is empty', () => {
    const noDesc = { ...sampleStartup, description: '' };
    render(<StartupCard startup={noDesc} />);
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  it('does not crash when location is null-like (undefined cast)', () => {
    const noLoc = { ...sampleStartup, location: undefined as any };
    expect(() => render(<StartupCard startup={noLoc} />)).not.toThrow();
  });
});