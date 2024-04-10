import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearErrorNote, setErrorNote } from '@/features/errorNote/errorNoteSlice';
import { InputField } from '@jod/design-system';

interface Competence {
  id: number;
  nimi: string;
  osuvuus: number;
}

const Competences = () => {
  const { t } = useTranslation();
  const [competences, setCompetences] = React.useState<Competence[]>([]);
  const [skill, setSkill] = React.useState('');
  const dispatch = useDispatch();

  const debounce = <F extends (...args: never[]) => void>(func: F, waitFor = 800) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), waitFor);
    };
  };

  const fetchCompetences = React.useCallback(
    (newSkill: string) => {
      fetch('/api/ehdotus/osaamiset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kuvaus: newSkill }),
      })
        .then((resp) => {
          if (!resp.ok) {
            dispatch(setErrorNote({ title: 'error.network.title', description: 'error.network.500' }));

            throw new Error('Network response was not ok');
          }
          dispatch(clearErrorNote());
          return resp.json();
        })
        .then((data: Competence[]) => {
          setCompetences(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    },
    [dispatch],
  );

  const debouncedFetchCompetences = React.useMemo(() => {
    return debounce((newSkill: string) => fetchCompetences(newSkill));
  }, [fetchCompetences]);

  const inputChangeHandler = (newValue: string) => {
    setSkill(newValue);
    debouncedFetchCompetences(newValue);
  };

  return (
    <div className="flex">
      <div className="basis-2/3">
        <h1 className="mb-5 mt-7 text-heading-1 text-primary-gray">{t('profile.competences.heading-1')}</h1>
        <div className="pb-7">
          <p className="mb-6 text-body-md text-primary-gray">{t('profile.competences.page-description')}</p>
          <p className="text-body-md text-primary-gray">{t('profile.competences.field-description')}</p>
        </div>
        <InputField label="Taitosi" value={skill} onChange={inputChangeHandler} />
        <div className="mt-7 min-h-[200px] rounded border p-4">
          <ul className="flex flex-col space-y-4">
            {competences.map((item) => (
              <li className="flex flex-row justify-between rounded border p-4" key={item.id}>
                <span>{item.nimi}</span>
                <span>{item.osuvuus}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="basis-1/3"></div>
    </div>
  );
};

export default Competences;
