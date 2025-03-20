import { client } from '@/api/client';
import { Button, ConfirmDialog } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface DeletePolkuButtonProps {
  paamaaraId?: string;
  suunnitelmaId?: string;
  className?: string;
  onDelete?: () => void;
}
const DeletePolkuButton = ({ paamaaraId, suunnitelmaId, className, onDelete }: DeletePolkuButtonProps) => {
  const { t } = useTranslation();

  const deletePolku = async () => {
    if (!paamaaraId || !suunnitelmaId) {
      return;
    }
    const { error } = await client.DELETE('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}', {
      params: { path: { id: paamaaraId, suunnitelmaId } },
    });

    if (!error) {
      onDelete?.();
    }
  };

  return paamaaraId && suunnitelmaId ? (
    <ConfirmDialog
      title={t('profile.paths.delete-path-title')}
      onConfirm={deletePolku}
      confirmText={t('delete')}
      cancelText={t('cancel')}
      variant="destructive"
      description={t('profile.paths.delete-path-description')}
    >
      {(showDialog: () => void) => (
        <div className={className ?? ''}>
          <Button label={t('profile.paths.delete-path')} variant="white-delete" onClick={showDialog} />
        </div>
      )}
    </ConfirmDialog>
  ) : null;
};

export default DeletePolkuButton;
