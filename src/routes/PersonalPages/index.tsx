/* eslint-disable sonarjs/no-duplicate-string */
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRoutes, matchPath, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActionBar } from '@/hooks/useActionBar';
import {
  Title,
  MainLayout,
  SimpleNavigationList,
  type RoutesNavigationListProps,
  RoutesNavigationList,
  Accordion,
} from '@/components';
import { RadioButtonGroup, RadioButton, Button, Checkbox, Tag } from '@jod/design-system';

const mapNavigationRoutes = (routes: RoutesNavigationListProps['routes']) =>
  routes.map((route) => ({ ...route, path: `../${route.path}` }));

const Preferences = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.preferences');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('personal-pages.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('welcome', { name: 'Reetta' })}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
        <br />
        <br />
        Cum ei sale incorrupte voluptatibus, his causae epicuri in, in est vero inimicus. Nam an ipsum tantas torquatos,
        per ei decore commodo, consul voluptua neglegentur te eam.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää kuva"
              onClick={() => {
                alert('Lisää kuva');
              }}
            />
            <Button
              variant="white"
              label="Jaa osaamiseni"
              onClick={() => {
                alert('Jaa osaamiseni');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista tilini"
              onClick={() => {
                alert('Poista tilini');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const Favorites = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.favorites');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('personal-pages.index')} collapsible>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title="Sisältö" collapsible>
            <div className="py-4">
              <p className="mb-5 text-body-xs text-secondary-gray">Valitse näytettävien suosikit.</p>
              TODO
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Vertaile"
              onClick={() => {
                alert('Vertaile');
              }}
            />
            <Button
              variant="white"
              label="Luo polku"
              onClick={() => {
                alert('Luo polku');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista valitut ammatit"
              onClick={() => {
                alert('Poista valitut ammatit');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

// TODO: Change to use data from backend
const hardcodedCompetenceTags = [
  'viestintätaidot',
  'tiimityöskentelytaidot',
  'ongelmanratkaisutaidot',
  'ajanhallintataidot',
  'itseohjautuvuus',
  'kriittinen ajattelu',
  'soveltava oppiminen',
  'muutosvalmius',
  'yleissivistäväkoulutus',
  'digitaaliset taidot',
  'kulttuurienvälinen kompetenssi',
];

const Competences = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.competences');
  const [value, setValue] = useState<string>('a');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [filter, setFilter] = useState({
    tyopaikkaOsaamiset: true,
    tietotekniikanTaikuri: true,
    ihmeidenManeesi: true,
    metsapuronPuutarha: true,
    koulutusosaamiset: true,
    vapaaAikaOsaamiset: true,
    jotainMuuta: true,
  });

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('personal-pages.index')} collapsible>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title="Järjestele" collapsible>
            <RadioButtonGroup
              label="Valitse, miten haluat ryhmitellä osaamisesi."
              value={value}
              onChange={setValue}
              className="py-4"
            >
              <RadioButton label="Lähteiden mukaan" value="a" />
              <RadioButton label="Teemoittain" value="b" />
              <RadioButton label="Aakkosellisesti" value="c" />
            </RadioButtonGroup>
          </SimpleNavigationList>
          <SimpleNavigationList title="Suodata" collapsible>
            <div className="py-4">
              <p className="mb-5 text-body-xs text-secondary-gray">
                Valitse osaamiset eri lähteistä. Käytämme valitsemiasi osaamisia mahdollisuuksien tunnistamiseen.
              </p>
              <div className="flex flex-col gap-y-2">
                <Accordion
                  title={
                    <Checkbox
                      checked={filter.tyopaikkaOsaamiset}
                      onChange={() => {
                        setFilter({ ...filter, tyopaikkaOsaamiset: !filter.tyopaikkaOsaamiset });
                      }}
                      label={
                        <>
                          <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-1" aria-hidden />
                          Työpaikka osaamiset
                        </>
                      }
                      name="suodata"
                      value="tyopaikka-osaamiset"
                    />
                  }
                >
                  <div className="ml-6 flex flex-col gap-y-2">
                    <Checkbox
                      checked={filter.tietotekniikanTaikuri}
                      onChange={() => {
                        setFilter({ ...filter, tietotekniikanTaikuri: !filter.tietotekniikanTaikuri });
                      }}
                      label="Tietotekniikan Taikuri"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                    />
                    <Checkbox
                      checked={filter.ihmeidenManeesi}
                      onChange={() => {
                        setFilter({ ...filter, ihmeidenManeesi: !filter.ihmeidenManeesi });
                      }}
                      label="Ihmeiden Maneesi"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                    />
                    <Checkbox
                      checked={filter.metsapuronPuutarha}
                      onChange={() => {
                        setFilter({ ...filter, metsapuronPuutarha: !filter.metsapuronPuutarha });
                      }}
                      label="Metsäpuron Puutarha"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                    />
                  </div>
                </Accordion>
                <Checkbox
                  checked={filter.koulutusosaamiset}
                  onChange={() => {
                    setFilter({ ...filter, koulutusosaamiset: !filter.koulutusosaamiset });
                  }}
                  label={
                    <>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-2" aria-hidden />
                      Koulutusosaamiset
                    </>
                  }
                  name="suodata"
                  value="koulutusosaamiset"
                />
                <Checkbox
                  checked={filter.vapaaAikaOsaamiset}
                  onChange={() => {
                    setFilter({ ...filter, vapaaAikaOsaamiset: !filter.vapaaAikaOsaamiset });
                  }}
                  label={
                    <>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-3" aria-hidden />
                      Vapaa-ajan osaamiset
                    </>
                  }
                  name="suodata"
                  value="vapaa-ajan-osaamiset"
                />
                <Checkbox
                  checked={filter.jotainMuuta}
                  onChange={() => {
                    setFilter({ ...filter, jotainMuuta: !filter.jotainMuuta });
                  }}
                  label={
                    <>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-4" aria-hidden />
                      Jotain muuta
                    </>
                  }
                  name="suodata"
                  value="jotain-muuta"
                />
              </div>
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <h2 className="mb-6 text-heading-3">Osaamiseni lähteiden mukaan</h2>
      <Accordion title={<span className="truncate text-heading-5 text-secondary-gray">Työpaikkojen mukaan</span>}>
        <span className="mb-5 mt-3 flex border border-b-2 border-inactive-gray"></span>
        <div className="flex flex-wrap gap-4">
          {hardcodedCompetenceTags.map((val) => {
            return <Tag label={val} key={val} variant="added" onClick={() => console.log('clicked:', val)} />;
          })}
        </div>
      </Accordion>

      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää osaamisala"
              onClick={() => {
                alert('Lisää osaamisala');
              }}
            />
            <Button
              variant="white"
              label="Jaa"
              onClick={() => {
                alert('Jaa');
              }}
            />
            <Button
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const WorkHistory = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.work-history');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('personal-pages.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää uusi työpaikka"
              onClick={() => {
                alert('Lisää uusi työpaikka');
              }}
            />
            <Button
              variant="white"
              label="Hae tietoja..."
              onClick={() => {
                alert('Hae tietoja...');
              }}
            />
            <Button
              variant="white"
              label="Tunnista osaamisia"
              onClick={() => {
                alert('Tunnista osaamisia');
              }}
            />
            <Button
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista"
              onClick={() => {
                alert('Poista');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const EducationHistory = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.education-history');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('personal-pages.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää uusi koulutus"
              onClick={() => {
                alert('Lisää uusi koulutus');
              }}
            />
            <Button
              variant="white"
              label="Hae tietoja..."
              onClick={() => {
                alert('Hae tietoja...');
              }}
            />
            <Button
              variant="white"
              label="Tunnista osaamisia"
              onClick={() => {
                alert('Tunnista osaamisia');
              }}
            />
            <Button
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista"
              onClick={() => {
                alert('Poista');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const FreeTimeActivities = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.free-time-activities');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('personal-pages.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää uusi toiminto"
              onClick={() => {
                alert('Lisää uusi toiminto');
              }}
            />
            <Button
              variant="white"
              label="Tunnista osaamisia"
              onClick={() => {
                alert('Tunnista osaamisia');
              }}
            />
            <Button
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista"
              onClick={() => {
                alert('Poista');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const SomethingElse = ({ routes }: RoutesNavigationListProps) => {
  const { t } = useTranslation();
  const title = t('personal-pages.something-else');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('personal-pages.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Lisää uusi ‘Jotain muuta...’"
              onClick={() => {
                alert('Lisää uusi ‘Jotain muuta...’');
              }}
            />
            <Button
              variant="white"
              label="Muokkaa"
              onClick={() => {
                alert('Muokkaa');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista"
              onClick={() => {
                alert('Poista');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

const PersonalPages = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  const routes = [
    {
      name: t('personal-pages.preferences'),
      path: t('slugs.personal-pages.preferences'),
      element: Preferences,
    },
    {
      name: t('personal-pages.favorites'),
      path: t('slugs.personal-pages.favorites'),
      element: Favorites,
    },
    {
      name: t('personal-pages.competences'),
      path: t('slugs.personal-pages.competences'),
      element: Competences,
    },
    {
      name: t('personal-pages.work-history'),
      path: t('slugs.personal-pages.work-history'),
      element: WorkHistory,
    },
    {
      name: t('personal-pages.education-history'),
      path: t('slugs.personal-pages.education-history'),
      element: EducationHistory,
    },
    {
      name: t('personal-pages.free-time-activities'),
      path: t('slugs.personal-pages.free-time-activities'),
      element: FreeTimeActivities,
    },
    {
      name: t('personal-pages.something-else'),
      path: t('slugs.personal-pages.something-else'),
      element: SomethingElse,
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`/${i18n.language}/${t('slugs.personal-pages.index')}/${route.path}`, pathname),
  }));

  return useRoutes(
    routes.map((route) => ({
      ...route,
      element: route.element({ routes }),
    })),
  );
};

export default PersonalPages;
