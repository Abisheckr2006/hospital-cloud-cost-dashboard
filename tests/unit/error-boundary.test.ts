import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/ErrorBoundary.js';

describe('ErrorBoundary React Component Tests', () => {
  it('Updates state via getDerivedStateFromError when rendering exception occurs', () => {
    const error = new Error('Test rendering crash in DICOM viewer');
    const newState = ErrorBoundary.getDerivedStateFromError(error);

    expect(newState.hasError).toBe(true);
    expect(newState.error).toBe(error);
  });

  it('Logs error telemetry in componentDidCatch lifecycle', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const boundary = new ErrorBoundary({ children: null });
    const error = new Error('Database connection reset during page render');
    const errorInfo = { componentStack: 'in TestComponent\n in ErrorBoundary' };

    boundary.componentDidCatch(error, errorInfo);

    expect(consoleSpy).toHaveBeenCalledWith('Uncaught Error Boundary Exception:', error, errorInfo);

    consoleSpy.mockRestore();
  });
});
