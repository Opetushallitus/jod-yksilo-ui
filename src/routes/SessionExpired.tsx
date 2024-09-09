import { Title } from '@/components';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdOutlinePerson } from 'react-icons/md';

export const SessionExpired = () => {
  const { t, i18n } = useTranslation();

  const params = new URLSearchParams();
  params.set('lang', i18n.language);
  const loginLink = `/login?${params.toString()}`;

  return (
    <main role="main" className="mx-auto max-w-[1140px] p-5" id="jod-main">
      <Title value={t('session-expired.title')} />
      <h1 className="mb-5 mt-7 text-heading-1 text-black">{t('session-expired.title')}</h1>
      <div>
        <p className="mb-6 text-body-md text-black font-arial">{t('session-expired.description')}</p>
        <Button
          icon={<MdOutlinePerson size={24} />}
          iconSide="left"
          label={t('login')}
          size="md"
          variant="white"
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
        />
      </div>
    </main>
  );
};
