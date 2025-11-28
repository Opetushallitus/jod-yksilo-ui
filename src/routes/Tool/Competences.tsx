import { OsaamisSuosittelija } from '@/components';
import { useToolStore } from '@/stores/useToolStore';
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { mergeUniqueValuesExcludingType } from './utils';

const Competences = () => {
  const { osaamiset, setOsaamiset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      setOsaamiset: state.setOsaamiset,
    })),
  );

  const onChange = React.useCallback(
    (newValues: typeof osaamiset) => {
      setOsaamiset(mergeUniqueValuesExcludingType(osaamiset, newValues));
    },
    [osaamiset, setOsaamiset],
  );

  return (
    <OsaamisSuosittelija
      onChange={onChange}
      value={osaamiset.filter((o) => o.tyyppi === 'KARTOITETTU')}
      tagHeadingClassName="bg-white"
      hideTextAreaLabel
    />
  );
};

export default Competences;
