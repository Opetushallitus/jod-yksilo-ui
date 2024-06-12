import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useActionBar } from '@/hooks/useActionBar';
import { mapNavigationRoutes } from './utils';
import {
  Title,
  MainLayout,
  SimpleNavigationList,
  type RoutesNavigationListProps,
  RoutesNavigationList,
} from '@/components';
import { Accordion, RadioButtonGroup, RadioButton, Button, Checkbox, Tag } from '@jod/design-system';
import { useOutletContext } from 'react-router-dom';

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

const Competences = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const { t, i18n } = useTranslation();
  const title = t('profile.competences');
  const [value, setValue] = React.useState<string>('a');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [filter, setFilter] = React.useState({
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
          <SimpleNavigationList title={t('profile.index')} collapsible>
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
                        <span className="flex items-center hyphens-auto" lang={i18n.language}>
                          <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-1" aria-hidden />
                          Työpaikka osaamiset
                        </span>
                      }
                      ariaLabel="Työpaikka osaamiset"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                      className="min-h-7"
                    />
                  }
                  expandMoreText={t('expand-more')}
                  expandLessText={t('expand-less')}
                  lang={i18n.language}
                >
                  <div className="ml-6 flex flex-col gap-y-2">
                    <Checkbox
                      checked={filter.tietotekniikanTaikuri}
                      onChange={() => {
                        setFilter({ ...filter, tietotekniikanTaikuri: !filter.tietotekniikanTaikuri });
                      }}
                      label={
                        <span className="flex items-center hyphens-auto pl-3" lang={i18n.language}>
                          Tietotekniikan Taikuri
                        </span>
                      }
                      ariaLabel="Tietotekniikan Taikuri"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                      className="min-h-7"
                    />
                    <Checkbox
                      checked={filter.ihmeidenManeesi}
                      onChange={() => {
                        setFilter({ ...filter, ihmeidenManeesi: !filter.ihmeidenManeesi });
                      }}
                      label={
                        <span className="flex items-center hyphens-auto pl-3" lang={i18n.language}>
                          Ihmeiden Maneesi
                        </span>
                      }
                      ariaLabel="Ihmeiden Maneesi"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                      className="min-h-7"
                    />
                    <Checkbox
                      checked={filter.metsapuronPuutarha}
                      onChange={() => {
                        setFilter({ ...filter, metsapuronPuutarha: !filter.metsapuronPuutarha });
                      }}
                      label={
                        <span className="flex items-center hyphens-auto pl-3" lang={i18n.language}>
                          Metsäpuron Puutarha
                        </span>
                      }
                      ariaLabel="Metsäpuron Puutarha"
                      name="suodata"
                      value="tyopaikka-osaamiset"
                      className="min-h-7"
                    />
                  </div>
                </Accordion>
                <Checkbox
                  checked={filter.koulutusosaamiset}
                  onChange={() => {
                    setFilter({ ...filter, koulutusosaamiset: !filter.koulutusosaamiset });
                  }}
                  label={
                    <span className="flex items-center hyphens-auto" lang={i18n.language}>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-2" aria-hidden />
                      Koulutusosaamiset
                    </span>
                  }
                  ariaLabel="Koulutusosaamiset"
                  name="suodata"
                  value="koulutusosaamiset"
                  className="min-h-7"
                />
                <Checkbox
                  checked={filter.vapaaAikaOsaamiset}
                  onChange={() => {
                    setFilter({ ...filter, vapaaAikaOsaamiset: !filter.vapaaAikaOsaamiset });
                  }}
                  label={
                    <span className="flex items-center hyphens-auto" lang={i18n.language}>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-3" aria-hidden />
                      Vapaa-ajan osaamiset
                    </span>
                  }
                  ariaLabel="Vapaa-ajan osaamiset"
                  name="suodata"
                  value="vapaa-ajan-osaamiset"
                  className="min-h-7"
                />
                <Checkbox
                  checked={filter.jotainMuuta}
                  onChange={() => {
                    setFilter({ ...filter, jotainMuuta: !filter.jotainMuuta });
                  }}
                  label={
                    <span className="flex items-center hyphens-auto" lang={i18n.language}>
                      <div className="mx-3 h-5 w-5 flex-none rounded-full bg-secondary-4" aria-hidden />
                      Jotain muuta
                    </span>
                  }
                  ariaLabel="Jotain muuta"
                  name="suodata"
                  value="jotain-muuta"
                  className="min-h-7"
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
      <Accordion
        title={<span className="truncate text-heading-5 text-secondary-gray">Työpaikkojen mukaan</span>}
        expandMoreText={t('expand-more')}
        expandLessText={t('expand-less')}
        lang={i18n.language}
      >
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

export default Competences;
