import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import type { KoulutusmahdollisuusJakaumat, TypedMahdollisuus } from '@/routes/types';
import { usePolutStore } from '@/stores/usePolutStore';
import { getLocalizedText } from '@/utils';
import { Accordion, RadioButton, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VaiheOpportunityCardProps {
  mahdollisuus: TypedMahdollisuus;
}

const VaiheOpportunityCard = React.memo(({ mahdollisuus }: VaiheOpportunityCardProps) => {
  const [osaamiset, setOsaamiset] = React.useState<components['schemas']['OsaaminenDto'][]>([]);
  const getMissingOsaamisetUris = usePolutStore((state) => state.getMissingOsaamisetUris);

  const { t, i18n } = useTranslation();
  const { id, otsikko, kuvaus } = mahdollisuus;
  const fetchOsaamiset = () =>
    client
      .GET(`/api/koulutusmahdollisuudet/{id}`, {
        params: { path: { id: mahdollisuus.id } },
      })
      .then(({ data }) => {
        const jakaumat = (data?.jakaumat ?? []) as unknown as KoulutusmahdollisuusJakaumat;
        const mahdollisuusOsaamiset = (jakaumat.osaaminen.arvot ?? []).map((x) => x.arvo);

        if (mahdollisuusOsaamiset.length === 0) {
          return Promise.resolve([]);
        }
        const missingOsaamisetUris = getMissingOsaamisetUris();
        const filteredUris = mahdollisuusOsaamiset.filter((uri) => missingOsaamisetUris.includes(uri));
        return osaamisetService.find(filteredUris);
      })
      .then(setOsaamiset);

  return (
    <div className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border">
      <div className="order-2 flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">
            {t(`opportunity-type.education.${mahdollisuus.tyyppi ?? 'EI_TUTKINTO'}`)}
          </span>
          <span>
            <RadioButton label={t('profile.paths.add-as-phase')} value={id} className="cursor-pointer" />
          </span>
        </div>
        <span className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto">{getLocalizedText(otsikko)}</span>
        <p className="font-arial text-body-md-mobile sm:text-body-md mb-4">{getLocalizedText(kuvaus)}</p>
        <Accordion
          title={t('count-competences', { count: mahdollisuus.osaamisetCount })}
          lang={i18n.language}
          initialState={false}
          fetchData={fetchOsaamiset}
        >
          <div className="flex flex-row flex-wrap gap-3">
            {osaamiset.map((osaaminen) => (
              <Tag
                label={getLocalizedText(osaaminen.nimi)}
                tooltip={getLocalizedText(osaaminen.kuvaus)}
                key={osaaminen.uri}
                variant="presentation"
                sourceType="tyopaikka"
              />
            ))}
          </div>
        </Accordion>
      </div>
    </div>
  );
});

VaiheOpportunityCard.displayName = 'VaiheOpportunityCard';
export default VaiheOpportunityCard;
