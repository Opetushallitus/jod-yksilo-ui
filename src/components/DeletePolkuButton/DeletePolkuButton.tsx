import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface DeletePolkuButtonProps {
  name?: string | components['schemas']['LokalisoituTeksti'];
  paamaaraId?: string;
  suunnitelmaId?: string;
  className?: string;
  onDelete?: () => void;
}
const DeletePolkuButton = ({ paamaaraId, suunnitelmaId, className, name, onDelete }: DeletePolkuButtonProps) => {
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

  const polkuName = typeof name === 'string' ? name : getLocalizedText(name);

  return paamaaraId && suunnitelmaId ? (
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
