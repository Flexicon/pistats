import { html } from 'htm/preact';
import { useState, useReducer, useEffect } from 'preact/hooks';

import Stats from './components/Stats';

const initialState = {
  stats: null,
  isLoading: true,
  isError: false,
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
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { stats, isLoading, isError } = state;

  const fetchStats = async () => {
    dispatch({ type: 'startLoading' });

    const res = await fetch('/pistats');
    if (!res.ok) {
      dispatch({ type: 'hasError' });
      return;
    }

    dispatch({ type: 'saveData', payload: await res.json() });
  };

  useEffect(async () => {
    await fetchStats();
    const inter = setInterval(fetchStats, 2000);
    return () => clearInterval(inter);
  }, []);

  return html`<div>
    <div class="w-11/12 lg:w-4/5 text-center mx-auto py-8">
      <h1 class="text-3xl">🥧 Server</h1>

      <${Stats} data=${stats} isError=${isError} isLoading=${isLoading} />
    </div>
  </div>`;
}
