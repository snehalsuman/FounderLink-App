import { renderHook, act } from '@testing-library/react';
import useDebounce from './useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 400));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    act(() => { jest.advanceTimersByTime(200); });

    expect(result.current).toBe('initial');
  });

  it('updates after the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    act(() => { jest.advanceTimersByTime(400); });

    expect(result.current).toBe('updated');
  });

  it('resets the timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    act(() => { jest.advanceTimersByTime(200); });
    rerender({ value: 'abc' });
    act(() => { jest.advanceTimersByTime(200); });

    // Timer has not yet elapsed since the last change
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(200); });

    expect(result.current).toBe('abc');
  });

  it('works with custom delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    act(() => { jest.advanceTimersByTime(999); });
    expect(result.current).toBe('first');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('second');
  });
});
