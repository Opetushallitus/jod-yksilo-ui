import { ActionButton } from '@/components';
import { ConfirmDialog } from '@jod/design-system';
import { JodFavorite, JodFavoriteFilled } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface FavoriteToggleProps {
  isFavorite?: boolean;
  onToggleFavorite: () => void;
}

export const FavoriteToggle = ({ isFavorite, onToggleFavorite }: FavoriteToggleProps) => {
  const { t } = useTranslation();

  return isFavorite ? (
    <ConfirmDialog
      title={t('remove-favorite-confirmation-title')}
      onConfirm={onToggleFavorite}
      confirmText={t('delete')}
      cancelText={t('cancel')}
      variant="destructive"
      description={t('remove-favorite-opportunity-confirmation')}
    >
      {(showDialog: () => void) => (
        <ActionButton
          label={t('remove-favorite')}
          icon={<JodFavoriteFilled className="text-accent" aria-hidden />}
          onClick={showDialog}
        />
      )}
    </ConfirmDialog>
  ) : (
    <ActionButton label={t('add-favorite')} icon={<JodFavorite className="text-accent" />} onClick={onToggleFavorite} />
  );
};
