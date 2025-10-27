import { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import DeletePolkuButton from '@/components/DeletePolkuButton/DeletePolkuButton';
import { useEnvironment } from '@/hooks/useEnvironment';
import loader from '@/routes/Profile/MyGoals/loader';
import { getTypeSlug } from '@/routes/Profile/utils';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import MyGoalsOpportunityCardMenu from './MyGoalsOpportunityCardMenu';
import TavoiteInput from './TavoiteInput';

interface MyGoalsSectionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  tavoitteet: components['schemas']['TavoiteDto'][];
}
const MyGoalsSection = ({ title, description, icon, tavoitteet }: MyGoalsSectionProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { mahdollisuusDetails, upsertTavoite } = useTavoitteetStore(
    useShallow((state) => ({ mahdollisuusDetails: state.mahdollisuusDetails, upsertTavoite: state.upsertTavoite })),
  );
  const { isPrd } = useEnvironment();

  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const getMahdollisuusDetails = React.useCallback(
    (id: string) => mahdollisuusDetails.find((item) => item.id === id),
    [mahdollisuusDetails],
  );

  const removePolkuFromStore = React.useCallback(
    (tavoiteId?: string, suunnitelmaId?: string) => {
      if (!tavoiteId || !suunnitelmaId) {
        return;
      }

      const tavoite = tavoitteet.find((tavoite) => tavoite.id === tavoiteId);

      if (tavoite) {
        upsertTavoite({
          ...tavoite,
          suunnitelmat: tavoite.suunnitelmat?.filter((polku) => polku.id !== suunnitelmaId),
        });
      }
    },
    [tavoitteet, upsertTavoite],
  );

  return (
    <div className="mb-5">
      <div className="flex flex-row items-center gap-3">
        {icon}
        <h2 className="text-heading-2-mobile sm:text-heading-2">{title}</h2>
      </div>
      <p className={`${icon ? 'ml-8' : ''} text-body-lg font-medium mb-5`}>{description}</p>
      <div className="flex flex-col gap-5 mb-5">
        {tavoitteet.map((pm, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi, id } = pm;
          const details = getMahdollisuusDetails(mahdollisuusId);
          const menuId = id ?? `menu-${i}`;
          return details ? (
            <div key={pm.id ?? mahdollisuusId} className="flex flex-col gap-5 mb-9">
              <OpportunityCard
                to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId}`}
                description={getLocalizedText(details.tiivistelma)}
                from="goal"
                ammattiryhma={details.ammattiryhma}
                ammattiryhmaNimet={loaderData?.ammattiryhmaNimet}
                name={getLocalizedText(details.otsikko)}
                aineisto={details.aineisto}
                tyyppi={details.tyyppi}
                type={mahdollisuusTyyppi}
                headingLevel="h3"
                menuContent={
                  <MyGoalsOpportunityCardMenu
                    mahdollisuusId={mahdollisuusId}
                    mahdollisuusTyyppi={mahdollisuusTyyppi}
                    tavoiteId={id}
                    menuId={menuId}
                  />
                }
                menuId={menuId}
                hideFavorite
              />
              <TavoiteInput goal={pm} />
              {!isPrd && pm.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' && (
                <>
                  <div className="text-form-label font-arial">{t('profile.my-goals.my-plan-towards-goal')}</div>
                  <div className="flex flex-col gap-3">
                    {pm.suunnitelmat?.map((polku) => (
                      <div className="flex flex-col gap-4" key={polku.id}>
                        <Link
                          to={`${pm.id}/${t('slugs.profile.path')}/${polku.id}`}
                          className="text-accent flex gap-2 text-heading-4"
                        >
                          {getLocalizedText(polku.nimi)} <JodArrowRight />
                        </Link>
                        <DeletePolkuButton
                          tavoiteId={pm.id}
                          suunnitelmaId={polku.id}
                          onDelete={() => removePolkuFromStore(pm.id, polku.id)}
                          name={polku.nimi}
                        />
                      </div>
                    ))}
                    <div className="mt-9">
                      <Button
                        variant="accent"
                        label={t('profile.my-goals.create-new-path-for-goal')}
                        // eslint-disable-next-line react/no-unstable-nested-components
                        LinkComponent={({ children }: { children: React.ReactNode }) => (
                          <Link
                            to={`${pm.id}/${t('slugs.profile.path')}`}
                            onClick={() => {
                              globalThis._paq?.push(['trackEvent', 'yksilo.Polku', 'Luonti']);
                            }}
                          >
                            {children}
                          </Link>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;
