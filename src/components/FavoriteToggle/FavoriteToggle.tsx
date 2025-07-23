import { ActionButton } from '@/components';
import { useModal } from '@/hooks/useModal';
import { JodFavorite, JodFavoriteFilled } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface FavoriteToggleProps {
  isFavorite?: boolean;
  onToggleFavorite: () => void;
}

export const FavoriteToggle = ({ isFavorite, onToggleFavorite }: FavoriteToggleProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  return isFavorite ? (
    <ActionButton
      label={t('remove-favorite')}
      icon={<JodFavoriteFilled className="text-accent" aria-hidden />}
      onClick={() =>
        showDialog({
          title: t('remove-favorite-confirmation-title'),
          description: t('remove-favorite-opportunity-confirmation'),
          confirmText: t('delete'),
          cancelText: t('cancel'),
          variant: 'destructive',
          onConfirm: onToggleFavorite,
        })
      }
    />
  ) : (
    <ActionButton label={t('add-favorite')} icon={<JodFavorite className="text-accent" />} onClick={onToggleFavorite} />
  );
};
