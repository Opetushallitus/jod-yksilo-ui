import { TypedMahdollisuus } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { Accordion, RadioButton, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VaiheOpportunityCardProps {
  mahdollisuus: TypedMahdollisuus;
}

const VaiheOpportunityCard = React.memo(({ mahdollisuus }: VaiheOpportunityCardProps) => {
  const { t, i18n } = useTranslation();
  const { id, otsikko, kuvaus, mahdollisuusTyyppi, osaamiset = [] } = mahdollisuus;

  const cardTypeTitle =
    mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' ? t('opportunity-type.work') : t('opportunity-type.education');

  return (
    <div className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border">
      <div className="order-2 flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">{cardTypeTitle}</span>
          <span>
            <RadioButton
              label={t('profile.paths.add-as-phase')}
              value={id}
              variant="bordered"
              className="cursor-pointer"
            />
          </span>
        </div>
        <span className="mb-2 text-heading-2-mobile sm:text-heading-2 hyphens-auto">{getLocalizedText(otsikko)}</span>
        <p className="font-arial text-body-md-mobile sm:text-body-md mb-4">{getLocalizedText(kuvaus)}</p>
        {osaamiset.length > 0 && (
          <Accordion
            title={t('count-competences', { count: osaamiset.length })}
            lang={i18n.language}
            initialState={false}
          >
            <div className="flex flex-row flex-wrap gap-3">
              {osaamiset.map((osaaminen) => (
                <Tag
                  label={getLocalizedText(osaaminen.nimi)}
                  title={getLocalizedText(osaaminen.kuvaus)}
                  key={osaaminen.uri}
                  variant="presentation"
                  sourceType="tyopaikka"
                />
              ))}
            </div>
          </Accordion>
        )}
      </div>
    </div>
  );
});

VaiheOpportunityCard.displayName = 'VaiheOpportunityCard';
export default VaiheOpportunityCard;
