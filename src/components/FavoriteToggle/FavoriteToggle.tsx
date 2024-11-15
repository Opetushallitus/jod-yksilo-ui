import { ActionButton } from '@/components';
import { ConfirmDialog } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';

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
          icon={<MdFavorite size={24} className="text-accent" aria-hidden />}
          onClick={showDialog}
        />
      )}
    </ConfirmDialog>
  ) : (
    <ActionButton
      label={t('add-favorite')}
      icon={<MdFavoriteBorder size={24} className="text-accent" />}
      onClick={onToggleFavorite}
    />
  );
};
