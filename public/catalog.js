const character = (id, rarity, extension = 'webp') => ({
  id, rarity, image: `/assets/portraits/${id}.${extension}`,
});

export const limitedCharacters = [
  character('xiaoyu', 5),
  character('chiyo', 5, 'png'),
];

export const standardCharacters = [
  character('faridah', 5),
  character('luruka', 5),
  character('peipei', 5, 'png'),
  character('cathbelle', 5),
  character('abby', 5),
  character('shalle', 5),
  character('ruby', 5),
  character('metsa', 5),
  character('lan-xiangzi', 5, 'png'),
  character('morwyn', 5),
];

export const fourStarCharacters = [
  character('nono', 4),
  character('lily', 4),
  character('pengpeng', 4),
  character('katalua', 4),
  character('mitty', 4),
  character('symphoria', 4),
  character('maple', 4, 'png'),
  character('terara', 4),
  character('han-youyou', 4),
  character('anais', 4),
];

const limitedWeapons = [
  { id: 'flower', rarity: 5, image: '/assets/portraits/flower.jpg' },
  { id: 'shadow', rarity: 5, image: '/assets/portraits/shadow.jpg' },
];

const generic = (id, rarity) => ({ id, rarity });
const threeStar = generic('three-star', 3);
const weapons = {
  3: generic('weapon-3', 3),
  4: generic('weapon-4', 4),
  5: generic('weapon-5', 5),
};

const characterOdds = { base: 0.8, soft: 71, high: 81, cap: 90 };
const weaponOdds = { base: 1.2, soft: 61, high: 71, cap: 80 };

export const fourStarRate = 6;
export const fourStarGuarantee = 10;
export const firstReward = 50;
export const rewardInterval = 200;

export const observations = {
  fate: {
    type: 'character',
    icon: 'fate',
    odds: characterOdds,
    four: fourStarCharacters,
    three: threeStar,
    banners: [
      { id: 'xiaoyu', target: limitedCharacters[0], theme: 'rose' },
      { id: 'chiyo', target: limitedCharacters[1], theme: 'crimson' },
    ],
  },
  bond: {
    type: 'weapon',
    icon: 'sword',
    odds: weaponOdds,
    four: [weapons[4]],
    three: weapons[3],
    banners: [
      { id: 'flower', target: limitedWeapons[0], owner: limitedCharacters[0], theme: 'indigo' },
      { id: 'shadow', target: limitedWeapons[1], owner: limitedCharacters[1], theme: 'crimson' },
    ],
  },
  order: {
    type: 'character',
    icon: 'order',
    odds: characterOdds,
    five: standardCharacters,
    four: fourStarCharacters,
    three: threeStar,
    reward: true,
    banners: [{ id: 'order', theme: 'azure' }],
  },
  eternity: {
    type: 'weapon',
    icon: 'order',
    odds: weaponOdds,
    five: [weapons[5]],
    four: [weapons[4]],
    three: weapons[3],
    banners: [{ id: 'eternity', theme: 'indigo' }],
  },
  leap: {
    type: 'character',
    icon: 'leap',
    odds: characterOdds,
    limit: 30,
    five: standardCharacters.filter(item => item.id !== 'peipei'),
    four: fourStarCharacters,
    three: threeStar,
    banners: [{ id: 'leap', theme: 'mint' }],
  },
};

export const items = Object.fromEntries([
  ...limitedCharacters, ...standardCharacters, ...fourStarCharacters, ...limitedWeapons,
  threeStar, ...Object.values(weapons),
].map(item => [item.id, item]));
