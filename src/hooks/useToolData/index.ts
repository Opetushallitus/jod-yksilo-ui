import { OsaaminenValue } from '@/components';
import React from 'react';

interface ToolContextProps {
  osaamiset: OsaaminenValue[];
  setOsaamiset: (osaamiset: OsaaminenValue[]) => void;
}

export const ToolDataContext = React.createContext<ToolContextProps>({
  osaamiset: [],
  setOsaamiset: () => void 0,
});

export const useToolData = () => {
  const context = React.useContext(ToolDataContext);
  if (context === undefined) {
    throw new Error('useToolData must be used within an ToolDataProvider');
  }
  return context;
};
