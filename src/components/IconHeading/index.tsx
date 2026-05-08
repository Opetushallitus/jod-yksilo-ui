export interface IconHeadingProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  testId?: string;
  bgClassName?: string;
  textClassName?: string;
}

export const IconHeading = ({
  icon,
  title,
  testId,
  bgClassName = 'bg-secondary-1-dark',
  textClassName = 'text-secondary-1-dark',
}: IconHeadingProps) => {
  return (
    <div className="mb-6 flex items-start gap-x-4 sm:mb-6">
      {icon && (
        <span
          aria-hidden="true"
          className={`flex aspect-square size-9 items-center justify-center rounded-full text-white ${bgClassName} print:hidden`}
        >
          {icon}
        </span>
      )}
      <h1
        data-testid={testId}
        className={`text-hero-mobile text-pretty wrap-break-word hyphens-auto focus:outline-0 sm:text-hero ${textClassName}`}
      >
        {title}
      </h1>
    </div>
  );
};
