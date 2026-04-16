import { formatCurrency, formatDate, formatRelativeTime } from './formatters';

// ─── 1. Normal working ────────────────────────────────────────────────────────

describe('formatCurrency – normal working', () => {
  it('formats a typical rupee amount', () => {
    expect(formatCurrency(500000)).toBe('₹5,00,000');
  });

  it('accepts a string representation', () => {
    expect(formatCurrency('10000')).toBe('₹10,000');
  });

  it('formats single digit amount', () => {
    expect(formatCurrency(1)).toBe('₹1');
  });
});

describe('formatDate – normal working', () => {
  it('formats ISO date string to Indian locale', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    // Should contain the year 2024 and month Jan
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });

  it('formats a year-only date without throwing', () => {
    expect(() => formatDate('2023-06-01')).not.toThrow();
  });
});

describe('formatRelativeTime – normal working', () => {
  it('returns "just now" for timestamps within the last minute', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toBe('just now');
  });

  it('returns minutes ago for timestamps within the last hour', () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatRelativeTime(thirtyMinsAgo)).toBe('30m ago');
  });

  it('returns hours ago for timestamps within the last day', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('falls back to formatDate for timestamps older than 24 hours', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(twoDaysAgo);
    expect(result).not.toContain('ago');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── 2. Boundary values ───────────────────────────────────────────────────────

describe('formatCurrency – boundary values', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('formats very large amount (1 crore)', () => {
    expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
  });

  it('formats negative amount without throwing', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('₹');
  });

  it('formats NaN-producing string by returning ₹NaN', () => {
    const result = formatCurrency('abc');
    expect(result).toContain('₹');
  });
});

describe('formatRelativeTime – boundary values', () => {
  it('returns "just now" for a timestamp exactly at now (0 ms diff)', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns "1m ago" for exactly 60 seconds ago', () => {
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
    expect(formatRelativeTime(sixtySecondsAgo)).toBe('1m ago');
  });

  it('returns "1h ago" for exactly 60 minutes ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
  });

  it('falls back for exactly 24 hours ago', () => {
    const exactlyOneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(exactlyOneDayAgo);
    expect(result).not.toBe('24h ago');
  });
});

// ─── 3. Exception handling ────────────────────────────────────────────────────

describe('formatters – exception handling', () => {
  it('formatDate does not throw for epoch timestamp string', () => {
    expect(() => formatDate('1970-01-01T00:00:00.000Z')).not.toThrow();
  });

  it('formatRelativeTime does not throw for very old dates', () => {
    expect(() => formatRelativeTime('1990-01-01T00:00:00.000Z')).not.toThrow();
  });

  it('formatCurrency handles Infinity without throwing', () => {
    expect(() => formatCurrency(Infinity)).not.toThrow();
  });
});
