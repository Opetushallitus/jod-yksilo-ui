import { client } from '@/api/client';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import React from 'react';

interface UseSessionExpirationTimerOptions {
  onWarning: () => void;
  onExpired: () => void;
  onReset?: () => void;
}

export const useSessionExpirationTimer = ({ onWarning, onExpired, onReset }: UseSessionExpirationTimerOptions) => {
  const {
    sessionLengthMs,
    warningTresholdMs,
    getTimeSinceLogin,
    resetSessionExpiration,
    setSessionExpired,
    extendSession,
  } = useSessionExpirationStore();
  const [disabled, setDisabled] = React.useState(false);
  const [timeSinceLogin, setTimeSinceLogin] = React.useState(0);

  const intervalId = React.useRef<number | undefined>(undefined);
  const warningShown = React.useRef(false);
  const expiredShown = React.useRef(false);

  const resetNotes = () => {
    warningShown.current = false;
    expiredShown.current = false;
  };

  // Start ticking interval on mount
  React.useEffect(() => {
    if (disabled) {
      return;
    }

    intervalId.current = window.setInterval(() => {
      setTimeSinceLogin(getTimeSinceLogin());
    }, 1000);

    return () => {
      if (intervalId.current !== undefined) {
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
    };
  }, [disabled, getTimeSinceLogin]);

  // Session expiration threshold logic
  React.useEffect(() => {
    if (disabled) {
      return;
    }

    if (timeSinceLogin >= warningTresholdMs && timeSinceLogin < sessionLengthMs && !warningShown.current) {
      warningShown.current = true;
      onWarning?.();
    }

    if (timeSinceLogin >= sessionLengthMs && !expiredShown.current) {
      expiredShown.current = true;
      onExpired?.();
      setSessionExpired(true);
      if (intervalId.current !== undefined) {
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
    }
  }, [disabled, timeSinceLogin, warningTresholdMs, sessionLengthMs, onWarning, onExpired, setSessionExpired]);

  const extend = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    await client.GET('/api/profiili/yksilo');
    resetNotes();
    extendSession();
    setTimeSinceLogin(0);
  }, [extendSession, disabled]);

  const reset = React.useCallback(() => {
    resetNotes();
    resetSessionExpiration();
    setTimeSinceLogin(0);
    onReset?.();
  }, [resetSessionExpiration, onReset]);

  const disable = React.useCallback(() => {
    setDisabled(true);
    resetNotes();
    if (intervalId.current !== undefined) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
    resetSessionExpiration();
    setTimeSinceLogin(0);
  }, [resetSessionExpiration]);

  return {
    disabled,
    reset,
    disable,
    extend,
    timeSinceLogin,
  };
};
