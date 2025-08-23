import { useEnvironment } from '@/hooks/useEnvironment';
import { MahdollisuusTyyppi } from '@/routes/types';
import { copyToClipboard } from '@/utils';
import { PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

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
  const { isDev } = useEnvironment();

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

  const mockOnClick = () => {
    alert('todo');
  };

  return (
    <PopupList>
      <ul id={menuId} className="flex flex-col gap-y-2 w-full">
        <li>
          <Link to={compareTo} type="button" data-testid="opportunity-action-compare">
            <PopupListItem>{t('compare')}</PopupListItem>
          </Link>
        </li>
        {isDev && (
          <li>
            <Link to="#" onClick={mockOnClick} type="button" data-testid="opportunity-action-create-path">
              <PopupListItem>TODO: {t('create-path')}</PopupListItem>
            </Link>
          </li>
        )}
        <li>
          <button
            onClick={() => void copyToClipboard(`${window.location.origin}/yksilo${compareTo.pathname}`)}
            className="cursor-pointer w-full"
            data-testid="opportunity-action-share"
          >
            <PopupListItem>{t('share')}</PopupListItem>
          </button>
        </li>
      </ul>
    </PopupList>
  );
};

export default FavoritesOpportunityCardActionMenu;
