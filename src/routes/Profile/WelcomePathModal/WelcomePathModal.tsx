import { client } from '@/api/client';
import { AnchorLink } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import type { YksiloData } from '@/hooks/useYksiloData';
import { LANGUAGE_VALUES, type LanguageValue } from '@/i18n/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiInfoButton, Button, Combobox, InputField, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import {
  Controller,
  Form,
  FormProvider,
  type FormSubmitHandler,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import z from 'zod';
import { PersonalDetailsInfoBlock, ToggleAllow } from '../components';
import { GENDER_VALUES } from '../utils';

interface LanguageOptions {
  label: string;
  value: LanguageValue;
}

const Separator = () => <hr aria-hidden className="my-4 h-1 bg-bg-gray-2 border-0" />;

const StepWelcome = () => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader text={t('introduction.step-1.title')} className="text-heading-1-mobile sm:text-heading-1 mb-5" />
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
  const { register, control, trigger } = useFormContext<YksiloData>();

  return (
    <>
      <ModalHeader text={t('introduction.step-2.title')} className="text-heading-1-mobile sm:text-heading-1 mb-5" />
      <p className="text-body-lg-mobile sm:text-body-lg font-medium mb-2">{t('introduction.step-2.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md mb-7 font-arial">{t('introduction.step-2.text-2')}</p>
      <div>
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.birthyear')}
          info={`${data.syntymavuosi}`}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name="allowSyntymavuosi"
            />
          }
        />
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.home-city')}
          info={data.kotikuntaNimi}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name="allowKotikunta"
            />
          }
        />
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.gender')}
          info={data.sukupuoliNimi}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <ToggleAllow {...field} onChange={(val: boolean) => onChange(val)} checked={value} />
              )}
              name="allowSukupuoli"
            />
          }
        />
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.mother-tongue')}
          stack={!sm}
          interactiveComponent={
            <Controller
              control={control}
              render={({ field: { onChange, value }, field }) => (
                <Combobox<LanguageValue, LanguageOptions>
                  className="w-full"
                  {...field}
                  label={t('personal-details.choose-mother-tongue')}
                  hideLabel
                  selected={value}
                  defaultValue={data.aidinkieli}
                  options={[
                    {
                      label: 'Suomi',
                      value: 'fi',
                    },
                    {
                      label: 'Svenska',
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
                  placeholder={t('personal-details.choose-mother-tongue')}
                />
              )}
              name="aidinkieli"
            />
          }
        />
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.email')}
          stack={!sm}
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
            Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <AnchorLink
                href={`/${language}/${t('common:slugs.privacy-and-cookies')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-accent hover:underline"
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
      <ModalHeader text={t('introduction.step-3.title')} className="text-heading-1-mobile sm:text-heading-1 mb-5" />
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
              Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
              CustomLink: (
                <AnchorLink
                  href={`/${language}/${t('common:slugs.ai-usage')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                />
              ),
            }}
          />
        }
      </p>

      <div className="mb-11">
        <AiInfoButton size={52} className="mb-2" />
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
        email: z.email().optional(),
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
        email: yksiloData.email,
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
        email: data.email,
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

  const headerText = React.useMemo(() => {
    if (isFirstStep) {
      return t('introduction.step-1.title');
    }
    if (isInfoStep) {
      return t('introduction.step-2.title');
    }
    if (isAiStep) {
      return t('introduction.step-3.title');
    }
    return '';
  }, [t, isFirstStep, isInfoStep, isAiStep]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={showWelcomePathModal}
      fullWidthContent
      className="sm:h-full!"
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
            <div ref={scrollRef} className="w-2/3">
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
