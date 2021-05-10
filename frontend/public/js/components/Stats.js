import { html } from 'htm/preact';

import StatsList from './StatsList';

export default function Stats({ data, isLoading, isError }) {
  if (isLoading && !data) {
    return html`<div class="py-5">Loading stats...</div>`;
  }

  if (isError) {
    return html`<div class="text-red-600 py-5">
      Oops, something went wrong 😕
    </div>`;
  }

  const statsItems = Object.keys(data).map((name) => ({
    name,
    value: data[name],
  }));

  return html`<div class="py-5">
    <${StatsList} items=${statsItems} />
  </div>`;
}
