import { client } from '@/api/client';
import { ConfirmDialog, PopupList, PopupListItem } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useParams, useRevalidator } from 'react-router';

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
 * A menu component to use with "polun vaihe" card
 */
const VaiheCardMenu = ({ vaiheId, openVaiheModal }: { vaiheId: string; openVaiheModal: () => void }) => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const { suunnitelmaId, paamaaraId } = useParams<{ suunnitelmaId: string; paamaaraId: string }>();

  const deleteVaihe = async () => {
    await client.DELETE(`/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}`, {
      params: {
        path: {
          vaiheId: vaiheId,
          id: paamaaraId!,
          suunnitelmaId: suunnitelmaId!,
        },
      },
    });
    await revalidator.revalidate();
  };

  return (
    <PopupList classNames="w-max">
      <ul className="flex flex-col gap-2 w-full" id={vaiheId}>
        <ListItem label={t('profile.paths.edit-phase')} onClick={openVaiheModal} />
        <ConfirmDialog
          title={t('profile.paths.delete-phase-title')}
          description={t('profile.paths.delete-phase-description')}
          onConfirm={() => void deleteVaihe()}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          variant="destructive"
        >
          {(showDialog: () => void) => <ListItem label={t('profile.paths.delete-phase')} onClick={showDialog} />}
        </ConfirmDialog>
      </ul>
    </PopupList>
  );
};

export default VaiheCardMenu;
