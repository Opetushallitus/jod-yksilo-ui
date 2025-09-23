export interface IconHeadingProps {
  icon: React.ReactNode;
  title: string;
  dataTestId?: string;
  bgClassName?: string;
  textClassName?: string;
}

export const IconHeading = ({
  icon,
  title,
  dataTestId,
  bgClassName = 'bg-secondary-1-dark-2',
  textClassName = 'text-secondary-1-dark-2',
}: IconHeadingProps) => {
  return (
    <div className="mb-6 sm:mb-8 flex gap-x-4 items-center">
      {icon && (
        <span
          className={`flex items-center justify-center size-9 aspect-square rounded-full text-white ${bgClassName}`}
        >
          {icon}
        </span>
      )}
      <h1
        data-testid={dataTestId}
        className={`text-hero-mobile sm:text-hero hyphens-auto text-pretty break-words ${textClassName}`}
      >
        {title}
      </h1>
    </div>
  );
};
