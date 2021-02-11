import { html } from 'htm/preact';

import StatsListItem from './StatsListItem';

export default function StatsList({ items = [] }) {
  return html`<div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    ${items.map((i) => StatsListItem(i))}
  </div>`;
}
