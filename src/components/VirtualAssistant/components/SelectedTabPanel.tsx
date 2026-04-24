import { cx, EmptyState, Tag } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
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
        'flex flex-col flex-1 min-h-0 overflow-y-auto bg-white p-4 sm:h-[484px] h-[378px] rounded-b-md text-primary-gray',
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

          <div aria-labelledby={selectedLabelId} className="min-h-[144px] overflow-y-auto mt-4">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
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
