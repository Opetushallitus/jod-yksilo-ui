import { Button } from '@jod/design-system';

import { getLinkTo } from '@/utils/routeUtils';

/** Creates a footer component to use with DS ConfirmDialog, used for dialogs that require user to log in before proceeding. */
export const createLoginDialogFooter = (
  t: (key: string) => string,
  loginUrl: string,
  callbackUrl: string,
  onClose?: () => void,
) => {
  const ConfirmDialogLoginFooter = (hideDialog: () => void) => {
    return (
      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 justify-end gap-4">
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
