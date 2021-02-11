import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

import Stats from './components/Stats';

export default function App() {
  const [stats, setStats] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    setIsError(false);
    setIsLoading(true);

    const res = await fetch('/pistats');
    if (!res.ok) {
      setIsLoading(false);
      setIsError(true);
      return;
    }

    setStats(await res.json());
    setIsLoading(false);
  }, []);

  return html`<div>
    <div class="w-11/12 lg:w-4/5 text-center mx-auto py-8">
      <h1 class="text-3xl">🥧 Server</h1>

      <${Stats} data=${stats} isError=${isError} isLoading=${isLoading} />
    </div>
  </div>`;
}
