import { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import { getTypeSlug } from '@/routes/Profile/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { Link, useLoaderData } from 'react-router';
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
  const {
    t,
    i18n: { language },
  } = useTranslation();
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

  return (
    <div className="mb-5">
      <div className="flex flex-row items-center gap-3">
        {icon}
        <h2 className="text-heading-2-mobile sm:text-heading-2">{title}</h2>
      </div>
      <p className={`${icon ? 'ml-8' : ''} text-body-lg font-medium mb-5`}>{description}</p>
      <div className="flex flex-col gap-5 mb-5">
        {paamaarat.map((pm, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi, id } = pm;
          const details = getDetailsByTyyppi(mahdollisuusTyyppi, mahdollisuusId);
          const menuId = id ?? `menu-${i}`;
          return details ? (
            <div key={mahdollisuusId} className="flex flex-col gap-5 mb-9">
              <OpportunityCard
                to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId}`}
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
              <div className="text-form-label font-arial">{t('profile.my-goals.my-plan-towards-goal')}</div>
              <div className="flex flex-col gap-3">
                {pm.suunnitelmat?.map((polku) => (
                  <Link
                    key={polku.id}
                    to={`${pm.id}/${t('slugs.profile.path')}/${polku.id}`}
                    className="text-link flex gap-2 text-heading-4 mb-6"
                  >
                    {polku.nimi[language]} <MdArrowForward size={24} />
                  </Link>
                ))}
                <Button
                  variant="accent"
                  label={t('profile.my-goals.create-new-path-for-goal')}
                  // eslint-disable-next-line react/no-unstable-nested-components
                  LinkComponent={({ children }: { children: React.ReactNode }) => (
                    <Link to={`${pm.id}/${t('slugs.profile.path')}`}>{children}</Link>
                  )}
                />
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;
