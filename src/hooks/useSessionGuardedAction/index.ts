import { useShowSessionExpiredDialog } from '@/hooks/useShowSessionExpiredDialog';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';

/**
 * Returns a function that wraps any action with a session expiration check.
 * If the session is expired, the session expired dialog is shown instead of executing the action.
 *
 * For interactions that only show the dialog (no follow-up action), use {@link useShowSessionExpiredDialog}.
 *
 * @returns A function that takes an action and its parameters, returning a handler function.
 *
 * @example
 * onClick={guardedAction(showDialog, deleteDialogProps)}
 * onClick={guardedAction(showModal, NewShareLinkModal, { id: linkki.id })}
 */
export const useSessionGuardedAction = () => {
  const sessionExpired = useSessionExpirationStore((state) => state.sessionExpired);
  const showSessionExpiredDialog = useShowSessionExpiredDialog();

  return <Args extends unknown[]>(action: (...args: Args) => void | Promise<void>, ...params: Args) => {
    return () => {
      if (sessionExpired) {
        showSessionExpiredDialog();
        return;
      }
      action(...params);
    };
  };
};
