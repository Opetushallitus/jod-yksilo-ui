import { useTranslation } from 'react-i18next';
import { MdOutlineThumbDown, MdOutlineThumbUp, MdThumbDown, MdThumbUp } from 'react-icons/md';

interface RateAiContentProps {
  onLike: () => void;
  onDislike: () => void;
  isLiked?: boolean;
  isDisliked?: boolean;
}
const RateAiContent = ({ isLiked, isDisliked, onLike, onDislike }: RateAiContentProps) => {
  const { t } = useTranslation();
  const LikeIcon = isLiked ? MdThumbUp : MdOutlineThumbUp;
  const DislikeIcon = isDisliked ? MdThumbDown : MdOutlineThumbDown;

  return (
    <div className="bg-white px-5 py-4 flex justify-between items-center">
      <p className="text-body-sm">{t('rate-ai-content')}</p>
      <div className="flex gap-6">
        <LikeIcon size={24} className="text-accent cursor-pointer" onClick={onLike} />
        <DislikeIcon size={24} className="text-accent cursor-pointer" onClick={onDislike} />
      </div>
    </div>
  );
};

export default RateAiContent;
