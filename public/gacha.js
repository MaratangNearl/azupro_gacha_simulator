import { firstReward, fourStarRate, items, rewardInterval } from './catalog.js';

export function emptyProgress() {
  return { total: 0, pity: 0, fiveCount: 0, fiveByItem: {}, rewards: [], latest: {} };
}

export function restoreFiveCounts(observation, progress, savedCounts) {
  if (!progress.fiveCount) return {};

  const counts = {};
  let remaining = progress.fiveCount;
  if (savedCounts && typeof savedCounts === 'object' && !Array.isArray(savedCounts)) {
    for (const [id, count] of Object.entries(savedCounts)) {
      if (Object.hasOwn(items, id) && items[id].rarity === 5 && Number.isSafeInteger(count)
        && count > 0 && count <= remaining) {
        counts[id] = count;
        remaining -= count;
      }
    }
    return counts;
  }

  // Older saves kept a total and the last batch for each banner.
  const bannersUsed = observation.banners.filter(banner => Object.hasOwn(progress.latest, banner.id));
  const fixedTarget = observation.five?.length === 1 ? observation.five[0]
    : bannersUsed.length === 1 ? bannersUsed[0].target : null;
  if (fixedTarget) return { [fixedTarget.id]: remaining };

  for (const batch of Object.values(progress.latest)) {
    for (const id of batch) {
      if (remaining && items[id].rarity === 5) {
        counts[id] = (counts[id] ?? 0) + 1;
        remaining -= 1;
      }
    }
  }
  return counts;
}

export function summarizeFiveStars(observationsProgress) {
  const counts = {};
  let total = 0;
  let known = 0;
  for (const progress of Object.values(observationsProgress)) {
    total += progress.fiveCount;
    for (const [id, count] of Object.entries(progress.fiveByItem)) {
      counts[id] = (counts[id] ?? 0) + count;
      known += count;
    }
    for (const { itemId } of progress.rewards) {
      if (itemId === null) continue;
      counts[itemId] = (counts[itemId] ?? 0) + 1;
      total += 1;
      known += 1;
    }
  }
  return { counts, total, unknown: total - known };
}

export function nextFiveRate(observation, progress) {
  if (observation.limit && progress.total >= observation.limit) return null;
  if (observation.limit && progress.total + 1 === observation.limit && !progress.fiveCount) return 100;
  const { base, soft, high, cap } = observation.odds;
  const pull = progress.pity + 1;
  if (pull >= cap) return 100;
  const softSteps = Math.max(0, Math.min(pull + 1, high) - soft);
  const highSteps = Math.max(0, pull + 1 - high);
  return base + softSteps * 2 + highSteps * 8;
}

export function nextRewardAt(total) {
  if (total < firstReward) return firstReward;
  return firstReward + (Math.floor((total - firstReward) / rewardInterval) + 1) * rewardInterval;
}

function choose(items, random) {
  return items[Math.floor(random() * items.length)];
}

export function draw(observation, banner, progress, count, random = Math.random) {
  if (count !== 1 && count !== 10) return [];
  if (observation.limit && progress.total + count > observation.limit) return [];

  const result = [];
  let hasFour = false;
  for (let index = 0; index < count; index += 1) {
    const rewardAt = observation.reward ? nextRewardAt(progress.total) : null;
    const rate = nextFiveRate(observation, progress);
    const roll = random() * 100;
    const needsFour = count === 10 && index === count - 1 && !hasFour;
    const previousThree = needsFour ? result.lastIndexOf(observation.three.id) : -1;
    let item = observation.three;

    // When the last pull rolls 5-star, use an earlier 3-star slot for the guarantee.
    // If no slot is available, the first nine were all 5-star, so pity has reset.
    if (roll < rate && (!needsFour || previousThree !== -1)) {
      item = banner.target ?? choose(observation.five, random);
      progress.pity = 0;
      progress.fiveCount += 1;
      progress.fiveByItem[item.id] = (progress.fiveByItem[item.id] ?? 0) + 1;
      if (needsFour) result[previousThree] = choose(observation.four, random).id;
    } else {
      progress.pity += 1;
      if (needsFour || roll < rate + fourStarRate) item = choose(observation.four, random);
    }
    hasFour ||= item.rarity === 4;

    progress.total += 1;
    if (progress.total === rewardAt) progress.rewards.push({ at: rewardAt, itemId: null });
    result.push(item.id);
  }
  progress.latest[banner.id] = result;
  return result;
}
