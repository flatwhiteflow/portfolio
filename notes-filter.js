(() => {
  const entries = [...document.querySelectorAll('.entry')];
  if (!entries.length) return;

  const details = [
    { index: '03', tag: 'Applied AI', key: 'ai', date: 'Published 26 Oct 2026' },
    { index: '02', tag: 'Personal finance', key: 'finance', date: 'Published 23 Sep 2026' },
    { index: '01', tag: 'Design / engineering', key: 'design', date: 'Published 19 Sep 2026' }
  ];
  const controls = [
    { key: 'all', label: 'All notes' },
    { key: 'ai', label: 'Applied AI' },
    { key: 'design', label: 'Design / engineering' },
    { key: 'finance', label: 'Personal finance' }
  ];
  const filter = document.createElement('nav');
  filter.className = 'notes-filters';
  filter.setAttribute('aria-label', 'Filter notes by topic');

  entries.forEach((entry, i) => {
    const item = details[i];
    entry.dataset.tag = item.key;
    const meta = entry.querySelector('.meta');
    meta.dataset.index = item.index;
    meta.dataset.tag = item.tag;
    meta.dataset.date = item.date;
    meta.textContent = '';
  });

  const choose = key => {
    entries.forEach(entry => entry.classList.toggle('is-filtered', key !== 'all' && entry.dataset.tag !== key));
    [...filter.querySelectorAll('button')].forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === key)));
  };
  controls.forEach(({ key, label }) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.dataset.filter = key;
    button.setAttribute('aria-pressed', String(key === 'all'));
    button.addEventListener('click', () => choose(key));
    filter.append(button);
  });
  document.querySelector('.intro').after(filter);
})();
