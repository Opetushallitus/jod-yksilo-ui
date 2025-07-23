import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';

/** Creates a footer component to use with DS ConfirmDialog, used for dialogs that require user to log in before proceeding. */
export const createLoginDialogFooter = (t: (key: string) => string, loginLink: string, onClose?: () => void) => {
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
          />
          <Button
            label={t('login')}
            variant="accent"
            LinkComponent={getLinkTo(loginLink, true)}
            className="whitespace-nowrap"
          />
        </div>
      </div>
    );
  };

  return ConfirmDialogLoginFooter;
};
