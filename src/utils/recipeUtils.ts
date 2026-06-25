/**
 * 菜谱相关工具函数
 * 从 App.tsx 提取，纯函数无副作用
 */

/**
 * 根据菜谱名获取图片URL（Unsplash）
 */
export const getRecipeImageUrl = (recipeName: string): string => {
  if (recipeName.includes('番茄西兰花')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('白菜') || recipeName.includes('五花肉')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('牛肉') || recipeName.includes('蛋面') || recipeName.includes('牛里脊')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('什锦') || recipeName.includes('乱炖') || recipeName.includes('蔬菜')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('鳕鱼') || recipeName.includes('粥')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('排骨') || recipeName.includes('糖醋')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('米粉') || recipeName.includes('面')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60';
  }
  if (recipeName.includes('鸡') || recipeName.includes('鸡肉') || recipeName.includes('鸡胸') || recipeName.includes('鸡翅')) {
    return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60';
  }
  return '';
};

/**
 * 根据菜谱名推断所需食材
 */
export const getRecipeIngredients = (recipeName: string): string[] => {
  const name = recipeName || '';
  if (name.includes('番茄西兰花')) return ['西兰花', '红番茄', '香蒜瓣'];
  if (name.includes('白菜') || name.includes('五花肉')) return ['精选五花肉', '大白菜', '生姜', '大蒜'];
  if (name.includes('牛肉') || name.includes('面') || name.includes('牛里脊')) return ['极佳级牛里脊', '手工麦蛋面', '走地鸡蛋', '香青葱'];
  if (name.includes('乱炖') || name.includes('蔬菜') || name.includes('什锦')) return ['大洋葱', '胡萝卜', '高山土豆', '春青豆', '干香菇'];
  if (name.includes('鳕鱼') || name.includes('粥')) return ['深海银鳕鱼', '即食燕麦', '鲜嫩香菇丝', '嫩生姜'];
  if (name.includes('排骨') || name.includes('糖醋') || name.includes('砂锅')) return ['肋排骨', '熟红番茄', '番茄沙司', '冰糖'];
  if (name.includes('面条') || name.includes('鲜虾') || name.includes('秋葵')) return ['大天然沼虾', '嫩绿秋葵', '手擀细面条', '大蒜瓣'];
  if (name.includes('南瓜') || name.includes('鸡肉')) return ['鸡胸肉', '红南瓜', '胡萝卜', '小洋葱'];
  return ['核心膳食膳料', '精制葱花', '家常调味料'];
};