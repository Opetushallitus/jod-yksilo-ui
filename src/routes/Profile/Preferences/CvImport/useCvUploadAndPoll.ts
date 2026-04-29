import React from 'react';

import { client } from '@/api/client';
import { components } from '@/api/schema';

import { ACCEPTED_MIME, MAX_PDF_BYTES, POLL_INTERVAL_ERROR_MS, POLL_INTERVAL_MS } from './constants';

type Step = 'select' | 'uploading' | 'polling' | 'done' | 'failed';

type ErrorCode = 'invalid-file-type' | 'file-too-large' | 'upload-failed' | 'extraction-failed' | 'network';

export interface CvImportError {
  code: ErrorCode;
  detail?: string;
}

export interface CvImportState {
  step: Step;
  tehtavaId?: string;
  // tulos?: unknown;
  tulos?: components['schemas']['Tulos'];
  error?: CvImportError;
}

type CvImportAction =
  | { type: 'VALIDATE_ERROR'; error: CvImportError }
  | { type: 'START_UPLOAD' }
  | { type: 'UPLOAD_DONE'; tehtavaId: string }
  | { type: 'POLL_DONE'; tulos: components['schemas']['Tulos']; tehtavaId: string }
  | { type: 'POLL_ERROR'; error: CvImportError }
  | { type: 'EXTRACTION_FAILED' }
  | { type: 'CANCEL' };

const initialState: CvImportState = { step: 'select' };

function reducer(state: CvImportState, action: CvImportAction): CvImportState {
  switch (action.type) {
    case 'VALIDATE_ERROR':
      return { step: 'select', error: action.error };
    case 'START_UPLOAD':
      return { step: 'uploading' };
    case 'UPLOAD_DONE':
      return { step: 'polling', tehtavaId: action.tehtavaId };
    case 'POLL_DONE':
      return { step: 'done', tulos: action.tulos, tehtavaId: action.tehtavaId };
    case 'POLL_ERROR':
      return { ...state, step: 'polling', error: action.error };
    case 'EXTRACTION_FAILED':
      return { step: 'failed', error: { code: 'extraction-failed' } };
    case 'CANCEL':
      return initialState;
    default:
      return state;
  }
}

export const useCvUploadAndPoll = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Abort in-flight requests on unmount
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const start = React.useCallback(async (file: File) => {
    // Client-side validation
    if (file.type !== ACCEPTED_MIME) {
      dispatch({ type: 'VALIDATE_ERROR', error: { code: 'invalid-file-type' } });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      dispatch({ type: 'VALIDATE_ERROR', error: { code: 'file-too-large' } });
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: 'START_UPLOAD' });

    try {
      const { data, error } = await client.POST('/api/profiili/cv', {
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
        bodySerializer: (b) => b,
        signal: controller.signal,
      });

      if (error || !data?.id) {
        dispatch({ type: 'VALIDATE_ERROR', error: { code: 'upload-failed' } });
        return;
      }

      const { id, tila, tulos } = data;

      if (tila === 'VALMIS' && tulos) {
        dispatch({ type: 'POLL_DONE', tulos, tehtavaId: id });
        return;
      }
      if (tila === 'EPAONNISTUNUT') {
        dispatch({ type: 'EXTRACTION_FAILED' });
        return;
      }

      dispatch({ type: 'UPLOAD_DONE', tehtavaId: id });
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') {
        return;
      }
      dispatch({ type: 'VALIDATE_ERROR', error: { code: 'upload-failed', detail: String(err) } });
    }
  }, []);

  const cancel = React.useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'CANCEL' });
  }, []);

  const retry = React.useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'CANCEL' });
  }, []);

  // Polling effect
  React.useEffect(() => {
    if (state.step !== 'polling' || !state.tehtavaId) {
      return;
    }

    const tehtavaId = state.tehtavaId;
    let active = true;

    const poll = async () => {
      if (!active) {
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data, error } = await client.GET('/api/profiili/cv/{tehtavaId}', {
          params: { path: { tehtavaId } },
          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        if (error) {
          dispatch({ type: 'POLL_ERROR', error: { code: 'network' } });
          return;
        }

        if (data?.tila === 'VALMIS' && data.tulos) {
          dispatch({ type: 'POLL_DONE', tulos: data.tulos, tehtavaId });
        } else if (data?.tila === 'EPAONNISTUNUT') {
          dispatch({ type: 'EXTRACTION_FAILED' });
        }
        // ODOTTAA: keep polling
      } catch (err) {
        if (!active || (err as { name?: string }).name === 'AbortError') {
          return;
        }
        dispatch({ type: 'POLL_ERROR', error: { code: 'network', detail: String(err) } });
      }
    };

    const interval = state.error ? POLL_INTERVAL_ERROR_MS : POLL_INTERVAL_MS;
    const intervalId = setInterval(poll, interval);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [state.step, state.tehtavaId, state.error]);

  const save = React.useCallback(
    async (dto: components['schemas']['CvTehtavaSaveDto']): Promise<boolean> => {
      if (!state.tehtavaId) {
        return false;
      }
      try {
        const { error } = await client.POST('/api/profiili/cv/{tehtavaId}', {
          params: { path: { tehtavaId: state.tehtavaId } },
          body: dto,
        });
        return !error;
      } catch {
        return false;
      }
    },
    [state.tehtavaId],
  );

  return { state, start, cancel, retry, save };
};
