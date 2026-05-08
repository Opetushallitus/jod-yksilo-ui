export const OpportunityCardSkeleton = ({ small = false }: { small?: boolean }) => {
  return (
    <li
      aria-hidden="true"
      className="animate-pulse flex list-none flex-col gap-y-4 rounded bg-white p-5 shadow-border sm:p-6"
    >
      {/* Actions section with favorite button */}
      <div className="mb-3 flex flex-row items-center justify-between">
        <div />
        <div className="rounded-2xl h-6 w-[150px] bg-bg-gray-2 p-1" />
      </div>

      {/* Header with icon and title */}
      <div className="flex flex-row">
        <div className="size-8 shrink-0 rounded-full bg-bg-gray-2" />
        <div className="relative ml-4 flex flex-1 flex-col justify-center gap-2">
          {/* Opportunity type label */}
          <div className="h-3 w-[100px] rounded bg-bg-gray-2" />
          {/* Title */}
          <div className="h-6 w-2/3 rounded bg-bg-gray-2" />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-3">
        <div className="h-4 w-full rounded bg-bg-gray-2" />
        <div className="h-4 w-11/12 rounded bg-bg-gray-2" />
        {!small && (
          <>
            <div className="h-4 w-full rounded bg-bg-gray-2" />
            <div className="h-4 w-4/5 rounded bg-bg-gray-2" />
            <div className="h-4 w-11/12 rounded bg-bg-gray-2" />
            <div className="h-4 w-4/5 rounded bg-bg-gray-2" />
            <div className="h-4 w-full rounded bg-bg-gray-2" />
            <div className="h-4 w-1/4 rounded bg-bg-gray-2" />
          </>
        )}
      </div>

      {/* Details section with border */}
      {!small && (
        <div className="mt-3 flex flex-col gap-y-4 border-l-2 border-bg-gray-2 pl-4">
          {/* First detail */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <div className="h-3 w-1/2 rounded bg-bg-gray-2" />
            </div>
            <div className="h-5 w-3/5 rounded bg-bg-gray-2" />
          </div>

          {/* Second detail */}
          <div className="flex flex-col gap-y-3">
            <div className="flexitems-center">
              <div className="h-3 w-1/6 rounded bg-bg-gray-2" />
            </div>
            <div className="h-5 w-1/7 rounded bg-bg-gray-2" />
          </div>
        </div>
      )}
    </li>
  );
};
