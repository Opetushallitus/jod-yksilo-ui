import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { type PolkuQueryParams } from '@/routes/Profile/Path/utils';
import { PopupList, PopupListItem } from '@jod/design-system';
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
const VaiheCardMenu = ({
  vaiheId,
  vaiheNimi,
  openVaiheModal,
}: {
  vaiheId: string;
  openVaiheModal: () => void;
  vaiheNimi: string;
}) => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const { showDialog } = useModal();
  const { suunnitelmaId, paamaaraId } = useParams<PolkuQueryParams>();

  const deleteVaihe = async () => {
    if (!paamaaraId || !suunnitelmaId) {
      return;
    }

    await client.DELETE(`/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}`, {
      params: {
        path: {
          vaiheId: vaiheId,
          id: paamaaraId,
          suunnitelmaId,
        },
      },
    });
    await revalidator.revalidate();
  };

  return (
    <PopupList classNames="w-max">
      <ul className="flex flex-col gap-2 w-full" id={vaiheId}>
        <ListItem label={t('profile.paths.edit-phase')} onClick={openVaiheModal} />
        <ListItem
          label={t('profile.paths.delete-phase')}
          onClick={() =>
            showDialog({
              title: t('profile.paths.delete-phase'),
              description: t('profile.paths.delete-phase-description', { name: vaiheNimi }),
              onConfirm: () => void deleteVaihe(),
            })
          }
        />
      </ul>
    </PopupList>
  );
};

export default VaiheCardMenu;
