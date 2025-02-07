import { client } from '@/api/client';
import { getPaamaaraTypeForMahdollisuus, PaamaaraTyyppi } from '@/routes/Profile/MyGoals/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { ConfirmDialog, PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
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
  const revalidator = useRevalidator();
  const paamaaraType = getPaamaaraTypeForMahdollisuus(mahdollisuusId);
  const { fetchPage, pageSize, pageNr, excludedIds, setExcludedIds } = useSuosikitStore(
    useShallow((state) => ({
      fetchPage: state.fetchPage,
      pageSize: state.pageSize,
      pageNr: state.pageNr,
      excludedIds: state.excludedIds,
      setExcludedIds: state.setExcludedIds,
    })),
  );
  const { paamaarat, upsertPaamaara } = usePaamaaratStore(
    useShallow((state) => ({
      paamaarat: state.paamaarat,
      upsertPaamaara: state.upsertPaamaara,
    })),
  );

  const setFavoriteAsGoal = async (tyyppi: PaamaaraTyyppi) => {
    if (paamaaraId) {
      const paamaara = paamaarat.find((pm) => pm.id === paamaaraId);

      if (paamaara) {
        const updatedPaamaara = { ...paamaara, tyyppi };
        await client.PUT('/api/profiili/paamaarat/{id}', {
          body: updatedPaamaara,
          params: { path: { id: paamaaraId } },
        });
        upsertPaamaara(updatedPaamaara);
      }
    } else {
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
      const { data: id } = await client.POST('/api/profiili/paamaarat', {
        body: newPaamaara,
      });
      // Add the new goal to excludedIds to prevent it from showing in the list
      setExcludedIds([...excludedIds, mahdollisuusId]);
      upsertPaamaara({ ...newPaamaara, id });
      await fetchPage({ page: pageNr, pageSize });
    }
  };

  const deleteGoal = async () => {
    if (paamaaraId) {
      await client.DELETE('/api/profiili/paamaarat/{id}', {
        params: {
          path: { id: paamaaraId },
        },
      });
      await revalidator.revalidate();
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
          <ConfirmDialog
            title={t('profile.my-goals.delete-goal')}
            onConfirm={() => void deleteGoal()}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            variant="destructive"
            description={t('profile.my-goals.delete-goal-description')}
          >
            {(showDialog: () => void) => <ListItem label={t('profile.my-goals.delete-goal')} onClick={showDialog} />}
          </ConfirmDialog>
        )}
      </ul>
    </PopupList>
  );
};

export default MyGoalsOpportunityCardMenu;
