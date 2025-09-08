import { Accordion } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

export const ArticleAccordion = ({ titleText, content }: { titleText: string; content: React.ReactNode }) => {
  const {
    i18n: { language },
  } = useTranslation();
  return (
    <Accordion
      className="bg-bg-gray-2 p-3"
      initialState={false}
      lang={language}
      titleText={titleText}
      title={<span className="pl-5 font-poppins text-heading-4-mobile sm:text-heading-4">{titleText}</span>}
    >
      <div className="px-5 pb-3">{content}</div>
    </Accordion>
  );
};
