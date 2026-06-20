const ARTICLE_CATEGORY_ICONS = {
  Guide: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  Safety: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
  Tips: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  Payouts: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>',
  FAQ: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  Lifestyle: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>',
};

function getArticleCardIcon(category) {
  const path = ARTICLE_CATEGORY_ICONS[category] || ARTICLE_CATEGORY_ICONS.Guide;
  const lightIcon = category === 'Payouts';
  return `<svg class="w-12 h-12 ${lightIcon ? 'text-swapio-dark/40' : 'text-white/80'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${path}</svg>`;
}

function renderArticleGrid() {
  const grid = document.getElementById('article-grid');
  if (!grid || typeof ARTICLES === 'undefined') return;

  grid.innerHTML = Object.entries(ARTICLES).map(([slug, article]) => `
    <a href="article.html?slug=${encodeURIComponent(slug)}" class="article-card">
      <div class="h-40 bg-gradient-to-br ${article.gradient} flex items-center justify-center">
        ${getArticleCardIcon(article.category)}
      </div>
      <div class="p-6">
        <span class="text-xs font-medium text-swapio-light uppercase tracking-wider">${article.category}</span>
        <h2 class="text-lg font-bold text-swapio-dark mt-2 mb-2">${article.title}</h2>
        <p class="text-gray-500 text-sm leading-relaxed">${getArticleExcerpt(article)}</p>
        <p class="read-more mt-4">Read article →</p>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout('articles');
  renderArticleGrid();
});