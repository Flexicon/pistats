import { html } from 'htm/preact';

export default function Controls({ onReboot }) {
  return html`<div class="py-5 text-right">
    <button
      onClick=${onReboot}
      class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded shadow-md"
    >
      😵 Reboot
    </button>
  </div>`;
}
