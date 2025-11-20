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
  const intervalId = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const warningShown = React.useRef(false);
  const expiredShown = React.useRef(false);

  // Reset note flags so that they can be shown again
  const resetNoteFlags = () => {
    if (warningShown.current) {
      warningShown.current = false;
    }
    if (expiredShown.current) {
      expiredShown.current = false;
    }
  };

  // Start ticking interval after login
  React.useEffect(() => {
    if (disabled || !isLoggedIn) {
      return;
    }

    if (isLoggedIn && intervalId.current === undefined && !sessionExpired) {
      setSessionStartTime(Date.now());

      intervalId.current = globalThis.setInterval(async () => {
        const timeSinceSessionStart = getTimeSinceSessionStarted();

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

  const extend = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    await client.GET('/api/profiili/yksilo');
    resetNoteFlags();
    extendSession();
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
  }, [setSessionExpired]);

  return {
    disabled,
    disable,
    extend,
  };
};
