import MoreActionsDropdown from '@/components/MoreActionsDropdown/MoreActionsDropdown';
import VaiheCardMenu from '@/routes/Profile/Path/VaiheCardMenu';
import { formatDate, getLocalizedText } from '@/utils';
import { Checkbox, Tag } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { getDuration, type VaiheForm } from './utils';

interface VaiheCardProps {
  vaihe: VaiheForm;
  totalSteps: number;
  setVaiheComplete: () => void;
  openVaiheModal: () => void;
}
const VaiheCard = ({ vaihe, totalSteps, setVaiheComplete, openVaiheModal }: VaiheCardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const getVaiheDurationMessage = () => {
    const startDate = new Date(vaihe.alkuPvm);
    const endDate = new Date(vaihe.loppuPvm);
    const { months, years } = getDuration(startDate.getTime(), endDate.getTime());
    const monthsStr = t('profile.paths.n-months', { count: months });

    return years > 0 ? `${t('profile.paths.n-years', { count: years })} ${monthsStr}` : monthsStr;
  };

  if (!vaihe.id) {
    return null;
  }

  return (
    <div className="shadow-border bg-white rounded-md flex flex-col gap-5 p-6 w-full">
      {/* Type & duration & actions */}
      <div className="flex flex-row justify-between flex-wrap gap-4">
        <div className="text-body-md font-semibold flex-wrap flex gap-2">
          <span>{t(`profile.paths.types.${vaihe.tyyppi}`)}</span>
          <span>-</span>
          <span>{getVaiheDurationMessage()}</span>
        </div>
        {/* Actions */}
        <div className="flex flex-row justify-between gap-5 flex-wrap">
          <Checkbox
            name={vaihe.nimi[language]}
            value={vaihe.nimi[language]}
            checked={vaihe.valmis ?? false}
            label={t('done')}
            ariaLabel={t('done')}
            variant="bordered"
            onChange={() => setVaiheComplete()}
          />
          <MoreActionsDropdown
            menuId={vaihe.nimi[language]}
            menuContent={<VaiheCardMenu vaiheId={vaihe.id} openVaiheModal={openVaiheModal} />}
          />
        </div>
      </div>
      {/* Title & description */}
      <div className="flex flex-col gap-5">
        <div className="text-heading-2">{vaihe.nimi[language]}</div>
        <div className="text-body-md">{vaihe.kuvaus?.[language]}</div>
      </div>
      {/* Links */}
      {vaihe.linkit.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-body-lg">{t('links')}</div>
          <div className="flex flex-col gap-1">
            {vaihe.linkit.map((link) => (
              <div className="flex flex-row gap-6" key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-link">
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Dates */}
      <div className="flex flex-col gap-2">
        <div className="text-body-lg">{t('profile.paths.starts-and-ends')}</div>
        <span>{`${formatDate(new Date(vaihe.alkuPvm), 'medium')} - ${formatDate(new Date(vaihe.loppuPvm), 'medium')}`}</span>
      </div>
      {/* Osaamiset */}
      <div className="flex flex-col gap-2">
        <div className="text-body-lg">
          {t('profile.paths.competences-gained-from-phase')} ({vaihe.osaamiset?.length ?? 0}/{totalSteps})
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {vaihe.osaamiset?.map((osaaminen) => (
            <Tag
              key={osaaminen.uri}
              variant="presentation"
              sourceType="tyopaikka"
              label={getLocalizedText(osaaminen.nimi)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaiheCard;
