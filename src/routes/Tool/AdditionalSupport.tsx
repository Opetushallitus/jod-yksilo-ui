import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

const AdditionalSupportLink = ({ url, textKey }: { url: string; textKey: string }) => {
  const { t } = useTranslation();
  const text = t(textKey);
  return (
    <div>
      <Trans
        i18nKey={textKey}
        components={{
          Icon: <JodOpenInNew ariaLabel={text} />,
          CustomLink: (
            <a
              href={url}
              className="inline-flex underline font-bold text-accent items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text}
            </a>
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
    <div className="bg-white rounded">
      <div className="flex flex-col gap-5 mt-5">
        <p className="text-body-md sm:text-body-md text-primary-gray">{t('tool.tools.description')}</p>
        <AdditionalSupportLink url={`/urataidot/${lng}`} textKey={'tool.tools.urataidot-additional-resource'} />
        <AdditionalSupportLink
          url={t('tool.tools.counseling-url')}
          textKey={'tool.tools.counseling-additional-resource'}
        />
        <AdditionalSupportLink
          url={`${t('tool.tools.compass-url')}/${lng}`}
          textKey={'tool.tools.compass-additional-resource'}
        />
        <AdditionalSupportLink
          url={t('tool.tools.reveal-your-skills-url')}
          textKey={'tool.tools.reveal-your-skills-additional-resource'}
        />
        <AdditionalSupportLink
          url={`${t('tool.tools.guidance-practitioner-url')}/${lng}`}
          textKey={'tool.tools.guidance-practitioner-additional-resource'}
        />
      </div>
    </div>
  );
};

export default AdditionalSupport;
