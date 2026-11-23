import ko from './locales/ko.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import zhHans from './locales/zh-Hans.js';
import zhHant from './locales/zh-Hant.js';
import { bannerNames, characterNames, limitedItemNames, observationNames } from './locales/names.js';

const messages = { ko, en, ja, 'zh-Hans': zhHans, 'zh-Hant': zhHant };
export const languages = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
};

function matchLanguage(tag) {
  const [language, ...qualifiers] = tag.toLowerCase().replaceAll('_', '-').split('-');
  if (language === 'zh') {
    if (qualifiers.includes('hans')) return 'zh-Hans';
    if (qualifiers.includes('hant')) return 'zh-Hant';
    return qualifiers.some(region => ['tw', 'hk', 'mo'].includes(region)) ? 'zh-Hant' : 'zh-Hans';
  }
  return ['ko', 'en', 'ja'].includes(language) ? language : null;
}

export function resolveLanguage(preferred, saved) {
  if (Object.hasOwn(languages, saved)) return saved;
  return preferred.map(matchLanguage).find(Boolean) ?? 'en';
}

let language = 'en';
let integers;
let decimals;
let percentages;

export function setLanguage(value) {
  language = value;
  integers = new Intl.NumberFormat(language, { maximumFractionDigits: 0 });
  decimals = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  percentages = new Intl.NumberFormat(language, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function t(key, values = {}) {
  return messages[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name]);
}

export function number(value) {
  return integers.format(value);
}

export function decimal(value) {
  return decimals.format(value);
}

export function percent(value) {
  return percentages.format(value / 100);
}

export function pullCount(value, end) {
  const count = end === undefined ? number(value) : `${number(value)}–${number(end)}`;
  const key = language === 'en' && value === 1 && end === undefined ? 'pullCountOne' : 'pullCount';
  return t(key, { n: count });
}

export function observationName(id) {
  return observationNames[language][id];
}

export function itemName(item) {
  const name = characterNames[item.id]?.[language] ?? limitedItemNames[item.id]?.[language];
  return name ?? t(item.id.startsWith('weapon-') ? 'weaponRarity' : 'rarity', { n: item.rarity });
}

export function bannerName(banner, observationId) {
  if (banner.owner) return t('signatureWeapon', { name: itemName(banner.owner) });
  return bannerNames[language]?.[banner.id] ?? t(`${observationId}Kind`);
}

setLanguage(language);
