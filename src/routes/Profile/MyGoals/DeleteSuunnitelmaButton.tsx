import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';

import { Button, useMediaQueries } from '@jod/design-system';

import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { getLocalizedText } from '@/utils';

interface DeletePolkuButtonProps {
  name?: string | components['schemas']['LokalisoituTeksti'];
  tavoiteId?: string;
  suunnitelmaId?: string;
  className?: string;
  onDelete?: () => void;
}
const DeleteSuunnitelmaButton = ({ tavoiteId, suunnitelmaId, className, name, onDelete }: DeletePolkuButtonProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();
  const { sm } = useMediaQueries();
  const guardedAction = useSessionGuardedAction();

  const deletePolku = async () => {
    if (!tavoiteId || !suunnitelmaId) {
      return;
    }
    const { error } = await client.DELETE('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
      params: { path: { id: tavoiteId, suunnitelmaId } },
    });

    if (error) {
      toast.error(t('profile.my-goals.delete-plan-failed'));
    } else {
      toast.success(t('profile.my-goals.delete-plan-success'));
      onDelete?.();
    }
  };

  const suunnitelmaName = typeof name === 'string' ? name : getLocalizedText(name);

  return tavoiteId && suunnitelmaId ? (
    <div className={className ?? ''}>
      <Button
        label={t('profile.my-goals.delete-plan')}
        variant="white-delete"
        size={sm ? 'lg' : 'sm'}
        className="h-5"
        onClick={guardedAction(showDialog, {
          title: t('profile.my-goals.delete-plan-title'),
          description: t('profile.my-goals.delete-plan-description', { name: suunnitelmaName }),
          onConfirm: deletePolku,
        })}
        testId="delete-suunnitelma-button"
      />
    </div>
  ) : null;
};

export default DeleteSuunnitelmaButton;
