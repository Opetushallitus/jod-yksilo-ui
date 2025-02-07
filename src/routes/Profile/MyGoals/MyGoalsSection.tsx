import { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import { useEnvironment } from '@/hooks/useEnvironment';
import { getTypeSlug } from '@/routes/Profile/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import loader from './loader';
import MyGoalsOpportunityCardMenu from './MyGoalsOpportunityCardMenu';
import TavoiteInput from './TavoiteInput';

interface MyGoalsSectionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  paamaarat: components['schemas']['PaamaaraDto'][];
}
const MyGoalsSection = ({ title, description, icon, paamaarat }: MyGoalsSectionProps) => {
  const { i18n } = useTranslation();
  const { koulutusMahdollisuudetDetails, tyomahdollisuudetDetails } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const getDetailsByTyyppi = React.useCallback(
    (tyyppi: MahdollisuusTyyppi, id: string) => {
      switch (tyyppi) {
        case 'KOULUTUSMAHDOLLISUUS':
          return koulutusMahdollisuudetDetails.find((koulutus) => koulutus.id === id);
        case 'TYOMAHDOLLISUUS':
          return tyomahdollisuudetDetails.find((tyo) => tyo.id === id);
      }
    },
    [koulutusMahdollisuudetDetails, tyomahdollisuudetDetails],
  );

  const { isDev } = useEnvironment();

  return (
    <div className="mb-5">
      <div className="flex flex-row items-center gap-3">
        {icon}
        <h2 className="text-heading-2-mobile sm:text-heading-2">{title}</h2>
      </div>
      {isDev && <p className={`${icon ? 'ml-8' : ''} text-body-lg font-medium mb-5 text-todo`}>{description}</p>}
      <div className="flex flex-col gap-5 mb-5">
        {paamaarat.map((pm, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi, id } = pm;
          const details = getDetailsByTyyppi(mahdollisuusTyyppi, mahdollisuusId);
          const menuId = id ?? `menu-${i}`;
          return details ? (
            <div key={mahdollisuusId} className="flex flex-col gap-5 mb-9">
              <OpportunityCard
                to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId}`}
                description={getLocalizedText(details?.tiivistelma)}
                employmentOutlook={2}
                hasRestrictions
                industryName="TODO: Lorem ipsum dolor"
                mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                name={getLocalizedText(details?.otsikko)}
                trend="LASKEVA"
                type={mahdollisuusTyyppi}
                menuContent={
                  <MyGoalsOpportunityCardMenu
                    mahdollisuusId={mahdollisuusId}
                    mahdollisuusTyyppi={mahdollisuusTyyppi}
                    paamaaraId={id}
                    menuId={menuId}
                  />
                }
                menuId={menuId}
                hideFavorite
              />
              <TavoiteInput paamaara={pm} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;
