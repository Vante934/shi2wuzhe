/**
 * 厨艺等级工具
 *
 * 统一规则，所有页面都用这里
 * 等级判断依据：用户累计烹饪记录数
 */

export interface LevelInfo {
  /** 等级序号 LV1~LV5 */
  lv: number;
  /** 等级名称（带emoji） */
  name: string;
  /** 等级名称（不带emoji，用于徽章） */
  shortName: string;
  /** 当前等级最低烹饪数 */
  baseRequired: number;
  /** 下一等级所需烹饪数；满级为 999 */
  nextRequired: number;
  /** 下一等级名称 */
  nextLevelName: string;
  /** 距离下一等级还需的菜数 */
  dishesToNext: number;
  /** 等级进度百分比 0~100 */
  percent: number;
}

/**
 * 根据累计烹饪数返回等级信息
 */
export function getLevelByCookingCount(totalCooked: number): LevelInfo {
  let lv = 1;
  let name = '厨房萌新 🥑';
  let shortName = '厨房萌新';
  let baseRequired = 0;
  let nextRequired = 3;
  let nextLevelName = '烹饪能手 🍳';

  if (totalCooked >= 15) {
    lv = 5;
    name = '食神宗师 👑';
    shortName = '食神宗师';
    baseRequired = 15;
    nextRequired = 999;
    nextLevelName = '已登峰造极';
  } else if (totalCooked >= 10) {
    lv = 4;
    name = '珍馐大厨 👨‍🍳';
    shortName = '珍馐大厨';
    baseRequired = 10;
    nextRequired = 15;
    nextLevelName = '食神宗师 👑';
  } else if (totalCooked >= 6) {
    lv = 3;
    name = '美食达人 🥗';
    shortName = '美食达人';
    baseRequired = 6;
    nextRequired = 10;
    nextLevelName = '珍馐大厨 👨‍🍳';
  } else if (totalCooked >= 3) {
    lv = 2;
    name = '烹饪能手 🍳';
    shortName = '烹饪能手';
    baseRequired = 3;
    nextRequired = 6;
    nextLevelName = '美食达人 🥗';
  }

  const dishesToNext = nextRequired === 999 ? 0 : nextRequired - totalCooked;
  const percent =
    nextRequired === 999
      ? 100
      : Math.min(
          100,
          Math.max(0, ((totalCooked - baseRequired) / (nextRequired - baseRequired)) * 100)
        );

  return {
    lv,
    name,
    shortName,
    baseRequired,
    nextRequired,
    nextLevelName,
    dishesToNext,
    percent,
  };
}