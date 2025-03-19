import { FormError } from '@/components';
import { getDatePickerTranslations, type DatePickerTranslations } from '@/utils';
import { Button, Combobox, Datepicker, InputField, Textarea } from '@jod/design-system';
import React from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { VaiheTyyppi, type VaiheForm } from '../utils';

const DetailsStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const {
    register,
    control,
    trigger,
    formState: { errors },
  } = useFormContext<VaiheForm>();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    fields: linkitFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: control,
    name: `linkit`,
  });

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = useWatch({ control, name: `alkuPvm` });
  React.useEffect(() => {
    void trigger(`loppuPvm`);
  }, [alkuPvm, trigger]);

  const type = useWatch({ control, name: `tyyppi`, defaultValue: 'KOULUTUS' });
  const labelPrefix = type === 'KOULUTUS' ? t('profile.paths.of-education') : t('profile.paths.of-work');
  const DatePickerTranslations = getDatePickerTranslations(
    t('datepicker', { returnObjects: true }) as DatePickerTranslations,
  );

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {t('profile.paths.step-n-details', { count: vaiheIndex + 1 })}
      </h2>
      <p>{t('profile.paths.step-modal-description')}</p>

      <div className="flex flex-col gap-4 mt-6">
        <Controller
          control={control}
          name="tyyppi"
          render={({ field: { onChange, value } }) => (
            <>
              <Combobox<VaiheTyyppi, { label: string; value: VaiheTyyppi }>
                label={t('profile.paths.select-phase-type')}
                options={[
                  { label: t('profile.paths.types.KOULUTUS'), value: 'KOULUTUS' },
                  { label: t('profile.paths.types.TYO'), value: 'TYO' },
                ]}
                defaultValue="KOULUTUS"
                placeholder={t('profile.paths.select-phase-type')}
                onChange={onChange}
                selected={value}
              />
              <FormError name="tyyppi" errors={errors} />
            </>
          )}
        />

        <div>
          <InputField
            label={`${labelPrefix} ${t('name').toLocaleLowerCase()}`}
            {...register(`nimi.${language}` as const)}
          />
          <FormError name={`nimi.${language}`} errors={errors} />
        </div>

        <div>
          <Textarea
            label={`${labelPrefix} ${t('description').toLocaleLowerCase()}`}
            {...register(`kuvaus.${language}` as const)}
          />
          <FormError name={`kuvaus.${language}`} errors={errors} />
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-form-label">
            {t(`profile.paths.add-links-for-${type === 'KOULUTUS' ? 'education' : 'work'}`)}
          </span>
          {linkitFields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-5">
              <div className="flex flex-row gap-3 w-full items-center">
                <InputField hideLabel placeholder={t('link')} {...register(`linkit.${index}.url` as const)} />
                <button
                  onClick={() => removeLink(index)}
                  aria-label={t('profile.paths.remove-link')}
                  className="cursor-pointer"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <FormError name={`linkit.${index}.url`} errors={errors} />
            </div>
          ))}
          <div>
            <Button
              variant="white"
              label={t('profile.paths.add-link')}
              onClick={() => {
                appendLink({ url: '' });
              }}
            />
          </div>
        </div>
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-5">
            <Controller
              control={control}
              render={({ field }) => (
                <Datepicker
                  {...field}
                  label={t('profile.paths.starts')}
                  placeholder={t('date-placeholder')}
                  translations={DatePickerTranslations}
                />
              )}
              name="alkuPvm"
            />
            <FormError name="alkuPvm" errors={errors} />
          </div>
          <div className="flex flex-col gap-5">
            <Controller
              control={control}
              render={({ field }) => (
                <Datepicker
                  {...field}
                  label={t('profile.paths.ends')}
                  placeholder={t('date-placeholder')}
                  translations={DatePickerTranslations}
                />
              )}
              name="loppuPvm"
            />
            <FormError name="loppuPvm" errors={errors} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsStep;
