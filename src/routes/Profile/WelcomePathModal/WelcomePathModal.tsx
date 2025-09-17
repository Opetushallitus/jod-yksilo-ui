import { client } from '@/api/client';
import { useEscHandler } from '@/hooks/useEscHandler';
import { YksiloData } from '@/hooks/useYksiloData';
import { LANGUAGE_VALUES, type LanguageValue } from '@/i18n/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Combobox, InputField, Modal, Toggle, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodAi, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import {
  Controller,
  Form,
  FormProvider,
  FormSubmitHandler,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useRevalidator } from 'react-router';
import z from 'zod';
import { GENDER_VALUES } from '../utils';

interface LanguageOptions {
  label: string;
  value: LanguageValue;
}

const Separator = () => <hr aria-hidden className="ds:my-4 ds:h-1 ds:bg-bg-gray-2 ds:border-0" />;

interface InfoBlockProps {
  label: string;
  info?: string;
  interactiveComponent: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

interface ToggleAllowProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleAllow = ({ onChange, checked }: ToggleAllowProps) => {
  const { t } = useTranslation();
  return (
    <>
      <span className="text-body-md-mobile sm:text-body-md text-secondary-gray font-arial">
        {t('introduction.step-2.i-allow')}
      </span>
      <Toggle
        type="button"
        serviceVariant="yksilo"
        checked={checked}
        onChange={onChange}
        ariaLabel={t('introduction.step-2.i-allow')}
      />
    </>
  );
};

const InfoBlock = ({ label, info, interactiveComponent, orientation = 'horizontal' }: InfoBlockProps) => {
  const orientationClassname = orientation === 'horizontal' ? 'flex-row' : 'flex-col';

  return (
    <div className={`flex ${orientationClassname} space-between gap-3`}>
      <div className="flex flex-col flex-1 gap-1">
        <span className="text-form-label font-arial">{label}</span>
        {info && <span className="text-body-md-mobile sm:text-body-md text-secondary-gray font-arial">{info}</span>}
      </div>
      <div className="flex flex-2 items-center gap-3 justify-end">{interactiveComponent}</div>
    </div>
  );
};

const StepWelcome = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5">{t('introduction.step-1.title')}</h1>
      <p className="text-body-lg-mobile sm:text-body-lg font-medium mb-7 sm:mb-8">{t('introduction.step-1.text-1')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside mb-7 font-arial">
        <li>{t('introduction.step-1.item-1')}</li>
        <li>{t('introduction.step-1.item-2')}</li>
        <li>{t('introduction.step-1.item-3')}</li>
        <li>{t('introduction.step-1.item-4')}</li>
        <li>{t('introduction.step-1.item-5')}</li>
      </ul>
    </>
  );
};

const StepInformation = ({ data }: { data: YksiloData }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const orientation = sm ? 'horizontal' : 'vertical';

  const { register, control, trigger } = useFormContext<YksiloData>();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5">{t('introduction.step-2.title')}</h1>
      <p className="text-body-lg-mobile sm:text-body-lg font-medium mb-2">{t('introduction.step-2.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md mb-7 font-arial">{t('introduction.step-2.text-2')}</p>
      <div>
        <Separator />
        <InfoBlock
          label={t('introduction.step-2.birthyear')}
          info={`${data.syntymavuosi}`}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name={'allowSyntymavuosi'}
            />
          }
        />
        <Separator />
        <InfoBlock
          label={t('introduction.step-2.home-city')}
          info={data.kotikuntaNimi}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name={'allowKotikunta'}
            />
          }
        />
        <Separator />
        <InfoBlock
          label={t('introduction.step-2.gender')}
          info={data.sukupuoliNimi}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name={'allowSukupuoli'}
            />
          }
        />
        <Separator />
        <InfoBlock
          label={t('introduction.step-2.mother-tongue')}
          orientation={orientation}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <Combobox<LanguageValue, LanguageOptions>
                  className="w-full"
                  {...field}
                  label={t('introduction.step-2.choose-mother-tongue')}
                  hideLabel
                  selected={value}
                  defaultValue={data.aidinkieli}
                  options={[
                    {
                      label: 'Suomi',
                      value: 'fi',
                    },
                    {
                      label: 'Sverige',
                      value: 'sv',
                    },
                    {
                      label: 'English',
                      value: 'en',
                    },
                  ]}
                  onChange={(val) => {
                    onChange(val);
                    trigger('aidinkieli');
                  }}
                  placeholder={t('introduction.step-2.choose-mother-tongue')}
                />
              )}
              name={'aidinkieli'}
            />
          }
        />
        <Separator />
        <InfoBlock
          label={t('introduction.step-2.email')}
          orientation={orientation}
          interactiveComponent={
            <InputField {...register('email')} hideLabel={true} placeholder="matti.meikalainen@suomi.fi" />
          }
        />
        <Separator />
      </div>

      <p className="text-heading-3-mobile sm:text-heading-3 mt-8 mb-2">{t('introduction.step-2.text-3')}</p>
      <p className="text-body-md-mobile sm:text-body-md font-arial mb-6">
        <Trans
          i18nKey="introduction.step-2.text-4"
          components={{
            Icon: <JodOpenInNew />,
            CustomLink: (
              <Link
                to={`/${language}/${t('slugs.privacy-policy')}`}
                className="inline-flex text-accent"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </p>
    </>
  );
};

const StepAi = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5">{t('introduction.step-3.title')}</h1>
      <p className="text-body-lg-mobile sm:text-body-lg font-medium mb-5 sm:mb-8">{t('introduction.step-3.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md">{t('introduction.step-3.item-text')}</p>
      <ul className="text-body-md-mobile sm:text-body-md list-disc list-inside ml-5 mb-7">
        <li>{t('introduction.step-3.item-1')}</li>
        <li>{t('introduction.step-3.item-2')}</li>
      </ul>
      <p className="text-body-md-mobile sm:text-body-md mb-5">
        {
          <Trans
            i18nKey="introduction.step-3.text-2"
            components={{
              Icon: <JodOpenInNew />,
              CustomLink: (
                <Link
                  to={`/${language}/${t('slugs.about-ai')}`}
                  className="inline-flex text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        }
      </p>

      <div className="mb-11">
        <JodAi size={52} className="text-secondary-gray" />
      </div>
      <p className="text-body-lg-mobile sm:text-body-lg font-semibold mb-5">{t('introduction.step-3.text-3')}</p>
    </>
  );
};

const WelcomePathModal = ({ yksiloData }: { yksiloData: YksiloData }) => {
  const [showWelcomePathModal, setShowWelcomePathModal] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const { t } = useTranslation();

  const formId = React.useId();

  const methods = useForm<YksiloData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(
      z.object({
        tervetuloapolku: z.boolean(),
        allowSyntymavuosi: z.boolean(),
        syntymavuosi: z.number().optional(),
        allowKotikunta: z.boolean(),
        kotikunta: z.string().optional(),
        kotikuntaNimi: z.string(),
        aidinkieli: z.enum(LANGUAGE_VALUES),
        email: z.email(t('feedback.errors.valid-sposti')).or(z.literal('')),
        allowSukupuoli: z.boolean(),
        sukupuoli: z.enum(GENDER_VALUES).or(z.undefined()),
        sukupuoliNimi: z.string(),
      }),
    ),
    defaultValues: async () => {
      return Promise.resolve({
        tervetuloapolku: false,
        allowSyntymavuosi: true,
        syntymavuosi: yksiloData.syntymavuosi,
        allowKotikunta: true,
        kotikunta: yksiloData.kotikunta, // koodi
        kotikuntaNimi: yksiloData.kotikuntaNimi,
        aidinkieli: yksiloData.aidinkieli,
        email: '',
        allowSukupuoli: true,
        sukupuoli: yksiloData.sukupuoli,
        sukupuoliNimi: yksiloData.sukupuoliNimi,
      });
    },
  });

  const revalidator = useRevalidator();
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<YksiloData> = async ({ data }: { data: YksiloData }) => {
    await client.PUT('/api/profiili/yksilo/tiedot-ja-luvat', {
      body: {
        tervetuloapolku: true,
        syntymavuosi: data.allowSyntymavuosi ? data.syntymavuosi : undefined,
        kotikunta: data.allowKotikunta ? data.kotikunta : undefined,
        aidinkieli: data.aidinkieli,
        sukupuoli: data.allowSukupuoli ? data.sukupuoli : undefined,
      },
    });

    await revalidator.revalidate();
    onClose();
  };

  const onClose = () => {
    setShowWelcomePathModal(false);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const onStepChange = async () => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  };

  useEscHandler(onClose, formId);

  const totalSteps = 3;
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isInfoStep = React.useMemo(() => step === 2, [step]);
  const isAiStep = React.useMemo(() => step === 3, [step]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      open={showWelcomePathModal}
      content={
        <FormProvider {...methods}>
          <Form
            id={formId}
            onSubmit={onSubmit}
            onKeyDown={(event) => {
              // Prevent form submission on Enter
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
          >
            <div ref={scrollRef}>
              {isFirstStep && <StepWelcome />}
              {isInfoStep && <StepInformation data={yksiloData} />}
              {isAiStep && <StepAi />}
            </div>
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-end gap-4 flex-1">
          {step > 1 && (
            <Button
              label={t('previous')}
              onClick={() => {
                setStep((value) => value - 1);
                onStepChange();
              }}
            />
          )}
          {step < totalSteps && (
            <Button
              onClick={() => {
                setStep(step + 1);
                onStepChange();
              }}
              label={t('next')}
              variant="accent"
              disabled={isInfoStep && !isValid}
              className="whitespace-nowrap"
            />
          )}
          {step === totalSteps && <Button form={formId} variant="accent" label={t('introduction.step-3.button-ok')} />}
        </div>
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={totalSteps}
          currentStep={step}
        />
      }
    />
  );
};

export default WelcomePathModal;
