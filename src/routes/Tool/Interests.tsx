import { OsaamisSuosittelija } from '@/components';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useToolStore } from '@/stores/useToolStore';
import { Button } from '@jod/design-system';
import { JodChatBot } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { VirtualAssistant } from './VirtualAssistant';

const Interests = () => {
  const { t } = useTranslation();
  const { isPrd } = useEnvironment();
  const { setKiinnostukset, virtualAssistantOpen, kiinnostukset, setVirtualAssistantOpen } = useToolStore(
    useShallow((state) => ({
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      virtualAssistantOpen: state.virtualAssistantOpen,
      setVirtualAssistantOpen: state.setVirtualAssistantOpen,
    })),
  );

  // 100vh - header height - padding
  const virtualAssistantClassNames = virtualAssistantOpen ? 'h-[calc(100vh-96px-40px)]' : '';

  const scrollToTitle = () => {
    setTimeout(() => {
      const titleElement = document.getElementById('kiinnostuksetTitle');

      if (titleElement) {
        titleElement.scrollIntoView({ behavior: 'smooth' });
        titleElement.focus();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className={virtualAssistantClassNames}>
      {virtualAssistantOpen ? (
        <div className="bg-white rounded h-full flex flex-col">
          <VirtualAssistant setVirtualAssistantOpen={setVirtualAssistantOpen} />
        </div>
      ) : (
        <>
          <OsaamisSuosittelija
            onChange={setKiinnostukset}
            value={kiinnostukset}
            mode="kiinnostukset"
            tagHeadingClassName="bg-white"
            hideTextAreaLabel
          />
          {!isPrd && (
            <div className="pt-5">
              <Button
                data-testid="interests-open-virtual-assistant"
                label={t('tool.my-own-data.interests.conversational-virtual-assistant')}
                variant="gray"
                size="sm"
                className="w-fit"
                icon={<JodChatBot />}
                iconSide="right"
                onClick={() => {
                  setVirtualAssistantOpen(true);
                  scrollToTitle();
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Interests;
