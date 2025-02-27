import { MainLayout, OpportunityCard } from '@/components';
import i18n from '@/i18n/config';
import TavoiteInput from '@/routes/Profile/MyGoals/TavoiteInput';
import { getTypeSlug } from '@/routes/Profile/utils';
import { getLocalizedText } from '@/utils';
import { Checkbox, PathProgress } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import loader from './loader';

const Path = () => {
  const { t } = useTranslation();
  const {
    paamaara,
    mahdollisuus,
    osaamiset = [],
    omatOsaamiset = [],
  } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const id = React.useId();
  const [steps, setSteps] = React.useState(1);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedOsaamiset, setSelectedOsaamiset] = React.useState<string[]>([]);
  const [ingoredOsaamiset, setIgnoredOsaamiset] = React.useState<string[]>([]);
  const [percentage, setPercentage] = React.useState(0);

  React.useEffect(() => {
    setPercentage(Math.round((selectedOsaamiset.length / osaamiset.length) * 100));
  }, [osaamiset.length, selectedOsaamiset.length]);

  React.useEffect(() => {
    setSelectedOsaamiset(omatOsaamiset.map((osaaminen) => osaaminen.osaaminen.uri));
  }, [omatOsaamiset]);

  if (!paamaara) {
    return null;
  }

  // eslint-disable-next-line no-console
  console.log(setSteps, currentStep);

  const onIgnoreOsaaminen = (osaaminenUri: string) => {
    if (ingoredOsaamiset.includes(osaaminenUri)) {
      setIgnoredOsaamiset(ingoredOsaamiset.filter((uri) => uri !== osaaminenUri));
    } else {
      setIgnoredOsaamiset([...ingoredOsaamiset, osaaminenUri]);
    }
  };

  const onOsaaminenChange = (osaaminenUri: string) => {
    if (selectedOsaamiset.includes(osaaminenUri)) {
      setSelectedOsaamiset(selectedOsaamiset.filter((uri) => uri !== osaaminenUri));
    } else {
      setSelectedOsaamiset([...selectedOsaamiset, osaaminenUri]);
    }
  };

  const { mahdollisuusTyyppi, mahdollisuusId } = paamaara;
  const menuId = paamaara.id ?? id;

  return (
    <MainLayout>
      <div className="flex flex-col gap-5">
        {/* Päämäärä */}
        <div className="bg-bg-gray p-9">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.paths.title')}</h1>
          </div>
          <p className="text-body-lg font-medium mb-5">{t('profile.paths.description')}</p>
          <div className="flex flex-col gap-5 mb-5">
            {paamaara ? (
              <div className="flex flex-col gap-5 mb-9">
                <OpportunityCard
                  to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId}`}
                  description={getLocalizedText(mahdollisuus?.tiivistelma)}
                  employmentOutlook={2}
                  hasRestrictions
                  industryName="TODO: Lorem ipsum dolor"
                  mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                  name={getLocalizedText(mahdollisuus?.otsikko)}
                  trend="LASKEVA"
                  type={mahdollisuusTyyppi}
                  menuContent={<></>}
                  menuId={menuId}
                  hideFavorite
                />
                <TavoiteInput paamaara={paamaara} />
              </div>
            ) : null}
          </div>
        </div>
        {/* Suunnitelma */}
        <div className="flex flex-col bg-bg-gray-2 p-9">
          <h2 className="text-heading-2 pb-7">{t('profile.paths.plan')}</h2>
          <div>
            <PathProgress steps={steps} currentStep={1} onClick={setCurrentStep} />
          </div>
          <div className="mt-[123px] border-t pt-6 border-[#bababa]">
            <h2 className="text-heading-2">Kokonaiskesto:</h2>
          </div>
        </div>
        {/* Osaamisen kehittyminen */}
        <div className="flex flex-col bg-bg-gray p-9">
          <div className="flex flex-row items-center gap-3">
            <h2 className="text-heading-1">{t('profile.paths.skill-progress')}</h2>
            <div className="grow text-body-lg">
              ({selectedOsaamiset.length}/{t('count-competences', { count: osaamiset.length ?? 0 })})
            </div>
            <div className="text-heading-3">{percentage}%</div>
          </div>
          <div className="relative w-full h-6 my-8">
            <div className="bg-bg-gray-2 w-full h-6 my-6 absolute"></div>
            <div className="transition-all bg-[#00A8B3] h-6 my-6 absolute" style={{ width: `${percentage}%` }}></div>
          </div>

          <div>
            <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
              <thead className="bg-white">
                <tr className="text-body-md text-left align-middle">
                  <th scope="col" className="font-arial text-form-label p-4">
                    {t('competence')}
                  </th>
                  <th scope="col" className="font-arial text-form-label">
                    {t('profile.paths.your-competences')}
                  </th>
                  <th scope="col" className="font-arial text-form-label">
                    {t('profile.paths.ignore')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {osaamiset.map((o, i) => {
                  const name = o.nimi[i18n.language];
                  return (
                    <tr key={o.uri} className={i % 2 !== 0 ? 'bg-white bg-opacity-60' : 'bg-bg-gray-2'}>
                      <td className="p-3 font-arial first-letter:capitalize text-body-md">{name}</td>
                      <td className="text-center">
                        <Checkbox
                          name={name}
                          value={o.uri}
                          checked={selectedOsaamiset.includes(o.uri)}
                          label={t('profile.paths.has-competence')}
                          ariaLabel={name}
                          onChange={() => onOsaaminenChange(o.uri)}
                        />
                      </td>
                      <td>
                        <Checkbox
                          name={`${name}-ignore`}
                          value={o.uri}
                          checked={ingoredOsaamiset.includes(o.uri)}
                          ariaLabel={`${t('profile.paths.ignore')} ${name}`}
                          onChange={() => onIgnoreOsaaminen(o.uri)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Path;
