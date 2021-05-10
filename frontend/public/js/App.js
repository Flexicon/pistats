import { html } from 'htm/preact';
import { useState, useReducer, useEffect } from 'preact/hooks';

import Controls from './components/Controls';
import Stats from './components/Stats';
import { useInterval } from './hooks';

const initialState = {
  stats: null,
  isLoading: true,
  isError: false,
  isRebooting: false,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'startLoading':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'hasError':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'saveData':
      return {
        ...state,
        stats: payload,
        isLoading: false,
        isError: false,
      };
    case 'rebooting':
      return {
        ...state,
        isLoading: false,
        isError: false,
        isRebooting: true,
      };
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { stats, isLoading, isError } = state;

  useInterval(
    async () => {
      dispatch({ type: 'startLoading' });

      const res = await fetch('/pistats');
      if (!res.ok) {
        dispatch({ type: 'hasError' });
        return;
      }

      dispatch({ type: 'saveData', payload: await res.json() });
    },
    2000,
    { immediate: true }
  );

  const onReboot = async () => {
    dispatch({ type: 'rebooting' });
    await fetch('/pistats/reboot');
    setTimeout(() => window.location.reload(), 30000);
  };

  if (state.isRebooting) {
    return html`<div class="w-11/12 lg:w-4/5 text-center mx-auto py-8">
      Rebooting now. Please wait, this page will automatically refresh after 30
      seconds.
    </div>`;
  }

  return html`<div>
    <div class="w-11/12 lg:w-4/5 text-center mx-auto py-8">
      <h1 class="text-3xl mb-5">🥧 Server</h1>

      <${Stats} data=${stats} isError=${isError} isLoading=${isLoading} />
      <${Controls} onReboot=${onReboot} />
    </div>
  </div>`;
}
