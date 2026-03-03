import { type MahdollisuusAlityyppi } from '@/routes/types';
import { JodBuild, JodCertificate, JodGuide, JodWorkPossibilities } from '@jod/design-system/icons';

const ICONS: Record<MahdollisuusAlityyppi, React.ElementType> = {
  AMMATTI: JodBuild,
  MUU_TYOMAHDOLLISUUS: JodWorkPossibilities,
  TUTKINTO: JodCertificate,
  MUU_KOULUTUS: JodGuide,
};

export const TitleIcon = ({ mahdollisuusAlityyppi }: { mahdollisuusAlityyppi: MahdollisuusAlityyppi }) => {
  const IconComponent = ICONS[mahdollisuusAlityyppi];
  return <IconComponent className="text-white" />;
};
