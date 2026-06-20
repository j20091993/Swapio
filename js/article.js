document.addEventListener('DOMContentLoaded', () => {
  initLayout('articles');

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const article = slug && ARTICLES[slug];

  if (!article) {
    document.getElementById('article-content').classList.add('hidden');
    document.getElementById('article-not-found').classList.remove('hidden');
    document.title = 'Article Not Found — Swapio';
    return;
  }

  const excerpt = getArticleExcerpt(article);
  const origin = getSiteOrigin();
  const url = `${origin}/article.html?slug=${encodeURIComponent(slug)}`;

  document.title = `${article.title} — Swapio`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', excerpt);
  setMeta('property', 'og:title', `${article.title} — Swapio`);
  setMeta('property', 'og:description', excerpt);
  setMeta('property', 'og:type', 'article');
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', `${article.title} — Swapio`);
  setMeta('name', 'twitter:description', excerpt);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url;

  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: excerpt,
    author: { '@type': 'Organization', name: 'Swapio' },
    publisher: { '@type': 'Organization', name: 'Swapio' },
    mainEntityOfPage: url,
  });
  document.head.appendChild(schema);

  document.getElementById('article-title').textContent = article.title;
  document.getElementById('article-read-time').textContent = article.readTime;
  document.getElementById('article-body').innerHTML = article.content;
});