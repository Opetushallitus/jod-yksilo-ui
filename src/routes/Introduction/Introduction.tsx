import { client } from '@/api/client';
import { components } from '@/api/schema';
import { Button, WizardProgress } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRouteLoaderData } from 'react-router';

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.5 22C11.5 19.3515 12.4212 17.1061 14.2636 15.2636C16.1061 13.4212 18.3515 12.5 21 12.5C18.3515 12.5 16.1061 11.5788 14.2636 9.73636C12.4212 7.89394 11.5 5.64848 11.5 3C11.5 5.64848 10.5788 7.89394 8.73636 9.73636C6.89394 11.5788 4.64848 12.5 2 12.5C4.64848 12.5 6.89394 13.4212 8.73636 15.2636C10.5788 17.1061 11.5 19.3515 11.5 22Z"
      fill="#6E6E6E"
    />
    <path
      d="M18 10C18 8.88485 18.3879 7.93939 19.1636 7.16364C19.9394 6.38788 20.8848 6 22 6C20.8848 6 19.9394 5.61212 19.1636 4.83636C18.3879 4.06061 18 3.11515 18 2C18 3.11515 17.6121 4.06061 16.8364 4.83636C16.0606 5.61212 15.1152 6 14 6C15.1152 6 16.0606 6.38788 16.8364 7.16364C17.6121 7.93939 18 8.88485 18 10Z"
      fill="#6E6E6E"
    />
  </svg>
);

const StepOne = () => {
  const { t } = useTranslation();

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
      <div className="w-full h-[390px] bg-bg-gray mb-8"></div>
      <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-1.text-2')}</p>
    </>
  );
};

const StepTwo = () => {
  const { t } = useTranslation();

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
      <div className="w-full h-[390px] bg-bg-gray mb-8"></div>
      <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-2.text-2')}</p>
    </>
  );
};

const StepThree = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-7">{t('introduction.step-3.title')}</h1>
      <p className="text-body-md-mobile sm:text-body-md font-medium mb-6">{t('introduction.step-3.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md">{t('introduction.step-3.item-text')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside ml-5 mb-7">
        <li>{t('introduction.step-3.item-1')}</li>
        <li>{t('introduction.step-3.item-2')}</li>
      </ul>
      <div className="w-full h-[390px] bg-bg-gray mb-8"></div>
      <p className="text-body-md-mobile sm:text-body-md mb-5">{t('introduction.step-3.text-2')}</p>
      <div className="mb-6">
        <SparkleIcon />
      </div>
      <p className="text-body-md-mobile sm:text-body-md mb-8">{t('introduction.step-3.text-3')}</p>
      <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-3.text-4')}</p>
    </>
  );
};

const Introduction = () => {
  const { t } = useTranslation();
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
      navigate('/');
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
