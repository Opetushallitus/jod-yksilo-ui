import { type MahdollisuusTyyppi } from '@/routes/types';
import { JodBuild, JodCertificate, JodWorkPossibilities } from '@jod/design-system/icons';

export const TitleIcon = ({
  tyyppi,
  aineisto,
}: {
  tyyppi: MahdollisuusTyyppi;
  aineisto: 'AMMATTITIETO' | 'TMT' | undefined;
}) => {
  if (tyyppi === 'TYOMAHDOLLISUUS') {
    return aineisto === 'AMMATTITIETO' ? (
      <JodBuild className="text-white" />
    ) : (
      <JodWorkPossibilities className="text-white" />
    );
  }
  return <JodCertificate className="text-white" />;
};
