import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { getTavoiteTypeForMahdollisuus, TavoiteTyyppi } from '@/routes/Profile/MyGoals/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const ListItem = ({
  label,
  onClick,
  disabled,
  testId,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}) => (
  <li>
    <PopupListItem>
      <button
        type="button"
        onClick={onClick}
        className="group text-left cursor-pointer"
        disabled={disabled}
        data-testid={testId}
      >
        <span className="group-disabled:text-inactive-gray group-disabled:cursor-not-allowed">{label}</span>
      </button>
    </PopupListItem>
  </li>
);

/**
 * A menu component to use with OpportunityCard that deal with goals (päämääräni)
 * Used for both goals and favorites.
 */
const MyGoalsOpportunityCardMenu = ({
  mahdollisuusId,
  mahdollisuusTyyppi,
  tavoiteId,
  menuId,
}: {
  mahdollisuusId: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  tavoiteId?: string;
  menuId: string;
}) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  const tavoiteType = getTavoiteTypeForMahdollisuus(mahdollisuusId);
  const { fetchPage, pageSize, pageNr, excludedIds, setExcludedIds, pageData } = useSuosikitStore(
    useShallow((state) => ({
      pageData: state.pageData,
      fetchPage: state.fetchPage,
      pageSize: state.pageSize,
      pageNr: state.pageNr,
      excludedIds: state.excludedIds,
      setExcludedIds: state.setExcludedIds,
    })),
  );
  const { tavoitteet, upsertTavoite, deleteTavoite, mahdollisuusDetails, setMahdollisuusDetails } = useTavoitteetStore(
    useShallow((state) => ({
      tavoitteet: state.tavoitteet,
      upsertTavoite: state.upsertTavoite,
      deleteTavoite: state.deleteTavoite,
      setMahdollisuusDetails: state.setMahdollisuusDetails,
      mahdollisuusDetails: state.mahdollisuusDetails,
    })),
  );

  const onDeleteTavoite = async (id: string) => {
    const suosikkiId = tavoitteet.find((tavoite) => tavoite.id === id)?.mahdollisuusId;
    await deleteTavoite(id);
    setExcludedIds(excludedIds.filter((excludedId) => (suosikkiId ? excludedId !== suosikkiId : true)));
  };

  const insertTavoite = async (tyyppi: TavoiteTyyppi) => {
    const newTavoite = {
      tyyppi,
      mahdollisuusTyyppi,
      mahdollisuusId,
      tavoite: {
        fi: '',
        sv: '',
        en: '',
      },
    };
    const { data: id, error } = await client.POST('/api/profiili/tavoitteet', {
      body: newTavoite,
    });
    if (!error) {
      // Add the new goal to excludedIds to prevent it from showing in the list and reload suosikit
      setExcludedIds([...excludedIds, mahdollisuusId]);
      upsertTavoite({ ...newTavoite, id });
      await fetchPage({ page: pageNr, pageSize });
    }
  };

  const updateTavoite = async (tyyppi: TavoiteTyyppi) => {
    const tavoite = tavoitteet.find((pm) => pm.id === tavoiteId);

    if (tavoite && tavoiteId) {
      const updatedTavoite = { ...tavoite, tyyppi };
      const { error } = await client.PUT('/api/profiili/tavoitteet/{id}', {
        body: updatedTavoite,
        params: { path: { id: tavoiteId } },
      });
      if (!error) {
        upsertTavoite(updatedTavoite);
      }
    }
  };

  const setFavoriteAsGoal = async (tyyppi: TavoiteTyyppi) => {
    if (tavoiteId) {
      await updateTavoite(tyyppi);
    } else {
      await insertTavoite(tyyppi);
    }

    // Find the details for the opportunity and put them to the tavoite store.
    // This is needed to show the opportunity in the goals list without the need to fetch the details again.
    const details = pageData.find((item) => item.id === mahdollisuusId);
    if (details) {
      setMahdollisuusDetails([...mahdollisuusDetails, details]);
    }
  };

  const canSetAsTavoiteType = (targetTyyppi: TavoiteTyyppi) => {
    const targetSlotIsEmpty = !tavoitteet.find((pm) => pm.tyyppi === targetTyyppi);
    const canSetAsMuu = targetTyyppi === 'MUU' && tavoiteType !== 'MUU';
    return canSetAsMuu || targetSlotIsEmpty;
  };

  return (
    <PopupList classNames="w-max">
      <ul className="flex flex-col gap-2 w-full" id={menuId}>
        <ListItem
          label={t('profile.my-goals.set-long-term-goal')}
          onClick={() => void setFavoriteAsGoal('PITKA')}
          disabled={!canSetAsTavoiteType('PITKA')}
          testId="goals-set-long-term"
        />
        <ListItem
          label={t('profile.my-goals.set-short-term-goal')}
          onClick={() => void setFavoriteAsGoal('LYHYT')}
          disabled={!canSetAsTavoiteType('LYHYT')}
          testId="goals-set-short-term"
        />
        <ListItem
          label={t('profile.my-goals.set-other-goal')}
          onClick={() => void setFavoriteAsGoal('MUU')}
          disabled={!canSetAsTavoiteType('MUU')}
          testId="goals-set-other"
        />
        {!!tavoiteId && (
          <ListItem
            label={t('profile.my-goals.delete-goal')}
            onClick={() => {
              showDialog({
                title: t('profile.my-goals.delete-goal'),
                description: t('profile.my-goals.delete-goal-description'),
                onConfirm: () => onDeleteTavoite(tavoiteId),
              });
            }}
            testId="goals-delete"
          />
        )}
      </ul>
    </PopupList>
  );
};

export default MyGoalsOpportunityCardMenu;
