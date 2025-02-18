import { MahdollisuusTyyppi } from '@/routes/types';
import { PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface OpportunityCardActionMenuProps {
  menuId: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  mahdollisuusId: string;
}

/**
 * A menu component to use with OpportunityCard inside tool
 */
const ToolOpportunityCardActionMenu = ({
  mahdollisuusTyyppi,
  mahdollisuusId,
  menuId,
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

  const mockOnClick = () => {
    alert('todo');
  };

  return (
    <PopupList>
      <ul id={menuId} className="flex flex-col gap-y-2 w-full">
        <li>
          <Link to={compareTo} type="button">
            <PopupListItem>{t('compare')}</PopupListItem>
          </Link>
        </li>
        <li>
          <Link to="#" onClick={mockOnClick} type="button">
            <PopupListItem>TODO: {t('create-path')}</PopupListItem>
          </Link>
        </li>
        <li>
          <Link to="#" onClick={mockOnClick} type="button">
            <PopupListItem>TODO: {t('share')}</PopupListItem>
          </Link>
        </li>
      </ul>
    </PopupList>
  );
};

export default ToolOpportunityCardActionMenu;
