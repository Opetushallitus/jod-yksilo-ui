import { client } from '@/api/client';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import React from 'react';
import { useShallow } from 'zustand/shallow';

interface UseSessionExpirationTimerOptions {
  onWarning: () => void;
  onExpired: () => void | Promise<void>;
  onExtended?: () => void;
  isLoggedIn?: boolean;
}

export const useSessionExpirationTimer = ({
  onWarning,
  onExpired,
  onExtended,
  isLoggedIn,
}: UseSessionExpirationTimerOptions) => {
  const {
    sessionLengthMs,
    warningTresholdMs,
    sessionExpired,
    setSessionStartTime,
    getTimeSinceSessionStarted,
    setSessionExpired,
    extendSession,
    setOnSessionExtended,
  } = useSessionExpirationStore(
    useShallow((state) => ({
      sessionLengthMs: state.sessionLengthMs,
      warningTresholdMs: state.warningTresholdMs,
      sessionExpired: state.sessionExpired,
      setSessionStartTime: state.setSessionStartTime,
      getTimeSinceSessionStarted: state.getTimeSinceSessionStarted,
      setSessionExpired: state.setSessionExpired,
      extendSession: state.extendSession,
      setOnSessionExtended: state.setOnSessionExtended,
    })),
  );
  const [disabled, setDisabled] = React.useState(false);
  const [timeSinceSessionStart, setTimeSinceSessionStart] = React.useState(0);
  const intervalId = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const warningShown = React.useRef(false);
  const expiredShown = React.useRef(false);

  // Reset note flags so that they can be shown again
  const resetNoteFlags = () => {
    warningShown.current = false;
    expiredShown.current = false;
  };

  // Start ticking interval after login
  React.useEffect(() => {
    if (disabled || !isLoggedIn) {
      return;
    }

    if (isLoggedIn && intervalId.current === undefined && !sessionExpired) {
      setSessionStartTime(Date.now());
      intervalId.current = globalThis.setInterval(() => {
        setTimeSinceSessionStart(getTimeSinceSessionStarted());
      }, 1000);
    }

    setOnSessionExtended(() => {
      onExtended?.();
      warningShown.current = false;
    });

    return () => {
      if (intervalId.current !== undefined) {
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
    };
    // This effect should only run when isLoggedIn or disabled changes. Cleanup will also run when these change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, disabled]);

  // Session expiration threshold logic
  React.useEffect(() => {
    const expirationTimer = async () => {
      if (disabled) {
        return;
      }

      if (timeSinceSessionStart < warningTresholdMs) {
        resetNoteFlags();
      }

      if (
        timeSinceSessionStart >= warningTresholdMs &&
        timeSinceSessionStart < sessionLengthMs &&
        !warningShown.current
      ) {
        warningShown.current = true;
        onWarning?.();
      }

      if (timeSinceSessionStart >= sessionLengthMs && !expiredShown.current) {
        expiredShown.current = true;
        await onExpired?.();
        setSessionExpired(true);
        if (intervalId.current !== undefined) {
          clearInterval(intervalId.current);
          intervalId.current = undefined;
        }
      }
    };

    expirationTimer();
  }, [disabled, timeSinceSessionStart, warningTresholdMs, sessionLengthMs, onWarning, onExpired, setSessionExpired]);

  const extend = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    await client.GET('/api/profiili/yksilo');
    resetNoteFlags();
    extendSession();
    setTimeSinceSessionStart(0);
  }, [extendSession, disabled]);

  const disable = React.useCallback(() => {
    setDisabled(true);
    // When disabling, also mark session as expired so that UI can react to it
    setSessionExpired(true);

    resetNoteFlags();

    if (intervalId.current !== undefined) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
    setTimeSinceSessionStart(0);
  }, [setSessionExpired]);

  return {
    disabled,
    disable,
    extend,
    timeSinceSessionStart,
  };
};
