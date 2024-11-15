import { useLoginLink } from '@/hooks/useLoginLink';
import { Button, Modal } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  onClose: () => void;
  isOpen: boolean;
}
export const LoginModal = ({ onClose, isOpen }: LoginModalProps) => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();

  return (
    <Modal
      open={isOpen}
      content={
        <>
          <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('login')}</h2>
          <div className="mb-6">{t('login-for-favorites')}</div>
        </>
      }
      footer={
        <div className="flex justify-end gap-5">
          <Button
            label={t('login')}
            variant="gray"
            /* eslint-disable-next-line sonarjs/no-unstable-nested-components */
            LinkComponent={({ children }) => <a href={loginLink}>{children}</a>}
          />
          <Button onClick={onClose} label={t('close')} />
        </div>
      }
    />
  );
};
