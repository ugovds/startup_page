/**
 * app.js - Point d'entrée principal de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation des différents modules
  if (typeof initThemes === 'function') initThemes();
  if (typeof initBookmarks === 'function') initBookmarks();
  if (typeof initClock === 'function') initClock();
  if (typeof initWeather === 'function') initWeather();
  if (typeof initTasks === 'function') initTasks();
  if (typeof initCalendar === 'function') initCalendar();
  if (typeof initSearch === 'function') initSearch();
  if (typeof initFeeds === 'function') initFeeds();
  if (typeof initShortcuts === 'function') initShortcuts();
});
