import { FormError } from '@/components';
import { getDatePickerTranslations, type DatePickerTranslations } from '@/utils';
import { Datepicker } from '@jod/design-system';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const DurationFormSection = () => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation();

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = useWatch({ control, name: `alkuPvm` });
  React.useEffect(() => {
    void trigger(`loppuPvm`);
  }, [alkuPvm, trigger]);

  const DatePickerTranslations = getDatePickerTranslations(
    t('datepicker', { returnObjects: true }) as DatePickerTranslations,
  );

  return (
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
  );
};

export default DurationFormSection;
