import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { PopupList, PopupListItem } from '@jod/design-system';

import { MahdollisuusTyyppi } from '@/routes/types';
import { copyToClipboard } from '@/utils';

interface OpportunityCardActionMenuProps {
  menuId: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusId: string;
  opportunityUrl: string;
}

/**
 * A menu component to use with OpportunityCard inside tool
 */
const ToolOpportunityCardActionMenu = ({
  mahdollisuusTyyppi,
  mahdollisuusId,
  menuId,
  opportunityUrl,
}: OpportunityCardActionMenuProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const compareTo =
    mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
      ? {
          pathname: `/${language}/${t('slugs.job-opportunity.index')}/${mahdollisuusId}`,
          hash: t('job-opportunity.competences.title'),
        }
      : {
          pathname: `/${language}/${t('slugs.education-opportunity.index')}/${mahdollisuusId}`,
          hash: t('education-opportunity.competences.route'),
        };

  return (
    <PopupList testId="opportunity-card-action-menu">
      <ul id={menuId} className="flex w-full flex-col gap-y-2">
        <li>
          <Link to={compareTo} type="button" data-testid="opportunity-action-compare">
            <PopupListItem>{t('compare')}</PopupListItem>
          </Link>
        </li>
        <li>
          <button
            data-testid="opportunity-action-share"
            onClick={() => copyToClipboard(window.location.origin + '/yksilo' + opportunityUrl)}
            className="w-full cursor-pointer"
          >
            <PopupListItem>{t('common:share')}</PopupListItem>
          </button>
        </li>
      </ul>
    </PopupList>
  );
};

export default ToolOpportunityCardActionMenu;
