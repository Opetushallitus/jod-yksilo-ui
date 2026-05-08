import { useShowSessionExpiredDialog } from '@/hooks/useShowSessionExpiredDialog';
import { isSessionExpiredState, useSessionManagerStore } from '@/stores/useSessionManagerStore';

/**
 * Returns a function that wraps any action with a session expiration check.
 * If the session is expired, the session expired dialog is shown instead of executing the action.
 *
 * Anonymous users (`!isLoggedIn` but not `expired`) are not blocked here — use disabled state or
 * route protection; showing the session-expired dialog for them would be wrong copy/UX.
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
  const showSessionExpiredDialog = useShowSessionExpiredDialog();

  return <Args extends unknown[]>(action: (...args: Args) => void | Promise<void>, ...params: Args) => {
    return () => {
      if (isSessionExpiredState(useSessionManagerStore.getState().status)) {
        showSessionExpiredDialog();
        return;
      }
      void action(...params);
    };
  };
};
