/**
 * 随机分配用户资料工具
 * 注册时给新用户分配随机昵称/头像/签名
 */

const NICKNAME_PREFIX = [
  '识食物者', '小厨神', '吃货', '美食家', '探店达人', 
  '料理研究员', '深夜食堂', '味蕾旅人', '锅气少年', '砂锅守护者',
];

const AVATAR_EMOJIS = [
  '🎒', '👩‍🍳', '👨‍🍳', '🥗', '🍩', '🥑', '🥣',
  '🍔', '🍕', '🍜', '🍱', '🍳', '🥘', '🍲', '🥟', '🍙',
];

const BIO_POOL = [
  '识食物者为俊杰，今天也有好好吃饭！',
  '人间烟火气，最抚凡人心 🍳',
  '今天吃点不一样的 🥢',
  '减脂期路过，求推荐低卡好物～',
  '一人食 / 三餐四季 / 慢生活',
  '正在解锁人生第 100 道菜 🔥',
  '从外卖星人到自炊小能手的进化日记',
  '深夜厨房永不打烊 🌙',
  '吃饱了才有力气减肥（雾）',
  '今日份的烟火气，已签收 📦',
];

/**
 * 生成一个 4 位随机数字编号
 */
function randomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * 从数组随机抽一项
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成随机用户资料
 * @returns { nickName, avatar, bio }
 */
export function generateRandomProfile() {
  return {
    nickName: `${pick(NICKNAME_PREFIX)}_${randomCode()}`,
    avatar: pick(AVATAR_EMOJIS),
    bio: pick(BIO_POOL),
  };
}