import DurationFormSection from '@/routes/Profile/Path/components/DurationFormSection';
import LinksFormSection from '@/routes/Profile/Path/components/LinksFormSection';
import { opportunityTypeToVaiheTyyppi } from '@/routes/Profile/Path/utils';
import { usePolutStore } from '@/stores/usePolutStore';
import { getLocalizedText } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const OpportunityDetailsStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const { t } = useTranslation();

  const { proposedOpportunity, vaiheet } = usePolutStore(
    useShallow((state) => ({
      proposedOpportunity: state.proposedOpportunity,
      vaiheet: state.vaiheet,
    })),
  );

  const vaihe = vaiheet.at(vaiheIndex);
  const isEditMode = vaihe?.id !== undefined;

  const phaseType = isEditMode ? vaihe.tyyppi : opportunityTypeToVaiheTyyppi(proposedOpportunity?.mahdollisuusTyyppi);
  const labelPrefix = phaseType === 'KOULUTUS' ? 'profile.paths.of-education' : 'profile.paths.of-work';
  const otsikko = isEditMode ? vaihe.nimi : proposedOpportunity?.otsikko;
  const kuvaus = isEditMode ? vaihe.kuvaus : proposedOpportunity?.kuvaus;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-1-mobile sm:text-heading-1">
        {t('profile.paths.phase-n-details', { count: vaiheIndex + 1 })}
      </h1>

      <h3 className="text-heading-3">{t('profile.paths.phase-type')}</h3>
      <div>{t(`profile.paths.types.${phaseType}`)}</div>

      <h3 className="text-heading-3 lowercase first-letter:uppercase">{`${t(labelPrefix)} ${t('name')}`}</h3>
      <div>{getLocalizedText(otsikko)}</div>

      <h3 className="text-heading-3 lowercase first-letter:uppercase">{`${t(labelPrefix)} ${t('description')}`}</h3>
      <div>{getLocalizedText(kuvaus)}</div>

      <LinksFormSection type={phaseType} />
      <DurationFormSection />
    </div>
  );
};

export default OpportunityDetailsStep;
