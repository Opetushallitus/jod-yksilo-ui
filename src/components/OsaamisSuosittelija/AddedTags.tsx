import { OsaaminenValue } from '@/components';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { Tag } from '@jod/design-system';

interface AddedTagProps {
  onClick: (id: string) => () => void;
  osaamiset: OsaaminenValue[];
  lahdetyyppi?: OsaaminenLahdeTyyppi;
}
const AddedTags = ({ osaamiset, lahdetyyppi, onClick }: AddedTagProps) =>
  osaamiset.map((osaaminen) => {
    let sourceType;

    if (lahdetyyppi) {
      sourceType = OSAAMINEN_COLOR_MAP[lahdetyyppi];
    } else if (osaaminen.tyyppi) {
      sourceType = OSAAMINEN_COLOR_MAP[osaaminen.tyyppi];
    } else {
      sourceType = OSAAMINEN_COLOR_MAP['MUU_OSAAMINEN'];
    }

    return (
      <Tag
        key={osaaminen.id}
        label={getLocalizedText(osaaminen.nimi)}
        title={getLocalizedText(osaaminen.kuvaus)}
        sourceType={sourceType}
        onClick={onClick(osaaminen.id)}
        variant="added"
        data-testid={`added-tag-${osaaminen.id}`}
      />
    );
  });

export default AddedTags;
