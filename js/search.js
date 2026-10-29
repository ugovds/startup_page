/**
 * search.js - Omnibox : moteur de recherche, préfixes (bangs), calculatrice & suggestions
 */
const searchEngines = {
  '!yt': { name: 'YouTube', icon: 'fa-brands fa-youtube', desc: 'Rechercher sur YouTube', url: 'https://www.youtube.com/results?search_query=' },
  '!tr': { name: 'DeepL', icon: 'fa-solid fa-language', desc: 'Traduire via DeepL', url: 'https://www.deepl.com/translator#auto/fr/' },
  '!maps': { name: 'Maps', icon: 'fa-solid fa-location-dot', desc: 'Google Maps', url: 'https://www.google.com/maps/search/' },
  '!img': { name: 'Images', icon: 'fa-regular fa-images', desc: 'Google Images', url: 'https://www.google.com/search?tbm=isch&q=' },
  '!w': { name: 'Wikipédia', icon: 'fa-brands fa-wikipedia-w', desc: 'Wikipédia', url: 'https://fr.wikipedia.org/wiki/Special:Search?search=' },
  '!d': { name: 'DuckDuckGo', icon: 'fa-solid fa-shield-halved', desc: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  '!gh': { name: 'GitHub', icon: 'fa-brands fa-github', desc: 'GitHub', url: 'https://github.com/search?q=' },
  '!so': { name: 'StackOverflow', icon: 'fa-brands fa-stack-overflow', desc: 'StackOverflow', url: 'https://stackoverflow.com/search?q=' },
  '!arch': { name: 'ArchWiki', icon: 'fa-brands fa-linux', desc: 'ArchWiki', url: 'https://wiki.archlinux.org/index.php?search=' },
  '!r': { name: 'Reddit', icon: 'fa-brands fa-reddit-alien', desc: 'Reddit', url: 'https://www.reddit.com/search/?q=' }
};

let currentSuggestions = [];
let selectedSuggestionIndex = -1;
let activePrefix = null;
let debounceTimer = null;

function tryEvaluateMath(expr) {
  const clean = expr.replace(/\s+/g, '');
  if (!/^[0-9+\-*/().%^]+$/.test(clean) || !/[+\-*/%^]/.test(clean)) return null;
  try {
    const normalized = clean.replace(/\^/g, '**');
    const result = Function(`"use strict"; return (${normalized})`)();
    if (typeof result === 'number' && isFinite(result)) {
      return Number.isInteger(result) ? result : Number(result.toFixed(4));
    }
  } catch {
    return null;
  }
  return null;
}

function fetchGoogleSuggestions(query) {
  return new Promise((resolve) => {
    const cbName = 'google_ac_' + Math.random().toString(36).substring(2, 9);
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 1500);

    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName] = (data) => {
      cleanup();
      resolve(Array.isArray(data[1]) ? data[1] : []);
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&q=${encodeURIComponent(query)}&callback=${cbName}`;
    script.onerror = () => {
      cleanup();
      resolve([]);
    };
    document.body.appendChild(script);
  });
}

function renderHelpMenu() {
  const suggestionsBox = document.getElementById('suggestions-box');
  if (!suggestionsBox) return;

  const helpItems = Object.entries(searchEngines).map(([prefix, info]) => ({
    type: 'help',
    prefix,
    text: `${prefix}  —  ${info.desc}`,
    icon: info.icon
  }));

  currentSuggestions = helpItems;
  selectedSuggestionIndex = -1;

  suggestionsBox.innerHTML =
    `<li class="help-header">
      <span>COMMANDES & PRÉFIXES DISPONIBLES</span>
      <span>[1-2-3] Thèmes | [/] Focus</span>
    </li>` +
    helpItems
      .map(
        (item, index) => `
        <li class="suggestion-item" data-index="${index}">
          <div class="sug-left">
            <i class="${item.icon}"></i>
            <span class="sug-text"><strong>${item.prefix}</strong> <span class="sug-match">${searchEngines[item.prefix].desc}</span></span>
          </div>
          <span class="sug-badge shortcut">${searchEngines[item.prefix].name}</span>
        </li>`
      )
      .join('');

  suggestionsBox.hidden = false;
}

function renderSuggestions(items, rawQuery) {
  const suggestionsBox = document.getElementById('suggestions-box');
  if (!suggestionsBox) return;

  currentSuggestions = items;
  selectedSuggestionIndex = -1;

  if (!items.length) {
    suggestionsBox.hidden = true;
    suggestionsBox.innerHTML = '';
    return;
  }

  const cleanQuery = rawQuery.replace(/^![a-z]+\s*/i, '').toLowerCase();

  suggestionsBox.innerHTML = items
    .map((item, index) => {
      const textLower = item.text.toLowerCase();
      let displayHtml = item.text;
      if (cleanQuery && textLower.startsWith(cleanQuery)) {
        const matched = item.text.slice(0, cleanQuery.length);
        const rest = item.text.slice(cleanQuery.length);
        displayHtml = `<span class="sug-match">${matched}</span><strong>${rest}</strong>`;
      }

      const badgeHtml =
        item.type === 'shortcut'
          ? `<span class="sug-badge shortcut">OPEN ↵</span>`
          : `<span class="sug-badge">SEARCH</span>`;

      return `
        <li class="suggestion-item" data-index="${index}">
          <div class="sug-left">
            <i class="${item.icon}"></i>
            <span class="sug-text">${displayHtml}</span>
          </div>
          ${badgeHtml}
        </li>
      `;
    })
    .join('');

  suggestionsBox.hidden = false;
}

function highlightSuggestion() {
  const suggestionsBox = document.getElementById('suggestions-box');
  if (!suggestionsBox) return;
  const nodes = suggestionsBox.querySelectorAll('.suggestion-item');
  nodes.forEach((n, i) => {
    n.classList.toggle('active', i === selectedSuggestionIndex);
  });
}

function executeSuggestion(item) {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  if (item.type === 'help') {
    searchInput.value = item.prefix + ' ';
    searchInput.focus();
    searchInput.dispatchEvent(new Event('input'));
    return;
  }
  if (item.type === 'shortcut') {
    window.open(item.url, '_blank');
  } else {
    const url =
      activePrefix && searchEngines[activePrefix]
        ? searchEngines[activePrefix].url + encodeURIComponent(item.text)
        : 'https://www.google.com/search?q=' + encodeURIComponent(item.text);
    window.open(url, '_blank');
  }
}

function initSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const engineName = document.getElementById('engine-name');
  const engineIcon = document.getElementById('engine-icon');
  const calcPreview = document.getElementById('calc-preview');
  const suggestionsBox = document.getElementById('suggestions-box');

  if (!searchForm || !searchInput) return;

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    const parts = val.split(' ');
    const prefix = parts[0].toLowerCase();

    if (prefix === '!help') {
      engineName.textContent = 'Help';
      engineIcon.className = 'fa-solid fa-circle-question';
      calcPreview.hidden = true;
      renderHelpMenu();
      return;
    }

    if (searchEngines[prefix]) {
      activePrefix = prefix;
      const eng = searchEngines[prefix];
      engineName.textContent = eng.name;
      engineIcon.className = eng.icon;
      calcPreview.hidden = true;
    } else {
      activePrefix = null;
      engineName.textContent = 'Google';
      engineIcon.className = 'fa-brands fa-google';

      const mathRes = tryEvaluateMath(val);
      if (mathRes !== null) {
        calcPreview.textContent = `= ${mathRes} (Entrée pour copier)`;
        calcPreview.hidden = false;
        calcPreview.dataset.result = mathRes;
        suggestionsBox.hidden = true;
        return;
      } else {
        calcPreview.hidden = true;
      }
    }

    if (!val) {
      suggestionsBox.hidden = true;
      return;
    }

    if (val.startsWith('!') && parts.length === 1 && !searchEngines[prefix]) {
      const matchingBangs = Object.entries(searchEngines)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, info]) => ({
          type: 'help',
          prefix: k,
          text: `${k} — ${info.desc}`,
          icon: info.icon
        }));
      if ('!help'.startsWith(prefix)) {
        matchingBangs.unshift({
          type: 'help',
          prefix: '!help',
          text: '!help — Afficher tous les préfixes de recherche',
          icon: 'fa-solid fa-circle-question'
        });
      }
      renderSuggestions(matchingBangs, '');
      return;
    }

    const queryForSuggest = activePrefix ? parts.slice(1).join(' ').trim() : val;
    if (!queryForSuggest) {
      suggestionsBox.hidden = true;
      return;
    }

    const shortcuts = typeof getQuickShortcuts === 'function' ? getQuickShortcuts() : [];
    const matchedShortcuts = !activePrefix
      ? shortcuts
          .filter((s) => s.title.toLowerCase().startsWith(queryForSuggest.toLowerCase()))
          .slice(0, 2)
          .map((s) => ({
            type: 'shortcut',
            text: s.title,
            url: s.url,
            icon: s.icon
          }))
      : [];

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const webSuggestions = await fetchGoogleSuggestions(queryForSuggest);
      const filteredWeb = webSuggestions
        .filter((w) => !matchedShortcuts.some((m) => m.text.toLowerCase() === w.toLowerCase()))
        .slice(0, 6 - matchedShortcuts.length)
        .map((w) => ({
          type: 'web',
          text: w,
          icon: activePrefix ? searchEngines[activePrefix].icon : 'fa-solid fa-magnifying-glass'
        }));

      if (searchInput.value.trim()) {
        renderSuggestions([...matchedShortcuts, ...filteredWeb], val);
      }
    }, 90);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (suggestionsBox.hidden || !currentSuggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % currentSuggestions.length;
      highlightSuggestion();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex =
        (selectedSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
      highlightSuggestion();
    } else if (e.key === 'Tab') {
      const targetIdx = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
      const chosen = currentSuggestions[targetIdx];
      if (chosen) {
        e.preventDefault();
        if (chosen.type === 'help') {
          searchInput.value = chosen.prefix + ' ';
        } else {
          searchInput.value = activePrefix ? `${activePrefix} ${chosen.text}` : chosen.text;
        }
        searchInput.dispatchEvent(new Event('input'));
      }
    } else if (e.key === 'Escape') {
      suggestionsBox.hidden = true;
      selectedSuggestionIndex = -1;
    }
  });

  suggestionsBox.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.suggestion-item');
    if (!li) return;
    const idx = Number(li.dataset.index);
    if (currentSuggestions[idx]) {
      executeSuggestion(currentSuggestions[idx]);
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      suggestionsBox.hidden = true;
    }
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = searchInput.value.trim();
    if (!raw) return;

    if (raw.toLowerCase() === '!help') {
      renderHelpMenu();
      return;
    }

    if (!suggestionsBox.hidden && selectedSuggestionIndex >= 0) {
      executeSuggestion(currentSuggestions[selectedSuggestionIndex]);
      return;
    }

    if (!calcPreview.hidden && calcPreview.dataset.result) {
      navigator.clipboard.writeText(calcPreview.dataset.result);
      calcPreview.textContent = 'Copié !';
      setTimeout(() => {
        searchInput.value = calcPreview.dataset.result;
        searchInput.dispatchEvent(new Event('input'));
      }, 500);
      return;
    }

    const parts = raw.split(' ');
    const prefix = parts[0].toLowerCase();

    if (searchEngines[prefix]) {
      const query = parts.slice(1).join(' ');
      window.open(searchEngines[prefix].url + encodeURIComponent(query), '_blank');
    } else {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(raw), '_blank');
    }
  });
}
