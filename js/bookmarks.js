/**
 * bookmarks.js - Gestion des catégories de signets, mode édition et persistance localStorage
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
      <div class="link-list">
        ${cat.links
          .map(
            (link, linkIdx) => `
          <a href="${link.url}" class="link-item" data-cat="${catIdx}" data-link="${linkIdx}">
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
}

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

function initBookmarks() {
  try {
    const saved = localStorage.getItem('startpage_categories_v1');
    categories = saved ? JSON.parse(saved) : structuredClone(defaultCategories);
  } catch {
    categories = structuredClone(defaultCategories);
  }

  renderCategories();

  const editToggleBtn = document.getElementById('edit-mode-toggle');
  const editModal = document.getElementById('edit-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const editForm = document.getElementById('edit-shortcut-form');
  const editNameInput = document.getElementById('edit-name');
  const editUrlInput = document.getElementById('edit-url');
  const editIconInput = document.getElementById('edit-icon');
  const resetAllBtn = document.getElementById('reset-all-shortcuts-btn');
  const categoriesContainer = document.getElementById('categories-container');

  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      document.body.classList.toggle('edit-mode-active', isEditMode);
      editToggleBtn.classList.toggle('active', isEditMode);
    });
  }

  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      const linkEl = e.target.closest('.link-item');
      if (!linkEl) return;

      if (isEditMode) {
        e.preventDefault();
        const catIdx = Number(linkEl.dataset.cat);
        const linkIdx = Number(linkEl.dataset.link);
        openEditModal(catIdx, linkIdx);
      }
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
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment restaurer tous les raccourcis d\'origine ?')) {
        categories = structuredClone(defaultCategories);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
        closeEditModal();
      }
    });
  }
}
