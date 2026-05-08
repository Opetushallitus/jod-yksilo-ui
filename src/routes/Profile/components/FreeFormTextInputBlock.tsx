import { Accordion } from '@jod/design-system';

import { components } from '@/api/schema';

import { FreeFormTextInput } from './FreeFormTextInput';

interface FreeFormTextInputBlockProps {
  header: string;
  description: string;
  collapsible?: boolean;
  text?: components['schemas']['LokalisoituTeksti'];
  testId?: string;
  placeholder?: string;
  onChange: (value: components['schemas']['LokalisoituTeksti']) => Promise<void>;
}

const Wrapper = ({
  header,
  description,
  collapsible,
  children,
}: Omit<FreeFormTextInputBlockProps, 'text' | 'onChange' | 'testId'> & { children: React.ReactNode }) => {
  const desc = <div className="my-5 max-w-input-long font-arial text-body-md">{description}</div>;

  return collapsible ? (
    <Accordion
      title={<h2 className="truncate text-heading-3-mobile sm:text-heading-3">{header}</h2>}
      ariaLabel={header}
      underline
    >
      {desc}
      {children}
    </Accordion>
  ) : (
    <div>
      <h2 className="truncate border-b border-border-gray text-heading-3-mobile sm:text-heading-3">{header}</h2>
      {desc}
      {children}
    </div>
  );
};

export const FreeFormTextInputBlock = ({
  header,
  description,
  collapsible,
  text,
  onChange,
  testId,
  placeholder,
}: FreeFormTextInputBlockProps) => {
  return (
    <Wrapper header={header} description={description} collapsible={collapsible}>
      <FreeFormTextInput text={text} onChange={onChange} testId={testId} placeholder={placeholder} />
    </Wrapper>
  );
};
