/**
 * shortcuts.js - Raccourcis clavier globaux
 */
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const editModal = document.getElementById('edit-modal');
    const searchInput = document.getElementById('search-input');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');

    const isEditingInModal = editModal && !editModal.hidden;
    const isTodoFocused = active === todoInput || active === todoDate;
    const isSearchEmpty = active === searchInput && searchInput.value.trim() === '';
    const isNotTyping = active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA';

    if (isEditingInModal) {
      if (e.key === 'Escape' && typeof closeEditModal === 'function') {
        closeEditModal();
      }
      return;
    }

    const isThemeKey =
      e.code === 'Numpad1' ||
      e.code === 'Numpad2' ||
      e.code === 'Numpad3' ||
      ((isNotTyping || isSearchEmpty) && ['1', '2', '3'].includes(e.key));

    if (isThemeKey && !isTodoFocused && (isNotTyping || isSearchEmpty)) {
      const num = e.code.startsWith('Numpad') ? e.code.replace('Numpad', '') : e.key;
      if (typeof themesConfig !== 'undefined' && themesConfig[num] && typeof applyTheme === 'function') {
        e.preventDefault();
        applyTheme(num);
        return;
      }
    }

    if (e.key === '/' && isNotTyping && searchInput) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape' && !isNotTyping) {
      active.blur();
    }
  });
}
