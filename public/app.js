import { firstReward, fourStarRate, items, observations, rewardInterval, standardCharacters } from './catalog.js';
import { draw, emptyProgress, nextFiveRate, nextRewardAt, restoreFiveCounts, summarizeFiveStars } from './gacha.js';

const storageKey = 'azur-promilia-observation-v1';
const observationIds = Object.keys(observations);
const standardIds = new Set(standardCharacters.map(item => item.id));
const $ = id => document.getElementById(id);
const formatNumber = new Intl.NumberFormat('ko-KR').format;
const percent = rate => `${rate.toFixed(1)}%`;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"/></svg>`;

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
  if (id === 'order') return `최대 ${observation.odds.cap}회 내 5성 확정. 누적 관측으로 상시 5성 선택권을 얻습니다.`;
  if (id === 'eternity') return '원하는 상시 5성 무기를 지정하면 5성 획득 시 해당 무기가 확정됩니다.';
  if (id === 'leap') return `최대 ${observation.limit}회 내 상시 5성 캐릭터 1명 확정.`;
  return `5성 등장 시 이 배너의 픽업 대상이 확정됩니다. 최대 ${observation.odds.cap}회 안에 획득할 수 있습니다.`;
}

function renderBanner() {
  const { observation, banner } = current();
  $('hero').dataset.theme = banner.theme;
  $('hero').dataset.art = banner.id;
  $('banner-image').src = `/assets/banners/${banner.id}.jpg`;
  $('banner-label').textContent = banner.label;
  $('banner-title').textContent = banner.target?.name ?? observation.name;
  $('banner-description').textContent = bannerDescription(state.active, observation);
  $('banner-options').innerHTML = observation.banners.length < 2 ? '' : observation.banners.map(option => `
    <button class="banner-option" type="button" data-banner="${option.id}" aria-pressed="${option.id === banner.id}">${option.target.name}</button>
  `).join('');
}

function renderProgress() {
  const { observation, progress } = current();
  const { base, cap } = observation.odds;
  const rate = nextFiveRate(observation, progress);
  const max = observation.limit ?? cap;
  const meterValue = observation.limit ? progress.total : progress.pity;
  const remaining = observation.limit ? observation.limit - progress.total : Infinity;
  $('total-pulls').textContent = `${formatNumber(progress.total)}회`;
  $('base-rate').textContent = percent(base);
  $('next-rate').textContent = rate === null ? '—' : percent(rate);
  $('pity-label').textContent = observation.limit ? '도약 관측 진행도' : '5성 천장 진행도';
  $('pity-value').textContent = `${meterValue} / ${max}회`;
  $('pity-meter').max = max;
  $('pity-meter').value = meterValue;
  $('pull-one').disabled = remaining < 1;
  $('pull-ten').disabled = remaining < 10;
  $('reset-open').disabled = progress.total === 0;

  if (!remaining) {
    $('rate-note').textContent = '도약 관측이 종료되었습니다.';
  } else if (rate === 100) {
    $('rate-note').textContent = '다음 관측에서 5성이 확정됩니다.';
  } else if (rate > base) {
    $('rate-note').textContent = `5성 확률 보정 +${(rate - base).toFixed(1)}%p 적용 중`;
  } else if (observation.limit && progress.fiveCount) {
    $('rate-note').textContent = `5성 획득 완료 · 관측 종료까지 ${remaining}회`;
  } else {
    $('rate-note').textContent = `5성 확정까지 최대 ${max - meterValue}회`;
  }
}

function itemArt(item) {
  return item.image
    ? `<img src="${item.image}" alt="" width="160" height="160">`
    : `<svg class="icon item-emblem" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${item.id.startsWith('weapon') ? 'sword' : 'order'}"/></svg>`;
}

function itemContent(item) {
  return `<span class="item-frame">${itemArt(item)}<span class="item-stars" aria-label="${item.rarity}성">${'★'.repeat(item.rarity)}</span></span>
    <span class="item-name">${item.name}</span>`;
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
    `<span class="summary-count rarity-${rarity}">${rarity}성 ${counts[rarity]}</span>`).join('');
  return counts;
}

function renderCollection() {
  const { counts, total, unknown } = summarizeFiveStars(state.progress);
  const list = $('collection-list');
  const note = $('collection-note');
  $('collection-total').textContent = `총 ${formatNumber(total)}회`;
  list.hidden = Object.keys(counts).length === 0;
  $('collection-empty').hidden = total > 0;
  note.hidden = !unknown;
  note.textContent = unknown ? `이전 기록에서 획득 대상을 확인할 수 없는 5성이 ${formatNumber(unknown)}개 있습니다.` : '';
  list.innerHTML = Object.values(items).filter(item => counts[item.id]).map(item => `
    <li class="collection-entry rarity-5">
      <span class="item-frame">${itemArt(item)}</span>
      <span class="collection-name">${item.name}</span>
      <strong class="collection-count">${formatNumber(counts[item.id])}회</strong>
    </li>
  `).join('');
}

function renderReward() {
  const { observation, progress } = current();
  $('reward-section').hidden = !observation.reward;
  if (!observation.reward) return;

  const available = progress.rewards.filter(reward => !reward.itemId).length;
  const claimed = progress.rewards.filter(reward => reward.itemId);
  const nextAt = nextRewardAt(progress.total);
  const status = [available ? `선택 가능 ${available}회` : `다음 보상까지 ${formatNumber(nextAt - progress.total)}회 (누적 ${formatNumber(nextAt)}회)`];
  if (claimed.length) status.push(`최근 획득 ${items[claimed.at(-1).itemId].name}`);
  $('reward-status').textContent = status.join(' · ');
  $('reward-open').disabled = !available;
}

function render() {
  renderTabs();
  renderBanner();
  renderProgress();
  renderReward();
  renderResults();
}

function selectObservation(id) {
  if (state.active === id) return;
  state.active = id;
  saveState();
  render();
}

$('observation-tabs').innerHTML = observationIds.map(id => {
  const { name, kind, icon: type } = observations[id];
  return `<button class="observation-tab" id="tab-${id}" data-observation="${id}" role="tab" aria-controls="observation-panel" type="button">
    ${icon(type)}<span><strong>${name}</strong><small>${kind}</small></span>
  </button>`;
}).join('');

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
  if (counts[5]) renderCollection();
  $('announcement').textContent = `누적 ${formatNumber(progress.total)}회. 이번 관측에서 5성 ${counts[5]}개, 4성 ${counts[4]}개, 3성 ${counts[3]}개를 획득했습니다.`;
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
    ? [[`1~${observation.limit - 1}회`, percent(base)], [`${observation.limit}회`, '미획득 시 100%']]
    : [[`1~${soft - 1}회`, percent(base)], [`${soft}~${high - 1}회`, '매회 +2%p'], [`${high}~${cap - 1}회`, '매회 +8%p'], [`${cap}회`, '100%']];
  const extra = {
    fate: '한정 캐릭터 배너 사이에 누적 관측과 천장 진행도를 공유합니다.',
    bond: '한정 무기 배너 사이에 누적 관측과 천장 진행도를 공유합니다.',
    order: `누적 ${firstReward}회에 첫 캐릭터 선택권을 받고, 이후 ${rewardInterval}회마다 선택권을 하나 더 받습니다.`,
    eternity: '지정한 상시 5성 무기를 획득하면 결과에 5성 무기로 표시합니다.',
    leap: `페페를 제외한 상시 5성 캐릭터가 등장합니다. ${observation.limit}회 관측을 마치면 배너가 종료됩니다.`,
  };
  const reset = observation.limit ? '도약 관측은 다른 관측과 진행도를 공유하지 않습니다.' : '5성을 뽑으면 천장 진행도가 초기화됩니다.';
  $('guide-content').innerHTML = `
    <p>${observation.name}의 5성 획득 확률입니다. ${reset}</p>
    <table class="guide-table"><thead><tr><th scope="col">천장 기준 회차</th><th scope="col">5성 획득 확률</th></tr></thead>
    <tbody>${rows.map(([range, rate]) => `<tr><td>${range}</td><td>${rate}</td></tr>`).join('')}</tbody></table>
    <p class="guide-note">${extra[state.active]}</p>
    <p class="guide-note">10회 관측의 결과 10개 중 최소 1개는 4성입니다. 4성 기본 확률은 시뮬레이터 가정값인 ${fourStarRate}%입니다.</p>
    <p class="guide-note">같은 등급의 무작위 캐릭터는 동일한 확률로 등장합니다.</p>
  `;
  $('guide-dialog').showModal();
});

$('reset-open').addEventListener('click', () => {
  resetObservationId = state.active;
  const observation = observations[resetObservationId];
  const scope = observation.banners.length > 1 ? `${observation.name}의 두 배너` : observation.name;
  const rewards = observation.reward ? ', 선택 보상' : '';
  $('reset-description').textContent = `${scope} 초기화 시 뽑기 횟수, 천장 진행도, 최근 결과, 5성 획득 기록${rewards}이 삭제됩니다.`;
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
  $('announcement').textContent = `${observations[resetObservationId].name} 기록을 초기화했습니다.`;
  resetObservationId = null;
});

$('reward-open').addEventListener('click', () => {
  pendingReward = state.progress.order.rewards.find(reward => !reward.itemId);
  if (!pendingReward) return;
  selectedRewardId = null;
  $('reward-claim').disabled = true;
  $('reward-dialog-description').textContent = `누적 ${formatNumber(pendingReward.at)}회 보상으로 획득할 캐릭터를 골라주세요.`;
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
  $('announcement').textContent = `선택 보상으로 ${items[selectedRewardId].name}을(를) 획득했습니다.`;
  $('reward-dialog').close();
  saveState();
  renderReward();
  renderCollection();
});

render();
renderCollection();
