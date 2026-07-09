import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { OsaamisSuosittelija } from '@/components';
import { isFeatureEnabled } from '@/utils/features';

import VirtualAssistant from '../../components/VirtualAssistant';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';

const Competences = () => {
  const { t } = useTranslation();
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
        scrollOnFocus={false}
        isTagSpacing={false}
        tagHeadingLevel="h3"
      />
      {mappedOsaamiset.length > 1 && (
        <Button
          variant="plain"
          onClick={() => {
            setOsaamiset([]);
          }}
          className="ml-2"
          label={t('tool.competency-profile.delete-all')}
          testId="competences-remove-all-button"
        />
      )}
      {isFeatureEnabled('VIRTUAALIOHJAAJA_OSAAMISET') && <VirtualAssistant type="competences" className="mt-6" />}
    </>
  );
};

export default Competences;
