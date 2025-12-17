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
}
/**
 * A component shared between PersonalDetails and WelcomePathModal for displaying a single personal user detail.
 */
export const PersonalDetailsInfoBlock = ({ label, info, interactiveComponent, stack }: InfoBlockProps) => {
  const rowOrCol = stack ? 'flex-col' : 'flex-row';

  return (
    <div className={tc(['flex space-between gap-3', rowOrCol])}>
      <div className="flex flex-col flex-1 gap-1">
        <span className="text-form-label font-arial">{label}</span>
        {info && <span className="text-body-md-mobile sm:text-body-md text-secondary-gray font-arial">{info}</span>}
      </div>
      {interactiveComponent && <div className="flex flex-2 items-center gap-3 justify-end">{interactiveComponent}</div>}
    </div>
  );
};
