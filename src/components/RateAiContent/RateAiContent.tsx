import { JodThumbDown, JodThumbDownFilled, JodThumbUp, JodThumbUpFilled } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface RateAiContentProps {
  onLike: () => void;
  onDislike: () => void;
  isLiked?: boolean;
  isDisliked?: boolean;
}
const RateAiContent = ({ isLiked, isDisliked, onLike, onDislike }: RateAiContentProps) => {
  const { t } = useTranslation();
  const LikeIcon = isLiked ? JodThumbUpFilled : JodThumbUp;
  const DislikeIcon = isDisliked ? JodThumbDownFilled : JodThumbDown;

  return (
    <div className="bg-white px-5 py-4 flex justify-between items-center">
      <p className="text-body-sm">{t('rate-ai-content')}</p>
      <div className="flex gap-6">
        <LikeIcon className="text-accent cursor-pointer" onClick={onLike} />
        <DislikeIcon className="text-accent cursor-pointer" onClick={onDislike} />
      </div>
    </div>
  );
};

export default RateAiContent;
