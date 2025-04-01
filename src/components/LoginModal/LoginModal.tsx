import { useEscHandler } from '@/hooks/useEscHandler';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  onClose: () => void;
  isOpen: boolean;
}
export const LoginModal = ({ onClose, isOpen }: LoginModalProps) => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();
  const contentId = React.useId();
  useEscHandler(onClose, contentId);

  return (
    <Modal
      open={isOpen}
      content={
        <div id={contentId}>
          <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('login')}</h2>
          <div className="mb-6">{t('login-for-favorites')}</div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-5 flex-1">
          <Button
            label={t('login')}
            variant="gray"
            /* eslint-disable-next-line react/no-unstable-nested-components */
            LinkComponent={({ children }) => <a href={loginLink}>{children}</a>}
            className="whitespace-nowrap"
          />
          <Button onClick={onClose} label={t('close')} />
        </div>
      }
    />
  );
};
