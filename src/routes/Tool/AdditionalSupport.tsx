import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { JodOpenInNew } from '@jod/design-system/icons';

const AdditionalSupportLink = ({ url, text }: { url: string; text: string }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Trans
        defaults={text}
        components={{
          Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
          CustomLink: (
            // oxlint-disable-next-line jsx_a11y/anchor-has-content
            <a
              href={url}
              className="font-bold inline-flex items-center text-accent underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        }}
      />
    </div>
  );
};

const AdditionalSupport = () => {
  const { t } = useTranslation();
  const { lng } = useParams();

  return (
    <div className="rounded bg-white">
      <div className="mt-5 flex flex-col gap-5">
        <p className="text-body-md text-primary-gray sm:text-body-md">{t('tool.tools.description')}</p>
        <AdditionalSupportLink url={`/urataidot/${lng}`} text={t('tool.tools.urataidot-additional-resource')} />
        <AdditionalSupportLink
          url={t('tool.tools.counseling-url')}
          text={t('tool.tools.counseling-additional-resource')}
        />
        <AdditionalSupportLink
          url={`${t('tool.tools.compass-url')}/${lng}`}
          text={t('tool.tools.compass-additional-resource')}
        />
        <AdditionalSupportLink
          url={t('tool.tools.reveal-your-skills-url')}
          text={t('tool.tools.reveal-your-skills-additional-resource')}
        />
        <AdditionalSupportLink
          url={`${t('tool.tools.guidance-practitioner-url')}/${lng}`}
          text={t('tool.tools.guidance-practitioner-additional-resource')}
        />
      </div>
    </div>
  );
};

export default AdditionalSupport;
