export interface Food {
  name: string;
  emoji: string;
  category: 'veggie' | 'meat' | 'staple';
  calories: number; // per 100g
  alias: string;
  pinyin: string;
}

// ⭐ 食材项（来自后端 recipe.ingredients_json）
export interface RecipeIngredient {
  name: string;
  amount?: string;
  isMain?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  time: number; // minutes
  calories: number; // kcal
  difficulty: '入门' | '比较容易' | '中等' | '较高';
  stars: number; // 1-5
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  glIndex?: number; // Glycemic load
  healthScore?: number; // 1-10
  steps: string[];
  coverEmoji: string;
  // ⭐ 新增：菜谱所需食材（来自后端 ingredients_json）
  ingredients?: RecipeIngredient[];
}

export interface MockPost {
  id: string;
  author: string;
  avatar: string;
  emoji: string;
  title: string;
  likes: number;
  comments: Array<{ name: string; text: string; time: string }>;
  isLiked: boolean;
  isSaved: boolean;
}

export interface SocialCommentReply {
  name: string;
  text: string;
  time: string;
  likes: number;
  dislikes: number;
}

export interface SocialComment {
  id: string;
  name: string;
  text: string;
  time: string;
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
  replies?: SocialCommentReply[];
}

export interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  emoji?: string;
  title: string;
  likes: number;
  comments: SocialComment[];
  isLiked: boolean;
  isSaved: boolean;
  coverEmoji?: string;
  image?: string;
  images?: string[];    // ⭐ Step 5：多张图（小红书风格切换用）
  caption?: string;
  stars?: number;
  time?: string;
  saves?: number;
  tags?: string[];
}

export interface ScanItem {
  name: string;
  weight: number; // grams
  calories: number; // kcal
}

// ============ 作者主页视图模型（Community） ============
export interface AuthorProfileVM {
  name: string;
  avatar: string;
  bio: string;
  followers: string;
  following: string;
  likes: string;
  posts: SocialPost[];
}
