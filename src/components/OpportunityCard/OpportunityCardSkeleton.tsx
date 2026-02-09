export const OpportunityCardSkeleton = ({ small = false }: { small?: boolean }) => {
  return (
    <li
      aria-hidden="true"
      className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border gap-y-4 animate-pulse list-none"
    >
      {/* Actions section with favorite button */}
      <div className="flex flex-row justify-between items-center mb-3">
        <div />
        <div className="h-6 p-1 w-[150px] bg-bg-gray-2 rounded-2xl" />
      </div>

      {/* Header with icon and title */}
      <div className="flex flex-row">
        <div className="size-8 bg-bg-gray-2 rounded-full shrink-0" />
        <div className="ml-4 flex flex-col justify-center gap-2 flex-1 relative">
          {/* Opportunity type label */}
          <div className="h-3 bg-bg-gray-2 rounded w-[100px]" />
          {/* Title */}
          <div className="h-6 bg-bg-gray-2 rounded w-2/3" />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-bg-gray-2 rounded w-full" />
        <div className="h-4 bg-bg-gray-2 rounded w-11/12" />
        {!small && (
          <>
            <div className="h-4 bg-bg-gray-2 rounded w-full" />
            <div className="h-4 bg-bg-gray-2 rounded w-4/5" />
            <div className="h-4 bg-bg-gray-2 rounded w-11/12" />
            <div className="h-4 bg-bg-gray-2 rounded w-4/5" />
            <div className="h-4 bg-bg-gray-2 rounded w-full" />
            <div className="h-4 bg-bg-gray-2 rounded w-1/4" />
          </>
        )}
      </div>

      {/* Details section with border */}
      {!small && (
        <div className="flex flex-col gap-y-4 border-l-2 pl-4 border-bg-gray-2 mt-3">
          {/* First detail */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <div className="h-3 bg-bg-gray-2 rounded w-1/2" />
            </div>
            <div className="h-5 bg-bg-gray-2 rounded w-3/5" />
          </div>

          {/* Second detail */}
          <div className="flex flex-col gap-y-3">
            <div className="flexitems-center">
              <div className="h-3 bg-bg-gray-2 rounded w-1/6" />
            </div>
            <div className="h-5 bg-bg-gray-2 rounded w-1/7" />
          </div>
        </div>
      )}
    </li>
  );
};
