/**
 * 搜索匹配工具函数
 */
import { getRecipeIngredients } from './recipeUtils';

/**
 * 菜谱模糊搜索匹配
 * 支持：菜名/步骤/食材/做法/口味/能量等多维度匹配
 */
export const matchRecipeSearch = (recipe: any, query: string): boolean => {
  if (!query) return true;
  const term = query.toLowerCase().trim();

  // 1. 基础匹配
  if (recipe.name.toLowerCase().includes(term)) return true;
  if (recipe.coverEmoji && recipe.coverEmoji.includes(term)) return true;
  if (recipe.steps && recipe.steps.some((step: string) => step.toLowerCase().includes(term))) return true;

  // 2. 食材匹配
  const ingredients = getRecipeIngredients(recipe.name);
  if (ingredients.some(ing => ing.toLowerCase().includes(term))) return true;

  // 分类模糊匹配
  if (term === '肉' || term === '肉类' || term.includes('肉')) {
    const meatKeywords = ['肉', '排骨', '牛', '鸡', '里脊', '肉片', '五花肉'];
    const hasMeat = meatKeywords.some(kw => recipe.name.includes(kw)) || ingredients.some(ing => meatKeywords.some(kw => ing.includes(kw)));
    if (hasMeat) return true;
  }
  if (term === '鱼' || term === '鱼类' || term === '海鲜' || term.includes('鱼')) {
    const seafoodKeywords = ['鱼', '鳕鱼', '虾', '蟹', '海鲜', '海参'];
    const hasSeafood = seafoodKeywords.some(kw => recipe.name.includes(kw)) || ingredients.some(ing => seafoodKeywords.some(kw => ing.includes(kw)));
    if (hasSeafood) return true;
  }
  if (term === '菜' || term === '蔬菜' || term === '素菜' || term.includes('菜')) {
    const vegKeywords = ['菜', '西兰花', '番茄', '洋葱', '玉米', '茄子', '胡萝卜', '甜豆', '香菇', '土豆', '黄瓜', '秋葵', '绿', '青椒'];
    const hasVeg = vegKeywords.some(kw => recipe.name.includes(kw)) || ingredients.some(ing => vegKeywords.some(kw => ing.includes(kw)));
    if (hasVeg) return true;
  }

  // 3. 做法模糊匹配
  if (term.includes('煎')) {
    if (recipe.name.includes('煎') || recipe.name.includes('鳕鱼') || recipe.steps.some((s: string) => s.includes('煎'))) return true;
  }
  if (term.includes('炒')) {
    if (recipe.name.includes('炒') || recipe.name.includes('西兰花') || recipe.steps.some((s: string) => s.includes('炒'))) return true;
  }
  if (term.includes('煮') || term.includes('炖') || term.includes('煲') || term.includes('汤') || term.includes('粥')) {
    const boilKeywords = ['煮', '炖', '粥', '汤', '乱炖', '煲', '砂锅', '面', '粉'];
    if (boilKeywords.some(kw => recipe.name.includes(kw)) || recipe.steps.some((s: string) => boilKeywords.some(kw => s.includes(kw)))) return true;
  }
  if (term.includes('炸') || term.includes('酥')) {
    if (recipe.name.includes('炸') || recipe.name.includes('排骨') || recipe.steps.some((s: string) => s.includes('炸') || s.includes('油温'))) return true;
  }

  // 4. 能量模糊匹配
  if (term.includes('低脂') || term.includes('低卡') || term.includes('轻食') || term.includes('减肥')) {
    if (recipe.calories < 350) return true;
  }
  if (term.includes('高') || term.includes('高卡') || term.includes('高热量') || term.includes('增肌') || term.includes('丰盛')) {
    if (recipe.calories >= 350) return true;
  }

  // 5. 口味模糊匹配
  if (term.includes('清淡') || term.includes('健康') || term.includes('原味') || term.includes('淡')) {
    const list = ['西兰花', '粥', '秋葵', '蔬菜', '什锦'];
    if (list.some(kw => recipe.name.includes(kw))) return true;
  }
  if (term.includes('辣') || term.includes('麻辣') || term.includes('香辣') || term.includes('酸辣') || term.includes('甜辣')) {
    const list = ['牛肉', '五花肉', '排骨'];
    if (list.some(kw => recipe.name.includes(kw))) return true;
  }
  if (term.includes('甜') || term.includes('糖醋') || term.includes('蜜汁')) {
    const list = ['排骨', '糖醋', '南瓜', '番茄'];
    if (list.some(kw => recipe.name.includes(kw))) return true;
  }
  if (term.includes('咸') || term.includes('咸鲜') || term.includes('家常') || term.includes('鲜')) {
    const list = ['白菜', '五花肉', '面条', '鳕鱼', '面'];
    if (list.some(kw => recipe.name.includes(kw))) return true;
  }

  return false;
};