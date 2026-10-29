/**
 * feeds.js - Flux d'actualités en direct (F1, Football, Tech)
 */
const rssSources = {
  f1: 'https://dwh.lequipe.fr/api/edito/rss?path=/Formule-1/',
  foot: 'https://dwh.lequipe.fr/api/edito/rss?path=/Football/'
};

async function fetchRssWithFallback(rssUrl) {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length) {
        return data.items.slice(0, 5).map((i) => ({ title: i.title, link: i.link }));
      }
    }
  } catch {}

  const rawRes = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
  );
  const xmlText = await rawRes.text();
  const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
  const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 5);
  if (!items.length) throw new Error('Empty RSS');
  return items.map((el) => ({
    title: el.querySelector('title')?.textContent || 'Actualité',
    link: el.querySelector('link')?.textContent || '#'
  }));
}

async function loadFeed(category) {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;

  feedList.innerHTML = '<li class="feed-skeleton">Récupération des dépêches...</li>';
  try {
    if (category === 'tech') {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = (await res.json()).slice(0, 5);
      const items = await Promise.all(
        ids.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
        )
      );
      feedList.innerHTML = items
        .map(
          (item) => `
          <li>
            <a href="${item.url || `https://news.ycombinator.com/item?id=${item.id}`}" target="_blank" rel="noopener">
              <span class="feed-score">TECH</span>
              <span class="feed-title">${item.title}</span>
            </a>
          </li>`
        )
        .join('');
    } else {
      const articles = await fetchRssWithFallback(rssSources[category]);
      const tag = category === 'f1' ? 'F1' : 'FOOT';
      feedList.innerHTML = articles
        .map(
          (item) => `
          <li>
            <a href="${item.link}" target="_blank" rel="noopener">
              <span class="feed-score">${tag}</span>
              <span class="feed-title">${item.title}</span>
            </a>
          </li>`
        )
        .join('');
    }
  } catch {
    feedList.innerHTML = '<li class="feed-skeleton">Flux temporairement indisponible.</li>';
  }
}

function initFeeds() {
  const feedTabs = document.querySelectorAll('.tab-btn');
  feedTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      feedTabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadFeed(btn.dataset.feed);
    });
  });

  loadFeed('f1');
}
