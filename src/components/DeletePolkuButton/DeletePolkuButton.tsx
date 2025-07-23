import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface DeletePolkuButtonProps {
  paamaaraId?: string;
  suunnitelmaId?: string;
  className?: string;
  onDelete?: () => void;
}
const DeletePolkuButton = ({ paamaaraId, suunnitelmaId, className, onDelete }: DeletePolkuButtonProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

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
    <div className={className ?? ''}>
      <Button
        label={t('profile.paths.delete-path')}
        variant="white-delete"
        onClick={() => {
          showDialog({
            title: t('profile.paths.delete-path-title'),
            description: t('profile.paths.delete-path-description'),
            confirmText: t('delete'),
            cancelText: t('cancel'),
            variant: 'destructive',
            onConfirm: deletePolku,
          });
        }}
      />
    </div>
  ) : null;
};

export default DeletePolkuButton;
