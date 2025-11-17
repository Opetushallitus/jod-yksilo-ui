import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store';
import { InputField, Textarea } from '@jod/design-system';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const CreateCustomPlanStep = () => {
  const { t } = useTranslation();
  const { planName, planDescription, setPlanDescription, setPlanName } = addPlanStore(
    useShallow((state) => ({
      planName: state.planName,
      planDescription: state.planDescription,
      setPlanName: state.setPlanName,
      setPlanDescription: state.setPlanDescription,
    })),
  );
  return (
    <div className="mb-2">
      <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.my-goals.add-custom-plan-header')}</h1>
      <p className="text-body-sm-mobile sm:text-body-sm ds:mt-3">{t('profile.my-goals.add-custom-plan-description')}</p>
      <div className="ds:mt-3">
        <InputField
          label={t('profile.my-goals.custom-plan-name')}
          requiredText={t('required')}
          value={planName[i18n.language]}
          onChange={(e) => setPlanName(e.target.value)}
        />
        <Textarea
          label={t('profile.my-goals.custom-plan-description')}
          value={planDescription[i18n.language]}
          onChange={(e) => setPlanDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CreateCustomPlanStep;
