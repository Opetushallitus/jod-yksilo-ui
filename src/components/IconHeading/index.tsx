export interface IconHeadingProps {
  icon: React.ReactNode;
  title: string;
  dataTestId?: string;
}

export const IconHeading = ({ icon, title, dataTestId }: IconHeadingProps) => {
  return (
    <div className="mb-6 sm:mb-8 flex gap-x-4 items-center">
      <span className="flex items-center justify-center size-9 aspect-square rounded-full bg-secondary-1-dark-2 text-white">
        {icon}
      </span>
      <h1
        data-testid={dataTestId}
        className="text-hero-mobile sm:text-hero text-secondary-1-dark-2 hyphens-auto text-pretty break-all"
      >
        {title}
      </h1>
    </div>
  );
};
