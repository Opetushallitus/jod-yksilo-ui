import { OsaamisSuosittelija } from '@/components';
import React from 'react';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';

const Competences = () => {
  const { osaamiset, setOsaamiset, mappedOsaamiset } = useTool();

  const onChange = React.useCallback(
    (newValues: typeof osaamiset) => {
      setOsaamiset(mergeUniqueValuesExcludingType(osaamiset, newValues));
    },
    [osaamiset, setOsaamiset],
  );

  return (
    <OsaamisSuosittelija
      onChange={onChange}
      value={mappedOsaamiset}
      tagHeadingClassName="bg-white"
      hideTextAreaLabel
      useAnimations
    />
  );
};

export default Competences;
