import { OsaaminenValue } from '@/components';
import { ToolDataContext } from '@/hooks';
import React from 'react';

export const ToolDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [osaamiset, setOsaamiset] = React.useState<OsaaminenValue[]>([]);
  const memoizedValue = React.useMemo(() => ({ osaamiset, setOsaamiset }), [osaamiset]);
  return <ToolDataContext.Provider value={memoizedValue}>{children}</ToolDataContext.Provider>;
};
