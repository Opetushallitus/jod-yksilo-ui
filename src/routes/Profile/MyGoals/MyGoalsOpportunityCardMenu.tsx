import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { getPaamaaraTypeForMahdollisuus, PaamaaraTyyppi } from '@/routes/Profile/MyGoals/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { usePaamaaratStore } from '@/stores/usePaamaaratStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const ListItem = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
  <li>
    <PopupListItem>
      <button type="button" onClick={onClick} className="group text-left cursor-pointer" disabled={disabled}>
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
  paamaaraId,
  menuId,
}: {
  mahdollisuusId: string;
  mahdollisuusTyyppi: MahdollisuusTyyppi;
  paamaaraId?: string;
  menuId: string;
}) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  const paamaaraType = getPaamaaraTypeForMahdollisuus(mahdollisuusId);
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
  const { paamaarat, upsertPaamaara, deletePaamaara, mahdollisuusDetails, setMahdollisuusDetails } = usePaamaaratStore(
    useShallow((state) => ({
      paamaarat: state.paamaarat,
      upsertPaamaara: state.upsertPaamaara,
      deletePaamaara: state.deletePaamaara,
      setMahdollisuusDetails: state.setMahdollisuusDetails,
      mahdollisuusDetails: state.mahdollisuusDetails,
    })),
  );

  const onDeletePaamaara = async (id: string) => {
    const suosikkiId = paamaarat.find((paamaara) => paamaara.id === id)?.mahdollisuusId;
    await deletePaamaara(id);
    setExcludedIds(excludedIds.filter((excludedId) => (suosikkiId ? excludedId !== suosikkiId : true)));
  };

  const insertPaamaara = async (tyyppi: PaamaaraTyyppi) => {
    const newPaamaara = {
      tyyppi,
      mahdollisuusTyyppi,
      mahdollisuusId,
      tavoite: {
        fi: '',
        sv: '',
        en: '',
      },
    };
    const { data: id, error } = await client.POST('/api/profiili/paamaarat', {
      body: newPaamaara,
    });
    if (!error) {
      // Add the new goal to excludedIds to prevent it from showing in the list and reload suosikit
      setExcludedIds([...excludedIds, mahdollisuusId]);
      upsertPaamaara({ ...newPaamaara, id });
      await fetchPage({ page: pageNr, pageSize });
    }
  };

  const updatePaamaara = async (tyyppi: PaamaaraTyyppi) => {
    const paamaara = paamaarat.find((pm) => pm.id === paamaaraId);

    if (paamaara && paamaaraId) {
      const updatedPaamaara = { ...paamaara, tyyppi };
      const { error } = await client.PUT('/api/profiili/paamaarat/{id}', {
        body: updatedPaamaara,
        params: { path: { id: paamaaraId } },
      });
      if (!error) {
        upsertPaamaara(updatedPaamaara);
      }
    }
  };

  const setFavoriteAsGoal = async (tyyppi: PaamaaraTyyppi) => {
    if (paamaaraId) {
      await updatePaamaara(tyyppi);
    } else {
      await insertPaamaara(tyyppi);
    }

    // Find the details for the opportunity and put them to the paamaara store.
    // This is needed to show the opportunity in the goals list without the need to fetch the details again.
    const details = pageData.find((item) => item.id === mahdollisuusId);
    if (details) {
      setMahdollisuusDetails([...mahdollisuusDetails, details]);
    }
  };

  const canSetAsPaamaaraType = (targetTyyppi: PaamaaraTyyppi) => {
    const targetSlotIsEmpty = !paamaarat.find((pm) => pm.tyyppi === targetTyyppi);
    const canSetAsMuu = targetTyyppi === 'MUU' && paamaaraType !== 'MUU';
    return canSetAsMuu || targetSlotIsEmpty;
  };

  return (
    <PopupList classNames="w-max">
      <ul className="flex flex-col gap-2 w-full" id={menuId}>
        <ListItem
          label={t('profile.my-goals.set-long-term-goal')}
          onClick={() => void setFavoriteAsGoal('PITKA')}
          disabled={!canSetAsPaamaaraType('PITKA')}
        />
        <ListItem
          label={t('profile.my-goals.set-short-term-goal')}
          onClick={() => void setFavoriteAsGoal('LYHYT')}
          disabled={!canSetAsPaamaaraType('LYHYT')}
        />
        <ListItem
          label={t('profile.my-goals.set-other-goal')}
          onClick={() => void setFavoriteAsGoal('MUU')}
          disabled={!canSetAsPaamaaraType('MUU')}
        />
        {!!paamaaraId && (
          <ListItem
            label={t('profile.my-goals.delete-goal')}
            onClick={() => {
              showDialog({
                title: t('profile.my-goals.delete-goal'),
                description: t('profile.my-goals.delete-goal-description'),
                confirmText: t('delete'),
                cancelText: t('cancel'),
                variant: 'destructive',
                onConfirm: () => onDeletePaamaara(paamaaraId),
              });
            }}
          />
        )}
      </ul>
    </PopupList>
  );
};

export default MyGoalsOpportunityCardMenu;
