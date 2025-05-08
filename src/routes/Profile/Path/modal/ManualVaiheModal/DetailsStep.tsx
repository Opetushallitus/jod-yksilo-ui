import { FormError } from '@/components';
import DurationFormSection from '@/routes/Profile/Path/components/DurationFormSection';
import LinksFormSection from '@/routes/Profile/Path/components/LinksFormSection';
import { Combobox, InputField, Textarea } from '@jod/design-system';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { VaiheTyyppi, type VaiheForm } from '../../utils';

const DetailsStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<VaiheForm>();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const type = useWatch({ control, name: `tyyppi`, defaultValue: 'KOULUTUS' });
  const labelPrefix = type === 'KOULUTUS' ? t('profile.paths.of-education') : t('profile.paths.of-work');

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
        <LinksFormSection type={type} />
        <DurationFormSection />
      </div>
    </>
  );
};

export default DetailsStep;
