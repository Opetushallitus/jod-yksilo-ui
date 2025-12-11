import type { components } from '@/api/schema';
import { ActionButton } from '@/components';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { JodFavorite, JodFavoriteFilled } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface FavoriteToggleProps {
  isFavorite?: boolean;
  favoriteName?: string | components['schemas']['LokalisoituTeksti'];
  onToggleFavorite: () => void;
  bgClassName?: string;
}

export const FavoriteToggle = ({ isFavorite, favoriteName, onToggleFavorite, bgClassName }: FavoriteToggleProps) => {
  const { t } = useTranslation();
  const { showDialog } = useModal();
  const name = typeof favoriteName === 'string' ? favoriteName : getLocalizedText(favoriteName);

  return isFavorite ? (
    <ActionButton
      label={t('remove-favorite')}
      icon={<JodFavoriteFilled className="text-accent" aria-hidden />}
      onClick={() =>
        showDialog({
          title: t('remove-favorite'),
          description: t('remove-favorite-opportunity-confirmation', { name }),
          onConfirm: onToggleFavorite,
        })
      }
      testId="remove-favorite-button"
      className={`${bgClassName}`}
    />
  ) : (
    <ActionButton
      label={t('add-favorite')}
      icon={<JodFavorite className="text-accent" />}
      onClick={onToggleFavorite}
      testId="add-favorite-button"
      className={`${bgClassName}`}
    />
  );
};
