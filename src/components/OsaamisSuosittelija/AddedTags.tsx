import type { OsaaminenValue } from '@/components';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { animateHideElement } from '@/utils/animations';
import { cx, Tag } from '@jod/design-system';
import React from 'react';

interface AddedTagProps {
  onClick: (ids: string[]) => () => void;
  osaamiset: OsaaminenValue[];
  lahdetyyppi?: OsaaminenLahdeTyyppi;
  useAnimations?: boolean;
}
const AddedTags = ({ osaamiset, lahdetyyppi, onClick, useAnimations = false }: AddedTagProps) => {
  const [shownIds, setShownIds] = React.useState<string[]>([]); // For handling newly added osaamiset
  const [debouncedIdsToBeRemoved, idsToBeRemoved, setIdsToBeRemoved] = useDebounceState<string[]>([], 300);

  React.useEffect(() => {
    if (debouncedIdsToBeRemoved.length > 0) {
      onClick(debouncedIdsToBeRemoved)();
      setShownIds((prev) => prev.filter((id) => !debouncedIdsToBeRemoved.includes(id)));
      setIdsToBeRemoved([]);
    }
    // Only run when debouncedIdsToBeRemoved changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedIdsToBeRemoved]);

  // This effect handles adding new osaamiset with animation
  React.useEffect(() => {
    if (!useAnimations) {
      return;
    }
    // Find new ids not yet shown
    const newIds = osaamiset.map((o) => o.id).filter((id) => !shownIds.includes(id));
    if (newIds.length > 0) {
      // Add new ids after a tick to trigger animation
      const timeout = setTimeout(() => {
        setShownIds((prev) => [...prev, ...newIds]);
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [osaamiset, shownIds, useAnimations]);

  return osaamiset.map((osaaminen) => {
    type TagProps = React.ComponentProps<typeof Tag>;
    let sourceType: TagProps['sourceType'];

    if (lahdetyyppi) {
      sourceType = OSAAMINEN_COLOR_MAP[lahdetyyppi];
    } else if (osaaminen.tyyppi) {
      sourceType = OSAAMINEN_COLOR_MAP[osaaminen.tyyppi];
    } else {
      sourceType = OSAAMINEN_COLOR_MAP['MUU_OSAAMINEN'];
    }

    const isVisible = useAnimations ? shownIds.includes(osaaminen.id) : true;

    return (
      <li
        key={osaaminen.id + sourceType}
        className={cx({
          'scale-100 opacity-100 transition-all duration-300 delay-500': useAnimations && isVisible,
          'scale-0 opacity-0 h-0': useAnimations && !isVisible,
        })}
      >
        <Tag
          label={getLocalizedText(osaaminen.nimi)}
          tooltip={idsToBeRemoved.includes(osaaminen.id) ? undefined : getLocalizedText(osaaminen.kuvaus)}
          sourceType={sourceType}
          onClick={(e) => {
            setIdsToBeRemoved([osaaminen.id, ...idsToBeRemoved]);
            if (useAnimations) {
              animateHideElement(e.currentTarget);
            }
          }}
          variant="added"
          testId={`added-tag-${osaaminen.id}`}
        />
      </li>
    );
  });
};

export default AddedTags;
