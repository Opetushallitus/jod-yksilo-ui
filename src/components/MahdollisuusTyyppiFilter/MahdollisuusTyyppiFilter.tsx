import { MahdollisuusTyyppi } from '@/routes/types';
import { Checkbox } from '@jod/design-system';

interface MahdollisuusTyyppiFilterProps {
  jobFilterText: string;
  educationFilterText: string;
  isFilterChecked: (filter: MahdollisuusTyyppi) => boolean;
  handleFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Filter component for mahdollisuus type */
export const MahdollisuusTyyppiFilter = ({
  jobFilterText,
  educationFilterText,
  isFilterChecked,
  handleFilterChange,
}: MahdollisuusTyyppiFilterProps) => {
  return (
    <div className="flex flex-col gap-4 hyphens-auto">
      <Checkbox
        ariaLabel={jobFilterText}
        checked={isFilterChecked('TYOMAHDOLLISUUS')}
        label={jobFilterText}
        name={jobFilterText}
        onChange={handleFilterChange}
        value="TYOMAHDOLLISUUS"
      />
      <Checkbox
        ariaLabel={educationFilterText}
        checked={isFilterChecked('KOULUTUSMAHDOLLISUUS')}
        label={educationFilterText}
        name={educationFilterText}
        onChange={handleFilterChange}
        value="KOULUTUSMAHDOLLISUUS"
      />
    </div>
  );
};
