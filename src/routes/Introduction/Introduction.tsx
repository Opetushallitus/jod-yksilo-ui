import { client } from '@/api/client';
import { components } from '@/api/schema';
import { AiInfo } from '@/components';
import { useEnvironment } from '@/hooks/useEnvironment';
import { Button, WizardProgress } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRouteLoaderData } from 'react-router';

const StepOne = () => {
  const { t } = useTranslation();
  const { isDev } = useEnvironment();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-7">{t('introduction.step-1.title')}</h1>
      <p className="text-body-md-mobile sm:text-body-md font-medium mb-6">{t('introduction.step-1.text-1')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside ml-5 mb-7">
        <li>{t('introduction.step-1.item-1')}</li>
        <li>{t('introduction.step-1.item-2')}</li>
        <li>{t('introduction.step-1.item-3')}</li>
        <li>{t('introduction.step-1.item-4')}</li>
        <li>{t('introduction.step-1.item-5')}</li>
      </ul>
      {isDev && (
        <>
          <div className="w-full h-[390px] bg-bg-gray mb-8"></div>
          <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-1.text-2')}</p>
        </>
      )}
    </>
  );
};

const StepTwo = () => {
  const { t } = useTranslation();
  const { isDev } = useEnvironment();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-7">{t('introduction.step-2.title')}</h1>
      <p className="text-body-md-mobile sm:text-body-md font-medium mb-6">{t('introduction.step-2.text-1')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside ml-5 mb-7">
        <li>{t('introduction.step-2.item-1')}</li>
        <li>{t('introduction.step-2.item-2')}</li>
        <li>{t('introduction.step-2.item-3')}</li>
        <li>{t('introduction.step-2.item-4')}</li>
      </ul>
      {isDev && (
        <>
          <div className="w-full h-[390px] bg-bg-gray mb-8"></div>
          <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-2.text-2')}</p>
        </>
      )}
    </>
  );
};

const StepThree = () => {
  const { t } = useTranslation();
  const { isDev } = useEnvironment();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-7">{t('introduction.step-3.title')}</h1>
      <p className="text-body-md-mobile sm:text-body-md font-medium mb-6">{t('introduction.step-3.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md">{t('introduction.step-3.item-text')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside ml-5 mb-7">
        <li>{t('introduction.step-3.item-1')}</li>
        <li>{t('introduction.step-3.item-2')}</li>
      </ul>
      {isDev && <div className="w-full h-[390px] bg-bg-gray mb-8"></div>}
      <p className="text-body-md-mobile sm:text-body-md mb-5">{t('introduction.step-3.text-2')}</p>
      <div className="mb-6">
        <AiInfo />
      </div>
      <p className="text-body-md-mobile sm:text-body-md mb-8">{t('introduction.step-3.text-3')}</p>
      <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-3.text-4')}</p>
    </>
  );
};

const Introduction = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [step, setStep] = React.useState(1);
  const navigate = useNavigate();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const onClick = async () => {
    if (step === 3) {
      await client.PUT('/api/profiili/yksilo', {
        body: {
          tervetuloapolku: true,
          lupaLuovuttaaTiedotUlkopuoliselle: data?.lupaLuovuttaaTiedotUlkopuoliselle ?? false,
          lupaArkistoida: data?.lupaArkistoida ?? false,
          lupaKayttaaTekoalynKoulutukseen: data?.lupaKayttaaTekoalynKoulutukseen ?? false,
        },
      });
      navigate(`/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`);
    } else {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <div className="bg-white">
      <main role="main" className="mx-auto w-full sm:max-w-[868px] px-5 sm:px-6 py-8" id="jod-main">
        <title>{t('osaamispolku')}</title>
        <div className="flex flex-row-reverse mb-6">
          <WizardProgress
            labelText={t('wizard.label')}
            stepText={t('wizard.step')}
            completedText={t('wizard.completed')}
            currentText={t('wizard.current')}
            steps={3}
            currentStep={step}
          />
        </div>
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}
        <div className="flex flex-row-reverse">
          <Button label={step === 3 ? t('move-to-service') : t('next')} onClick={onClick} />
        </div>
      </main>
    </div>
  );
};

export default Introduction;
