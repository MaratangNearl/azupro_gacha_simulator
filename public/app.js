import { firstReward, fourStarGuarantee, fourStarRate, items, observations, rewardInterval, standardCharacters } from './catalog.js';
import { draw, emptyProgress, nextFiveRate, nextRewardAt, restoreFiveCounts, restoreFourCounts, restoreFourPlusPity, summarizeFiveStars } from './gacha.js';
import { bannerName, decimal, itemName, languages, number, observationName, percent, pullCount, resolveLanguage, setLanguage, t } from './localization.js';

const storageKey = 'azur-promilia-observation-v1';
const languageKey = 'azur-promilia-language';
const observationIds = Object.keys(observations);
const standardIds = new Set(standardCharacters.map(item => item.id));
const $ = id => document.getElementById(id);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"/></svg>`;

function initialLanguage() {
  let saved;
  try {
    saved = localStorage.getItem(languageKey);
  } catch {
    // The browser preference still applies without storage.
  }
  return resolveLanguage([...navigator.languages, navigator.language].filter(Boolean), saved);
}

function renderThemeLabel() {
  const mode = t(document.documentElement.dataset.theme === 'dark' ? 'themeLight' : 'themeDark');
  $('theme-label').textContent = mode;
  $('theme-toggle').title = t('themeChange', { mode });
  $('theme-toggle').setAttribute('aria-label', $('theme-toggle').title);
}

function renderLanguage(locale) {
  setLanguage(locale);
  document.documentElement.lang = locale;
  $('language-select').value = locale;
  document.title = `${t('heading')} · ${t('brand')}`;
  document.querySelector('meta[name="description"]').content = t('intro');
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll('[data-i18n-label]')) {
    element.setAttribute('aria-label', t(element.dataset.i18nLabel));
  }
  $('banner-stars').setAttribute('aria-label', t('rarity', { n: 5 }));
  $('observation-tabs').innerHTML = observationIds.map(id => `
    <button class="observation-tab" id="tab-${id}" data-observation="${id}" role="tab" aria-controls="observation-panel" type="button">
      ${icon(observations[id].icon)}<span><strong>${observationName(id)}</strong><small>${t(`${id}Kind`)}</small></span>
    </button>`).join('');
  $('announcement').textContent = '';
  renderThemeLabel();
  render();
}

function readState() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey));
  } catch {
    // The simulator also runs when browser storage is unavailable.
  }

  const progress = {};
  const selected = {};
  const count = (value, max = Infinity) => Number.isSafeInteger(value) && value >= 0 && value <= max ? value : 0;
  for (const id of observationIds) {
    const observation = observations[id];
    const stored = saved?.progress?.[id];
    const state = emptyProgress();
    state.total = count(stored?.total, observation.limit);
    state.pity = count(stored?.pity, Math.min(observation.odds.cap - 1, state.total));
    state.fiveCount = count(stored?.fiveCount, state.total);

    if (observation.reward && Array.isArray(stored?.rewards)) {
      state.rewards = stored.rewards.filter(reward => Number.isSafeInteger(reward?.at)
        && reward.at >= firstReward && reward.at <= state.total
        && (reward.at - firstReward) % rewardInterval === 0
        && (reward.itemId === null || standardIds.has(reward.itemId)));
    }

    for (const banner of observation.banners) {
      const result = stored?.latest?.[banner.id];
      if (Array.isArray(result) && (result.length === 1 || result.length === 10)
        && result.every(itemId => Object.hasOwn(items, itemId))) {
        state.latest[banner.id] = result;
      }
    }

    state.fiveByItem = restoreFiveCounts(observation, state, stored?.fiveByItem);
    state.fourPlusPity = restoreFourPlusPity(state, stored?.fourPlusPity);
    restoreFourCounts(observation, state, stored?.fourByBanner, stored?.fourHistoryPartial);
    progress[id] = state;
    selected[id] = observation.banners.find(banner => banner.id === saved?.selected?.[id])?.id
      ?? observation.banners[0].id;
  }

  return { progress, selected, active: observationIds.includes(saved?.active) ? saved.active : 'fate' };
}

const state = readState();
let pendingReward = null;
let selectedRewardId = null;
let resetObservationId = null;

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Progress stays available in memory on this page.
  }
}

function current() {
  const observation = observations[state.active];
  const banner = observation.banners.find(candidate => candidate.id === state.selected[state.active]);
  return { observation, banner, progress: state.progress[state.active] };
}

function renderTabs() {
  for (const id of observationIds) {
    const active = id === state.active;
    const tab = $(`tab-${id}`);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  $('observation-panel').setAttribute('aria-labelledby', `tab-${state.active}`);
}

function bannerDescription(id, observation) {
  const key = { order: 'orderDescription', eternity: 'eternityDescription', leap: 'leapDescription' }[id] ?? 'featuredGuarantee';
  return t(key, { count: pullCount(observation.limit ?? observation.odds.cap) });
}

function renderBanner() {
  const { observation, banner } = current();
  $('hero').dataset.theme = banner.theme;
  $('hero').dataset.art = banner.id;
  $('banner-image').src = `/assets/banners/${banner.id}.jpg`;
  $('banner-label').textContent = bannerName(banner, state.active);
  $('banner-title').textContent = banner.target ? itemName(banner.target) : observationName(state.active);
  $('banner-description').textContent = bannerDescription(state.active, observation);
  $('banner-options').innerHTML = observation.banners.length < 2 ? '' : observation.banners.map(option => `
    <button class="banner-option" type="button" data-banner="${option.id}" aria-pressed="${option.id === banner.id}">${itemName(option.target)}</button>
  `).join('');
}

function renderProgress() {
  const { observation, progress } = current();
  const { base, cap } = observation.odds;
  const rate = nextFiveRate(observation, progress);
  const max = observation.limit ?? cap;
  const meterValue = observation.limit ? progress.total : progress.pity;
  const remaining = observation.limit ? observation.limit - progress.total : Infinity;
  $('total-pulls').textContent = pullCount(progress.total);
  $('base-rate').textContent = percent(base);
  $('next-rate').textContent = rate === null ? '—' : percent(rate);
  $('pity-label').textContent = t(observation.limit ? 'beginnerProgress' : 'pityLabel');
  $('pity-value').textContent = `${number(meterValue)} / ${pullCount(max)}`;
  $('pity-meter').max = max;
  $('pity-meter').value = meterValue;
  $('pull-one').disabled = remaining < 1;
  $('pull-ten').disabled = remaining < 10;
  $('reset-open').disabled = progress.total === 0;
  $('rarity-note').hidden = remaining < 1;
  $('rarity-note').textContent = t('fourPlusGuarantee', { count: pullCount(fourStarGuarantee - progress.fourPlusPity) });

  if (!remaining) {
    $('rate-note').textContent = t('beginnerEnded');
  } else if (rate === 100) {
    $('rate-note').textContent = t('nextGuaranteed');
  } else if (rate > base) {
    $('rate-note').textContent = t('rateBoost', { delta: decimal(rate - base) });
  } else if (observation.limit && progress.fiveCount) {
    $('rate-note').textContent = t('beginnerAcquired', { count: pullCount(remaining) });
  } else {
    $('rate-note').textContent = t('fiveGuarantee', { count: pullCount(max - meterValue) });
  }
}

function itemArt(item) {
  return item.image
    ? `<img src="${item.image}" alt="" width="160" height="160">`
    : `<svg class="icon item-emblem" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${item.id.startsWith('weapon') ? 'sword' : 'order'}"/></svg>`;
}

function itemContent(item) {
  return `<span class="item-frame">${itemArt(item)}<span class="item-stars" role="img" aria-label="${t('rarity', { n: item.rarity })}">
      <span class="item-star-glyphs" aria-hidden="true">${'★'.repeat(item.rarity)}</span>
      <span class="item-rarity-text" aria-hidden="true">${t('rarityBadge', { n: item.rarity })}</span>
    </span></span>
    <span class="item-name">${itemName(item)}</span>`;
}

function renderResults(animate = false) {
  const { banner, progress } = current();
  const result = progress.latest[banner.id] ?? [];
  const grid = $('result-grid');
  const summary = $('result-summary');
  grid.hidden = !result.length;
  summary.hidden = !result.length;
  $('empty-results').hidden = Boolean(result.length);
  grid.classList.toggle('single', result.length === 1);
  grid.classList.toggle('reveal', animate);

  const counts = { 3: 0, 4: 0, 5: 0 };
  grid.innerHTML = result.map((itemId, index) => {
    const item = items[itemId];
    counts[item.rarity] += 1;
    return `<li class="item-card rarity-${item.rarity}" style="--position:${index}">${itemContent(item)}</li>`;
  }).join('');
  summary.innerHTML = [5, 4, 3].map(rarity =>
    `<span class="summary-count rarity-${rarity}">${t('rarityBadge', { n: rarity })} ${number(counts[rarity])}</span>`).join('');
  return counts;
}

function renderCollectionList(list, counts, rarity) {
  list.hidden = Object.keys(counts).length === 0;
  list.innerHTML = Object.values(items).filter(item => counts[item.id]).map(item => `
    <li class="collection-entry rarity-${rarity}">
      <span class="item-frame">${itemArt(item)}</span>
      <span class="collection-name">${itemName(item)}</span>
      <strong class="collection-count">${t('copies', { n: number(counts[item.id]) })}</strong>
    </li>
  `).join('');
}

function renderCollection() {
  const { observation, banner, progress } = current();
  const { counts, total, unknown } = summarizeFiveStars(progress, banner.target?.id);
  const note = $('collection-note');
  $('collection-heading').textContent = t('collectionFive', { name: banner.target ? itemName(banner.target) : observationName(state.active) });
  $('collection-total').textContent = t('totalCopies', { count: t('copies', { n: number(total) }) });
  $('collection-empty').hidden = total > 0 || unknown > 0;
  note.hidden = !unknown;
  note.textContent = unknown ? t('collectionUnknown', { n: number(unknown) }) : '';
  renderCollectionList($('collection-list'), counts, 5);

  const tracksCharacters = observation.type === 'character';
  $('collection-four').hidden = !tracksCharacters;
  if (!tracksCharacters) return;
  const fourCounts = progress.fourByBanner[banner.id] ?? {};
  const fourTotal = Object.values(fourCounts).reduce((sum, count) => sum + count, 0);
  $('collection-four-total').textContent = t('totalCopies', { count: t('copies', { n: number(fourTotal) }) });
  $('collection-four-empty').hidden = fourTotal > 0;
  $('collection-four-note').hidden = !progress.fourHistoryPartial || !progress.latest[banner.id];
  renderCollectionList($('collection-four-list'), fourCounts, 4);
}

function renderReward() {
  const { observation, progress } = current();
  $('reward-section').hidden = !observation.reward;
  if (!observation.reward) return;

  const available = progress.rewards.filter(reward => !reward.itemId).length;
  const claimed = progress.rewards.filter(reward => reward.itemId);
  const nextAt = nextRewardAt(progress.total);
  const status = [available
    ? t('rewardAvailable', { count: t('copies', { n: number(available) }) })
    : t('rewardNext', { count: pullCount(nextAt - progress.total), total: pullCount(nextAt) })];
  if (claimed.length) status.push(t('rewardRecent', { name: itemName(items[claimed.at(-1).itemId]) }));
  $('reward-status').textContent = status.join(' · ');
  $('reward-open').disabled = !available;
}

function render() {
  renderTabs();
  renderBanner();
  renderProgress();
  renderReward();
  renderResults();
  renderCollection();
}

function selectObservation(id) {
  if (state.active === id) return;
  state.active = id;
  saveState();
  render();
}

$('language-select').innerHTML = Object.entries(languages).map(([code, label]) =>
  `<option value="${code}" lang="${code}">${label}</option>`).join('');
$('language-select').addEventListener('change', event => {
  const locale = event.target.value;
  if (!Object.hasOwn(languages, locale)) return;
  renderLanguage(locale);
  try {
    localStorage.setItem(languageKey, locale);
  } catch {
    // Keep the language selected for this page when storage is unavailable.
  }
});
document.addEventListener('azur-themechange', renderThemeLabel);

$('observation-tabs').addEventListener('click', event => {
  const tab = event.target.closest('button[data-observation]');
  if (tab) selectObservation(tab.dataset.observation);
});

$('observation-tabs').addEventListener('keydown', event => {
  const index = observationIds.indexOf(state.active);
  const last = observationIds.length - 1;
  const destination = { ArrowLeft: index ? index - 1 : last, ArrowRight: index === last ? 0 : index + 1, Home: 0, End: last };
  if (!Object.hasOwn(destination, event.key)) return;
  event.preventDefault();
  const id = observationIds[destination[event.key]];
  selectObservation(id);
  $(`tab-${id}`).focus();
});

$('banner-options').addEventListener('click', event => {
  const option = event.target.closest('button[data-banner]');
  if (!option || state.selected[state.active] === option.dataset.banner) return;
  state.selected[state.active] = option.dataset.banner;
  saveState();
  renderBanner();
  renderResults();
  renderCollection();
  $('banner-options').querySelector('[aria-pressed="true"]').focus();
});

function pull(count) {
  const { observation, banner, progress } = current();
  const result = draw(observation, banner, progress, count);
  if (!result.length) return;
  saveState();
  renderProgress();
  renderReward();
  const counts = renderResults(true);
  if (counts[5] || counts[4]) renderCollection();
  $('announcement').textContent = t('pullAnnouncement', {
    count: pullCount(progress.total), five: number(counts[5]), four: number(counts[4]), three: number(counts[3]),
  });
  if (matchMedia('(max-width: 760px)').matches) {
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    $('result-grid').scrollIntoView({ block: 'nearest', behavior });
  }
}

$('pull-one').addEventListener('click', () => pull(1));
$('pull-ten').addEventListener('click', () => pull(10));

$('guide-open').addEventListener('click', () => {
  const { observation } = current();
  const { base, soft, high, cap } = observation.odds;
  const rows = observation.limit
    ? [[pullCount(1, observation.limit - 1), percent(base)], [pullCount(observation.limit), t('guideGuaranteed')]]
    : [
      [pullCount(1, soft - 1), percent(base)],
      [pullCount(soft, high - 1), t('guideIncrement', { delta: number(2) })],
      [pullCount(high, cap - 1), t('guideIncrement', { delta: number(8) })],
      [pullCount(cap), percent(100)],
    ];
  const guideKeys = { fate: 'guideFate', bond: 'guideBond', order: 'guideOrder', eternity: 'guideEternity', leap: 'guideLeap' };
  const extra = t(guideKeys[state.active], {
    first: pullCount(firstReward),
    interval: pullCount(rewardInterval),
    name: itemName(items.peipei),
    count: pullCount(observation.limit ?? cap),
  });
  const reset = t(observation.limit ? 'guideSeparate' : 'guidePityReset');
  $('guide-content').innerHTML = `
    <p>${t('guideIntro', { name: observationName(state.active) })} ${reset}</p>
    <table class="guide-table"><thead><tr><th scope="col">${t('guideRound')}</th><th scope="col">${t('guideRate')}</th></tr></thead>
    <tbody>${rows.map(([range, rate]) => `<tr><td>${range}</td><td>${rate}</td></tr>`).join('')}</tbody></table>
    <p class="guide-note">${extra}</p>
    <p class="guide-note">${t('guideFour', { count: pullCount(fourStarGuarantee - 1), rate: percent(fourStarRate) })}</p>
    <p class="guide-note">${t('guideEqual')}</p>
  `;
  $('guide-dialog').showModal();
});

$('reset-open').addEventListener('click', () => {
  resetObservationId = state.active;
  const observation = observations[resetObservationId];
  const scope = t(observation.banners.length > 1 ? 'resetPair' : 'resetSingle', { name: observationName(resetObservationId) });
  const description = t('resetDescription', { scope });
  $('reset-description').textContent = observation.reward ? `${description} ${t('resetRewards')}` : description;
  $('reset-dialog').returnValue = '';
  $('reset-dialog').showModal();
});

$('reset-dialog').addEventListener('close', event => {
  if (event.target.returnValue !== 'reset' || !resetObservationId) return;
  state.progress[resetObservationId] = emptyProgress();
  saveState();
  renderProgress();
  renderReward();
  renderResults();
  renderCollection();
  $('announcement').textContent = t('resetDone', { name: observationName(resetObservationId) });
  resetObservationId = null;
});

$('reward-open').addEventListener('click', () => {
  pendingReward = state.progress.order.rewards.find(reward => !reward.itemId);
  if (!pendingReward) return;
  selectedRewardId = null;
  $('reward-claim').disabled = true;
  $('reward-dialog-description').textContent = t('rewardDialogDescription', { count: pullCount(pendingReward.at) });
  $('reward-choices').innerHTML = standardCharacters.map(item => `
    <button class="item-card rarity-5 reward-option" type="button" aria-pressed="false" data-item="${item.id}">${itemContent(item)}</button>
  `).join('');
  $('reward-dialog').showModal();
});

$('reward-choices').addEventListener('click', event => {
  const option = event.target.closest('button[data-item]');
  if (!option) return;
  selectedRewardId = option.dataset.item;
  for (const button of $('reward-choices').children) {
    button.setAttribute('aria-pressed', String(button === option));
  }
  $('reward-claim').disabled = false;
});

$('reward-claim').addEventListener('click', () => {
  if (!pendingReward || pendingReward.itemId || !standardIds.has(selectedRewardId)) return;
  pendingReward.itemId = selectedRewardId;
  $('announcement').textContent = t('rewardClaimed', { name: itemName(items[selectedRewardId]) });
  $('reward-dialog').close();
  saveState();
  renderReward();
  renderCollection();
});

renderLanguage(initialLanguage());
