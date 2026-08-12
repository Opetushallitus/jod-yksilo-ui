import { JodInfo } from '@jod/design-system/icons';

export const ImportInfoBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-5">
      <div
        className="inline-flex items-start gap-3 rounded-md bg-bg-gray-2 py-3 pr-5 pl-4 text-body-sm text-secondary-gray"
        data-testid="preferences.import-info-box"
      >
        <span className="shrink-0">
          <JodInfo className="text-secondary-gray" />
        </span>
        <span className="font-arial">{children}</span>
      </div>
    </div>
  );
};
