import { RateAiContentCard } from '@jod/design-system';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

interface RateAiContentProps {
  variant: 'kohtaanto' | 'mahdollisuus';
  area: 'Kohtaanto työkalu' | 'Työmahdollisuus' | 'Koulutusmahdollisuus';
}

export const RateAiContent = ({ variant, area }: RateAiContentProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { id } = useParams();

  return (
    <RateAiContentCard
      translations={{
        card: {
          title:
            variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.header') : t('rate-ai-content.mahdollisuus.header'),
          aiLabel: t('rate-ai-content.icon'),
          content:
            variant === 'kohtaanto' ? t('rate-ai-content.kohtaanto.body') : t('rate-ai-content.mahdollisuus.body'),
          likeLabel: t('rate-ai-content.like'),
          dislikeLabel: t('rate-ai-content.dislike'),
        },
        modal: {
          close: t('rate-ai-content.modal.close'),
          send: t('rate-ai-content.modal.send'),
          sending: t('rate-ai-content.modal.sending'),
          title: t('rate-ai-content.modal.header'),
          description: t('rate-ai-content.modal.body'),
          placeholder: t('rate-ai-content.modal.placeholder'),
        },
      }}
      onSubmit={async ({ rating, message }) => {
        try {
          globalThis._paq?.push(['trackEvent', `yksilo.${area}`, rating === 1 ? 'Tykkäys' : 'Ei tykkäys', id]);

          const body = JSON.stringify({
            section: 'Osaamispolkuni',
            area,
            language: message ? language : undefined,
            details: window.location.pathname,
            rating,
            message,
          });
          const response = await fetch('/api/arvostelu', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-amz-content-sha256': Array.from(
                new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))),
              )
                .map((b) => b.toString(16).padStart(2, '0'))
                .join(''),
            },
            body,
          });

          if (!response.ok) {
            throw new Error();
          }

          toast.success(t('rate-ai-content.toast'));

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error(t('rate-ai-content.toast-error'));
        }
      }}
    />
  );
};
