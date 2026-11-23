const character = (name, id, rarity, extension = 'webp') => ({
  name, id, rarity, image: `/assets/portraits/${id}.${extension}`,
});

export const limitedCharacters = [
  character('도산소옥', 'xiaoyu', 5),
  character('미나모토 치요', 'chiyo', 5, 'png'),
];

export const standardCharacters = [
  character('파란타', 'faridah', 5),
  character('루루카', 'luruka', 5),
  character('페페', 'peipei', 5, 'png'),
  character('캐시벨', 'cathbelle', 5),
  character('아비', 'abby', 5),
  character('샬레', 'shalle', 5),
  character('루비', 'ruby', 5),
  character('멧사', 'metsa', 5),
  character('난향자', 'lan-xiangzi', 5, 'png'),
  character('모르윈', 'morwyn', 5),
];

export const fourStarCharacters = [
  character('노노', 'nono', 4),
  character('릴리', 'lily', 4),
  character('펭펭', 'pengpeng', 4),
  character('카타루', 'katalua', 4),
  character('미티', 'mitty', 4),
  character('심포리아', 'symphoria', 4),
  character('메이플', 'maple', 4, 'png'),
  character('테라라', 'terara', 4),
  character('한요요', 'han-youyou', 4),
  character('애니스', 'anais', 4),
];

const limitedWeapons = [
  { id: 'flower', name: '꽃의 춤사위', rarity: 5, image: '/assets/portraits/flower.jpg' },
  { id: 'shadow', name: '요괴 그림자 섬멸', rarity: 5, image: '/assets/portraits/shadow.jpg' },
];

const generic = (id, name, rarity) => ({ id, name, rarity });
const threeStar = generic('three-star', '3성', 3);
const weapons = {
  3: generic('weapon-3', '3성 무기', 3),
  4: generic('weapon-4', '4성 무기', 4),
  5: generic('weapon-5', '5성 무기', 5),
};

const characterOdds = { base: 0.8, soft: 71, high: 81, cap: 90 };
const weaponOdds = { base: 1.2, soft: 61, high: 71, cap: 80 };

export const fourStarRate = 6;
export const firstReward = 50;
export const rewardInterval = 200;

export const observations = {
  fate: {
    name: '운명 관측',
    kind: '한정 캐릭터',
    icon: 'fate',
    odds: characterOdds,
    four: fourStarCharacters,
    three: threeStar,
    banners: [
      { id: 'xiaoyu', label: '꽃의 언약', target: limitedCharacters[0], theme: 'rose' },
      { id: 'chiyo', label: '월하가인', target: limitedCharacters[1], theme: 'crimson' },
    ],
  },
  bond: {
    name: '인연 관측',
    kind: '한정 무기',
    icon: 'sword',
    odds: weaponOdds,
    four: [weapons[4]],
    three: weapons[3],
    banners: [
      { id: 'flower', label: '도산소옥 전용 무기', target: limitedWeapons[0], theme: 'indigo' },
      { id: 'shadow', label: '미나모토 치요 전용 무기', target: limitedWeapons[1], theme: 'crimson' },
    ],
  },
  order: {
    name: '질서 관측',
    kind: '상시 캐릭터',
    icon: 'order',
    odds: characterOdds,
    five: standardCharacters,
    four: fourStarCharacters,
    three: threeStar,
    reward: true,
    banners: [{ id: 'order', label: '상시 캐릭터', theme: 'azure' }],
  },
  eternity: {
    name: '영원 관측',
    kind: '상시 무기',
    icon: 'order',
    odds: weaponOdds,
    five: [weapons[5]],
    four: [weapons[4]],
    three: weapons[3],
    banners: [{ id: 'eternity', label: '상시 무기', theme: 'indigo' }],
  },
  leap: {
    name: '도약 관측',
    kind: '초보자 캐릭터',
    icon: 'leap',
    odds: characterOdds,
    limit: 30,
    five: standardCharacters.filter(item => item.id !== 'peipei'),
    four: fourStarCharacters,
    three: threeStar,
    banners: [{ id: 'leap', label: '초보자 캐릭터', theme: 'mint' }],
  },
};

export const items = Object.fromEntries([
  ...limitedCharacters, ...standardCharacters, ...fourStarCharacters, ...limitedWeapons,
  threeStar, ...Object.values(weapons),
].map(item => [item.id, item]));
