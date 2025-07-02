import { useState, useCallback } from 'react';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimiterState {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

export const useRateLimiter = (config: RateLimiterConfig) => {
  const [state, setState] = useState<RateLimiterState>({
    attempts: 0,
    lastAttempt: 0,
    lockedUntil: null,
  });

  const isLocked = useCallback(() => {
    const now = Date.now();
    return state.lockedUntil !== null && now < state.lockedUntil;
  }, [state.lockedUntil]);

  const getRemainingLockTime = useCallback(() => {
    if (!state.lockedUntil) return 0;
    const remaining = Math.max(0, state.lockedUntil - Date.now());
    return Math.ceil(remaining / 1000); // Return seconds
  }, [state.lockedUntil]);

  const canAttempt = useCallback(() => {
    if (isLocked()) return false;
    
    const now = Date.now();
    // Reset attempts if window has passed
    if (now - state.lastAttempt > config.windowMs) {
      setState(prev => ({ ...prev, attempts: 0 }));
      return true;
    }
    
    return state.attempts < config.maxAttempts;
  }, [state, config, isLocked]);

  const recordAttempt = useCallback((success: boolean) => {
    const now = Date.now();
    
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const shouldLock = !success && newAttempts >= config.maxAttempts;
      
      return {
        attempts: success ? 0 : newAttempts, // Reset on success
        lastAttempt: now,
        lockedUntil: shouldLock ? now + config.lockoutMs : null,
      };
    });
  }, [config]);

  const getRemainingAttempts = useCallback(() => {
    return Math.max(0, config.maxAttempts - state.attempts);
  }, [config.maxAttempts, state.attempts]);

  return {
    canAttempt: canAttempt(),
    isLocked: isLocked(),
    remainingAttempts: getRemainingAttempts(),
    remainingLockTime: getRemainingLockTime(),
    recordAttempt,
  };
};