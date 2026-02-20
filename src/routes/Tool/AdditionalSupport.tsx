import { JodOpenInNew } from '@jod/design-system/icons';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

const AdditionalSupportLink = ({ url, text }: { url: string; text: string }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Trans
        defaults={text}
        components={{
          Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
          CustomLink: (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a
              href={url}
              className="inline-flex underline font-bold text-accent items-center"
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
    <div className="bg-white rounded">
      <div className="flex flex-col gap-5 mt-5">
        <p className="text-body-md sm:text-body-md text-primary-gray">{t('tool.tools.description')}</p>
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
