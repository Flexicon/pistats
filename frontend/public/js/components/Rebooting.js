import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

import { useInterval } from '../hooks';

export default function Rebooting({ delay }) {
  const [counter, setCounter] = useState(delay);

  useInterval(() => {
    if (counter > 0) {
      setCounter((val) => val - 1);
    }
  }, 1000);

  return html`<div class="w-11/12 lg:w-4/5 text-center mx-auto py-8">
    Rebooting now. Please wait, this page will automatically refresh after ${counter} seconds.
  </div>`;
}
