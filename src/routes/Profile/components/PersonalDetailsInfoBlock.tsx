import { tidyClasses as tc } from '@jod/design-system';

interface InfoBlockProps {
  /** Label for the info block */
  label: string;
  /** Optional information to display under the label */
  info?: string;
  /** Interactive component to render alongside the info, like form inputs */
  interactiveComponent?: React.ReactNode;
  /** Whether to stack the label and interactive component vertically (flex-col vs flex-row) */
  stack?: boolean;
  /** Optional id for accessibility - links label to input field via htmlFor attribute */
  htmlFor?: string;
}
/**
 * A component shared between PersonalDetails and WelcomePathModal for displaying a single personal user detail.
 */
export const PersonalDetailsInfoBlock = ({ label, info, interactiveComponent, stack, htmlFor }: InfoBlockProps) => {
  const rowOrCol = stack ? 'flex-col' : 'flex-row';

  return (
    <div className={tc(['space-between flex gap-3', rowOrCol])}>
      <div className="flex flex-1 flex-col gap-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="font-arial text-form-label">
            {label}
          </label>
        ) : (
          <span className="font-arial text-form-label">{label}</span>
        )}
        {info && <span className="font-arial text-body-md-mobile text-secondary-gray sm:text-body-md">{info}</span>}
      </div>
      {interactiveComponent && <div className="flex flex-2 items-center justify-end gap-3">{interactiveComponent}</div>}
    </div>
  );
};
