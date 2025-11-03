import { RateAiContentCard } from '@jod/design-system';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

interface RateAiContentProps {
  variant: 'kohtaanto' | 'tyomahdollisuus' | 'koulutusmahdollisuus';
  area: 'Kohtaanto työkalu' | 'Työmahdollisuus' | 'Koulutusmahdollisuus';
  size?: React.ComponentProps<typeof RateAiContentCard>['size'];
}

export const RateAiContent = ({ variant, area, size }: RateAiContentProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { id } = useParams();

  const listTexts = {
    kohtaanto: [
      t('rate-ai-content.modal.description.list.kohtaanto.item1'),
      t('rate-ai-content.modal.description.list.kohtaanto.item2'),
      t('rate-ai-content.modal.description.list.kohtaanto.item3'),
    ],
    tyomahdollisuus: [
      t('rate-ai-content.modal.description.list.tyomahdollisuus.item1'),
      t('rate-ai-content.modal.description.list.tyomahdollisuus.item2'),
      t('rate-ai-content.modal.description.list.tyomahdollisuus.item3'),
    ],
    koulutusmahdollisuus: [
      t('rate-ai-content.modal.description.list.koulutusmahdollisuus.item1'),
      t('rate-ai-content.modal.description.list.koulutusmahdollisuus.item2'),
      t('rate-ai-content.modal.description.list.koulutusmahdollisuus.item3'),
      t('rate-ai-content.modal.description.list.koulutusmahdollisuus.item4'),
    ],
  };

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
          description: (
            <>
              <p>{t(`rate-ai-content.modal.description.intro`)}</p>
              <ul className="list-disc ml-5">
                {listTexts[variant].map((item: string, index, array) => (
                  <li key={item}>{`${item}${index === array.length - 1 ? '.' : ','}`}</li>
                ))}
              </ul>
              <p className="mt-4">{t(`rate-ai-content.modal.description.question`)}</p>
              <p>{t(`rate-ai-content.modal.description.help`)}</p>
            </>
          ),
          placeholder: t('rate-ai-content.modal.placeholder'),
        },
      }}
      onSubmit={async ({ rating, message }: { rating: number; message?: string }) => {
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
      size={size}
      testId="rate-ai-content"
    />
  );
};
