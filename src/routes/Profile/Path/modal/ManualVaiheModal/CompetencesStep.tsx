import { usePolutStore } from '@/stores/usePolutStore';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { mapOsaaminenToUri, type VaiheForm } from '../../utils';

const CompetencesStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const [disabledOsaamiset, setDisabledOsaamiset] = React.useState<string[]>([]);
  const { vaiheet, vaaditutOsaamiset, osaamisetFromProfile, osaamisetFromPolku } = usePolutStore(
    useShallow((state) => ({
      vaiheet: state.vaiheet,
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      osaamisetFromProfile: state.osaamisetFromProfile,
      osaamisetFromPolku: state.selectedOsaamiset,
    })),
  );

  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { control } = useFormContext<VaiheForm>();
  const {
    fields: osaamisetFields,
    append,
    remove,
  } = useFieldArray({
    control: control,
    name: `osaamiset`,
  });

  React.useEffect(() => {
    const osaamisetInOtherVaiheet = vaiheet
      .filter((_, index) => index !== vaiheIndex)
      .flatMap((vaihe) => vaihe.osaamiset ?? [])
      .map(mapOsaaminenToUri);

    const filteredProfiiliOsaamiset = osaamisetFromProfile
      .filter((osaaminen) => vaaditutOsaamiset.some((o) => o.uri === osaaminen.uri))
      .map(mapOsaaminenToUri);

    setDisabledOsaamiset([...osaamisetInOtherVaiheet, ...filteredProfiiliOsaamiset, ...osaamisetFromPolku]);
  }, [osaamisetFromPolku, osaamisetFromProfile, vaaditutOsaamiset, vaiheIndex, vaiheet]);

  const isChecked = (osaaminenUri: string) => {
    return osaamisetFields.some((osaaminen) => osaaminen.uri === osaaminenUri);
  };

  const onOsaaminenChange = (osaaminenUri: string) => {
    if (isChecked(osaaminenUri)) {
      remove(osaamisetFields.findIndex((osaaminen) => osaaminen.uri === osaaminenUri));
    } else {
      const newOsaaminen = vaaditutOsaamiset.find((osaaminen) => osaaminen.uri === osaaminenUri);

      if (newOsaaminen) {
        append(newOsaaminen);
      }
    }
  };

  const sortedOsaamiset = vaaditutOsaamiset
    .filter((osaaminen) => !disabledOsaamiset.includes(osaaminen.uri))
    .sort(sortByProperty(`nimi.${language}`));

  return (
    <>
      <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
        {t('profile.paths.step-n-details', { count: vaiheIndex + 1 })}
      </h2>
      <p>{t('profile.paths.step-modal-description')}</p>

      <table className="w-full">
        <thead>
          <tr className="bg-white font-arial text-form-label text-left">
            <th className="p-4">{t('profile.paths.required-competence')}</th>
            <th>{t('profile.paths.add-to-step')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedOsaamiset.map((osaaminen) => (
            <tr key={osaaminen.uri} className="border-b border-b-border-gray">
              <td className="p-4 first-letter:uppercase">{getLocalizedText(osaaminen.nimi)}</td>
              <td>
                <Checkbox
                  name={osaaminen.uri}
                  value={osaaminen.uri}
                  checked={isChecked(osaaminen.uri)}
                  ariaLabel={t('profile.paths.add-to-step')}
                  className="disabled:bg-inactive-gray"
                  disabled={disabledOsaamiset.includes(osaaminen.uri)}
                  onChange={() => onOsaaminenChange(osaaminen.uri)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default CompetencesStep;
