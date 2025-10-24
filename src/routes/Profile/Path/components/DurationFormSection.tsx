import { FormError } from '@/components';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
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
    if (!alkuPvm) {
      return;
    }
    void trigger(`loppuPvm`);
  }, [alkuPvm, trigger]);

  const datePickerTranslations = useDatePickerTranslations();

  return (
    <div className="flex flex-row gap-5">
      <div className="flex flex-col gap-5 flex-1">
        <Controller
          control={control}
          render={({ field }) => (
            <Datepicker
              {...field}
              label={t('profile.paths.starts')}
              placeholder={t('date-placeholder')}
              requiredText={t('required')}
              translations={datePickerTranslations}
            />
          )}
          name="alkuPvm"
        />
        <FormError name="alkuPvm" errors={errors} />
      </div>
      <div className="flex flex-col gap-5 flex-1">
        <Controller
          control={control}
          render={({ field }) => (
            <Datepicker
              {...field}
              label={t('profile.paths.ends')}
              placeholder={t('date-placeholder')}
              requiredText={t('required')}
              translations={datePickerTranslations}
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
