import { InputField, Textarea } from '@jod/design-system';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OmaSuunnitelmaForm } from './AddOrEditCustomPlanModal';

const CreateCustomPlanStep = () => {
  const { t, i18n } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<OmaSuunnitelmaForm>();

  return (
    <div className="mb-2">
      <p className="font-arial text-body-md-mobile sm:text-body-md mt-3">
        {t('profile.my-goals.add-custom-plan-description')}
      </p>
      <div className="mt-6">
        <InputField
          label={t('profile.my-goals.custom-plan-name')}
          requiredText={t('common:required')}
          errorMessage={errors?.nimi?.[i18n.language]?.message}
          {...register(`nimi.${i18n.language}`)}
        />
      </div>
      <div className="mt-6">
        <Textarea
          label={t('profile.my-goals.custom-plan-description')}
          errorMessage={errors?.kuvaus?.[i18n.language]?.message}
          {...register(`kuvaus.${i18n.language}`)}
        />
      </div>
    </div>
  );
};

export default CreateCustomPlanStep;
