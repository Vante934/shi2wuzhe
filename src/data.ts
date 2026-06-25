import { Food, Recipe, MockPost } from './types';

export const ROSTER_VEGGIES: Food[] = [
  { name: '西兰花', emoji: '🥦', category: 'veggie', calories: 34, alias: '椰菜花,绿花菜', pinyin: 'xlh' },
  { name: '大白菜', emoji: '🥬', category: 'veggie', calories: 13, alias: '黄芽白,包心白菜', pinyin: 'dbc' },
  { name: '洋葱头', emoji: '🧅', category: 'veggie', calories: 40, alias: '皮牙子,圆葱,洋葱', pinyin: 'yct' },
  { name: '胡萝卜', emoji: '🥕', category: 'veggie', calories: 41, alias: '红萝卜,丁香萝卜', pinyin: 'hlb' },
  { name: '鲜秋葵', emoji: '🥒', category: 'veggie', calories: 37, alias: '羊角豆,秋葵', pinyin: 'xqk' },
  { name: '香菇块', emoji: '🍄', category: 'veggie', calories: 26, alias: '冬菇,香蕈,蘑菇', pinyin: 'xgk' },
  { name: '青豆仁', emoji: '🫛', category: 'veggie', calories: 81, alias: '豌豆,甜豆', pinyin: 'qdr' },
  { name: '红南瓜', emoji: '🎃', category: 'veggie', calories: 26, alias: '金瓜,番瓜,南瓜', pinyin: 'hng' },
  { name: '圣女果', emoji: '🍅', category: 'veggie', calories: 22, alias: '小番茄,樱桃番茄', pinyin: 'sng' },
  { name: '绿韭菜', emoji: '🥬', category: 'veggie', calories: 25, alias: '起阳草,懒人菜', pinyin: 'ljc' },
  { name: '甜玉米', emoji: '🌽', category: 'veggie', calories: 86, alias: '苞米,棒子,玉米', pinyin: 'tym' },
  { name: '嫩茄子', emoji: '🍆', category: 'veggie', calories: 25, alias: '矮瓜,吊瓜,茄子', pinyin: 'nqz' }
];

export const ROSTER_MEATS: Food[] = [
  { name: '牛里脊', emoji: '🥩', category: 'meat', calories: 106, alias: '牛肉条,牛柳,牛肉', pinyin: 'nlj' },
  { name: '五花肉', emoji: '🥓', category: 'meat', calories: 350, alias: '三层肉,肋条肉,猪肉', pinyin: 'whr' },
  { name: '鸡胸肉', emoji: '🍗', category: 'meat', calories: 133, alias: '鸡脯肉,鸡肉条,鸡肉', pinyin: 'jxr' },
  { name: '小排骨', emoji: '🍖', category: 'meat', calories: 278, alias: '猪排,肋排,排骨', pinyin: 'xpg' },
  { name: '大沼虾', emoji: '🍤', category: 'meat', calories: 93, alias: '基围虾,大虾,鲜虾', pinyin: 'dzx' },
  { name: '银鳕鱼', emoji: '🐟', category: 'meat', calories: 105, alias: '鳕鱼,白鳕鱼,鱼肉', pinyin: 'yxy' },
  { name: '梭子蟹', emoji: '🦀', category: 'meat', calories: 95, alias: '白蟹,飞蟹,螃蟹', pinyin: 'szx' },
  { name: '鲜鸡蛋', emoji: '🥚', category: 'meat', calories: 143, alias: '蛋,鸡子,鸡蛋,蛋液', pinyin: 'xjd' }
];

export const ROSTER_STAPLES: Food[] = [
  { name: '白米饭', emoji: '🍚', category: 'staple', calories: 116, alias: '大米饭,米饭,白饭', pinyin: 'bmf' },
  { name: '手擀面', emoji: '🍜', category: 'staple', calories: 280, alias: '面条,捞面,生面', pinyin: 'sgm' },
  { name: '烤馒头', emoji: '🌾', category: 'staple', calories: 220, alias: '馒头片,饽饽,馒头', pinyin: 'kmt' },
  { name: '燕麦粥', emoji: '🥣', category: 'staple', calories: 67, alias: '麦片粥,燕麦片,燕麦', pinyin: 'ymz' },
  { name: '煮红薯', emoji: '🍠', category: 'staple', calories: 86, alias: '地瓜,甘薯,红薯', pinyin: 'zhs' },
  { name: '意面条', emoji: '🍝', category: 'staple', calories: 351, alias: '意大利面,通心粉,意面', pinyin: 'ymt' }
];

export const POT_LIST = [
  { name: '极简麦饭石炒锅', icon: '🍳', isLarge: false },
  { name: '经典不粘炖煮锅', icon: '🍲', isLarge: false },
  { name: '迷你日式底汤锅', icon: '🫕', isLarge: false },
  { name: '不锈钢多功能蒸锅', icon: '🥡', isLarge: false },
  { name: '智能家用空气炸锅', icon: '🍟', isLarge: false },
  { name: '全能能炒能煮大锅', icon: '🫕', isLarge: true },
  { name: '懒人智能压力锅', icon: '🍛', isLarge: false },
  { name: '微音极速微波炉', icon: '📟', isLarge: false }
];

export const SEASONING_STICKIES = ['食盐', '生抽', '辣椒面', '黑胡椒', '冰糖', '葱姜蒜', '香醋', '料酒', '蚝油'];

export const RECIPES_DATABASE: Recipe[] = [
  {
    id: '1',
    name: '鲜美番茄西兰花',
    time: 5,
    calories: 140,
    difficulty: '入门',
    stars: 4,
    protein: 6,
    carbohydrates: 12,
    fat: 4,
    glIndex: 2.1,
    healthScore: 9.2,
    coverEmoji: '🥦🍅',
    steps: [
      '准备工作：将西兰花洗净切成均匀的小朵，番茄洗净切成小橘瓣，准备蒜末。',
      '温油热脑：预热炒锅放入适量清油，爆香蒜末，直到边缘呈现金黄色。',
      '下入番茄：倒入切好的番茄，大火翻炒，用锅铲轻轻挤压番茄炒出浓厚的汁液。',
      '合炒收汁：倒入西兰花，调入盐和白糖大火拌炒1分钟，盖上锅盖焖煮20秒，汁水紧裹即可出锅。'
    ]
  },
  {
    id: '2',
    name: '五花肉焖白菜',
    time: 12,
    calories: 380,
    difficulty: '比较容易',
    stars: 5,
    protein: 18,
    carbohydrates: 10,
    fat: 28,
    glIndex: 1.5,
    healthScore: 7.8,
    coverEmoji: '🥓🥬',
    steps: [
      '切配原料：五花肉切成2mm厚的薄片。大白菜顺着叶脉撕成小块、洗净沥干。',
      '煸炒出油：锅热后不放油，下五花肉片中小火煸炒。五花肉收缩出油、呈现焦黄色。',
      '炝锅增香：加入大蒜、姜丝，调入一勺生抽、白醋，激发出酱焦香味。',
      '焖煮入味：下入白菜叶大火翻炒至变软，淋入少量醋，盖上盖子用菜叶自身的水分润熟焖煮3分钟，收干汤汁出锅。'
    ]
  },
  {
    id: '3',
    name: '牛里脊滑蛋面条',
    time: 10,
    calories: 450,
    difficulty: '中等',
    stars: 5,
    protein: 34,
    carbohydrates: 48,
    fat: 14,
    glIndex: 4.8,
    healthScore: 8.9,
    coverEmoji: '🥩🥚',
    steps: [
      '腌渍牛肉：牛里脊切片，放入盐、生抽、生粉和少许水，抓拌至水分全部吸干备用。',
      '煮面待用：水开下入面条，煮至七成熟撈出过凉水、放入碗中。',
      '滑熟牛柳：锅中下少许底油，牛肉滑入迅速滑散炒至发白，倒入打散的鸡蛋液翻炒至半凝固。',
      '浇盖拌香：将滑润的蛋液与牛肉香气一起盖在白面条上，点缀葱花，香气逼人。'
    ]
  },
  {
    id: '4',
    name: '乱炖什锦鲜蔬菜',
    time: 15,
    calories: 220,
    difficulty: '入门',
    stars: 3,
    protein: 8,
    carbohydrates: 25,
    fat: 6,
    glIndex: 2.8,
    healthScore: 9.5,
    coverEmoji: '🫛🧅🥕',
    steps: [
      '食材切件：将洋葱头、胡萝卜、香菇、青豆切配完毕，红薯切滚刀块。',
      '爆锅起鲜：锅底放一调羹油，下洋葱、香菇片翻炒直到散发香菇清香。',
      '加水焖煮：加入胡萝卜、红薯、青豆，倒入清鸡汤或清水，加少量老抽，中火焖煮8分钟直到红薯变软。',
      '收汁出菜：撒盐、少许糖和生抽调味，大火收汁，淋两滴麻油，即可品尝。'
    ]
  },
  {
    id: '5',
    name: '清香鳕鱼燕麦粥',
    time: 8,
    calories: 190,
    difficulty: '入门',
    stars: 5,
    protein: 20,
    carbohydrates: 22,
    fat: 5,
    glIndex: 1.8,
    healthScore: 9.8,
    coverEmoji: '🥣🐟',
    steps: [
      '鱼片腌制：银鳕鱼解冻后改刀成薄片，加入少许姜丝、食盐腌渍5分钟。',
      '麦片煲底：清水下锅，水开倒入即食燕麦片，小火不停揉匀搅拌2分钟直到奶沫溢出。',
      '下鱼去腥：下入鳕鱼片和嫩香菇丝，转大火煮开1分半。',
      '出锅入味：出锅前撒入白胡椒粉、葱末、熟青豆仁，鳕鱼滑嫩，燕麦口感香糯。'
    ]
  },
  {
    id: '6',
    name: '茄汁排骨砂锅煲',
    time: 30,
    calories: 510,
    difficulty: '较高',
    stars: 4,
    protein: 28,
    carbohydrates: 18,
    fat: 32,
    glIndex: 2.5,
    healthScore: 7.2,
    coverEmoji: '🍖🍅',
    steps: [
      '排骨焯水：冷水下小排骨，加入料酒和姜，水开焯去浮沫、洗净捞干备yont。',
      '煎至金黄：锅底少油，中火煎排骨边缘发焦，煸出肥油。',
      '炒制茄汁：倒入一碗番茄酱和热水，下入姜片、冰糖、食盐和老抽。',
      '焖煮软烂：全部移入热砂锅，盖上锅盖慢火煨25分钟直到排骨软烂，最后大火收汁，排骨红亮晶莹。'
    ]
  },
  {
    id: '7',
    name: '低脂鲜虾秋葵拌面',
    time: 10,
    calories: 320,
    difficulty: '入门',
    stars: 5,
    protein: 24,
    carbohydrates: 40,
    fat: 5,
    glIndex: 3.2,
    healthScore: 9.6,
    coverEmoji: '🍤🥒🍜',
    steps: [
      '焯烫时蔬：秋葵整根焯水1分钟、切小轮。大沼虾煮熟去底、去壳备用。',
      '煮熟面条：锅中下入手擀面或意面，水滚捞出控水用直饮水冰镇。',
      '秘制酱汁：用两勺生抽、半勺白醋、半勺蚝油、香油和蒜末调成微咸酱汁。',
      '捞起拌匀：盆中放入面条，铺上秋葵段与虾仁，淋上香浓酱汁，拌动即食。'
    ]
  },
  {
    id: '8',
    name: '南瓜胡萝卜鸡肉盅',
    time: 15,
    calories: 240,
    difficulty: '比较容易',
    stars: 4,
    protein: 26,
    carbohydrates: 20,
    fat: 5,
    glIndex: 2.2,
    healthScore: 9.4,
    coverEmoji: '🎃🍗🥕',
    steps: [
      '腌渍胸肉：鸡胸肉切丁，抓入酱油、蛋白腌渍嫩白。',
      '焖软瓜瓤：南瓜洗净切成大块，胡萝卜切片，放入大碗中微波炉高火加热3分钟使其变脆软。',
      '入锅滑熟：炒锅烧热，爆香洋葱，倒入鸡胸肉炒出，加胡萝卜、南瓜丁一起大火翻炒。',
      '香气调和：加盐调味，再倒小半碗水，中火盖盖焖2分钟让红南瓜的甜融入鸡汤中即可。'
    ]
  }
];

export const INITIAL_POSTS: MockPost[] = [
  {
    id: '1',
    author: '厨艺大主宰',
    avatar: '👩‍🍳',
    emoji: '🥩🥓',
    title: '经典家常回锅肉，下饭神器！超级简单学得快！',
    likes: 512,
    comments: [
      { name: '小粉', text: '看着好有食欲啊！今晚就试一试！', time: '10分钟前' },
      { name: '食客甲', text: '火候大一点更好吃。', time: '5分钟前' }
    ],
    isLiked: false,
    isSaved: false
  },
  {
    id: '2',
    author: '瘦身小达人',
    avatar: '🏃‍♀️',
    emoji: '🥦🥗',
    title: '减脂餐打卡：无油大盘水煮西兰花，三天肉嫩汤甜！',
    likes: 233,
    comments: [
      { name: '小绿', text: '真的可以嘛！今天就开始吃！', time: '20分钟前' }
    ],
    isLiked: true,
    isSaved: true
  },
  {
    id: '3',
    author: '懒人食谱君',
    avatar: '🍳',
    emoji: '🍚🍳',
    title: '手残党福音——一碗有灵魂的超豪华白米酱油拌面！',
    likes: 189,
    comments: [],
    isLiked: false,
    isSaved: false
  },
  {
    id: '4',
    author: '冬日火锅狂人',
    avatar: '🍲',
    emoji: '🥩🍅',
    title: '番茄肥牛小火锅，暖呼呼太治愈了吧！冬日宅家必备',
    likes: 954,
    comments: [],
    isLiked: false,
    isSaved: false
  }
];
