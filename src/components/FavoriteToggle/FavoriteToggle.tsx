import { useTranslation } from 'react-i18next';

import { ActionButton } from '@jod/design-system';
import { JodFavorite, JodFavoriteFilled } from '@jod/design-system/icons';

import type { components } from '@/api/schema';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';

interface FavoriteToggleProps {
  isFavorite?: boolean;
  favoriteName?: string | components['schemas']['LokalisoituTeksti'];
  onToggleFavorite: () => void;
  opensDialog?: boolean;
  className?: string;
}

export const FavoriteToggle = ({
  isFavorite,
  favoriteName,
  onToggleFavorite,
  className,
  opensDialog,
}: FavoriteToggleProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();
  const name = typeof favoriteName === 'string' ? favoriteName : getLocalizedText(favoriteName);

  return isFavorite ? (
    <ActionButton
      label={t('remove-favorite')}
      icon={<JodFavoriteFilled className="text-accent" aria-hidden />}
      aria-haspopup="dialog"
      onClick={() =>
        showDialog({
          title: t('remove-favorite'),
          description: t('remove-favorite-opportunity-confirmation', { name }),
          onConfirm: onToggleFavorite,
          testId: 'remove-favorite-dialog',
        })
      }
      testId="remove-favorite-button"
      className={className}
    />
  ) : (
    <ActionButton
      label={t('add-favorite')}
      icon={<JodFavorite className="text-accent" />}
      onClick={onToggleFavorite}
      aria-haspopup={opensDialog ? 'dialog' : undefined}
      testId="add-favorite-button"
      className={className}
    />
  );
};
