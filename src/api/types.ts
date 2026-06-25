/**
 * 后端 DTO 类型定义
 * 严格按照接口文档返回的字段定义
 * 不允许组件直接使用这些类型，必须通过 mappers 转换
 */

// ============ 通用 ============
export interface PageDTO<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// ============ 认证 ============
export interface CaptchaDTO {
  captchaEnabled: boolean;
  uuid: string;
  img: string; // base64
}

export interface LoginParamsDTO {
  username: string;
  password: string;
  code: string;
  uuid: string;
}

export interface UserInfoDTO {
  user: {
    userId: number;
    userName: string;
    nickName: string;
    avatar: string;
    sex: string; // '0'男 '1'女 '2'未知
    email?: string;
    phonenumber?: string;
    remark?: string;
    // 扩展字段（来自 user_extend 表）
    bio?: string;
    region?: string;
    constellation?: string;
    customAvatar?: string;
  };
  roles: string[];
  permissions: string[];
}

// ============ 食材 ============
export interface IngredientCategoryDTO {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface IngredientDTO {
  id: number;
  name: string;
  emoji?: string;
  alias?: string;
  pinyin?: string;
  categoryId: number;
  categoryName?: string;
  calories?: number;
  /** ⭐ 排序权重（手动调整显示顺序，越小越靠前） */
  sortOrder?: number;
  /** ⭐ 是否常用：1常用 0不常用 */
  isCommon?: number;
}

// ============ 菜谱 ============
export interface RecipeDTO {
  id: number;
  title: string;
  description?: string;
  cuisineType?: string;
  difficulty: number; // 1简单 2中等 3困难 (建议改成4档对应前端)
  cookTime: number;
  coverImage?: string;
  coverEmoji?: string;
  ingredientsJson?: string; // JSON.stringify([{name, amount}])
  stepsJson?: string;       // JSON.stringify([{step, description, images}])
  tagsJson?: string;        // JSON.stringify([string])
  
  // 营养信息（需后端补充字段）
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  glIndex?: number;
  healthScore?: number;

  // 统计
  viewCount?: number;
  likeCount?: number;
  collectCount?: number;
  commentCount?: number;
  rating?: number;
  
  // 用户态（需后端在登录态下返回）
  isLiked?: boolean;
  isCollected?: boolean;
  
  // 元数据
  source?: 'system' | 'user' | 'ai';
  status?: number;
  userId?: number;
  createTime?: string;
}

export interface RecipeIngredientItem {
  name: string;
  amount: string;
}

export interface RecipeStepItem {
  step: number;
  description: string;
  images?: string[];
}

// ============ 社区帖子 ============
export interface CommunityPostDTO {
  id: number;
  userId: number;
  userName?: string;
  nickName?: string;
  avatar?: string;

  // 后端补充的字段（来自 SysUser + UserExtend join）
  authorName?: string | null;
  authorAvatar?: string | null;

  title: string;
  content: string;

  // ⚠️ 改：后端用 JacksonTypeHandler，返回的是数组不是字符串
  imagesJson?: string[] | string | null;
  tagsJson?: string[] | string | null;

  recipeId?: number | null;

  likeCount: number;
  commentCount: number;
  collectCount: number;
  viewCount?: number;

  // 用户态（后端 join user_like / user_collect）
  isLiked?: boolean;
  isSaved?: boolean;       // ⚠️ 后端字段名是 isSaved，不是 isCollected
  isCollected?: boolean;   // 兼容旧字段名

  createTime: string;
  updateTime?: string;
  status?: number;
}

// ============ 评论 ============
export interface CommentDTO {
  id: number;
  userId: number;
  userName?: string;
  userAvatar?: string;       // ⚠️ 后端字段叫 userAvatar，不是 avatar
  nickName?: string;         // 兼容
  avatar?: string;           // 兼容

  targetType: 1 | 2;
  targetId: number;
  content: string;
  parentId?: number | null;
  replyToUserId?: number | null;
  replyToUserName?: string | null;

  likeCount: number;
  dislikeCount?: number;     // ⚠️ 新增：踩数
  isLiked?: boolean;
  isDisliked?: boolean;      // ⚠️ 新增：是否踩过
  replyCount?: number;
  createTime: string;
}

// ============ 用户偏好 ============
export interface UserPreferenceDTO {
  id?: number;
  userId?: number;
  cookingLevel: 'beginner' | 'intermediate' | 'advanced' | 'junior' | 'senior';

  // ⚠️ 改：后端用 JacksonTypeHandler，全是数组
  flavorPreference?: string[] | string;
  avoidIngredients?: any[] | string;     // List<Object>，前端传 string[] 也能存
  allergens?: string[] | string;
  commonTools?: any[] | string;
  dietaryHabits?: string[] | string;

  mealReminder?: number;
  reminderTime?: string;

  createTime?: string;
  updateTime?: string;
}

// ============ 烹饪记录 ============
export interface CookingRecordDTO {
  id: number;
  userId: number;
  recipeId?: number;             // 可空（手工打卡）
  recipeTitle: string;
  rating: number;
  note?: string;
  imagesJson?: string;
  cookDate: string;
  createTime?: string;
}

export interface CookingRecordAddDTO {
  recipeId?: number;
  recipeTitle: string;
  rating: number;
  note?: string;
  imagesJson?: string;
  cookDate: string;
}

// ============ 文件上传 ============
export interface UploadResultDTO {
  code: number;
  url: string;
  fileName: string;
  newFileName: string;
  originalFilename: string;
}