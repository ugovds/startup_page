/**
 * bookmarks.js - Gestion des catégories de signets, mode personnalisation, glisser-déposer et sauvegarde/restauration JSON
 */
const defaultCategories = [
  {
    id: 'social',
    title: 'Social',
    icon: 'fa-solid fa-share-nodes',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'fa-brands fa-youtube' },
      { name: 'Twitch', url: 'https://www.twitch.tv/', icon: 'fa-brands fa-twitch' },
      { name: 'Gmail', url: 'https://mail.google.com/', icon: 'fa-solid fa-envelope-open-text' },
      { name: 'Twitter / X', url: 'https://x.com/', icon: 'fa-brands fa-x-twitter' },
      { name: 'Google Docs', url: 'https://docs.google.com/document/', icon: 'fa-solid fa-file-lines' },
      { name: 'Google Slides', url: 'https://docs.google.com/presentation/', icon: 'fa-solid fa-display' }
    ]
  },
  {
    id: 'jeux',
    title: 'Jeux',
    icon: 'fa-solid fa-gamepad',
    links: [
      { name: 'Chess', url: 'https://www.chess.com/home', icon: 'fa-solid fa-chess-knight' },
      { name: 'Monkeytype', url: 'https://monkeytype.com/', icon: 'fa-solid fa-keyboard' },
      { name: 'Cémantix', url: 'https://cemantix.certitudes.org/', icon: 'fa-solid fa-fire-flame-curved' },
      { name: 'Worldle', url: 'https://worldle.teuteuf.fr/', icon: 'fa-solid fa-earth-europe' },
      { name: 'Framed', url: 'https://framed.wtf/', icon: 'fa-solid fa-film' },
      { name: 'Chronophoto', url: 'https://www.chronophoto.app/', icon: 'fa-solid fa-camera-retro' }
    ]
  },
  {
    id: 'ia',
    title: 'IA',
    icon: 'fa-solid fa-microchip',
    links: [
      { name: 'Gemini', url: 'https://gemini.google.com/app?hl=fr', icon: 'fa-solid fa-wand-magic-sparkles' },
      { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'fa-solid fa-bolt' },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: 'fa-solid fa-book-open-reader' },
      { name: 'Claude', url: 'https://claude.ai/new', icon: 'fa-solid fa-brain' },
      { name: 'Perplexity', url: 'https://www.perplexity.ai/', icon: 'fa-solid fa-magnifying-glass-chart' },
      { name: 'DeepSeek', url: 'https://chat.deepseek.com/', icon: 'fa-solid fa-terminal' }
    ]
  },
  {
    id: 'unif',
    title: 'Unif',
    icon: 'fa-solid fa-graduation-cap',
    links: [
      { name: 'Moodle', url: 'https://moodle.uclouvain.be/my/', icon: 'fa-solid fa-book-bookmark' },
      { name: 'INGInious', url: 'https://inginious.info.ucl.ac.be/mycourses', icon: 'fa-solid fa-code' },
      { name: 'MonHoraire', url: 'https://monhoraire.uclouvain.be/', icon: 'fa-regular fa-calendar-days' },
      { name: 'Outlook', url: 'https://outlook.office.com/mail/', icon: 'fa-solid fa-envelope' },
      { name: 'Overleaf', url: 'https://overleaf.info.ucl.ac.be/project', icon: 'fa-solid fa-feather-pointed' },
      { name: 'MyUCL', url: 'https://uclouvain.be/fr/myuclouvain', icon: 'fa-solid fa-building-columns' }
    ]
  }
];

let categories = [];
let quickShortcuts = [];
let isEditMode = false;
let currentEditingTarget = { catIdx: null, linkIdx: null };

// Variables pour le Glisser-Déposer
let draggedData = null; // { catIdx, linkIdx }
let didDragOccur = false;

function getQuickShortcuts() {
  return quickShortcuts;
}

function renderCategories() {
  const categoriesContainer = document.getElementById('categories-container');
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = categories
    .map(
      (cat, catIdx) => `
    <div class="category-card" data-cat="${catIdx}">
      <div class="category-header">
        <i class="${cat.icon}"></i>
        <h3>${cat.title}</h3>
      </div>
      <div class="link-list" data-cat="${catIdx}">
        ${cat.links
          .map(
            (link, linkIdx) => `
          <a
            href="${link.url}"
            class="link-item"
            data-cat="${catIdx}"
            data-link="${linkIdx}"
            ${isEditMode ? 'draggable="true"' : ''}
          >
            ${
              isEditMode
                ? `<span class="link-drag-handle" title="Glisser pour réorganiser"><i class="fa-solid fa-grip-vertical"></i></span>`
                : ''
            }
            <i class="${link.icon}"></i>
            <span>${link.name}</span>
            <span class="link-edit-badge" title="Modifier ce raccourci">
              <i class="fa-solid fa-pen"></i>
            </span>
          </a>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('');

  quickShortcuts = [];
  categories.forEach((cat) => {
    cat.links.forEach((l) => {
      quickShortcuts.push({
        title: l.name,
        url: l.url,
        icon: l.icon
      });
    });
  });

  if (isEditMode) {
    attachDragAndDropEvents();
  }
}

function setEditMode(active) {
  isEditMode = Boolean(active);
  document.body.classList.toggle('edit-mode-active', isEditMode);

  const editToggleBtn = document.getElementById('edit-mode-toggle');
  if (editToggleBtn) {
    editToggleBtn.classList.toggle('active', isEditMode);
  }

  const customizeToolbar = document.getElementById('customize-toolbar');
  if (customizeToolbar) {
    customizeToolbar.hidden = !isEditMode;
  }

  renderCategories();
}

// ----------------------------------------------------
// Glisser-Déposer (Drag and Drop)
// ----------------------------------------------------
function attachDragAndDropEvents() {
  const linkItems = document.querySelectorAll('.link-item[draggable="true"]');
  const linkLists = document.querySelectorAll('.link-list');

  linkItems.forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      didDragOccur = true;
      const catIdx = Number(item.dataset.cat);
      const linkIdx = Number(item.dataset.link);
      draggedData = { catIdx, linkIdx };

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
      setTimeout(() => item.classList.add('is-dragging'), 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('is-dragging');
      document.querySelectorAll('.link-item').forEach((el) => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      document.querySelectorAll('.category-card').forEach((el) => {
        el.classList.remove('drag-over-cat');
      });
      setTimeout(() => {
        didDragOccur = false;
        draggedData = null;
      }, 50);
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';

      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isTop = e.clientY < midY;

      item.classList.toggle('drag-over-top', isTop);
      item.classList.toggle('drag-over-bottom', !isTop);
    });

    item.addEventListener('dragleave', (e) => {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      item.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggedData) return;

      const targetCatIdx = Number(item.dataset.cat);
      const targetLinkIdx = Number(item.dataset.link);
      const rect = item.getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;

      moveBookmark(draggedData.catIdx, draggedData.linkIdx, targetCatIdx, targetLinkIdx, isTop);
    });
  });

  linkLists.forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.closest('.category-card')?.classList.add('drag-over-cat');
    });

    list.addEventListener('dragleave', (e) => {
      if (!list.contains(e.relatedTarget)) {
        list.closest('.category-card')?.classList.remove('drag-over-cat');
      }
    });

    list.addEventListener('drop', (e) => {
      list.closest('.category-card')?.classList.remove('drag-over-cat');
      if (!draggedData) return;
      // Si dropped directement sur la liste (fin de la liste)
      if (e.target === list) {
        e.preventDefault();
        const targetCatIdx = Number(list.dataset.cat);
        moveBookmark(draggedData.catIdx, draggedData.linkIdx, targetCatIdx, categories[targetCatIdx].links.length, false);
      }
    });
  });
}

function moveBookmark(srcCat, srcLink, dstCat, dstLink, insertBefore) {
  if (srcCat === null || srcLink === null) return;

  const itemToMove = categories[srcCat].links[srcLink];
  if (!itemToMove) return;

  // Retirer l'élément de sa catégorie d'origine
  categories[srcCat].links.splice(srcLink, 1);

  // Calculer le nouvel index dans la catégorie cible
  let insertionIndex = dstLink;
  if (srcCat === dstCat && srcLink < dstLink) {
    insertionIndex = Math.max(0, dstLink - 1);
  }
  if (!insertBefore) {
    insertionIndex += 1;
  }
  insertionIndex = Math.min(insertionIndex, categories[dstCat].links.length);

  categories[dstCat].links.splice(insertionIndex, 0, itemToMove);

  localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
  renderCategories();
}

// ----------------------------------------------------
// Modale d'édition d'un raccourci individuel
// ----------------------------------------------------
function openEditModal(catIdx, linkIdx) {
  const editModal = document.getElementById('edit-modal');
  const editNameInput = document.getElementById('edit-name');
  const editUrlInput = document.getElementById('edit-url');
  const editIconInput = document.getElementById('edit-icon');

  currentEditingTarget = { catIdx, linkIdx };
  const data = categories[catIdx].links[linkIdx];
  editNameInput.value = data.name;
  editUrlInput.value = data.url;
  editIconInput.value = data.icon;
  updateIconPreview(data.icon);
  editModal.hidden = false;
  editNameInput.focus();
}

function closeEditModal() {
  const editModal = document.getElementById('edit-modal');
  if (editModal) editModal.hidden = true;
  currentEditingTarget = { catIdx: null, linkIdx: null };
}

function updateIconPreview(cls) {
  const editIconPreview = document.getElementById('edit-icon-preview');
  if (editIconPreview) {
    editIconPreview.className = cls || 'fa-solid fa-link';
  }
}

// ----------------------------------------------------
// Sauvegarde & Restauration (Export / Import JSON)
// ----------------------------------------------------
function exportFullConfig() {
  let customFeeds = [];
  try {
    customFeeds = JSON.parse(localStorage.getItem('startpage_custom_feeds') || '[]');
  } catch {}

  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem('startpage_todos_v2') || '[]');
  } catch {}

  const config = {
    app: 'violet-startpage',
    version: '2.0',
    exportDate: new Date().toISOString(),
    theme: localStorage.getItem('startpage_theme') || '1',
    weatherCity: localStorage.getItem('startpage_weather_city') || '',
    weatherFx: localStorage.getItem('startpage_weather_fx') !== 'false',
    categories: categories,
    todos: todos,
    customFeeds: customFeeds
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
  const downloadAnchor = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `startpage-backup-${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  if (typeof showToast === 'function') {
    showToast('Sauvegarde JSON téléchargée avec succès !', 'success');
  }
}

function importFullConfig(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data || (!data.categories && !data.todos)) {
        throw new Error('Format de fichier de configuration invalide');
      }

      if (data.categories && Array.isArray(data.categories)) {
        categories = data.categories;
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
      }

      if (data.todos && Array.isArray(data.todos)) {
        localStorage.setItem('startpage_todos_v2', JSON.stringify(data.todos));
        if (typeof initTasks === 'function') initTasks();
      }

      if (data.customFeeds && Array.isArray(data.customFeeds)) {
        localStorage.setItem('startpage_custom_feeds', JSON.stringify(data.customFeeds));
        if (typeof initFeeds === 'function') initFeeds();
      }

      if (data.weatherCity !== undefined) {
        localStorage.setItem('startpage_weather_city', data.weatherCity);
        if (typeof fetchWeather === 'function') fetchWeather();
      }

      if (data.weatherFx !== undefined) {
        localStorage.setItem('startpage_weather_fx', String(data.weatherFx));
        if (typeof toggleWeatherFx === 'function') toggleWeatherFx(data.weatherFx);
      }

      if (data.theme && typeof applyTheme === 'function') {
        applyTheme(data.theme);
      }

      if (typeof showToast === 'function') {
        showToast('Configuration restaurée avec succès !', 'success');
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Erreur : fichier JSON non valide ou corrompu', 'error');
      }
    }
  };

  reader.readAsText(file);
}

// ----------------------------------------------------
// Initialisation du module
// ----------------------------------------------------
function initBookmarks() {
  try {
    const saved = localStorage.getItem('startpage_categories_v1');
    categories = saved ? JSON.parse(saved) : structuredClone(defaultCategories);
  } catch {
    categories = structuredClone(defaultCategories);
  }

  renderCategories();

  const editToggleBtn = document.getElementById('edit-mode-toggle');
  const closeEditBtn = document.getElementById('btn-close-edit');
  const editModal = document.getElementById('edit-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const editForm = document.getElementById('edit-shortcut-form');
  const editNameInput = document.getElementById('edit-name');
  const editUrlInput = document.getElementById('edit-url');
  const editIconInput = document.getElementById('edit-icon');
  const resetAllBtn = document.getElementById('reset-all-shortcuts-btn');
  const categoriesContainer = document.getElementById('categories-container');

  // Boutons Export / Import JSON
  const btnExport = document.getElementById('btn-export-backup');
  const btnImport = document.getElementById('btn-import-backup');
  const importFileInput = document.getElementById('import-file-input');

  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', () => {
      setEditMode(!isEditMode);
    });
  }

  if (closeEditBtn) {
    closeEditBtn.addEventListener('click', () => {
      setEditMode(false);
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', exportFullConfig);
  }

  if (btnImport && importFileInput) {
    btnImport.addEventListener('click', () => {
      importFileInput.value = '';
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importFullConfig(file);
    });
  }

  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      if (!isEditMode) return;

      // Si un drag vient de s'achever, ne pas ouvrir la modale
      if (didDragOccur) return;

      const linkEl = e.target.closest('.link-item');
      if (!linkEl) return;

      e.preventDefault();
      const catIdx = Number(linkEl.dataset.cat);
      const linkIdx = Number(linkEl.dataset.link);
      openEditModal(catIdx, linkIdx);
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEditModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeEditModal);

  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });
  }

  if (editIconInput) {
    editIconInput.addEventListener('input', () => {
      updateIconPreview(editIconInput.value.trim());
    });
  }

  document.querySelectorAll('.q-icon-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const iconCls = btn.dataset.icon;
      if (editIconInput) {
        editIconInput.value = iconCls;
        updateIconPreview(iconCls);
      }
    });
  });

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { catIdx, linkIdx } = currentEditingTarget;
      if (catIdx === null || linkIdx === null) return;

      categories[catIdx].links[linkIdx] = {
        name: editNameInput.value.trim(),
        url: editUrlInput.value.trim(),
        icon: editIconInput.value.trim()
      };

      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      renderCategories();
      closeEditModal();
      if (typeof showToast === 'function') {
        showToast('Raccourci mis à jour', 'success');
      }
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment restaurer tous les raccourcis d\'origine ?')) {
        categories = structuredClone(defaultCategories);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
        closeEditModal();
        if (typeof showToast === 'function') {
          showToast('Raccourcis par défaut restaurés', 'info');
        }
      }
    });
  }
}
