import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

/**
 * Returns a function that opens the session expired dialog (login vs continue browsing).
 * Use when the user should see this dialog without wrapping another action — e.g. a link
 * replaced by a button when the session is already known to be expired.
 */
export const useShowSessionExpiredDialog = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showDialog } = useModal();
  const location = useLocation();
  const loginLink = useLoginLink({ callbackURL: location.pathname + location.search + location.hash });

  return () => {
    showDialog({
      title: t('common:session.expired.modal.title'),
      description: t('common:session.expired.modal.description'),
      confirmText: t('common:session.expired.login'),
      cancelText: t('common:session.expired.continue'),
      variant: 'normal',
      onConfirm: () => {
        globalThis.location.href = loginLink;
      },
      onCancel: () => {
        globalThis.scrollTo(0, 0);
        globalThis.location.replace(globalThis.location.origin + `/yksilo/${language}`);
      },
    });
  };
};
