import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { PopupList, PopupListItem } from '@jod/design-system';

import { MahdollisuusTyyppi } from '@/routes/types';
import { copyToClipboard } from '@/utils';

interface FavoritesOpportunityCardActionMenuProps {
  menuId: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusId: string;
}

/**
 * A menu component to use with OpportunityCard inside favorites (suosikkini)
 */
const FavoritesOpportunityCardActionMenu = ({
  mahdollisuusTyyppi,
  mahdollisuusId,
  menuId,
}: FavoritesOpportunityCardActionMenuProps) => {
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
    <PopupList>
      <ul id={menuId} className="flex w-full flex-col gap-y-2">
        <li>
          <Link to={compareTo} type="button" data-testid="opportunity-action-compare">
            <PopupListItem>{t('compare')}</PopupListItem>
          </Link>
        </li>
        <li>
          <button
            onClick={() => void copyToClipboard(`${window.location.origin}/yksilo${compareTo.pathname}`)}
            className="w-full cursor-pointer"
            data-testid="opportunity-action-share"
          >
            <PopupListItem>{t('common:share')}</PopupListItem>
          </button>
        </li>
      </ul>
    </PopupList>
  );
};

export default FavoritesOpportunityCardActionMenu;
