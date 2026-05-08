import React from 'react';
import { Location } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { Button, useNoteStack } from '@jod/design-system';

import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { isSessionValidState, useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLinkTo } from '@/utils/routeUtils';

type NoteActions = Pick<
  ReturnType<typeof useNoteStack>,
  'addPermanentNote' | 'removePermanentNote' | 'addTemporaryNote' | 'removeTemporaryNote'
>;

interface UseSessionManagerNotificationsOptions extends NoteActions {
  data: components['schemas']['YksiloCsrfDto'] | null | undefined;
  language: string;
  t: (key: string) => string;
  location: Location;
  isOnProtectedRoute: boolean;
}

export const useSessionManagerNotifications = (options: UseSessionManagerNotificationsOptions) => {
  const optsRef = React.useRef(options);

  React.useLayoutEffect(() => {
    optsRef.current = options;
  });

  const { data } = options;
  const loaderSessionKey = `${data?.csrf?.token ?? ''}|${data?.etunimi ?? ''}|${data?.sukunimi ?? ''}`;

  const { initializeFromLoader, start, stop, setOnWarning, setOnExpired, setOnSessionExtended } =
    useSessionManagerStore(
      useShallow((state) => ({
        initializeFromLoader: state.initializeFromLoader,
        start: state.start,
        stop: state.stop,
        setOnWarning: state.setOnWarning,
        setOnExpired: state.setOnExpired,
        setOnSessionExtended: state.setOnSessionExtended,
      })),
    );

  React.useEffect(() => {
    initializeFromLoader(optsRef.current.data);
  }, [initializeFromLoader, loaderSessionKey]);

  React.useEffect(() => {
    const warningId = 'session-expiration-warning';
    const expiredId = 'session-expired';

    const handleWarningContinue = async () => {
      optsRef.current.removeTemporaryNote(warningId);
      await useSessionManagerStore.getState().validateSession(true);
    };

    const handleExpiredContinue = () => {
      useSessionManagerStore.getState().disable();
      const { removePermanentNote, isOnProtectedRoute, language } = optsRef.current;
      removePermanentNote(expiredId);
      if (isOnProtectedRoute) {
        globalThis.location.replace(globalThis.location.origin + `/yksilo/${language}`);
        return;
      }
      globalThis.location.reload();
    };

    setOnSessionExtended(() => {
      setTimeout(() => {
        optsRef.current.removeTemporaryNote(warningId);
        optsRef.current.removePermanentNote(expiredId);
      }, 50);
    });

    setOnWarning(() => {
      if (!isSessionValidState(useSessionManagerStore.getState().status)) {
        return;
      }
      const { addTemporaryNote, t } = optsRef.current;
      addTemporaryNote(() => ({
        id: warningId,
        title: t('common:session.warning.note.title'),
        description: t('common:session.warning.note.description'),
        variant: 'warning',
        readMoreComponent: (
          <Button
            size="sm"
            variant="white"
            label={t('common:session.warning.continue')}
            onClick={handleWarningContinue}
          />
        ),
        isCollapsed: false,
      }));
    });

    setOnExpired(async (reason) => {
      const { removeTemporaryNote, addPermanentNote, t, location } = optsRef.current;
      removeTemporaryNote(warningId);
      if (reason === 'logout') {
        optsRef.current.removePermanentNote(expiredId);
        return;
      }
      useToolStore.getState().reset();
      void useToolStore.getState().updateEhdotuksetAndTyomahdollisuudet(false, true);
      useSuosikitStore.getState().reset();
      addPermanentNote(() => ({
        id: expiredId,
        title: t('common:session.expired.note.title'),
        description: t('common:session.expired.note.description'),
        variant: 'error',
        readMoreComponent: (
          <div className="flex gap-4">
            <Button
              size="sm"
              variant="white"
              label={t('common:session.expired.login')}
              linkComponent={getLinkTo(`/${i18n.language}/${t('slugs.profile.login')}`, {
                state: { callbackUrl: `${location.pathname}${location.search}${location.hash}` },
              })}
            />
            <Button
              size="sm"
              variant="white"
              label={t('common:session.expired.continue')}
              onClick={handleExpiredContinue}
            />
          </div>
        ),
      }));
    });

    start();

    return () => {
      setOnWarning(undefined);
      setOnExpired(undefined);
      setOnSessionExtended(undefined);
      stop();
    };
  }, [setOnExpired, setOnSessionExtended, setOnWarning, start, stop]);
};
