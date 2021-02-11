import { html } from 'htm/preact';

const ellipsize = (val, maxLength = 20) => {
  if (val.length < maxLength + 3) {
    return val;
  }
  return val.substr(0, maxLength) + '...';
};

export default function StatsListItem({ name, value }) {
  return html`<div class="bg-gray-200 p-5 rounded-lg shadow-md font-mono">
    <div class="text-gray-500 mb-3">${name}</div>
    <div title="${value}">${ellipsize(value)}</div>
  </div>`;
}
