import { useTranslation } from 'react-i18next';

import { cx, EmptyState, Tag } from '@jod/design-system';

import type { useVirtualAssistantChat } from '../hooks/useVirtualAssistantChat';
import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantVariant } from '../virtualAssistantTypes';

type VirtualAssistantChatState = ReturnType<typeof useVirtualAssistantChat>;

export interface SelectedTabPanelProps {
  type: VirtualAssistantVariant;
  selection: VirtualAssistantChatState['selection'];
  tabs: VirtualAssistantChatState['tabs'];
}

export const SelectedTabPanel = ({ type, selection, tabs }: SelectedTabPanelProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);
  const { handleTagRemove, handleTagsKeyboardNavigation, isSelectedEmpty, selected, selectedLabelId, selectedTagsRef } =
    selection;
  const { selectedTabButtonId, selectedTabPanelId, selectedVisible } = tabs;

  return (
    <div
      id={selectedTabPanelId}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={selectedTabButtonId}
      className={cx(
        'flex h-[378px] min-h-0 flex-1 flex-col overflow-y-auto rounded-b-md bg-white p-4 text-primary-gray sm:h-[484px]',
        !selectedVisible && 'hidden',
      )}
      data-testid="va-selected"
    >
      <h2 tabIndex={-1} id={selectedLabelId} className="text-heading-4-mobile sm:text-heading-4">
        {config.labels.selected}
      </h2>
      {isSelectedEmpty && (
        <div className="mt-4">
          <EmptyState text={config.labels.emptySelection} testId="empty-state" />
        </div>
      )}
      {!isSelectedEmpty && (
        <>
          <span className="text-help text-secondary-gray">{t('osaamissuosittelija.interest.remove')}</span>

          <div aria-labelledby={selectedLabelId} className="mt-4 min-h-[144px] overflow-y-auto">
            <ul className="flex flex-wrap gap-3 p-1" ref={selectedTagsRef} onKeyDown={handleTagsKeyboardNavigation}>
              {selected.map((k, index) => (
                <li key={k.uri} className="max-w-full">
                  <Tag
                    label={k.nimi[language] ?? k.uri}
                    sourceType={config.tagSourceType}
                    variant="added"
                    onClick={(e) => handleTagRemove(e, k.uri, index)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
