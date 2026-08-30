const skills = [
  {
    slug: 'write-complete-project-readme', name: 'Write Complete Project README', category: 'Writing', status: 'Stable', version: '0.2.0', accent: 'bg-cobalt', mark: 'WR',
    summary: 'Turns repository evidence into a complete README that helps people understand, run, and trust the project.',
    command: 'npx --yes --package=github:montasim/write-complete-project-readme#v0.2.0 write-complete-project-readme',
    github: 'https://github.com/montasim/skills/tree/main/skills/write-complete-project-readme',
    readme: 'https://raw.githubusercontent.com/montasim/write-complete-project-readme/main/README.md',
    branch: 'main',
    uses: ['Repository documentation', 'README audits', 'Setup and usage guides'],
    trigger: 'Use when a repository needs a new README, a complete rewrite, or an evidence-backed documentation audit.',
    workflow: ['Inspect the repository and collect verified facts.', 'Map the audience and the document’s single job.', 'Draft the complete narrative from value to setup.', 'Verify every command, path, and claim before delivery.']
  },
  {
    slug: 'domain-modeling', name: 'Domain Modeling', category: 'Strategy', status: 'Stable', version: '1.1.0', accent: 'bg-orange', mark: 'DM',
    summary: 'Sharpens product language into a shared domain model teams and agents can reason with.',
    command: '$skill domain-modeling', uses: ['Ubiquitous language', 'Architecture decisions', 'Concept mapping'],
    trigger: 'Use when the vocabulary is fuzzy, business rules conflict, or an architectural decision needs durable context.',
    workflow: ['Collect the language already used by stakeholders.', 'Separate entities, events, policies, and value objects.', 'Resolve collisions and define boundaries.', 'Record decisions close to the project.']
  },
  {
    slug: 'frontend-design', name: 'Frontend Design', category: 'Design', status: 'Stable', version: '2.0.0', accent: 'bg-lime', mark: 'FD',
    summary: 'Guides intentional interface design with a specific visual thesis instead of template-shaped defaults.',
    command: '$skill frontend-design', uses: ['Landing pages', 'Product interfaces', 'Visual redesigns'],
    trigger: 'Use when building a new web interface or reshaping an existing one with a deliberate visual direction.',
    workflow: ['Ground the visual idea in the product’s world.', 'Set type, color, layout, and one signature move.', 'Build the responsive interface.', 'Critique the result at real viewport sizes.']
  },
  {
    slug: 'release-notes', name: 'Release Notes', category: 'Writing', status: 'Beta', version: '0.8.0', accent: 'bg-orange', mark: 'RN',
    summary: 'Converts commits and pull requests into release notes users can scan and act on.',
    command: '$skill release-notes', uses: ['Changelogs', 'Launch summaries', 'Upgrade notes'],
    trigger: 'Use when a set of technical changes needs a user-facing release story.',
    workflow: ['Identify the release boundary.', 'Group changes by user impact.', 'Call out breaking changes and migration steps.', 'Produce concise, linkable notes.']
  },
  {
    slug: 'repo-onboarding', name: 'Repo Onboarding', category: 'Workflow', status: 'Beta', version: '0.6.0', accent: 'bg-mist', mark: 'RO',
    summary: 'Maps an unfamiliar codebase into a practical starting point for a new contributor or agent.',
    command: '$skill repo-onboarding', uses: ['Codebase tours', 'First-task guidance', 'Dependency maps'],
    trigger: 'Use when someone needs to become productive in an unfamiliar repository quickly.',
    workflow: ['Trace runtime entry points.', 'Locate conventions, tests, and boundaries.', 'Map the change path for common tasks.', 'Write a compact onboarding route.']
  },
  {
    slug: 'skill-critic', name: 'Skill Critic', category: 'Strategy', status: 'Lab', version: '0.2.0', accent: 'bg-cobalt', mark: 'SC',
    summary: 'Stress-tests a skill for vague triggers, missing constraints, and instructions that fail in real work.',
    command: '$skill skill-critic', uses: ['Skill audits', 'Trigger testing', 'Instruction refinement'],
    trigger: 'Use before publishing a new skill or after a skill behaves inconsistently.',
    workflow: ['Test the trigger against close alternatives.', 'Find ambiguous or conflicting instructions.', 'Simulate difficult edge cases.', 'Recommend the smallest durable fixes.']
  }
];

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function showToast(message = 'Copied to clipboard') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 1800);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast(); }
  catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    showToast(copied ? 'Copied to clipboard' : 'Select and copy the command');
  }
}

function renderLibrary() {
  const grid = document.getElementById('skillGrid');
  if (!grid) return;
  const search = document.getElementById('searchInput');
  const empty = document.getElementById('emptyState');
  let active = 'All';

  const draw = () => {
    const term = search.value.toLowerCase().trim();
    const visible = skills.filter(skill => (active === 'All' || skill.category === active) && `${skill.name} ${skill.summary} ${skill.category}`.toLowerCase().includes(term));
    grid.innerHTML = visible.map(skill => `
      <article class="skill-card relative border-2 border-ink bg-white shadow-card min-h-[330px] flex flex-col">
        <div class="flex justify-between items-start p-6 border-b-2 border-ink">
          <span class="${skill.accent} border-2 border-ink w-14 h-14 grid place-items-center font-display font-bold text-lg ${skill.accent === 'bg-cobalt' ? 'text-white' : ''}">${skill.mark}</span>
          <span class="font-mono text-[10px] uppercase tracking-wider border border-ink px-2 py-1">${skill.status} · v${skill.version}</span>
        </div>
        <div class="p-6 flex flex-col flex-1">
          <p class="font-mono text-[11px] uppercase tracking-widest text-cobalt">${skill.category}</p>
          <h3 class="font-display text-2xl font-semibold tracking-tight mt-2">${skill.name}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/65">${skill.summary}</p>
          <div class="mt-auto pt-7 flex items-center justify-between">
            <a href="skill.html?skill=${skill.slug}" class="font-semibold text-sm underline decoration-2 underline-offset-4 hover:text-cobalt">View skill</a>
            <button data-copy="${escapeHTML(skill.command)}" class="w-10 h-10 rounded-full border-2 border-ink hover:bg-lime" aria-label="Copy ${skill.name} command">⌘</button>
          </div>
        </div>
      </article>`).join('');
    empty.classList.toggle('hidden', visible.length > 0);
    grid.classList.toggle('hidden', visible.length === 0);
  };

  document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
    active = button.dataset.filter;
    document.querySelectorAll('.chip').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
    draw();
  }));
  search.addEventListener('input', draw);
  document.getElementById('clearSearch').addEventListener('click', () => { search.value = ''; active = 'All'; document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === 'All'))); draw(); search.focus(); });
  grid.addEventListener('click', event => { const button = event.target.closest('[data-copy]'); if (button) copyText(button.dataset.copy); });
  draw();

  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); mobileMenu.classList.toggle('hidden'); });
}

function renderDetail() {
  const root = document.getElementById('detailRoot');
  if (!root) return;
  const slug = new URLSearchParams(location.search).get('skill') || skills[0].slug;
  const skill = skills.find(item => item.slug === slug) || skills[0];
  document.title = `${skill.name} — Skillfolio`;
  root.innerHTML = `
    <section class="docs-grid border-b-2 border-ink">
      <div class="mx-auto max-w-[1380px] px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-[minmax(0,1fr)_390px] gap-10 lg:gap-16 items-end">
        <div>
          <div class="flex flex-wrap items-center gap-3"><span class="font-mono text-xs uppercase tracking-wider text-cobalt">${skill.category}</span><span class="w-1 h-1 rounded-full bg-orange"></span><span class="font-mono text-xs">v${skill.version}</span><span class="font-mono text-[10px] uppercase tracking-wider border border-ink px-2 py-1 bg-white">${skill.status}</span></div>
          <h1 class="font-display text-[clamp(3.4rem,7vw,6.8rem)] leading-[.87] tracking-[-.065em] font-semibold mt-6 max-w-4xl">${skill.name}</h1>
          <p class="text-lg lg:text-xl leading-relaxed mt-7 max-w-3xl text-ink/70">${skill.summary}</p>
        </div>
        <aside class="bg-lime border-2 border-ink shadow-card p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4"><p class="font-mono text-[10px] uppercase tracking-widest">Install from GitHub</p><span class="font-mono text-[9px] bg-white border border-ink px-2 py-1">v${skill.version}</span></div>
          <code class="block font-mono text-[11px] leading-relaxed break-all mt-4 bg-ink text-white p-4">${skill.command}</code>
          <button id="copyCommand" class="w-full mt-4 border-2 border-ink bg-white py-3 font-semibold hover:bg-ink hover:text-white transition-colors">Copy install command</button>
        </aside>
      </div>
    </section>

    <section class="mx-auto max-w-[1380px] px-5 lg:px-10 py-10 lg:py-16 grid lg:grid-cols-[230px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
      <aside class="lg:sticky lg:top-24">
        <p class="font-mono text-[10px] uppercase tracking-[.18em] text-ink/45">Repository</p>
        <div class="mt-4 border-t-2 border-ink divide-y divide-ink/15 text-sm">
          <div class="py-4 flex justify-between gap-4"><span class="text-ink/55">Owner</span><strong>${skill.github ? 'montasim' : 'Not connected'}</strong></div>
          <div class="py-4 flex justify-between gap-4"><span class="text-ink/55">Branch</span><code class="font-mono text-xs">${skill.branch || '—'}</code></div>
          <div class="py-4 flex justify-between gap-4"><span class="text-ink/55">Document</span><code class="font-mono text-xs">README.md</code></div>
        </div>
        ${skill.github ? `<a href="${skill.github}" target="_blank" rel="noreferrer" class="mt-5 w-full inline-flex items-center justify-between border-2 border-ink bg-white px-4 py-3 font-semibold text-sm hover:bg-ink hover:text-white transition-colors">View on GitHub <span aria-hidden="true">↗</span></a>` : ''}
        <div class="mt-8 hidden lg:block"><p class="font-mono text-[10px] uppercase tracking-[.18em] text-ink/45">Good for</p><ul class="mt-3 space-y-2 text-sm text-ink/70">${skill.uses.map(use => `<li class="flex gap-2"><span class="text-orange">◆</span>${use}</li>`).join('')}</ul></div>
      </aside>

      <article class="min-w-0 bg-white border border-ink/15 rounded-2xl shadow-[0_18px_60px_rgba(23,32,59,.08)] overflow-hidden">
        <header class="border-b border-ink/15 bg-[#FAFBF8] px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3"><span class="w-9 h-9 grid place-items-center rounded-lg bg-cobalt text-white font-mono text-xs">MD</span><div><p class="font-semibold text-sm">README.md</p><p id="readmeStatus" class="font-mono text-[9px] uppercase tracking-wider text-ink/45">Loading from GitHub</p></div></div>
          ${skill.github ? `<a href="${skill.github}/blob/${skill.branch}/README.md" target="_blank" rel="noreferrer" class="font-mono text-[10px] uppercase tracking-wider underline underline-offset-4 hover:text-cobalt">View source ↗</a>` : ''}
        </header>
        <div id="readmeContent" class="readme-content p-6 sm:p-9 lg:p-12">
          <div class="space-y-4" aria-label="Loading README"><div class="readme-skeleton h-10 rounded w-2/3"></div><div class="readme-skeleton h-4 rounded w-full"></div><div class="readme-skeleton h-4 rounded w-5/6"></div><div class="readme-skeleton h-40 rounded mt-8"></div></div>
        </div>
      </article>
    </section>`;

  document.getElementById('copyCommand').addEventListener('click', () => copyText(skill.command));
  loadReadme(skill);
}

async function loadReadme(skill) {
  const content = document.getElementById('readmeContent');
  const status = document.getElementById('readmeStatus');
  if (!content || !status) return;
  if (!skill.readme) {
    status.textContent = 'Repository not connected';
    content.innerHTML = `<div class="py-12 text-center"><span class="inline-grid place-items-center w-14 h-14 rounded-full bg-mist font-mono font-bold">MD</span><h2 class="font-display text-3xl font-semibold mt-5">README not connected yet.</h2><p class="mt-3 text-ink/60 max-w-md mx-auto">Add this skill’s GitHub repository and raw README URL to show its documentation here.</p></div>`;
    return;
  }
  try {
    const response = await fetch(skill.readme, { headers: { Accept: 'text/plain' } });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const markdown = await response.text();
    if (!window.marked || !window.DOMPurify) throw new Error('Markdown renderer did not load');
    marked.setOptions({ gfm: true, breaks: false });
    const safeHTML = DOMPurify.sanitize(marked.parse(markdown), { ADD_ATTR: ['target'] });
    content.innerHTML = safeHTML;
    rewriteReadmeLinks(content, skill);
    status.textContent = `Synced from GitHub · ${skill.branch}`;
  } catch (error) {
    status.textContent = 'Could not load README';
    content.innerHTML = `<div class="py-12 text-center"><span class="inline-grid place-items-center w-14 h-14 rounded-full bg-orange text-white font-mono font-bold">!</span><h2 class="font-display text-3xl font-semibold mt-5">README unavailable.</h2><p class="mt-3 text-ink/60 max-w-lg mx-auto">The GitHub document could not be loaded. Check the connection or open the source directly.</p><a href="${skill.github}" target="_blank" rel="noreferrer" class="mt-6 inline-flex border-2 border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-white">Open GitHub ↗</a></div>`;
    console.error(error);
  }
}

function rewriteReadmeLinks(container, skill) {
  container.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (!/^(https?:|mailto:)/i.test(href)) link.href = `${skill.github}/blob/${skill.branch}/${href.replace(/^\.\//, '')}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
  });
  container.querySelectorAll('img[src]').forEach(image => {
    const src = image.getAttribute('src');
    if (src && !/^(https?:|data:)/i.test(src)) image.src = `${skill.github.replace('github.com', 'raw.githubusercontent.com')}/${skill.branch}/${src.replace(/^\.\//, '')}`;
  });
}

renderLibrary();
renderDetail();
