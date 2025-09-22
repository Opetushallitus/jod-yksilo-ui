import { useModal } from '@/hooks/useModal';
import { Textarea } from '@jod/design-system';
import { JodAi, JodThumbDown, JodThumbDownFilled, JodThumbUp, JodThumbUpFilled } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface RateAiContentProps {
  onLike: () => void;
  onDislike: (feedback: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  variant: 'kohtaanto' | 'mahdollisuus';
}

export const RateAiContent = ({ isLiked, isDisliked, onLike, onDislike, variant }: RateAiContentProps) => {
  const { t } = useTranslation();
  const LikeIcon = isLiked ? JodThumbUpFilled : JodThumbUp;
  const DislikeIcon = isDisliked ? JodThumbDownFilled : JodThumbDown;
  const { showDialog } = useModal();
  const dislikeRef = React.useRef('');

  const headerText =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.header') : t('rate-ai-content.mahdollisuus.header');
  const bodyDescription =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.body') : t('rate-ai-content.mahdollisuus.body');

  return (
    <div className="bg-accent flex flex-col rounded-lg min-h-[271px] p-6">
      <div className="flex items-start mb-2">
        <div className="text-heading-2 text-white mr-2">{headerText}</div>
        <div className="text-white">
          <JodAi size={32} />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <p className="text-body-lg text-white">{bodyDescription}</p>
      </div>
      <div className="bg-white flex items-center justify-between px-5 w-[128px] h-9 rounded-[30px] mt-auto">
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
