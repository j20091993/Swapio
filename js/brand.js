document.addEventListener('DOMContentLoaded', () => {
  initLayout('');

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const brand = slug && BRANDS[slug];

  if (!brand) {
    document.getElementById('brand-content').classList.add('hidden');
    document.getElementById('brand-not-found').classList.remove('hidden');
    document.title = 'Brand Not Found — Swapio';
    return;
  }

  const origin = getSiteOrigin();
  const url = `${origin}/brand.html?slug=${encodeURIComponent(slug)}`;
  const swapUrl = `index.html?brand=${encodeURIComponent(brand.name)}#swap`;

  document.title = `${brand.title} — Swapio`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', brand.description);
  setMeta('property', 'og:title', `${brand.title} — Swapio`);
  setMeta('property', 'og:description', brand.description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', `${brand.title} — Swapio`);
  setMeta('name', 'twitter:description', brand.description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url;

  document.getElementById('brand-hero-bg').className =
    `h-48 sm:h-56 bg-gradient-to-br ${brand.gradient} rounded-2xl mb-8`;
  document.getElementById('brand-title').textContent = brand.title;
  document.getElementById('brand-intro').textContent = brand.intro;
  document.getElementById('brand-highlights').innerHTML = brand.highlights
    .map((item) => `<li>${item}</li>`)
    .join('');
  document.getElementById('brand-cta').href = swapUrl;
});