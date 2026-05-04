import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';

/** Creates a footer component to use with DS ConfirmDialog, used for dialogs that require user to log in before proceeding. */
export const createLoginDialogFooter = (
  t: (key: string) => string,
  loginUrl: string,
  callbackUrl: string,
  onClose?: () => void,
) => {
  const ConfirmDialogLoginFooter = (hideDialog: () => void) => {
    return (
      <div className="flex gap-4 flex-1">
        <div className="flex gap-4 flex-1 justify-end">
          <Button
            label={t('tool.my-own-data.cancel-text')}
            variant="white"
            onClick={() => {
              hideDialog();
              onClose?.();
            }}
            className="whitespace-nowrap"
            testId="login-dialog-cancel"
          />
          <Button
            label={t('common:login')}
            variant="accent"
            linkComponent={getLinkTo(loginUrl, {
              state: { callbackUrl },
              onClick: () => {
                hideDialog();
                onClose?.();
              },
            })}
            className="whitespace-nowrap"
            testId="login-dialog-login"
          />
        </div>
      </div>
    );
  };

  return ConfirmDialogLoginFooter;
};
