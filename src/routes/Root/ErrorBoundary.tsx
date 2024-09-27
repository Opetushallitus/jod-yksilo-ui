import { Title } from '@/components';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdHome, MdOutlinePerson } from 'react-icons/md';
import { useRouteError } from 'react-router-dom';

const ErrorBoundary = () => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();
  const error = useRouteError() as Error;
  const title = t('error-boundary.title');
  const message = (error.message && t(`error-boundary.${error.message}`)) ?? t('error-boundary.unexpected');

  return (
    <main role="main" id="jod-main" className="m-4 flex flex-col items-center justify-center gap-4">
      <Title value={title} />
      <h1 className="text-heading-1">{title}</h1>
      <p className="text-body-lg">{message}</p>
      <div className="flex gap-4">
        <Button
          icon={<MdHome size={24} />}
          iconSide="left"
          label={t('return-home')}
          size="md"
          variant="gray"
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>}
        />
        <Button
          icon={<MdOutlinePerson size={24} />}
          iconSide="left"
          label={t('login')}
          size="md"
          variant="gray"
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
        />
      </div>
    </main>
  );
};

export default ErrorBoundary;