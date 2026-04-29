import React from 'react';

interface CvSectionProps {
  title?: string;
  selected: boolean;
  onToggle: () => void;
  expandable?: boolean;
  children: React.ReactNode;
}

const CvSection = ({ title, children }: CvSectionProps) => (
  <section className="mb-4">
    {title && <h3 className="text-heading-4 mb-2 font-poppins text-primary-gray">{title}</h3>}
    {children}
  </section>
);

interface SectionSelectionState {
  selected: boolean;
  itemSelections: Record<string, boolean>;
}

type SectionsState = Record<string, SectionSelectionState>;

interface ToggleSectionAction {
  type: 'TOGGLE_SECTION';
  sectionKey: string;
}

interface ToggleItemAction {
  type: 'TOGGLE_ITEM';
  sectionKey: string;
  itemKey: string;
}

type SectionsAction = ToggleSectionAction | ToggleItemAction;

function sectionsReducer(state: SectionsState, action: SectionsAction): SectionsState {
  switch (action.type) {
    case 'TOGGLE_SECTION': {
      const section = state[action.sectionKey];
      return { ...state, [action.sectionKey]: { ...section, selected: !section?.selected } };
    }
    case 'TOGGLE_ITEM': {
      const section = state[action.sectionKey];
      return {
        ...state,
        [action.sectionKey]: {
          ...section,
          itemSelections: { ...section?.itemSelections, [action.itemKey]: !section?.itemSelections[action.itemKey] },
        },
      };
    }
    default:
      return state;
  }
}

interface CvImportResultPanelProps {
  tulos: unknown;
}

const CvImportResultPanel = ({ tulos }: CvImportResultPanelProps) => {
  const initialState: SectionsState = {
    raw: { selected: true, itemSelections: {} },
  };

  const [, dispatch] = React.useReducer(sectionsReducer, initialState);

  const handleToggle = React.useCallback(() => {
    dispatch({ type: 'TOGGLE_SECTION', sectionKey: 'raw' });
  }, []);

  return (
    <CvSection selected onToggle={handleToggle}>
      <pre className="font-mono text-body-sm-mobile whitespace-pre-wrap overflow-auto max-h-[60vh] bg-bg-gray-2 p-4 rounded">
        {JSON.stringify(tulos, null, 2)}
      </pre>
    </CvSection>
  );
};

export default CvImportResultPanel;
