import { OsaamisSuosittelija } from '@/components';
import { isFeatureEnabled } from '@/utils/features';
import React from 'react';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';
import { VirtualAssistant } from './VirtualAssistant';

const Competences = () => {
  const { osaamiset, setOsaamiset, mappedOsaamiset } = useTool();

  const onChange = React.useCallback(
    (newValues: typeof osaamiset) => {
      setOsaamiset(mergeUniqueValuesExcludingType(osaamiset, newValues));
    },
    [osaamiset, setOsaamiset],
  );

  return (
    <>
      <OsaamisSuosittelija
        onChange={onChange}
        value={mappedOsaamiset}
        tagHeadingClassName="bg-white"
        hideTextAreaLabel
        useAnimations
      />
      {isFeatureEnabled('VIRTUAALIOHJAAJA') && <VirtualAssistant type="competences" />}
    </>
  );
};

export default Competences;
