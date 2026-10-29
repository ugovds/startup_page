/**
 * clock.js - Horloge dynamique et date en français
 */
function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl || !dateEl) return;

  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${h}:${m}:${s}`;

  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('fr-FR', options);
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
