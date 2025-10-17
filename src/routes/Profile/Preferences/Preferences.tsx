import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { useModal } from '@/hooks/useModal';
import { LogoutFormContext } from '@/routes/Root';
import { useToolStore } from '@/stores/useToolStore';
import { Button, Toggle, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';

const DownloadLink = ({ children }: { children: React.ReactNode }) => (
  <a href={`${import.meta.env.BASE_URL}api/profiili/yksilo/vienti`}>{children}</a>
);

const ToggleWithText = ({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#CCC]">
      <div className="flex-1">
        <p className="text-form-label">{title}</p>
        <p className="text-help-mobile sm:text-help">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <p aria-hidden="true">{checked ? t('allow') : t('disallow')}</p>
        <Toggle
          serviceVariant="yksilo"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          ariaLabel={checked ? t('allow') : t('disallow')}
        />
      </div>
    </div>
  );
};

const Preferences = () => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.preferences.title');
  const toolStore = useToolStore();
  const logoutForm = React.useContext(LogoutFormContext);
  const { showDialog } = useModal();

  const deleteProfile = async () => {
    toolStore.reset();
    const deletionInput = document.createElement('input');
    deletionInput.type = 'hidden';
    deletionInput.name = 'deletion';
    deletionInput.value = 'true';
    logoutForm?.appendChild(deletionInput);
    logoutForm?.submit();
  };

  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const [lupaLuovuttaaTiedotUlkopuoliselle, setLupaLuovuttaaTiedotUlkopuoliselle] = React.useState(
    data?.lupaLuovuttaaTiedotUlkopuoliselle ?? false,
  );
  const [lupaKayttaaTekoalynKoulutukseen, setLupaKayttaaTekoalynKoulutukseen] = React.useState(
    data?.lupaKayttaaTekoalynKoulutukseen ?? false,
  );
  const [updating, setUpdating] = React.useState<boolean>(false);

  // Store previous values for comparison to determine actual change
  const prevValues = React.useRef({
    lupaLuovuttaaTiedotUlkopuoliselle,
    lupaKayttaaTekoalynKoulutukseen,
  });

  const isEqual = (a: object, b: object) => JSON.stringify(a) === JSON.stringify(b);

  // Effect to call update only when data change (and not on first render)
  React.useEffect(() => {
    const currentValues = {
      lupaLuovuttaaTiedotUlkopuoliselle,
      lupaKayttaaTekoalynKoulutukseen,
    };

    if (!isEqual(prevValues.current, currentValues)) {
      // Values changed, call update endpoint
      setUpdating(true);
      client
        .PUT('/api/profiili/yksilo', {
          body: {
            tervetuloapolku: data?.tervetuloapolku ?? false,
            lupaLuovuttaaTiedotUlkopuoliselle: currentValues.lupaLuovuttaaTiedotUlkopuoliselle,
            lupaKayttaaTekoalynKoulutukseen: currentValues.lupaKayttaaTekoalynKoulutukseen,
          },
        })
        .finally(() => {
          setUpdating(false);
        });

      prevValues.current = currentValues;
    }
  }, [lupaLuovuttaaTiedotUlkopuoliselle, lupaKayttaaTekoalynKoulutukseen, data?.tervetuloapolku]);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="preferences-go-to-tool" />
        </div>
      }
    >
      <title>{title}</title>
      <ProfileSectionTitle type="ASETUKSENI" title={title} />
      <div className="mb-8 text-body-lg flex flex-col gap-7">
        <p>{t('preferences.description')}</p>
      </div>
      <section className="mb-8">
        <h3 className="text-heading-3-mobile sm:text-heading-3 mb-3">
          {t('preferences.data-disclosure-unanonymized.title')}
        </h3>
        <p className="text-body-md mb-5">{t('preferences.data-disclosure-unanonymized.description')}</p>
        <ToggleWithText
          title={t('preferences.data-disclosure-unanonymized.permission-education-and-planning.title')}
          description={t('preferences.data-disclosure-unanonymized.permission-education-and-planning.description')}
          checked={lupaLuovuttaaTiedotUlkopuoliselle}
          onChange={() => setLupaLuovuttaaTiedotUlkopuoliselle(!lupaLuovuttaaTiedotUlkopuoliselle)}
          disabled={updating}
          data-testid="pref-share-third-parties"
        />
        <ToggleWithText
          title={t('preferences.data-disclosure-unanonymized.permission-use-AI-education.title')}
          description={t('preferences.data-disclosure-unanonymized.permission-use-AI-education.description')}
          checked={lupaKayttaaTekoalynKoulutukseen}
          onChange={() => {
            setLupaKayttaaTekoalynKoulutukseen(!lupaKayttaaTekoalynKoulutukseen);
          }}
          disabled={updating}
          data-testid="pref-ai-training"
        />
      </section>
      <section className="mb-8">
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.download.title')}</h2>
        <p className="text-body-md mb-5">{t('preferences.download.description')}</p>
        <Button
          variant="accent"
          label={t('preferences.download.action')}
          LinkComponent={DownloadLink}
          data-testid="pref-download-data"
        />
      </section>
      <section>
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.delete-profile.title')}</h2>
        <p className="text-body-md mb-5">{t('preferences.delete-profile.description')}</p>
        <Button
          variant="white-delete"
          label={t('preferences.delete-profile.action')}
          onClick={() => {
            showDialog({
              title: t('preferences.delete-profile.action'),
              description: t('preferences.delete-profile.confirm'),
              onConfirm: deleteProfile,
            });
          }}
          data-testid="pref-delete-profile"
        />
      </section>
      {lg ? null : <ToolCard testId="preferences-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default Preferences;
