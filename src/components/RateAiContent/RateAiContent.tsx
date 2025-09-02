import { useModal } from '@/hooks/useModal';
import { Textarea } from '@jod/design-system';
import { JodThumbDown, JodThumbDownFilled, JodThumbUp, JodThumbUpFilled } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const AiIcon = () => {
  return (
    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_15169_167361)">
        <path
          d="M16.3138 3.22119C8.9538 3.22119 2.98047 9.19452 2.98047 16.5545C2.98047 23.9145 8.9538 29.8879 16.3138 29.8879C23.6738 29.8879 29.6471 23.9145 29.6471 16.5545C29.6471 9.19452 23.6738 3.22119 16.3138 3.22119ZM16.3138 20.9012L14.1405 26.7812L11.9671 20.9012L6.08714 18.7279L11.9671 16.5545L14.1405 10.6745L16.3138 16.5545L22.1938 18.7279L16.3138 20.9012ZM22.3538 13.0745L21.0738 16.5545L19.7938 13.0745L16.3138 11.7945L19.7938 10.5145L21.0738 7.03452L22.3538 10.5145L25.8338 11.7945L22.3538 13.0745Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_15169_167361">
          <rect width="32" height="32" fill="white" transform="translate(0.3125 0.554688)" />
        </clipPath>
      </defs>
    </svg>
  );
};

interface RateAiContentProps {
  onLike: () => void;
  onDislike: (feedback: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  variant: 'kohtaanto' | 'opportunity';
}
const RateAiContent = ({ isLiked, isDisliked, onLike, onDislike, variant }: RateAiContentProps) => {
  const { t } = useTranslation();
  const LikeIcon = isLiked ? JodThumbUpFilled : JodThumbUp;
  const DislikeIcon = isDisliked ? JodThumbDownFilled : JodThumbDown;
  const { showDialog } = useModal();
  const dislikeRef = React.useRef('');

  const headerText =
    variant === 'kohtaanto' ? t('rate-ai-content.header-for-opportunities') : t('rate-ai-content.header');
  const bodyDescription =
    variant === 'kohtaanto' ? t('rate-ai-content.body') : t('rate-ai-content.body-for-opportunities');

  return (
    <div className="bg-accent flex flex-col rounded-lg" style={{ height: 271, padding: 24 }}>
      <div className="flex items-start mb-2">
        <div className="text-heading-2 text-white mr-2">{headerText}</div>
        <div className="text-white">
          <AiIcon />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <p className="text-body-lg text-white">{bodyDescription}</p>
      </div>
      <div
        className="bg-white flex items-center justify-between px-5 mt-auto"
        style={{ width: 128, height: 48, borderRadius: 30 }}
      >
        <span className="bg-white rounded-full flex items-center px-3">
          <LikeIcon className="text-accent cursor-pointer" onClick={onLike} />
        </span>
        <div className="h-9 w-1 bg-border-gray" aria-hidden="true" />
        <span className="bg-white rounded-full flex items-center justify-center px-3">
          <DislikeIcon
            className="text-accent cursor-pointer"
            onClick={() =>
              showDialog({
                title: t('rate-ai-content.modal-header'),
                content: (
                  <Textarea
                    onChange={(e) => {
                      dislikeRef.current = e.target.value;
                    }}
                    placeholder={t('rate-ai-content.modal-placeholder')}
                  />
                ),
                description: t('rate-ai-content.modal-body'),
                onConfirm: () => onDislike(dislikeRef.current),
              })
            }
          />
        </span>
      </div>
    </div>
  );
};

export default RateAiContent;
