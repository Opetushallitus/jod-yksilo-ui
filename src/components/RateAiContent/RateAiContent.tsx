import { useEnvironment } from '@/hooks/useEnvironment';
import { useModal } from '@/hooks/useModal';
import { Textarea } from '@jod/design-system';
import { JodAi, JodThumbDown, JodThumbDownFilled, JodThumbUp, JodThumbUpFilled } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
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
  const { isDev } = useEnvironment();

  const headerText =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.header') : t('rate-ai-content.mahdollisuus.header');
  const bodyDescription =
    variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.body') : t('rate-ai-content.mahdollisuus.body');

  return isDev ? (
    <div className="bg-accent flex flex-col rounded-lg min-h-[271px] p-6">
      <div className="flex items-start mb-2">
        <div className="text-heading-2 text-white mr-2">{headerText}</div>
        <div className="text-white">
          <JodAi aria-label={t('rate-ai-content.icon')} size={32} />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <p className="text-body-lg text-white">{bodyDescription}</p>
      </div>
      <div className="flex flex-row items-center justify-between w-[128px] h-9 rounded-[30px] mt-auto">
        <button
          className="bg-white rounded-l-[30px] flex-1 h-full w-full items-center justify-center pl-6 pr-5 flex"
          aria-label={t('rate-ai-content.like')}
        >
          <LikeIcon
            className="text-accent cursor-pointer"
            onClick={() => {
              onLike();
              toast.success(t('rate-ai-content.toast'));
            }}
          />
        </button>
        <div className="h-9 min-w-1 bg-border-gray" aria-hidden="true" />
        <button
          className="bg-white rounded-r-[30px] flex-1 h-full items-center justify-center pl-5 pr-6 flex"
          aria-label={t('rate-ai-content.dislike')}
          onClick={() =>
            showDialog({
              variant: 'normal',
              title: t('rate-ai-content.modal.header'),
              cancelText: t('rate-ai-content.modal.close'),
              confirmText: t('rate-ai-content.modal.send'),
              content: (
                <Textarea
                  onChange={(e) => {
                    dislikeRef.current = e.target.value;
                  }}
                  placeholder={t('rate-ai-content.modal.placeholder')}
                />
              ),
              description: t('rate-ai-content.modal.body'),
              onConfirm: () => {
                onDislike(dislikeRef.current);
                toast.success(t('rate-ai-content.toast'));
              },
            })
          }
        >
          <DislikeIcon className="text-accent cursor-pointer" />
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
};
