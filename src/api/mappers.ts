/**
 * DTO ↔ ViewModel 转换层
 *
 * 职责：
 *   1. 把后端返回的 DTO（数据库字段名）转成前端 ViewModel（业务字段名）
 *   2. 把前端提交的 ViewModel 转回后端期望的 DTO
 *   3. 处理字段缺失/格式不一致的兼容
 *
 * 设计原则：
 *   - 组件层永远不接触 DTO，只接触 ViewModel
 *   - 任何后端字段调整都只改这个文件，不影响组件
 *   - 这一层叫"防腐层"（Anti-Corruption Layer）
 */

import type {
  IngredientDTO,
  RecipeDTO,
  RecipeStepItem,
  CommunityPostDTO,
  CommentDTO,
  UserPreferenceDTO,
  CookingRecordDTO,
} from './types';
import type { Food, Recipe, SocialPost, SocialComment } from '../types';

// ============================================================================
// 通用工具
// ============================================================================

/** 安全解析 JSON 字符串，失败时返回兜底值 */
const safeParseJSON = <T>(jsonStr: string | undefined | null, fallback: T): T => {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return fallback;
  }
};

/** 逗号分隔字符串转字符串数组 */
const splitCommaString = (str: string | undefined | null): string[] => {
  if (!str) return [];
  return str.split(',').map((s) => s.trim()).filter(Boolean);
};

/** 字符串数组合并为逗号分隔字符串 */
const joinToString = (arr: string[] | undefined | null): string => {
  if (!arr || arr.length === 0) return '';
  return arr.join(',');
};

// ============================================================================
// 食材分类映射
// ============================================================================
/**
 * 后端真实分类（共8类，来自 ingredient_category 表）：
 *   id=1 蔬菜 / id=2 肉类 / id=3 海鲜 / id=4 蛋奶
 *   id=5 豆制品 / id=6 主食 / id=7 菌菇 / id=8 调料
 *
 * 前端流程只有三步，把8类归并到3大类显示：
 *   第1步 选蔬菜  → veggie  (蔬菜 + 菌菇)
 *   第2步 选肉类  → meat    (肉类 + 海鲜 + 蛋奶 + 豆制品)
 *   第3步 选主食  → staple  (主食)
 *
 * 调料(id=8)归到 veggie（不显示在主流程，未来可在锅具页单独处理）
 *
 * 后续如果产品决定第2步改成"选蛋白质"或者新增"选海鲜"步骤，
 * 只需修改此函数 + FoodSelectorPage.tsx 即可。
 */
export const mapCategoryIdToType = (categoryId: number): Food['category'] => {
  switch (categoryId) {
    case 1: return 'veggie';   // 蔬菜
    case 2: return 'meat';     // 肉类
    case 3: return 'meat';     // 海鲜 -> 归入肉类
    case 4: return 'meat';     // 蛋奶 -> 归入肉类
    case 5: return 'meat';     // 豆制品 -> 归入肉类（蛋白质来源）
    case 6: return 'staple';   // 主食
    case 7: return 'veggie';   // 菌菇 -> 归入蔬菜
    case 8: return 'veggie';   // 调料 -> 暂归蔬菜（不会大量出现）
    default: return 'veggie';
  }
};

// ============================================================================
// 食材 Emoji 字典（核心：解决后端 icon 字段无真实 emoji 的问题）
// ============================================================================
/**
 * 方案A：前端硬编码 emoji 映射表
 *
 * 原因：
 *   后端数据库 ingredient.icon 字段虽然有值，但都是占位图标，
 *   不是真正的食物 emoji。前端硬编码字典最直观可控。
 *
 * 维护规则：
 *   - key：食材准确名称（必须和数据库 name 字段完全一致）
 *   - value：单个 emoji 字符
 *   - 没匹配上的食材使用 CATEGORY_DEFAULT_EMOJI 兜底
 *
 * 优先级：
 *   1. INGREDIENT_EMOJI_MAP 精确命中
 *   2. CATEGORY_DEFAULT_EMOJI 按分类兜底
 *   3. 最终兜底 🥬
 */
const INGREDIENT_EMOJI_MAP: Record<string, string> = {
  // ===== 蔬菜 =====
  '西兰花': '🥦', '大白菜': '🥬', '小白菜': '🥬', '生菜': '🥬', '菠菜': '🥬',
  '油菜': '🥬', '韭菜': '🥬', '芹菜': '🥬', '香菜': '🌿', '茼蒿': '🥬',
  '空心菜': '🥬', '苋菜': '🥬', '芥菜': '🥬', '卷心菜': '🥬', '紫甘蓝': '🥬',
  '胡萝卜': '🥕', '白萝卜': '🥕', '红萝卜': '🥕', '土豆': '🥔', '红薯': '🍠',
  '紫薯': '🍠', '山药': '🥔', '芋头': '🥔', '南瓜': '🎃', '红南瓜': '🎃',
  '冬瓜': '🥒', '黄瓜': '🥒', '苦瓜': '🥒', '丝瓜': '🥒', '西葫芦': '🥒',
  '茄子': '🍆', '嫩茄子': '🍆', '番茄': '🍅', '圣女果': '🍅', '青椒': '🫑',
  '彩椒': '🫑', '尖椒': '🌶️', '辣椒': '🌶️', '洋葱': '🧅', '洋葱头': '🧅',
  '大蒜': '🧄', '蒜苗': '🧄', '葱': '🧅', '姜': '🫚', '玉米': '🌽',
  '甜玉米': '🌽', '青豆': '🫛', '青豆仁': '🫛', '豌豆': '🫛', '四季豆': '🫛',
  '豆角': '🫛', '荷兰豆': '🫛', '蚕豆': '🫛', '黄豆芽': '🌱', '绿豆芽': '🌱',
  '秋葵': '🥒', '鲜秋葵': '🥒', '芦笋': '🥬', '莲藕': '🥔', '竹笋': '🎋',

  // ===== 菌菇 =====
  '香菇': '🍄', '香菇块': '🍄', '蘑菇': '🍄', '金针菇': '🍄', '杏鲍菇': '🍄',
  '平菇': '🍄', '茶树菇': '🍄', '草菇': '🍄', '木耳': '🍄', '银耳': '🍄',
  '猴头菇': '🍄', '松茸': '🍄', '海鲜菇': '🍄', '白玉菇': '🍄',

  // ===== 肉类 =====
  '猪肉': '🥓', '五花肉': '🥓', '里脊肉': '🥩', '猪里脊': '🥩', '排骨': '🍖',
  '小排骨': '🍖', '猪蹄': '🍖', '猪肝': '🥩', '猪心': '🥩', '猪肚': '🥩',
  '牛肉': '🥩', '牛里脊': '🥩', '牛腩': '🥩', '牛排': '🥩', '牛腱': '🥩',
  '羊肉': '🥩', '羊排': '🥩', '羊腿': '🥩',
  '鸡肉': '🍗', '鸡胸肉': '🍗', '鸡腿': '🍗', '鸡翅': '🍗', '鸡爪': '🍗',
  '鸭肉': '🦆', '鸭腿': '🦆', '鹅肉': '🦆',
  '香肠': '🌭', '培根': '🥓', '火腿': '🍖',

  // ===== 海鲜 =====
  '鱼': '🐟', '鲫鱼': '🐟', '草鱼': '🐟', '鲢鱼': '🐟', '鳙鱼': '🐟',
  '鲤鱼': '🐟', '青鱼': '🐟', '黑鱼': '🐟', '鳜鱼': '🐟', '鲈鱼': '🐟',
  '黄花鱼': '🐟', '带鱼': '🐟', '鲳鱼': '🐟', '多宝鱼': '🐟', '石斑鱼': '🐟',
  '三文鱼': '🐟', '金枪鱼': '🐟', '秋刀鱼': '🐟', '沙丁鱼': '🐟', '鳕鱼': '🐟',
  '银鳕鱼': '🐟', '鳗鱼': '🐟', '泥鳅': '🐟', '黄鳝': '🐟', '鲶鱼': '🐟',
  '罗非鱼': '🐟', '龙利鱼': '🐟', '巴沙鱼': '🐟',
  '虾': '🦐', '大沼虾': '🦐', '基围虾': '🦐', '对虾': '🦐', '河虾': '🦐',
  '皮皮虾': '🦐', '小龙虾': '🦞', '龙虾': '🦞',
  '蟹': '🦀', '螃蟹': '🦀', '梭子蟹': '🦀', '大闸蟹': '🦀',
  '鱿鱼': '🦑', '墨鱼': '🦑', '章鱼': '🐙', '海参': '🦪', '鲍鱼': '🦪',
  '扇贝': '🦪', '生蚝': '🦪', '牡蛎': '🦪', '蛤蜊': '🦪', '海螺': '🐚',
  '海带': '🌿', '紫菜': '🌿', '海苔': '🌿',

  // ===== 蛋奶 =====
  '鸡蛋': '🥚', '鲜鸡蛋': '🥚', '鸭蛋': '🥚', '鹌鹑蛋': '🥚', '咸鸭蛋': '🥚',
  '皮蛋': '🥚', '蛋液': '🥚',
  '牛奶': '🥛', '酸奶': '🥛', '奶酪': '🧀', '黄油': '🧈', '奶油': '🥛',

  // ===== 豆制品 =====
  '豆腐': '🍱', '嫩豆腐': '🍱', '老豆腐': '🍱', '内酯豆腐': '🍱', '千页豆腐': '🍱',
  '鸡蛋豆腐': '🍱', '血豆腐': '🍱', '鱼豆腐': '🍱', '豆腐干': '🍱', '白豆腐干': '🍱',
  '卤豆腐干': '🍱', '熏豆腐干': '🍱', '五香豆腐干': '🍱', '茶干': '🍱', '扬州干丝': '🍱',
  '豆腐丝': '🍱', '豆腐皮': '🍱', '油豆皮': '🍱', '腐竹': '🍱', '腐竹结': '🍱',
  '干腐竹': '🍱', '豆腐泡': '🍱', '炸豆腐': '🍱', '豆腐丸': '🍱', '豆腐脑': '🥣',
  '甜豆花': '🥣', '咸豆花': '🥣', '豆浆': '🥛', '甜豆浆': '🥛',

  // ===== 主食 =====
  '大米': '🍚', '糙米': '🌾', '黑米': '🌾', '红米': '🌾', '糯米': '🍚',
  '香米': '🍚', '泰国香米': '🍚', '珍珠米': '🍚', '小米': '🌾', '燕麦': '🌾',
  '燕麦米': '🌾', '燕麦粥': '🥣', '荞麦米': '🌾', '薏米': '🌾', '高粱米': '🌾',
  '藜麦': '🌾', '麦片': '🌾',
  '面粉': '🌾', '高筋面粉': '🌾', '中筋面粉': '🌾', '低筋面粉': '🌾', '全麦面粉': '🌾',
  '玉米面': '🌽', '糯米粉': '🌾',
  '白米饭': '🍚', '米饭': '🍚', '面条': '🍜', '手擀面': '🍜', '挂面': '🍜',
  '拉面': '🍜', '刀削面': '🍜', '乌冬面': '🍜', '荞麦面': '🍜', '意面': '🍝',
  '意大利面': '🍝', '意面条': '🍝', '通心粉': '🍝', '米粉': '🍜', '河粉': '🍜',
  '粉丝': '🍜', '红薯粉条': '🍜', '土豆粉条': '🍜',
  '馒头': '🍞', '烤馒头': '🍞', '包子': '🥟', '饺子': '🥟', '面包': '🍞',
  '吐司': '🍞',  '煮红薯': '🍠', 

  // ===== 调料（基本不会显示，但备用）=====
  '盐': '🧂', '食盐': '🧂', '糖': '🍬', '冰糖': '🍬', '醋': '🧪',
  '香醋': '🧪', '生抽': '🥢', '老抽': '🥢', '酱油': '🥢', '料酒': '🍶',
  '蚝油': '🥢', '黑胡椒': '🌶️', '辣椒面': '🌶️', '葱姜蒜': '🧄',
};

/**
 * 分类默认 emoji（兜底）
 * 当某食材名不在 INGREDIENT_EMOJI_MAP 时使用
 */
const CATEGORY_DEFAULT_EMOJI: Record<number, string> = {
  1: '🥬', // 蔬菜
  2: '🥩', // 肉类
  3: '🐟', // 海鲜
  4: '🥚', // 蛋奶
  5: '🍱', // 豆制品
  6: '🍚', // 主食
  7: '🍄', // 菌菇
  8: '🧂', // 调料
};

/**
 * 根据食材名 + 分类ID 获取最合适的 emoji
 *
 * @param name 食材名（必须和数据库 name 完全一致）
 * @param categoryId 后端分类ID（1-8）
 * @returns 单个 emoji 字符
 */
const resolveEmoji = (name: string, categoryId: number): string => {
  // 1. 精确命中
  if (INGREDIENT_EMOJI_MAP[name]) {
    return INGREDIENT_EMOJI_MAP[name];
  }
  // 2. 模糊命中（包含关系，例如"牛里脊肉" → 命中"牛里脊"）
  for (const key in INGREDIENT_EMOJI_MAP) {
    if (name.includes(key) || key.includes(name)) {
      return INGREDIENT_EMOJI_MAP[key];
    }
  }
  // 3. 分类兜底
  return CATEGORY_DEFAULT_EMOJI[categoryId] || '🥬';
};

// ============================================================================
// 食材 DTO -> ViewModel
// ============================================================================
/**
 * 后端 IngredientDTO -> 前端 Food
 *
 * 字段映射：
 *   - id          → 丢弃（前端用name做唯一key）
 *   - name        → name（直接复用）
 *   - emoji       → emoji（优先用映射表，后端字段忽略）
 *   - categoryId  → category（通过 mapCategoryIdToType 转）
 *   - alias       → alias（默认空字符串）
 *   - pinyin      → pinyin（默认空字符串）
 *   - calories    → calories（默认0）
 *
 * 注：前端 Food 不保留 isCommon 字段，排序通过 mapper 外的逻辑处理
 */
export const mapIngredientDTOToFood = (dto: IngredientDTO): Food => {
  return {
    name: dto.name,
    emoji: resolveEmoji(dto.name, dto.categoryId),
    category: mapCategoryIdToType(dto.categoryId),
    calories: dto.calories ?? 0,
    alias: dto.alias || '',
    pinyin: dto.pinyin || '',
  };
};

// ============================================================================
// 菜谱难度映射（前后端枚举对应）
// ============================================================================
// 后端 1/2/3 -> 前端 入门/中等/较高
const difficultyMap: Record<number, Recipe['difficulty']> = {
  1: '入门',
  2: '比较容易',
  3: '中等',
  4: '较高',
};

const reverseDifficultyMap: Record<Recipe['difficulty'], number> = {
  '入门': 1,
  '比较容易': 2,
  '中等': 2,
  '较高': 3,
};

export const mapDifficultyToFrontend = (n: number): Recipe['difficulty'] => {
  return difficultyMap[n] || '中等';
};

export const mapDifficultyToBackend = (s: Recipe['difficulty']): number => {
  return reverseDifficultyMap[s] || 2;
};

// ============================================================================
// 菜谱 emoji 字典 + 兜底
// ============================================================================
/**
 * 菜谱封面 emoji 字典（数据库没有 cover_emoji 字段，前端兜底）
 *
 * 匹配策略：
 *   1. 精确命中菜名
 *   2. 模糊命中（菜名包含字典key）
 *   3. 按菜系/做法关键词兜底
 *   4. 最终兜底 🍽️
 */
const RECIPE_EMOJI_MAP: Record<string, string> = {
  // 常见菜
  '番茄炒蛋': '🍅', '红烧肉': '🥩', '可乐鸡翅': '🍗', '酸辣土豆丝': '🥔',
  '青椒肉丝': '🌶️', '宫保鸡丁': '🍗', '麻婆豆腐': '🍱', '鱼香肉丝': '🥩',
  '糖醋里脊': '🥩', '回锅肉': '🥓', '水煮鱼': '🐟', '辣子鸡': '🍗',
  '西红柿鸡蛋面': '🍜', '蛋炒饭': '🍚', '扬州炒饭': '🍚', '酸菜鱼': '🐟',
  '小笼包': '🥟', '饺子': '🥟', '春卷': '🥟', '炒面': '🍜',
  '凉拌黄瓜': '🥒', '蒜蓉西兰花': '🥦', '清炒油菜': '🥬',
  '红烧排骨': '🍖', '糖醋排骨': '🍖', '蒜泥白肉': '🥩',
  '鸡蛋羹': '🥚', '皮蛋瘦肉粥': '🥣', '小米粥': '🥣',
  '炸薯条': '🍟', '炸鸡': '🍗', '汉堡': '🍔', '三明治': '🥪',
  '披萨': '🍕', '寿司': '🍣', '拉面': '🍜',
};

const resolveRecipeEmoji = (title: string, cuisineType?: string): string => {
  if (!title) return '🍽️';
  // 1. 精确
  if (RECIPE_EMOJI_MAP[title]) return RECIPE_EMOJI_MAP[title];
  // 2. 模糊
  for (const key in RECIPE_EMOJI_MAP) {
    if (title.includes(key) || key.includes(title)) return RECIPE_EMOJI_MAP[key];
  }
  // 3. 关键词
  if (title.includes('鱼') || title.includes('虾') || title.includes('蟹')) return '🐟';
  if (title.includes('鸡')) return '🍗';
  if (title.includes('牛') || title.includes('猪') || title.includes('肉')) return '🥩';
  if (title.includes('面') || title.includes('粉')) return '🍜';
  if (title.includes('饭') || title.includes('粥')) return '🍚';
  if (title.includes('汤')) return '🍲';
  if (title.includes('饺') || title.includes('包')) return '🥟';
  if (title.includes('菜') || title.includes('蔬')) return '🥬';
  if (title.includes('蛋')) return '🥚';
  if (title.includes('豆腐') || title.includes('豆')) return '🍱';
  return '🍽️';
};

/**
 * 通用工具：兼容 JSON 字段两种返回格式
 * MyBatis 处理 MySQL JSON 类型时，可能返回:
 *   - 字符串："[{\"name\":\"豆腐\"}]"
 *   - 已解析对象/数组: [{name:"豆腐"}]
 * 这个函数统一处理
 */
const parseJsonField = <T>(val: any, fallback: T): T => {
  if (val == null) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  // 已经是对象/数组
  return val as T;
};

// ============================================================================
// 菜谱 DTO -> ViewModel（阶段2.1 升级）
// ============================================================================
/**
 * 后端 RecipeDTO -> 前端 Recipe
 *
 * 字段处理：
 *   - title -> name（直接复制）
 *   - cookTime -> time（默认0）
 *   - difficulty (1/2/3) -> 中文档（mapDifficultyToFrontend）
 *   - rating -> stars（默认5）
 *   - stepsJson -> steps[]（解析 [{step,description,images}]，只取description）
 *   - nutritionJson -> protein/carbohydrates/fat/calories（解析后赋值）
 *   - coverEmoji -> 数据库没此字段，前端用 resolveRecipeEmoji 按菜名生成
 *
 * 注意：后端 JSON 字段可能返回字符串或已解析对象，统一用 parseJsonField 处理
 */


/**
 * 后端 RecipeDTO -> 前端 Recipe
 *
 * 步骤字段说明（重要修正）：
 *   后端实际返回的 stepsJson 元素结构是：
 *     { "step": 1, "title": "煮奶", "desc": "牛奶煮微沸，倒入..." }
 *   优先取 desc（步骤说明），次取 title（步骤名），都没有才兜底
 */
export const mapRecipeDTOToRecipe = (dto: RecipeDTO): Recipe => {
  // 步骤解析：兼容多种字段名
  const rawSteps = parseJsonField<any[]>(dto.stepsJson, []);
  const steps = rawSteps
    .map((item) => {
      if (typeof item === 'string') return item;
      const desc = item?.desc || item?.description || item?.step_desc || item?.text || '';
      const title = item?.title || item?.step_title || '';
      if (title && desc) return `${title}：${desc}`;
      return desc || title || '';
    })
    .filter(Boolean);

  // 营养信息解析
  const nutrition = parseJsonField<any>((dto as any).nutritionJson, {});
  const calories = dto.calories ?? nutrition?.calories ?? 0;
  const protein = dto.protein ?? nutrition?.protein ?? 0;
  const carbohydrates = dto.carbohydrates ?? nutrition?.carbohydrates ?? nutrition?.carbs ?? 0;
  const fat = dto.fat ?? nutrition?.fat ?? 0;

  // ⭐ 新增：食材解析（后端 ingredients_json 结构 [{name, amount, isMain?}]）
  // ⭐ 食材解析（兼容多种字段名 + 已解析对象/字符串两种格式）
  const rawIngredientsField =
    (dto as any).ingredientsJson ??
    (dto as any).ingredients_json ??
    (dto as any).ingredients ??
    [];

  // 调试：第一次解析时打印一下原始数据，确认字段名和格式
  if (typeof window !== 'undefined' && !(window as any).__debugIngOnce) {
    (window as any).__debugIngOnce = true;
    console.log('[mapRecipeDTOToRecipe] 原始 dto 字段:', Object.keys(dto));
    console.log('[mapRecipeDTOToRecipe] ingredientsJson 字段值:', rawIngredientsField);
  }

  const rawIngredients = parseJsonField<any[]>(rawIngredientsField, []);
  const ingredients = rawIngredients
    .map((item) => {
      if (typeof item === 'string') return { name: item, amount: '' };
      return {
        name: item?.name || '',
        amount: item?.amount || '',
        isMain: item?.isMain ?? item?.is_main ?? undefined,
      };
    })
    .filter((it) => !!it.name);

  return {
    id: String(dto.id),
    name: dto.title || '未命名菜谱',
    time: dto.cookTime || 0,
    calories,
    difficulty: mapDifficultyToFrontend(dto.difficulty),
    stars: dto.rating ?? 5,
    protein,
    carbohydrates,
    fat,
    glIndex: dto.glIndex,
    healthScore: dto.healthScore,
    steps: steps.length > 0 ? steps : ['暂无步骤说明'],
    coverEmoji: dto.coverEmoji || resolveRecipeEmoji(dto.title, dto.cuisineType),
    // ⭐ 新增
    ingredients,
  };
};

/** 提取菜谱封面图URL（单独工具，因为 Recipe 不存这字段） */
export const getRecipeCoverImageFromDTO = (dto: RecipeDTO): string => {
  return dto.coverImage || '';
};

// ============================================================================
// 菜谱 ViewModel -> DTO（提交时用）
// ============================================================================
export const mapRecipeToDTO = (recipe: Recipe): Partial<RecipeDTO> => {
  const stepsItems: RecipeStepItem[] = recipe.steps.map((desc, idx) => ({
    step: idx + 1,
    description: desc,
    images: [],
  }));

  return {
    title: recipe.name,
    cookTime: recipe.time,
    difficulty: mapDifficultyToBackend(recipe.difficulty),
    stepsJson: JSON.stringify(stepsItems),
    coverEmoji: recipe.coverEmoji,
    calories: recipe.calories,
    protein: recipe.protein,
    carbohydrates: recipe.carbohydrates,
    fat: recipe.fat,
    glIndex: recipe.glIndex,
    healthScore: recipe.healthScore,
  };
};

// ============================================================================
// 社区帖子 DTO -> ViewModel
// ============================================================================

/** 兼容：图片字段可能是 string[] 也可能是 string(JSON) 或 逗号分隔的字符串 */
const parseImagesField = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr.filter(Boolean) : [val];
    } catch {
      // 如果不是 JSON，尝试按逗号分隔解析
      if (val.includes(',')) {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [val];
    }
  }
  return [];
};

/** 拼图片完整 URL */
const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // 相对路径走 vite 代理
  return url.startsWith('/') ? url : `/${url}`;
};

/** 拼头像 URL（emoji 不动，URL 拼前缀） */
const resolveAvatar = (avatar: string | null | undefined): string => {
  if (!avatar) return '🍽️';
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) {
    return avatar;
  }
  if (avatar.startsWith('/')) {
    return avatar;
  }
  // 不是 URL 直接当 emoji 用
  return avatar;
};

/** 相对时间格式化（"刚刚 / 5分钟前 / 3小时前 / 2天前 / 2026-06-01"） */
const formatRelativeTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const t = new Date(timeStr.replace(/-/g, '/')).getTime();
  if (isNaN(t)) return timeStr;
  const diff = Date.now() - t;
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}小时前`;
  if (diff < 7 * 86400_000) return `${Math.floor(diff / 86400_000)}天前`;
  return timeStr.slice(0, 10);
};

export const mapCommunityPostDTOToSocialPost = (dto: CommunityPostDTO): SocialPost => {
  const images = parseImagesField(dto.imagesJson).map(resolveImageUrl);
  const tags = parseImagesField(dto.tagsJson);

  const authorName = dto.authorName || dto.nickName || dto.userName || '匿名美食家';
  const authorAvatar = resolveAvatar(dto.authorAvatar || dto.avatar);

  return {
    id: String(dto.id),
    author: authorName,
    avatar: authorAvatar,
    emoji: undefined,
    title: dto.title,
    likes: dto.likeCount ?? 0,
    comments: [], // 列表不带评论，详情页另外拉
    isLiked: dto.isLiked ?? false,
    isSaved: dto.isSaved ?? dto.isCollected ?? false,
    image: images[0],
    images,              // ⭐ Step 5：完整图片数组
    caption: dto.content,
    stars: undefined,
    time: formatRelativeTime(dto.createTime),
    saves: dto.collectCount ?? 0,
    tags,
  };
};

// ============================================================================
// 评论 DTO -> ViewModel
// ============================================================================
export const mapCommentDTOToSocialComment = (dto: CommentDTO): SocialComment => {
  const avatar = resolveAvatar(dto.userAvatar || dto.avatar);
  const name = dto.userName || dto.nickName || `用户${dto.userId}`;

  return {
    id: String(dto.id),
    name,
    text: dto.content,
    time: formatRelativeTime(dto.createTime),
    likes: dto.likeCount ?? 0,
    dislikes: dto.dislikeCount ?? 0,
    userLiked: dto.isLiked ?? false,
    userDisliked: dto.isDisliked ?? false,
    replies: [],
    // 把后端字段透传给前端，方便后续调点赞/踩接口时用
    // @ts-ignore
    _avatar: avatar,
    // @ts-ignore
    _userId: dto.userId,
    // @ts-ignore
    _parentId: dto.parentId,
  };
};

// ============================================================================
// 用户偏好 DTO -> ViewModel
// ============================================================================
const mapBackendLevelToFrontend = (level: string): 'junior' | 'senior' => {
  if (level === 'junior' || level === 'beginner') return 'junior';
  if (level === 'senior' || level === 'intermediate' || level === 'advanced') return 'senior';
  return 'junior';
};

const mapFrontendLevelToBackend = (level: 'junior' | 'senior'): string => {
  return level;
};

export interface PreferenceViewModel {
  cookingLevel: 'junior' | 'senior';
  tasteTendency: string;
  avoidIngredients: string[];
  allergens: string[];
  commonTools: string[];
  mealReminder: boolean;
  reminderTime: string;
}

export const mapPreferenceDTOToViewModel = (dto: any): PreferenceViewModel => {
  const parseArrayOrString = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  let tasteTendency = '不挑（默认）';
  if (dto.flavorPreference) {
    if (Array.isArray(dto.flavorPreference)) {
      tasteTendency = dto.flavorPreference[0] || '不挑（默认）';
    } else if (typeof dto.flavorPreference === 'string') {
      tasteTendency = dto.flavorPreference;
    }
  }

  return {
    cookingLevel: mapBackendLevelToFrontend(dto.cookingLevel),
    tasteTendency,
    avoidIngredients: parseArrayOrString(dto.avoidIngredients),
    allergens: parseArrayOrString(dto.allergens),
    commonTools: parseArrayOrString(dto.commonTools),
    mealReminder: Boolean(dto.mealReminder),
    reminderTime: dto.reminderTime || '12:00',
  };
};

export const mapPreferenceViewModelToDTO = (vm: PreferenceViewModel): any => {
  return {
    cookingLevel: mapFrontendLevelToBackend(vm.cookingLevel) as any,
    flavorPreference: vm.tasteTendency ? [vm.tasteTendency] : [],
    avoidIngredients: vm.avoidIngredients || [],
    allergens: vm.allergens || [],
    commonTools: vm.commonTools || [],
    mealReminder: vm.mealReminder ? 1 : 0,
    reminderTime: vm.reminderTime,
  };
};

// ============================================================================
// 烹饪记录 DTO -> ViewModel
// ============================================================================
export interface CookingLogViewModel {
  id: string;
  name: string;
  date: string;
  stars: number;
  note: string;
  emoji: string;
  duration: number;
  recipeId?: number;
}

export const mapCookingRecordDTOToLog = (dto: CookingRecordDTO): CookingLogViewModel => {
  const imagesRaw: any = (dto as any).imagesJson;
  let images: string[] = [];
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw.filter(Boolean);
  } else if (typeof imagesRaw === 'string' && imagesRaw) {
    try {
      const arr = JSON.parse(imagesRaw);
      images = Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch { /* ignore */ }
  }

  const stepsRaw: any = (dto as any).stepsJson;
  let steps: string[] = [];
  if (Array.isArray(stepsRaw)) {
    steps = stepsRaw.filter(Boolean);
  } else if (typeof stepsRaw === 'string' && stepsRaw) {
    try {
      const arr = JSON.parse(stepsRaw);
      steps = Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch { /* ignore */ }
  }

  const tagsRaw: any = (dto as any).tagsJson;
  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    tags = tagsRaw.filter(Boolean);
  } else if (typeof tagsRaw === 'string' && tagsRaw) {
    try {
      const arr = JSON.parse(tagsRaw);
      tags = Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch { /* ignore */ }
  }

  return {
    id: String(dto.id),
    name: dto.recipeTitle || '未命名',
    date: (dto.cookDate || '').slice(0, 10),
    stars: dto.rating ?? 0,
    note: dto.note || '',
    emoji: images.length > 0 ? '📸' : '🥘',
    duration: 0,
    recipeId: dto.recipeId,
    // 透传给视图层（CookingLogEditorPage / Viewer 都能用）
    // @ts-ignore
    images,
    // @ts-ignore
    steps,
    // @ts-ignore
    tags,
    // @ts-ignore
    fromRecipe: !!dto.recipeId,
  };
};

/**
 * 前端 ViewModel -> 后端新增/编辑 DTO
 */
export const mapLogVMToCookingRecordAddDTO = (vm: any): any => {
  return {
    recipeId: vm.recipeId != null && !isNaN(Number(vm.recipeId)) ? Number(vm.recipeId) : undefined,
    recipeTitle: vm.name,
    rating: vm.stars ?? 0,
    note: vm.note || '',
    imagesJson: Array.isArray(vm.images) && vm.images.length > 0 ? vm.images : undefined,
    stepsJson: Array.isArray(vm.steps) && vm.steps.length > 0 ? vm.steps : undefined,
    tagsJson: Array.isArray(vm.tags) && vm.tags.length > 0 ? vm.tags : undefined,
    cookDate: ((vm.date || new Date().toISOString().slice(0, 10)) + ' 12:00:00'),
  };
};