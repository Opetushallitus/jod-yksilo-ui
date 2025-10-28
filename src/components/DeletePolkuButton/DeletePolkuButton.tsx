import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface DeletePolkuButtonProps {
  name?: string | components['schemas']['LokalisoituTeksti'];
  tavoiteId?: string;
  suunnitelmaId?: string;
  className?: string;
  onDelete?: () => void;
}
const DeletePolkuButton = ({ tavoiteId, suunnitelmaId, className, name, onDelete }: DeletePolkuButtonProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  const deletePolku = async () => {
    if (!tavoiteId || !suunnitelmaId) {
      return;
    }
    const { error } = await client.DELETE('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
      params: { path: { id: tavoiteId, suunnitelmaId } },
    });

    if (!error) {
      onDelete?.();
    }
  };

  const polkuName = typeof name === 'string' ? name : getLocalizedText(name);

  return tavoiteId && suunnitelmaId ? (
    <div className={className ?? ''}>
      <Button
        label={t('profile.paths.delete-path')}
        variant="white-delete"
        onClick={() => {
          showDialog({
            title: t('profile.paths.delete-path'),
            description: t('profile.paths.delete-path-description', { name: polkuName }),
            onConfirm: deletePolku,
          });
        }}
      />
    </div>
  ) : null;
};

export default DeletePolkuButton;
