import React, { useState, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Soup,  Lightbulb,  Globe, Home,  User,  Search,  Trash2,  ShoppingCart,  ArrowLeft,  ArrowRight,  Plus,  X,  Tv,  Share2,
  Star,  Minus,  Settings,  ClipboardList,  UtensilsCrossed,  Flame,  Heart,  Sparkles,  Code,  Copy,  Check,  ChevronRight,  HelpCircle,
  ThumbsUp,  ThumbsDown,  BookOpen,  Camera,  RotateCw,  ExternalLink,  MessageSquare,  PlusCircle,  MinusCircle,  Ban,
  Undo2,  ChevronLeft,  ChevronDown,  BarChart3,  UserCheck,  Send
} from 'lucide-react';

import { Food, Recipe, MockPost, SocialPost } from './types';
import { 
  ROSTER_VEGGIES, 
  ROSTER_MEATS, 
  ROSTER_STAPLES, 
  POT_LIST, 
  SEASONING_STICKIES, 
  RECIPES_DATABASE, 
  INITIAL_POSTS 
} from './data';
import { 
  VUE_CODE_STORE, 
  VUE_CODE_EATWELL, 
  VUE_CODE_COMMUNITY, 
  VUE_CODE_SCAN,
  VUE_CODE_LOGIN,
  VUE_CODE_USER_STORE,
  VUE_CODE_STORAGE,
  VUE_CODE_REQUEST,
  VUE_CODE_ROUTER
} from './vue_code';

const getRecipeImageUrl = (recipeName: string): string => {
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
  return ''; // Trigger elegant default fallback design
};

const getRecipeIngredients = (recipeName: string): string[] => {
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

const matchRecipeSearch = (recipe: any, query: string): boolean => {
  if (!query) return true;
  const term = query.toLowerCase().trim();
  
  // 1. Check basic name, steps, coverEmoji matches
  if (recipe.name.toLowerCase().includes(term)) return true;
  if (recipe.coverEmoji.includes(term)) return true;
  if (recipe.steps && recipe.steps.some((step: string) => step.toLowerCase().includes(term))) return true;

  // 2. Ingredients fuzzy search (XX菜, XX肉, XX鱼)
  const ingredients = getRecipeIngredients(recipe.name);
  if (ingredients.some(ing => ing.toLowerCase().includes(term))) return true;

  // Fuzzy matches for general categories:
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

  // 3. Cooking methods fuzzy search (煎、炒、煮、炸)
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

  // 4. Energy rating fuzzy search (低脂、高卡)
  if (term.includes('低脂') || term.includes('低卡') || term.includes('轻食') || term.includes('减肥')) {
    if (recipe.calories < 350) return true;
  }
  if (term.includes('高') || term.includes('高卡') || term.includes('高热量') || term.includes('增肌') || term.includes('丰盛')) {
    if (recipe.calories >= 350) return true;
  }

  // 5. Taste fuzzy search (清淡、麻辣、酸辣、甜辣、甜、咸等)
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

export default function App() {
  // ============================================================================
  // CURRENT VIEWER AND EXPORTS CONTREAUX
  // ============================================================================
  const [activeInspectorView, setActiveInspectorView] = useState<string>('free');
  const [isExporterPanelOpen, setIsExporterPanelOpen] = useState(false);
  const [activeExportFile, setActiveExportFile] = useState<'store_export' | 'eatwell_export' | 'community_export' | 'login_export' | 'user_store_export' | 'request_export' | 'storage_export' | 'router_export' | 'scan_export'>('store_export');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // ============================================================================
  // MAIN NAVIGATION TABS CONTROLS
  // ============================================================================
  const [activeTab, setActiveTab] = useState<'eatwell' | 'inspiration' | 'community' | 'profile'>('eatwell');
  const [subStep, setSubStep] = useState(0); // 0 welcome, 1 veggie, 2 meat, 3 staple, 4 pots, 5 recipes, 6 active cook

  const [recipeDetailSource, setRecipeDetailSource] = useState<'eatwell_recommend' | 'random_inspiration' | 'recipe_square' | 'profile_starred'>('eatwell_recommend');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Query validation helper for forbidden ingredients and allergens (Requirement 7)
  const checkQueryRestrictions = (query: string) => {
    if (!query) return null;
    const qLower = query.toLowerCase().trim();
    if (qLower.length === 0) return null;
    
    // Forbidden food filter check (忌口)
    const matchedForbidden = forbiddenFoodsSelected.find(f => 
      f.toLowerCase().includes(qLower) || qLower.includes(f.toLowerCase())
    );
    if (matchedForbidden) {
      return {
        type: 'forbidden',
        message: '该食材已在偏好设置中被过滤'
      };
    }

    // Allergen check (过敏原)
    const matchedAllergen = allergens.find(a => 
      a.toLowerCase().includes(qLower) || qLower.includes(a.toLowerCase())
    );
    if (matchedAllergen) {
      return {
        type: 'allergen',
        message: '该食材已在标记为过敏原'
      };
    }

    return null;
  };

  // Helper for tasting preferences keywords matching (Requirement 9)
  const checkTastePreferenceRestrictions = (query: string) => {
    if (!query || tasteTendency === '不挑（默认）') return null;
    const qLower = query.toLowerCase().trim();
    if (qLower.length === 0) return null;

    const tasteKeywords = [
      { name: '清淡', keywords: ['清淡', '不辣', '素'] },
      { name: '重口', keywords: ['重口', '麻辣', '重油', '油腻'] },
      { name: '偏辣', keywords: ['辣', '香辣', '辣椒', '剁椒', '红油'] },
      { name: '偏甜', keywords: ['甜', '糖', '蜜'] },
      { name: '偏咸', keywords: ['咸', '盐', '重咸'] }
    ];

    const matchedFilteredTaste = tasteKeywords.find(t => 
      t.name !== tasteTendency && t.keywords.some(kw => qLower.includes(kw))
    );

    if (matchedFilteredTaste) {
      return `您已过滤该口味 请在偏好设置中修改`;
    }
    return null;
  };
  
  // Ingredients Basket Selection State
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([]);
  const [selectedMeats, setSelectedMeats] = useState<string[]>([]);
  const [selectedStaples, setSelectedStaples] = useState<string[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]); // Track chronological selection sequence

  // Config states
  const [activePot, setActivePot] = useState('全能能炒能煮大锅');
  const [potScale, setPotScale] = useState(3); // dine count 1-10 people
  const [matchingMode, setMatchingMode] = useState<'strict' | 'fuzzy' | 'survival'>('strict');
  const [hoveredMode, setHoveredMode] = useState<'strict' | 'fuzzy' | 'survival' | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sizable popup states
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inspirationSearchQuery, setInspirationSearchQuery] = useState('');
  const [isBulbGlow, setIsBulbGlow] = useState(false);
  const [showCongratsSuccess, setShowCongratsSuccess] = useState(false);
  const [defaultRecommendOffset, setDefaultRecommendOffset] = useState(0);

  // Inspiration module states (Module 3 - Random Generator)
  const [inspirationCount, setInspirationCount] = useState(6);
  const [isSpinning, setIsSpinning] = useState(false);
  const [randomizedRecipes, setRandomizedRecipes] = useState<Recipe[]>(RECIPES_DATABASE.slice(0, 6));
  const [isGenerated, setIsGenerated] = useState(false);

  // Recipe details selected index
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [starredRecipes, setStarredRecipes] = useState<string[]>([]);
  const [animatingStarId, setAnimatingStarId] = useState<string | null>(null); // For star bouncing
  const [selectedResultsRecipeId, setSelectedResultsRecipeId] = useState<string | null>(null); // For selected recipe on results page before proceeding
  const [activeCookingStepIndex, setActiveCookingStepIndex] = useState(0);

  // Custom UI elements: Flying items, floating toast cards, and editable logs detail selection
  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<any | null>(null);
  const [isEditingLogDetail, setIsEditingLogDetail] = useState(false);
  const [tempLogName, setTempLogName] = useState('');
  const [tempLogNote, setTempLogNote] = useState('');
  const [tempLogStars, setTempLogStars] = useState(5);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  };

  // Community Feed states with enhanced capabilities
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    return INITIAL_POSTS.map(post => ({
      ...post,
      comments: post.comments.map((comm, cidx) => ({
        ...comm,
        id: `c-${post.id}-${cidx}`,
        likes: Math.floor(Math.random() * 8) + 2,
        dislikes: Math.floor(Math.random() * 2),
        userLiked: false,
        userDisliked: false,
        replies: [
          { name: '食尚小捕快', text: '这个火候很到位，感觉比例很棒！', time: '10分钟前', likes: 1, dislikes: 0 }
        ]
      }))
    }));
  });
  const [activeSidebarFilter, setActiveSidebarFilter] = useState<'all' | 'liked' | 'saved' | 'comments'>('all');
  const [chosenPost, setChosenPost] = useState<SocialPost | null>(null);
  const [currentUserCommentText, setCurrentUserCommentText] = useState('');
  const [isPublishingModal, setIsPublishingModal] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostStars, setNewPostStars] = useState(5);
  const [generatedDraftEmoji, setGeneratedDraftEmoji] = useState('');

  // Profile preferences states
  const [tastePreference, setTastePreference] = useState('1');
  const [forbiddenFoodsSelected, setForbiddenFoodsSelected] = useState<string[]>(['洋葱头']);
  const [diningTipsSwitch, setDiningTipsSwitch] = useState(true);
  const [cookingLevel, setCookingLevel] = useState<'junior' | 'senior'>('junior');
  const [activeProfileTabGroup, setActiveProfileTabGroup] = useState<'main' | 'recipes' | 'preferences' | 'statistics' | 'cooking_logs' | 'account_settings'>('main');
  const [recipeTabMode, setRecipeTabMode] = useState<'original' | 'starred' | 'draft'>('original');

  // New extended states for personalized fields
  const [inspirationSubView, setInspirationSubView] = useState<'search' | 'square' | 'generator'>('generator');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [viewingAuthorProfile, setViewingAuthorProfile] = useState<any | null>(null);
  const [tasteTendency, setTasteTendency] = useState<string>('不挑（默认）');
  const [avoidTags, setAvoidTags] = useState<string[]>(['香菜', '大蒜']);
  const [customAvoids, setCustomAvoids] = useState<string[]>([]);
  const [avoidSearchText, setAvoidSearchText] = useState('');
  const [allergens, setAllergens] = useState<string[]>(['牛奶']);
  const [mealReminder, setMealReminder] = useState<boolean>(true);
  const [profilePassword, setProfilePassword] = useState('123456');
  const [openPrefSection, setOpenPrefSection] = useState<string | null>('cookingMode');

  // Recipes editing & list states
  const [myOriginalRecipes, setMyOriginalRecipes] = useState<any[]>([
    { id: 'or-1', name: '秘制黄金汤汁西兰花锅', coverEmoji: '🥦🍯', calories: 245, time: 8, difficulty: '入门', steps: ['西兰花洗净', '大火清炒'] },
    { id: 'or-2', name: '清脆滑嫩水煮捞芥兰', coverEmoji: '🥬🍤', calories: 180, time: 6, difficulty: '入门', steps: ['芥兰灼水', '淋上海鲜原汁酱油'] },
    { id: 'or-3', name: '一人食超低卡手擀面', coverEmoji: '🍝🍄', calories: 310, time: 10, difficulty: '比较容易', steps: ['手擀面下水', '煮熟捞出拌菌菇酱'] }
  ]);
  const [myDraftRecipes, setMyDraftRecipes] = useState<any[]>([
    { id: 'df-1', name: '高高炖锅海产什锦汤', coverEmoji: '🍲🦀', calories: 350, time: 20, difficulty: '中等', steps: ['备鲜虾和什锦贝类', '慢火吊汤'] },
    { id: 'df-2', name: '小白电热锅胡萝卜滑饭', coverEmoji: '🍚🍗', calories: 420, time: 15, difficulty: '入门', steps: ['备胡萝卜碎及滑鸡肉丁', '拌饭同蒸'] }
  ]);
  const [postImageFile, setPostImageFile] = useState<string | null>(null);
  const [generatedPostEmoji, setGeneratedPostEmoji] = useState<string>('');
  const [myDraftPosts, setMyDraftPosts] = useState<any[]>([
    { id: 'draft-post-1', title: '自制高纤维全麦三明治，控糖减脂推荐！🥪🥦', emoji: '🥪🥦🍳', date: '2026-05-30', author: 'Vante' },
    { id: 'draft-post-2', title: '五花肉大火焖白菜，暖乎乎太香了 🥘🥬', emoji: '🥘🥬🥩', date: '2026-05-29', author: 'Vante' }
  ]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingRecipeName, setEditingRecipeName] = useState('');
  const [editingRecipeEmoji, setEditingRecipeEmoji] = useState('🍲');

  // New customized states for detailed edits, warnings, and settings selection constraints
  const [viewingMyRecipeDetail, setViewingMyRecipeDetail] = useState<any | null>(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState<boolean>(false);
  const [editingDetailName, setEditingDetailName] = useState('');
  const [editingDetailEmoji, setEditingDetailEmoji] = useState('🍲');
  const [hasSelectedSideCookware, setHasSelectedSideCookware] = useState(false);
  const [allergenSearchText, setAllergenSearchText] = useState('');
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState('12:00');
  const [showNoIngredientsPopup, setShowNoIngredientsPopup] = useState(false);
  const [activeAlertTriggered, setActiveAlertTriggered] = useState(false);
  const [showRecipeSharePopup, setShowRecipeSharePopup] = useState(false);
  const [showWXQRCode, setShowWXQRCode] = useState(false);

  // New States for User Checkpoint 1 requirements
  const [cartBadgePop, setCartBadgePop] = useState(false);
  const [showMatchWarning, setShowMatchWarning] = useState(false);
  const [communityFeedTab, setCommunityFeedTab] = useState<'discover' | 'following'>('discover');
  const [isCustomPublishPage, setIsCustomPublishPage] = useState(false);
  const [customPublishTitle, setCustomPublishTitle] = useState('');
  const [customPublishBody, setCustomPublishBody] = useState('');
  const [customPublishSource, setCustomPublishSource] = useState<'community' | 'cooking_logs'>('community');
  const [customPublishEmoji, setCustomPublishEmoji] = useState('🥘');
  const [customPublishImage, setCustomPublishImage] = useState<string | null>(null);
  const [customPublishImages, setCustomPublishImages] = useState<string[]>([]);
  const [customPublishTags, setCustomPublishTags] = useState<string[]>([]);
  const [customPublishStars, setCustomPublishStars] = useState<number>(5);
  const [publishToCommunity, setPublishToCommunity] = useState<boolean>(true);
  const [publishToLogs, setPublishToLogs] = useState<boolean>(true);

  useEffect(() => {
    if (!mealReminder) return;
    const timer = setInterval(() => {
      const now = new Date();
      const currentHrsMins = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (currentHrsMins === reminderTime) {
        if (!activeAlertTriggered) {
          alert(`🔔 识食物者就餐提醒：到达您设定的就餐时间 ${reminderTime} 啦！好好吃饭，元气满满！🍳🌟`);
          setActiveAlertTriggered(true);
        }
      } else {
        setActiveAlertTriggered(false);
      }
    }, 15000); // Check every 15s to be extremely gentle on browser performance
    return () => clearInterval(timer);
  }, [mealReminder, reminderTime, activeAlertTriggered]);

  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [showEmptyWarn, setShowEmptyWarn] = useState(false);
  const [activeReplyCommentIdx, setActiveReplyCommentIdx] = useState<number | null>(null);
  const [commentReplyText, setCommentReplyText] = useState('');

  // Floating heart like dynamic animation
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; left: number }>>([]);

  // Account details states (Goal 3 & 5 real profile)
  const [profileUsername, setProfileUsername] = useState('Vante');
  const [profileBio, setProfileBio] = useState('🍳 识食物为俊杰，今天也有好吃饭！');
  const [profileRegion, setProfileRegion] = useState('吉林');
  const [profileConstellation, setProfileConstellation] = useState('天秤座');
  const [profileGender, setProfileGender] = useState('♀');
  const [profileAvatar, setProfileAvatar] = useState('🎒');

  // Cooking history records logs state (Goal 5 Menu 4)
  const [cookingLogs, setCookingLogs] = useState<Array<{ id: string; name: string; date: string; stars: number; note: string; emoji: string; duration: number }>>([
    { id: '1', name: '鲜美番茄西兰花', date: '2026-05-27', stars: 5, note: '首次尝试微油低脂版，西兰花充分锁住番茄酸甜汁液，美味极了！', emoji: '🥦', duration: 5 },
    { id: '2', name: '五花肉焖白菜', date: '2026-05-26', stars: 4, note: '五花肉充分煸炒出油脂，白菜叶香软糯，汤汁拌饭非常棒！', emoji: '🥬', duration: 12 },
    { id: '3', name: '红南瓜拌手擀面', date: '2026-05-25', stars: 5, note: '将南瓜熬成浓汁淋在面条上，饱腹感十足，咸甜适中。', emoji: '🍜', duration: 15 },
  ]);

  // Dynamic carousel index for Random Inspiration view (Interactive Layout refer to diagram)
  const [activeInspirationIndex, setActiveInspirationIndex] = useState(0);

  // Backup recipes database for "换一道" (cycling replacements)
  const [shownRecipeIds, setShownRecipeIds] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8']);

  // ============================================================================
  // COMPUTED CALCULATED DERIVATIVE VALUES
  // ============================================================================
  // Total chosen ingredients basket items count
  const basketCount = useMemo(() => {
    return selectedVeggies.length + selectedMeats.length + selectedStaples.length;
  }, [selectedVeggies, selectedMeats, selectedStaples]);

  // Combined selected list with calories metadata - ordered chronologically by click selection
  const selectedListWithDetails = useMemo(() => {
    const combined: Food[] = [];
    selectionOrder.forEach(name => {
      let match = ROSTER_VEGGIES.find(x => x.name === name);
      if (!match) match = ROSTER_MEATS.find(x => x.name === name);
      if (!match) match = ROSTER_STAPLES.find(x => x.name === name);
      if (match) combined.push(match);
    });
    return combined;
  }, [selectionOrder]);

  // Calculated exact match verification for Request 5
  const isExactIngredientsMatch = useMemo(() => {
    if (selectedListWithDetails.length === 0) return false;
    const basketNames = selectedListWithDetails.map(x => x.name);
    return shownRecipeIds.some(id => {
      const recipe = RECIPES_DATABASE.find(r => r.id === id);
      if (!recipe) return false;
      const reqIngs = getRecipeIngredients(recipe.name);
      return reqIngs.every(ing => basketNames.includes(ing));
    });
  }, [selectedListWithDetails, shownRecipeIds]);

  // Trigger match warning auto-fadeout when entering recipe recommendations (subStep === 5) (Requirement 3)
  useEffect(() => {
    if (subStep === 5) {
      if (isExactIngredientsMatch) {
         setShowMatchWarning(false);
      } else {
         setShowMatchWarning(true);
         const timer = setTimeout(() => {
           setShowMatchWarning(false);
         }, 5500); // Fades out after 5.5 seconds of display
         return () => clearTimeout(timer);
      }
    }
  }, [subStep, isExactIngredientsMatch]);

  // Aggregate selected calories sum
  const selectedBasketCaloriesTotal = useMemo(() => {
    return selectedListWithDetails.reduce((sum, item) => sum + item.calories, 0);
  }, [selectedListWithDetails]);

  // Filtered ingredients lists based on Forbidden choices in Profile Preferences (忌口过滤)
  const availableVeggiesFiltered = useMemo(() => {
    return ROSTER_VEGGIES.filter(v => !forbiddenFoodsSelected.includes(v.name));
  }, [forbiddenFoodsSelected]);

  const availableMeatsFiltered = useMemo(() => {
    return ROSTER_MEATS.filter(m => !forbiddenFoodsSelected.includes(m.name));
  }, [forbiddenFoodsSelected]);

  const availableStaplesFiltered = useMemo(() => {
    return ROSTER_STAPLES.filter(s => !forbiddenFoodsSelected.includes(s.name));
  }, [forbiddenFoodsSelected]);

  // Triggering visual presets through sidebar simulator controllers
  const handleSelectInspectorPreset = (presetId: string) => {
    setActiveInspectorView(presetId);
    
    switch (presetId) {
      case 'module1-ingredients':
        setActiveTab('eatwell');
        setSubStep(1);
        break;
      case 'module1-pots':
        setActiveTab('eatwell');
        setSubStep(4);
        break;
      case 'module1-recipes':
        setActiveTab('eatwell');
        setSubStep(5);
        setSearchQuery('');
        break;
      case 'module1-detail':
        setActiveTab('eatwell');
        setSubStep(6);
        setActiveCookingStepIndex(1); // Set directly here to step 2 as dynamic sample
        break;
      case 'module2-plaza':
        setActiveTab('eatwell');
        setSubStep(5);
        setSearchQuery('');
        break;
      case 'module2-search':
        setActiveTab('eatwell');
        setSubStep(5);
        setSearchQuery('牛肉');
        break;
      case 'module3-spin-page':
        setActiveTab('inspiration');
        setIsSpinning(false);
        break;
      case 'module3-spin-result':
        setActiveTab('inspiration');
        break;
      case 'module6-community':
        setActiveTab('community');
        setChosenPost(null);
        setIsPublishingModal(false);
        setActiveSidebarFilter('all');
        break;
      case 'module6-post-detail':
        setActiveTab('community');
        setChosenPost(socialPosts[1]); // Choose second mockup post
        setIsPublishingModal(false);
        break;
      case 'module6-publish':
        setActiveTab('community');
        setChosenPost(null);
        setCustomPublishSource('community');
        setCustomPublishTitle('');
        setCustomPublishBody('');
        setCustomPublishStars(5);
        setCustomPublishEmoji('🥘');
        setCustomPublishImage(null);
        setIsCustomPublishPage(true);
        break;
      case 'module7-profile-main':
        setActiveTab('profile');
        setActiveProfileTabGroup('main');
        break;
      case 'module7-preferences':
        setActiveTab('profile');
        setActiveProfileTabGroup('preferences');
        break;
      case 'module7-my-recipes':
        setActiveTab('profile');
        setActiveProfileTabGroup('recipes');
        setRecipeTabMode('original');
        break;
      case 'module7-cook-history':
        setActiveTab('profile');
        setActiveProfileTabGroup('main');
        alert('📊 已在“个人中心主页”为您激活烹饪熟练度（12道菜）和历史获赞（512次）等烹饪历史统计！');
        break;
      case 'module7-account-settings':
        setActiveTab('profile');
        setActiveProfileTabGroup('preferences');
        alert('⚙️ 已在偏好设置下方展示账号选项、基础提示级别及厨房等级设置！');
        break;
      case 'module8-global-search':
        setActiveTab('community');
        setSearchQuery('瓜');
        break;
      default:
        // free interact play state
        break;
    }
  };

  // Spinning dynamic triggers for Module 3 - Random generator
  const handleSpinInspiration = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setIsBulbGlow(true);
    
    let cyclesCount = 0;
    const interval = setInterval(() => {
      // Pick random recipes from full database
      const tempPool = [...RECIPES_DATABASE];
      const randomized: Recipe[] = [];
      const trackingIds = new Set<string>();
      
      while (randomized.length < Math.min(inspirationCount, tempPool.length)) {
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        const item = tempPool[randomIndex];
        // Ensure not containing forbidden ingredients
        const containsForbidden = item.steps.some(step => 
          forbiddenFoodsSelected.some(forbidden => step.includes(forbidden))
        );
        if (!trackingIds.has(item.id) && !containsForbidden) {
          randomized.push(item);
          trackingIds.add(item.id);
        }
      }
      setRandomizedRecipes(randomized);
      cyclesCount++;
      if (cyclesCount > 8) {
        clearInterval(interval);
        setIsSpinning(false);
        setIsGenerated(true);
        // Turn off bulb pulse slightly later or keep glowing
      }
    }, 90);
  };

  // Individual recipe card refresh inside Random generation block (单格换一道)
  const handleRefreshSingleInspiration = (idxToReplace: number) => {
    const currentList = [...randomizedRecipes];
    const excludedIds = currentList.map(r => r.id);
    const availablePool = RECIPES_DATABASE.filter(r => 
      !excludedIds.includes(r.id) && 
      !r.steps.some(step => forbiddenFoodsSelected.some(f => step.includes(f)))
    );
    
    if (availablePool.length > 0) {
      const freshChoice = availablePool[Math.floor(Math.random() * availablePool.length)];
      currentList[idxToReplace] = freshChoice;
      setRandomizedRecipes(currentList);
    }
  };

  // Click handler to toggle selected foods in basket
  const handleToggleIngredient = (name: string, category: 'veggie' | 'meat' | 'staple', e?: React.MouseEvent) => {
    // Check if we are selecting or deselecting
    const isSelecting = category === 'veggie' ? !selectedVeggies.includes(name) :
                        category === 'meat' ? !selectedMeats.includes(name) :
                        !selectedStaples.includes(name);

    if (isSelecting && e) {
      // Find exact emoji dynamically from the roster databases in list so it matches 100% (Requirement 1)
      const findEmoji = (ingName: string): string => {
        const found = [...ROSTER_VEGGIES, ...ROSTER_MEATS, ...ROSTER_STAPLES].find(x => x.name === ingName);
        return found ? found.emoji : '🥦';
      };
      const emo = findEmoji(name);
      
      // Calculate coordinates dynamically for accurate fly-to-cart destination
      const cartEl = document.getElementById('shopping-cart-btn');
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight - 80;
      if (cartEl) {
        const rect = cartEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      const flyId = Date.now() + Math.random();
      setFlyingItems(prev => [...prev, { id: flyId, x: e.clientX, y: e.clientY, targetX, targetY, emoji: emo } as any]);
      
      // Animate cart badge increment immediately (同时 购物车左上角标加1)
      setCartBadgePop(true);
      setTimeout(() => setCartBadgePop(false), 300);

      setTimeout(() => {
        setFlyingItems(prev => prev.filter(x => x.id !== flyId));
      }, 900);
    }

    if (category === 'veggie') {
      setSelectedVeggies(prev => {
        const has = prev.includes(name);
        if (has) {
          setSelectionOrder(order => order.filter(x => x !== name));
          return prev.filter(x => x !== name);
        } else {
          setSelectionOrder(order => [...order.filter(x => x !== name), name]);
          return [...prev, name];
        }
      });
    } else if (category === 'meat') {
      setSelectedMeats(prev => {
        const has = prev.includes(name);
        if (has) {
          setSelectionOrder(order => order.filter(x => x !== name));
          return prev.filter(x => x !== name);
        } else {
          setSelectionOrder(order => [...order.filter(x => x !== name), name]);
          return [...prev, name];
        }
      });
    } else {
      setSelectedStaples(prev => {
        const has = prev.includes(name);
        if (has) {
          setSelectionOrder(order => order.filter(x => x !== name));
          return prev.filter(x => x !== name);
        } else {
          setSelectionOrder(order => [...order.filter(x => x !== name), name]);
          return [...prev, name];
        }
      });
    }
  };

  // Recipe cycling replacement on "换一道" trigger
  const handleCycleReplaceRecipe = (recipeIdToReplace: string) => {
    const listCount = 4;
    const currentListIds = shownRecipeIds;
    const remainingPool = RECIPES_DATABASE.filter(r => !currentListIds.includes(r.id));
    
    if (remainingPool.length > 0) {
      const randomAlternative = remainingPool[Math.floor(Math.random() * remainingPool.length)];
      setShownRecipeIds(prev => prev.map(id => id === recipeIdToReplace ? randomAlternative.id : id));
    } else {
      // Rotate pool instead
      const resetPool = RECIPES_DATABASE.filter(r => r.id !== recipeIdToReplace);
      const choice = resetPool[Math.floor(Math.random() * resetPool.length)];
      setShownRecipeIds(prev => prev.map(id => id === recipeIdToReplace ? choice.id : id));
    }
  };

  // Comment submission trigger
  const handleSubmitComment = () => {
    if (!currentUserCommentText.trim()) {
      setCommentError('✍️ 评论内容不能为空，请先输入字符哦～');
      setTimeout(() => setCommentError(null), 2200);
      return;
    }
    if (!chosenPost) return;
    
    const updatedPost = { ...chosenPost };
    updatedPost.comments.unshift({
      id: `c-${chosenPost.id}-${Date.now()}`,
      name: `${profileUsername} (我)`,
      text: currentUserCommentText,
      time: '刚刚',
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
      replies: []
    });

    setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updatedPost : p));
    setChosenPost(updatedPost);
    setCurrentUserCommentText('');
    showToast('🎉 评论已发布');
  };

  // Reply submission trigger under a specific comment (Goal 2)
  const handleSubmitReply = (commentIdx: number) => {
    if (!commentReplyText.trim()) {
      setCommentError('✍️ 回复内容不能为空，请先输入字符哦～');
      setTimeout(() => setCommentError(null), 2200);
      return;
    }
    if (!chosenPost) return;
    
    const updatedPost = { ...chosenPost };
    const comment = updatedPost.comments[commentIdx];
    if (!comment) return;

    if (!comment.replies) comment.replies = [];
    comment.replies.push({
      name: `${profileUsername} (我)`,
      text: commentReplyText,
      time: '刚刚',
      likes: 0,
      dislikes: 0
    });

    setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updatedPost : p));
    setChosenPost(updatedPost);
    setCommentReplyText('');
    setActiveReplyCommentIdx(null);
    showToast('🎉 回复已发布');
  };

  // Quick caption graphic drawer generator
  const handleGenerativeMockAIPic = () => {
    const list = ['🥗🍲', '🥩🍛', '🍤🥦', '🥣🐟', '🧅🍗', '🍅🥓', '🍝🍄', '🥞🍳'];
    setGeneratedDraftEmoji(list[Math.floor(Math.random() * list.length)]);
  };

  // Floating heart creator for dynamic likes (Goal 3)
  const triggerHeartPop = () => {
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10
    }));
    setFloatingHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 1200);
  };

  const handlePublishNewPost = () => {
    if (!newPostCaption.trim() && !newPostTitle.trim()) {
      alert('⚠️ 标题 or 内容总得填一个，快记录下今天的美食时光吧！');
      return;
    }
    const finalCaption = newPostTitle 
      ? `【${newPostTitle}】 (自评难度/满意度: ${'⭐'.repeat(newPostStars)}) \n\n${newPostCaption}` 
      : newPostCaption;
    const fresh: SocialPost = {
      id: String(socialPosts.length + 1),
      author: 'Vante',
      avatar: profileAvatar,
      emoji: generatedPostEmoji || (postImageFile ? '🖼️' : '🌾🍲'),
      title: finalCaption,
      likes: 1,
      comments: [],
      isLiked: false,
      isSaved: false
    };

    setSocialPosts([fresh, ...socialPosts]);
    // Clear draft states so that exiting doesn't auto-save again
    setNewPostCaption('');
    setNewPostTitle('');
    setNewPostStars(5);
    setGeneratedPostEmoji('');
    setPostImageFile(null);
    setIsPublishingModal(false);
    setActiveTab('community');
    alert('🎉 帖子成功发布到交流社区中进行分享！✨');
  };

  const handlePublishDraftPost = (draft: any) => {
    const fresh = {
      id: String(socialPosts.length + 1),
      author: 'Vante',
      avatar: profileAvatar,
      emoji: draft.emoji || '🌾🍲',
      title: draft.title || draft.name || '未命名草稿食谱',
      likes: 1,
      comments: [],
      isLiked: false,
      isSaved: false
    };
    setSocialPosts([fresh, ...socialPosts]);
    setMyDraftPosts(prev => prev.filter(d => d.id !== draft.id));
    alert('🎉 发布成功！已从草稿箱中取出，成功公开发布到交流社区！✨');
  };

  const handleTextRecognizeIllustration = () => {
    if (!newPostCaption.trim()) {
      alert('💡 识食物者提示：请先在中央编辑区输入一些包含食材名称（如：番茄、牛肉、西兰花、面条等）的文字，方便智能配图进行语义识别识别哦！');
      return;
    }
    const text = newPostCaption;
    let found: string[] = [];
    if (text.includes('番茄') || text.includes('西红柿') || text.includes('tomato')) found.push('🍅');
    if (text.includes('牛') || text.includes('beef')) found.push('🥩');
    if (text.includes('南瓜') || text.includes('pumpkin')) found.push('🎃');
    if (text.includes('西兰花') || text.includes('broccoli')) found.push('🥦');
    if (text.includes('白菜') || text.includes('cabbage')) found.push('🥬');
    if (text.includes('洋葱') || text.includes('onion')) found.push('🧅');
    if (text.includes('玉米') || text.includes('corn')) found.push('🌽');
    if (text.includes('面') || text.includes('pasta') || text.includes('noodle')) found.push('🍝');
    if (text.includes('蛋') || text.includes('egg')) found.push('🍳');
    if (text.includes('鸡') || text.includes('chicken')) found.push('🍗');
    if (text.includes('鱼') || text.includes('fish')) found.push('🐟');
    if (text.includes('虾') || text.includes('shrimp')) found.push('🍤');
    if (text.includes('豆腐') || text.includes('tofu')) found.push('⬜');

    if (found.length > 0) {
      setGeneratedPostEmoji(found.join(''));
      alert(`✨ 文字识别成功！智能匹配到包含食材特征的配图：${found.join(' ')}`);
    } else {
      setGeneratedPostEmoji('🥗🍲');
      alert('✨ 文字识别提示：未检测到高阶食材特征关键词，已为您智能自配精品营养组合插画 🥗🍲 ！');
    }
  };

  const handleGenerateAIIllustration = () => {
    const premiumIllustrations = ['🍕', '🍔', '🍟', '🥗', '🍲', '🍱', '🍛', '🍜', '🍣', '🍤', '🥞', '🐔', '🍗', '🍉', '🥩'];
    const randomPicked = premiumIllustrations[Math.floor(Math.random() * premiumIllustrations.length)];
    setGeneratedPostEmoji(randomPicked);
    alert(`🤖 AI 智能绘画完成：已为您智能绘制了一份美味的实物插图【 ${randomPicked} 】！`);
  };

  const handleClearPostIllustration = () => {
    setPostImageFile(null);
    setGeneratedPostEmoji('');
    alert('🗑️ 已成功清除当前选择的配图和插图！您可以重新上传或点击智能配图。');
  };

  const handleLeavePostCreation = () => {
    if (newPostCaption.trim() || generatedPostEmoji || postImageFile) {
      // Auto save to drafts box
      const newDraft = {
        id: `draft-${Date.now()}`,
        title: newPostCaption || '未命名的美食随笔',
        emoji: generatedPostEmoji || (postImageFile ? '🖼️' : '🥗'),
        date: new Date().toISOString().split('T')[0],
        author: 'Vante'
      };
      setMyDraftPosts(prev => [newDraft, ...prev]);
      alert('💾 识食物者提示：已自动将您编辑中的帖子保存到【个人中心 - 我的食谱（草稿箱）】！');
    }
    // Clear and return to community
    setNewPostCaption('');
    setGeneratedPostEmoji('');
    setPostImageFile(null);
    setActiveTab('community');
  };

  const handleCopySourceCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Filtering feeds based on tab selectors (with Request 9.2 following-vs-discover filter support)
  const filteredSocialPosts = useMemo(() => {
    let base = socialPosts;
    if (activeSidebarFilter === 'liked') {
      base = socialPosts.filter(p => p.isLiked);
    } else if (activeSidebarFilter === 'saved') {
      base = socialPosts.filter(p => p.isSaved);
    }
    
    // Switch between Discover (发现) and Following (关注) feeds
    if (communityFeedTab === 'following') {
      if (followedAuthors.length > 0) {
        base = base.filter(p => followedAuthors.includes(p.author));
      } else {
        // Fallback to displaying self posts if no authors are followed (Requirement 9.2)
        base = base.filter(p => p.author === profileUsername || p.author.toLowerCase().includes('me') || p.author.includes('我'));
      }
    }

    if (searchQuery) {
      base = base.filter(p => 
        p.title.includes(searchQuery) || 
        p.author.includes(searchQuery) ||
        (p.tags && p.tags.some((t: string) => t.includes(searchQuery) || searchQuery.includes(t)))
      );
    }
    return base;
  }, [socialPosts, activeSidebarFilter, searchQuery, communityFeedTab, followedAuthors, profileUsername]);

  // Aggregated nutrition list for Random Recipes view
  const aggregatedRandomNutrition = useMemo(() => {
    let protein = 0;
    let carb = 0;
    let fat = 0;
    let calories = 0;
    
    randomizedRecipes.forEach(r => {
      protein += r.protein;
      carb += r.carbohydrates;
      fat += r.fat;
      calories += r.calories;
    });

    return { protein, carb, fat, calories };
  }, [randomizedRecipes]);

  return (
    <div className="min-h-screen bg-[#333d29] flex flex-col items-center justify-start p-4 md:p-6 select-none overflow-x-hidden">
      <style>{`
        @keyframes steam-rise-1 {
          0% { transform: translateY(12px) scaleX(0.85); opacity: 0; }
          50% { opacity: 0.65; }
          100% { transform: translateY(-44px) scaleX(1.35); opacity: 0; }
        }
        @keyframes steam-rise-2 {
          0% { transform: translateY(15px) scaleX(0.9); opacity: 0; }
          50% { opacity: 0.72; }
          100% { transform: translateY(-56px) scaleX(1.15); opacity: 0; }
        }
        @keyframes float-veg-odd {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-veg-even {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-steam-1 {
          animation: steam-rise-1 2.8s ease-in-out infinite;
        }
        .animate-steam-2 {
          animation: steam-rise-2 2.2s ease-in-out infinite;
        }
        .animate-float-1 {
          animation: float-veg-odd 6.2s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-veg-even 5.2s ease-in-out infinite;
        }
      `}</style>
      
      {/* BRAND HEADER BAR */}
      <header className="w-full max-w-[1700px] flex flex-col lg:flex-row items-center justify-between bg-[#2c3523] border border-[#a2c28f]/20 rounded-2xl px-6 py-4 mb-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-[#8ca779] p-2.5 rounded-xl text-white shadow-md">
            <UtensilsCrossed className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-widest font-sans flex items-center gap-2">
              识食物者
            </h1>
            <p className="text-xs text-stone-300">智能美食社区 · 大卡追踪与营养搭配平台</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 mt-3 lg:mt-0">
          <button
            onClick={() => setIsExporterPanelOpen(true)}
            className={`hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all ${
              isExporterPanelOpen
                ? 'bg-brand-yellow text-brand-grey font-bold shadow-lg'
                : 'bg-[#3b472f] text-stone-200 border border-[#a2c28f]/10 hover:bg-[#465437]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>获取 Vue 3 + Vant 4 完美源代码</span>
          </button>
          
          <button
            onClick={() => handleSelectInspectorPreset('free')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
              activeInspectorView === 'free' 
                ? 'bg-[#8ca779] text-white font-bold' 
                : 'bg-[#1e2417] text-stone-400 hover:text-white'
            }`}
          >
            <span>重置自由交互</span>
          </button>
        </div>
      </header>

      {/* CORE SPLIT WORKSPACE */}
        <main className="w-full max-w-[1700px] flex flex-col gap-6 flex-1">        
        {/* LEFT COLUMN: VIEW STATES INSPECTOR GROUP (Perfect for sandboxed navigation demonstration) */}
        <div className="hidden bg-[#232a1b] border border-[#a2c28f]/10 rounded-3xl p-5 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-brand-green" />
              <h3 className="text-white font-bold text-sm tracking-wider font-sans">原型视点演示舱</h3>
            </div>
            
            <p className="text-xs text-stone-400 mb-4 bg-[#1b2115] p-3 rounded-lg border border-[#a2c28f]/5 leading-relaxed">
              点击下方快捷跳转锚点，右侧实机框架将流畅跳转至对应等级页面视图：
            </p>

            <div className="flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1 custom-scroll">
              {/* SECTION: MODULE 1 */}
              <div className="space-y-1">
                <span className="text-xs text-brand-yellow font-bold tracking-wider font-mono px-1 flex items-center gap-1">
                  模块一：食材选择与菜谱生成
                </span>
                <div className="grid grid-cols-1 gap-1 pl-1">
                  <button 
                    onClick={() => handleSelectInspectorPreset('module1-ingredients')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module1-ingredients' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 食材选择页（一级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module1-pots')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module1-pots' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 厨具选择页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module1-recipes')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module1-recipes' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 菜谱结果页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module1-detail')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module1-detail' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 菜谱详情页（三级页面）
                  </button>
                </div>
              </div>

              {/* SECTION: MODULE 2 & 3 */}
              <div className="space-y-1">
                <span className="text-xs text-brand-green font-bold tracking-wider font-mono px-1 flex items-center gap-1">
                  模块二&三：菜谱广场与随机生成
                </span>
                <div className="grid grid-cols-1 gap-1 pl-1">
                  <button 
                    onClick={() => handleSelectInspectorPreset('module2-plaza')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module2-plaza' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 菜谱广场页（一级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module2-search')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module2-search' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 菜谱搜索结果页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module3-spin-page')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module3-spin-page' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 随机生成页（一级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module3-spin-result')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module3-spin-result' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 随机生成结果页（二级页面）
                  </button>
                </div>
              </div>

              {/* SECTION: MODULE 6 & 7 & 8 */}
              <div className="space-y-1">
                <span className="text-xs text-[#cadbb7] font-bold tracking-wider font-mono px-1 flex items-center gap-1">
                  模块六&七&八：分享社区与个人中心
                </span>
                <div className="grid grid-cols-1 gap-1 pl-1">
                  <button 
                    onClick={() => handleSelectInspectorPreset('module6-community')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module6-community' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 社区广场页（一级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module6-post-detail')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module6-post-detail' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 帖子详情页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module6-publish')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module6-publish' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 发帖页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module7-profile-main')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module7-profile-main' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 个人中心主页（一级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module7-preferences')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module7-preferences' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 偏好设置页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module7-my-recipes')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module7-my-recipes' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 我的菜谱页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module7-cook-history')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module7-cook-history' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 烹饪记录页（二级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module7-account-settings')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module7-account-settings' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 账号设置页（三级页面）
                  </button>
                  <button 
                    onClick={() => handleSelectInspectorPreset('module8-global-search')}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeInspectorView === 'module8-global-search' ? 'bg-[#8ca779] text-white font-semibold' : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'}`}
                  >
                    · 全局搜索页（二级页面）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#a2c28f]/10 text-[11px] text-stone-500 font-mono text-center">
            识食物者 Gourmet Smart App v1.2.0
          </div>
        </div>

        {/* RIGHT COLUMN: CORE INTERACTIVE SIMULATOR CARD OR CODE EXPORTER */}
        <div className="flex flex-col">
          
          {/* RENDER EXPORTER INTERACTIVE CONTAINER */}
          {isExporterPanelOpen ? (
            <div className="bg-[#1e2417] border border-[#a2c28f]/20 rounded-3xl p-6 shadow-2xl flex flex-col flex-1 text-white animate-fade-in min-h-[750px] justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-brand-yellow" />
                    <h3 className="font-bold text-base font-sans leading-none">Vue 3 + Vant 4 完美源代码极速导出器</h3>
                  </div>
                  <button 
                    onClick={() => setIsExporterPanelOpen(false)}
                    className="p-1.5 px-3 text-xs bg-brand-green/20 text-brand-green rounded-lg hover:bg-brand-green/30"
                  >
                    ← 返回模拟区
                  </button>
                </div>

                <p className="text-xs text-stone-300 mb-4 leading-relaxed font-sans">
                  这些是为您的项目特制的 Vue 3 单文件组件。使用 Vant 4 组件标签，采用现代 <code className="bg-[#2c3523] px-1 text-brand-yellow font-mono text-xs">&lt;script setup lang="ts"&gt;</code> 糖语法，响应式状态由 Pinia 自动分发。直接一键复制即可无缝接入您的研发工程中：
                </p>

                {/* SELECT FILE BULLETS */}
                <div className="flex flex-wrap gap-1.5 mb-4 bg-black/30 p-1.5 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setActiveExportFile('store_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'store_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    PiniaStore.ts (共享状态)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('eatwell_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'eatwell_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    EatWell.vue (主页选择)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('community_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'community_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    Community.vue (交流社区)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('login_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'login_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    Login.vue (登录与注册)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('user_store_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'user_store_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    user.js (Pinia账户Store)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('request_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'request_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    request.js (若依/Axios封装)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('storage_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'storage_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    storage.js (缓存储存封装)
                  </button>
                  <button 
                    onClick={() => setActiveExportFile('router_export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeExportFile === 'router_export' ? 'bg-brand-green text-white font-bold' : 'text-stone-400 hover:text-white'}`}
                  >
                    router.js (路由拦截校验)
                  </button>
                </div>

                {/* VISUAL CODE BOX */}
                <div className="relative bg-black/60 rounded-xl overflow-hidden border border-white/10">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopySourceCode(
                        activeExportFile === 'store_export' ? VUE_CODE_STORE :
                        activeExportFile === 'eatwell_export' ? VUE_CODE_EATWELL :
                        activeExportFile === 'community_export' ? VUE_CODE_COMMUNITY :
                        activeExportFile === 'login_export' ? VUE_CODE_LOGIN :
                        activeExportFile === 'user_store_export' ? VUE_CODE_USER_STORE :
                        activeExportFile === 'request_export' ? VUE_CODE_REQUEST :
                        activeExportFile === 'storage_export' ? VUE_CODE_STORAGE :
                        activeExportFile === 'router_export' ? VUE_CODE_ROUTER :
                        VUE_CODE_SCAN
                      )}
                      className="bg-[#2c3523] hover:bg-[#3d4931] border border-[#a2c28f]/20 p-2 rounded-lg text-xs text-brand-yellow font-bold flex items-center gap-1 transition-all pointer-events-auto"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span>已拷贝到剪贴板！</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>一键复制代码</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-[#b3cc9a] leading-relaxed max-h-[480px] custom-scroll">
                    <code>
                      {activeExportFile === 'store_export' ? VUE_CODE_STORE :
                       activeExportFile === 'eatwell_export' ? VUE_CODE_EATWELL :
                       activeExportFile === 'community_export' ? VUE_CODE_COMMUNITY :
                       activeExportFile === 'login_export' ? VUE_CODE_LOGIN :
                       activeExportFile === 'user_store_export' ? VUE_CODE_USER_STORE :
                       activeExportFile === 'request_export' ? VUE_CODE_REQUEST :
                       activeExportFile === 'storage_export' ? VUE_CODE_STORAGE :
                       activeExportFile === 'router_export' ? VUE_CODE_ROUTER :
                       VUE_CODE_SCAN}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="text-stone-400 text-xs text-center border-t border-white/5 pt-4 mt-4 font-sans flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-yellow animate-spin-slow" />
                <span>以上代码均存储在当前工程 📁 `/vue/` 静态目录下目录供实地查阅。</span>
              </div>
            </div>
          ) : (
            
            /* ORIGINAL MOCK PHONE SHELL DRAW (1920*1080 Adaptive Canvas with fresh pale green background) */
            <div className="bg-[#eaf6d9] border-4 border-[#2c3523] rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-[750px]">
              
              {/* SCREEN MAIN SECTION VIEWPORTS SWITCHES */}
              <div className="flex-1 p-6 relative flex flex-col min-h-[620px]">
                
                {isCustomPublishPage ? (
                  <div className="flex flex-col flex-1 max-w-[850px] mx-auto w-full justify-between animate-fade-in bg-white border border-[#a2c28f]/20 rounded-[2rem] p-6 shadow-sm overflow-hidden text-left relative">
                    
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4 shrink-0 select-none">
                      <button 
                        onClick={() => {
                          setIsCustomPublishPage(false);
                          if (customPublishSource === 'community') {
                            setActiveTab('community');
                          } else {
                            setActiveTab('profile');
                            setActiveProfileTabGroup('cooking_logs');
                          }
                        }}
                        className="p-1 px-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl hover:text-stone-900 font-extrabold border transition-colors cursor-pointer flex items-center gap-1"
                      >
                        ← 取消并返回
                      </button>
                      <div className="text-center">
                        <span className="block text-xs font-black text-stone-850">🛠️ 智能美馔打卡与快捷发布工坊</span>
                        <span className="block text-[9px] text-[#8ca779] font-black tracking-wide font-mono uppercase">CULINARY LOGGING & COMMUNITY POSTING</span>
                      </div>
                      <div className="w-16"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 flex-1 items-stretch max-h-[500px] overflow-y-auto custom-scroll pr-1">
                      
                      {/* Left side: Food picture / cover picker with Request 11.2 & 11.4 support */}
                      <div className="bg-[#fbfcfa] border border-[#a1c18e]/15 rounded-2xl p-4.5 flex flex-col justify-between gap-4.5 min-h-[220px]">
                        <div className="space-y-3.5 shrink-0">
                          <span className="text-[10px] font-black text-stone-500 block">🖼️ 打卡菜品相册配图</span>
                          
                          <div className="bg-[#eff7e8] border-2 border-dashed border-[#a9c894] rounded-xl min-h-[135px] flex items-center justify-center relative overflow-hidden p-3 text-center">
                            {customPublishImages.length > 0 ? (
                              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 w-full h-full items-center justify-start max-h-[140px] overflow-y-auto">
                                {customPublishImages.slice(0, 5).map((imgUrl, imgIdx) => (
                                  <div key={imgIdx} className="relative h-14 w-full rounded-lg overflow-hidden border border-stone-200 group">
                                    <img 
                                      src={imgUrl} 
                                      alt={`Preview ${imgIdx}`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomPublishImages(prev => prev.filter((_, idx2) => idx2 !== imgIdx));
                                        showToast('🗑️ 已删除此预览配图');
                                      }}
                                      className="absolute -top-0.5 -right-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full w-4 h-4 p-0 text-[8px] flex items-center justify-center font-bold font-mono shadow-xs cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                {customPublishImages.length < 5 && (
                                  <label
                                    htmlFor="custom-file-upload-input"
                                    className="h-14 border border-dashed border-[#a9c894] rounded-lg flex flex-col items-center justify-center text-stone-400 bg-white hover:bg-stone-50 cursor-pointer"
                                  >
                                    <span className="text-sm font-black">+增加</span>
                                  </label>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-5xl block animate-bounce-subtle">{customPublishEmoji}</span>
                                <span className="text-[10px] text-[#5d7350] font-black block">配图可单选表情或导入图片 (最多5张)</span>
                              </div>
                            )}
                          </div>

                          {/* Hidden actual file input */}
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (customPublishImages.length + files.length > 5) {
                                showToast('⚠️ 提示：配图上传最多支持 5 张照片提醒哦！');
                                return;
                              }
                              const newUrls = files.map((f: File) => URL.createObjectURL(f));
                              setCustomPublishImages(prev => [...prev, ...newUrls]);
                              showToast(`📸 成功添加了 ${files.length} 张打卡配图！`);
                            }}
                            className="hidden"
                            id="custom-file-upload-input"
                          />

                          {/* Action Grid (Emoji, Text Drawing, Upload Image) */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const randomMockAIPics = [
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=60"
                                  ];
                                  if (customPublishImages.length >= 5) {
                                    showToast('⚠️ 提示：配图占位已满，最多只能上传 5 作为配图打卡哦！');
                                    return;
                                  }
                                  const pic = randomMockAIPics[Math.floor(Math.random() * randomMockAIPics.length)];
                                  setCustomPublishImages(prev => [...prev, pic]);
                                  showToast('🎨 文字配图：AI已自动为您检索并绘制了该美食菜品的超级逼真唯美插图！');
                                }}
                                className="bg-[#a9c894] hover:bg-[#8ba779] text-white text-[9px] font-black py-1.5 px-2 rounded-lg cursor-pointer text-center"
                              >
                                🎨 文字配图 (AI制图)
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomPublishImages([]);
                                  const randomEmojis = ['🍕','🍔','🍟','🌭','🍳','🥗','🥘','🍛','🍜','🍣','🍤','🥟','🥯','🥞','🧇','🍨','🍧','🍫','🍿'];
                                  const emo = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
                                  setCustomPublishEmoji(emo);
                                  showToast(`✨ 表情符号已更新: ${emo}`);
                                }}
                                className="bg-white border text-stone-500 hover:bg-stone-50 text-[9px] font-black py-1.5 px-2 rounded-lg cursor-pointer text-center"
                              >
                                🍩 表情符号配图
                              </button>
                            </div>

                            <label
                              htmlFor="custom-file-upload-input"
                              className="w-full bg-[#eff7e8] border border-[#a2c28f]/40 hover:bg-[#e4ffd2] text-[#4d5d44] text-[9.5px] font-bold py-1.5 text-center rounded-lg cursor-pointer block select-none"
                            >
                              📥 导入本地真实打卡照片 ({customPublishImages.length}/5)
                            </label>
                          </div>
                        </div>

                        {/* Optional Emoji slider array */}
                        <div className="space-y-1.5 border-t pt-3 border-stone-200/40">
                          <span className="text-[10px] font-black text-stone-500 block">快捷表情符号配饰 (单选)：</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['🥘', '🥗', '🥩', '🍜', '🍤', '🧁', '🍗', '🍉', '🥟'].map((emo) => (
                              <button
                                type="button"
                                key={emo}
                                onClick={() => {
                                  setCustomPublishEmoji(emo);
                                  setCustomPublishImages([]);
                                }}
                                className={`w-7 h-7 rounded-lg border text-sm flex items-center justify-center cursor-pointer hover:bg-stone-100 ${customPublishEmoji === emo && customPublishImages.length === 0 ? 'border-[#8ca779] bg-[#eff7e8]' : 'border-stone-200 bg-white'}`}
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Information form with Request 11.1 & 11.2 & 11.3 support */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-stone-550 block">🥘 帖头标题 / 美馔名称 (如：经典家常回锅肉)</label>
                          <input 
                            type="text"
                            value={customPublishTitle}
                            onChange={(e) => setCustomPublishTitle(e.target.value)}
                            placeholder="给今天亲手研制的美味起一个亮眼的标题吧..."
                            className="w-full bg-[#f8faf7] border border-stone-250/70 rounded-xl px-3 py-2.5 text-xs font-black outline-none focus:bg-white focus:border-[#8ca779]"
                          />
                        </div>

                        {/* Interactive Tag Select Option Panel (Request 11.2 & 11.3) */}
                        <div className="space-y-1.5 bg-[#fbfcfa] border border-stone-200 p-3.5 rounded-2xl">
                          <label className="text-[10px] font-black text-[#5d7350] block">🏷️ 关联食谱标签选择 (可多选，关联后支持一键快速筛选)：</label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['健康轻食', '营养高蛋白', '快手懒人', '传统硬菜', '低脂能量', '时令美馔'].map((tag) => {
                              const isSelected = customPublishTags.includes(tag);
                              return (
                                <button
                                  type="button"
                                  key={tag}
                                  onClick={() => {
                                    if (isSelected) {
                                      setCustomPublishTags(prev => prev.filter(t => t !== tag));
                                    } else {
                                      setCustomPublishTags(prev => [...prev, tag]);
                                      showToast(`🏷️ 已关联帖子标签: #${tag}`);
                                    }
                                  }}
                                  className={`px-3 py-1 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-[#8ca779] border-brand-green/30 text-white shadow-3xs' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                                >
                                  #{tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-stone-550 block">📝 打卡心得正文内容 (200字以内)</label>
                          <textarea 
                            rows={4}
                            value={customPublishBody}
                            onChange={(e) => setCustomPublishBody(e.target.value)}
                            placeholder="在这儿分享一下你的烹饪美味诀窍、健康打卡心得、香料放了多少或给其他慢病群友的暖心饮食建议吧..."
                            className="w-full bg-[#f8faf7] border border-stone-250/70 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-[#8ca779]"
                          />
                        </div>

                        {/* Hidden sync options matching Request 11.1 - defaults to true behind the scenes */}
                        <div className="text-[9px] text-[#5d7350] italic text-right pr-1 select-none font-bold">
                          🌱 智能多路归档就绪：本记录将同步推送至「社区广场」以及「个人中心」历史打卡中
                        </div>
                      </div>
                    </div>

                    {/* Submissions action footer */}
                    <div className="border-t border-stone-100 pt-3 flex gap-3 justify-end shrink-0 select-none">
                      <button
                        onClick={() => {
                          setIsCustomPublishPage(false);
                          if (customPublishSource === 'community') {
                            setActiveTab('community');
                          } else {
                            setActiveTab('profile');
                            setActiveProfileTabGroup('cooking_logs');
                          }
                        }}
                        className="bg-stone-100 text-stone-500 text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer hover:bg-stone-200 active:scale-95 transition-all text-center"
                      >
                        取消录入 / 放回草稿箱
                      </button>

                      <button
                        onClick={() => {
                          if (!customPublishTitle.trim()) {
                            showToast('⚠️ 不能空提交：请为这道手工菜谱自定义一个名字吧！');
                            return;
                          }
                          if (!publishToCommunity && !publishToLogs) {
                            showToast('⚠️ 归档目标限制：请至少勾选「分享到社区」或「录入个人打卡」之一进行归档保存！');
                            return;
                          }
                          
                          const postNote = customPublishBody.trim() || '手工烹制，清甜好吃，健康营养极其到位！👍';
                          const chosenImg = customPublishImage;
                          
                          if (publishToCommunity) {
                            const newPostId = String(socialPosts.length + 1);
                            const postItem: SocialPost = {
                              id: newPostId,
                              author: profileUsername,
                              avatar: profileAvatar,
                              title: customPublishTitle,
                              caption: postNote,
                              image: chosenImg || undefined,
                              coverEmoji: chosenImg ? undefined : customPublishEmoji,
                              emoji: chosenImg ? undefined : customPublishEmoji,
                              stars: customPublishStars,
                              time: '2026-06-02',
                              likes: 0,
                              saves: 0,
                              isLiked: false,
                              isSaved: false,
                              comments: []
                            };
                            setSocialPosts([postItem, ...socialPosts]);
                          }

                          if (publishToLogs) {
                            const newLogId = String(cookingLogs.length + 1);
                            const logItem = {
                              id: newLogId,
                              name: customPublishTitle,
                              date: '2026-06-02',
                              stars: customPublishStars,
                              note: postNote,
                              emoji: chosenImg ? '📸' : customPublishEmoji,
                              duration: 15
                            };
                            setCookingLogs([logItem, ...cookingLogs]);
                          }

                          showToast('🎉 录入大成功！您的美味烹饪记录已成功归档并实时发布！');
                          setIsCustomPublishPage(false);
                          
                          if (publishToCommunity) {
                            setActiveTab('community');
                            setActiveSidebarFilter('all');
                          } else {
                            setActiveTab('profile');
                            setActiveProfileTabGroup('cooking_logs');
                          }
                        }}
                        className="bg-brand-green hover:bg-[#728f60] active:scale-95 text-white text-xs font-black px-8 py-2.5 rounded-xl cursor-pointer transition-all shadow-md text-center"
                      >
                        确认递交，完成同步打卡记录！ 👨‍🍳
                      </button>
                    </div>

                  </div>
                ) : (
                  <>
                    {/* 3, 新：半透明单独进度条样式, 与上一步下一步完全分开显示 */}
                    {activeTab === 'eatwell' && subStep >= 1 && subStep <= 4 && (
                  <div className="max-w-[1000px] w-full mx-auto mb-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-full px-5 py-3 shadow-md relative overflow-hidden shrink-0 flex items-center justify-between">
                    {/* Progress Fill Bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#8ca779]/20 rounded-full transition-all duration-300"
                      style={{ width: `${(subStep / 4) * 100}%` }}
                    ></div>
                    
                    {/* Step milestones (Clickable / jump to interface) */}
                    <div className="relative z-10 flex justify-around items-center w-full gap-2 select-none">
                      {[
                        { icon: '🥬', label: '选蔬菜' },
                        { icon: '🥩', label: '选肉类' },
                        { icon: '🍚', label: '选主食' },
                        { icon: '🍳', label: '配锅具' }
                      ].map((item, idx) => {
                        const stepNum = idx + 1;
                        const isCurrent = subStep === stepNum;
                        const isPassed = subStep > stepNum;
                        return (
                          <div 
                            key={item.label}
                            onClick={() => setSubStep(stepNum)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-black md:text-[13px] cursor-pointer hover:scale-105 active:scale-95 duration-200 ${
                              isCurrent 
                                ? 'bg-[#8ca779] text-white shadow-md' 
                                : isPassed 
                                ? 'text-[#36482c] hover:bg-[#8ca779]/10' 
                                : 'text-stone-500 opacity-70 hover:opacity-100 hover:bg-stone-50/50'
                            }`}
                            title={`跳转至：${stepNum}. ${item.label}`}
                          >
                            <span>{item.icon}</span>
                            <span>{stepNum}. {item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1, 3, 新：直觉左箭头 (<) 与 右箭头 (>) 在实机屏幕左右边缘绝对居中浮动 */}
                {activeTab === 'eatwell' && (
                  <>
                    {subStep > 0 && subStep < 6 && (
                      <button
                        id="eatwell-slider-prev-arrow"
                        onClick={() => setSubStep(prev => Math.max(0, prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-white/95 rounded-full border-2 border-stone-300 shadow-2xl flex items-center justify-center text-stone-700 font-serif text-xl md:text-2xl font-black hover:bg-white hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer animate-pulse-subtle"
                        title="上一步/上一页"
                      >
                        &lt;
                      </button>
                    )}
                     {subStep < 6 && (
                       <button
                         id="eatwell-slider-next-arrow"
                         onClick={() => {
                           if (subStep < 5) {
                             setSubStep(prev => prev + 1);
                           } else {
                             // subStep === 5: Recipe recommendations results step
                             if (!selectedResultsRecipeId) {
                               showToast("⚠️ 请先勾选/选择下方列表中的一道推荐菜谱，再进行下一步烹饪哦！");
                               return;
                             }
                             const foundRecipe = RECIPES_DATABASE.find(r => r.id === selectedResultsRecipeId);
                             if (foundRecipe) {
                               setActiveRecipe(foundRecipe);
                               setRecipeDetailSource('eatwell_recommend');
                               if (basketCount === 0) {
                                 setShowNoIngredientsPopup(true);
                               } else {
                                 setSubStep(6);
                                 setActiveCookingStepIndex(0);
                               }
                             }
                           }
                         }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-white/95 rounded-full border-2 border-stone-300 shadow-2xl flex items-center justify-center text-stone-700 font-serif text-xl md:text-2xl font-black hover:bg-white hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer animate-pulse-subtle"
                        title="下一步/下一页"
                      >
                        &gt;
                      </button>
                    )}
                  </>
                )}

                {activeTab === 'eatwell' && subStep === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 text-center relative select-none">
                    
                    <div className="relative w-[390px] h-[340px] flex items-center justify-center mb-8">
                      {/* Ingredients closely surround the cooking pot in a beautiful circle with mathematically perfect even gaps */}
                      {[
                        { emoji: '🎃', title: '新鲜南瓜' },
                        { emoji: '🥬', title: '大白菜' },
                        { emoji: '🥦', title: '绿西兰花' },
                        { emoji: '🧅', title: '洋葱头' },
                        { emoji: '🍅', title: '红番茄' },
                        { emoji: '🌽', title: '甜玉米' },
                        { emoji: '🍆', title: '嫩茄子' },
                        { emoji: '🥕', title: '脆胡萝卜' },
                        { emoji: '🫛', title: '嫩甜豆' },
                        { emoji: '🍄', title: '鲜香菇' },
                        { emoji: '🥔', title: '黄土豆' },
                        { emoji: '🥒', title: '青黄瓜' },
                      ].map((veg, idx, arr) => {
                        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / arr.length;
                        const x = 195 + 175 * Math.cos(angle) - 20;
                        const y = 170 + 145 * Math.sin(angle) - 20;
                        const animName = idx % 2 === 0 ? 'animate-float-1' : 'animate-float-2';
                        return (
                          <div 
                            key={`veg-ring-${idx}`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                            className={`absolute text-4xl ${animName} z-10 hover:scale-125 transition-all cursor-pointer drop-shadow-md select-none`} 
                            title={veg.title}
                          >
                            {veg.emoji}
                          </div>
                        );
                      })}

                      {/* Perspective Cooking Casserole/Pot Vector Shape with Dynamic Steam (Botanical Sage Theme) */}
                      <div 
                        onClick={() => setSubStep(1)}
                        className="relative w-[230px] h-[200px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all group mt-6"
                      >
                        {/* Animated steam puffs rising up */}
                        <div className="absolute top-[-25px] flex gap-4 justify-center w-full z-20">
                          <div className="w-2.5 h-8 bg-white/70 rounded-full blur-[2px] animate-steam-1"></div>
                          <div className="w-2 h-10 bg-white/65 rounded-full blur-[3px] animate-steam-2 [animation-delay:0.3s]"></div>
                          <div className="w-2.5 h-8 bg-white/55 rounded-full blur-[2px] animate-steam-1 [animation-delay:0.6s]"></div>
                          <div className="w-2 h-9 bg-white/60 rounded-full blur-[2px] animate-steam-2 [animation-delay:1.1s]"></div>
                        </div>

                        {/* Elegant Pot Lid Ring (Wooden texture / Matching forest green) */}
                        <div className="w-[170px] h-4 bg-[#6c8a5a] rounded-full shadow-md border-b-2 border-[#526a44]/50 flex items-center justify-center relative translate-y-1 group-hover:-translate-y-2 transition-transform duration-300">
                          <div className="w-8 h-4 bg-[#dbb874] rounded-t-lg border-b border-[#cca65c] absolute -top-3 shadow-inner"></div>
                        </div>
                        
                        {/* Body of Casserole Pot with 3D elliptical lip (Sage green gradient matches style) (Sleek body with no center emoji) */}
                        <div className="w-[180px] h-[100px] bg-gradient-to-r from-[#8caf77] to-[#71985c] rounded-b-[4rem] relative shadow-lg flex flex-col items-center justify-center border-t-2 border-[#b9d6a8] pb-1">
                          {/* Side handles (耳) */}
                          <div className="absolute left-[-16px] top-4 w-4 h-6 bg-[#6c8a5a] rounded-l-xl border-y border-l border-[#526a44]"></div>
                          <div className="absolute right-[-16px] top-4 w-4 h-6 bg-[#6c8a5a] rounded-r-xl border-y border-r border-[#526a44]"></div>
                          
                          <span className="text-[11px] text-[#eef6ea] font-black tracking-widest uppercase mt-1">Gourmet Master</span>
                        </div>

                        {/* Counter shadowing */}
                        <div className="w-[150px] h-3 bg-black/15 rounded-full blur-[2px] mt-2 group-hover:scale-95 transition-all"></div>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-stone-800 tracking-wide font-sans mt-16 md:mt-24 mb-14">
                      欢迎来到「识食物者」，今天您好好吃饭了吗？
                    </h2>

                    <button
                      onClick={() => setSubStep(1)}
                      className="bg-[#8caf77] hover:bg-[#9bbe85] text-white font-black text-base py-4 px-12 rounded-full shadow-lg border border-[#8caf77]/20 flex items-center gap-2 tracking-wide transition-all transform active:scale-95 duration-200 mb-6"
                    >
                      <span>开启今日美食之旅</span>
                      <ChevronRight className="w-5 h-5 text-brand-yellow font-extrabold stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* ==================================================================== */}
                {/* VIEW 1: EAT WELL (好好吃饭) - SUB VIEW 1/2/3 (Ingredient Choosing) */}
                {/* ==================================================================== */}
                {activeTab === 'eatwell' && subStep >= 1 && subStep <= 3 && (
                  <div className="flex flex-col flex-1 max-w-[1000px] mx-auto w-full justify-between">
                    <div className="relative max-w-[480px] w-full mx-auto mb-4">
                      <input 
                        type="text"
                        placeholder="搜索更多美好..."
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          if (val.trim()) {
                            const check = checkQueryRestrictions(val);
                            if (check) {
                              showToast(`${check.message}`);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!searchQuery.trim()) {
                              showToast('⚠️ 不能空搜索：请输入需要添加或筛选的食材名称！');
                              return;
                            }
                            
                            const check = checkQueryRestrictions(searchQuery);
                            if (check) {
                              showToast(`${check.message}`);
                              return;
                            }

                            if (subStep < 3) {
                              setSubStep(prev => prev + 1);
                              setSearchQuery('');
                              showToast(`📝 已为您自动暂存选择，进入下一步原料选择！`);
                            } else {
                              setSubStep(4);
                              setSearchQuery('');
                              showToast(`🍳 原料备齐！进入烹饪锅具及人数配置。`);
                            }
                          }
                        }}
                        className="w-full bg-white border-2 border-brand-green pl-11 pr-5 py-2.5 rounded-full text-xs outline-none shadow-sm focus:border-brand-green-dark"
                      />
                      <Search className="w-4 h-4 text-[#8ba779] absolute left-4 top-3.5 animate-pulse" />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3 hover:text-red-500">
                          <X className="w-4 h-4 text-stone-400" />
                        </button>
                      )}
                    </div>

                    {/* FOOD ITEMS MAIN CONTAINER */}
                    <div className="flex-1 bg-white/75 border border-brand-green/20 rounded-3xl p-5 overflow-y-auto max-h-[340px] custom-scroll">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {(() => {
                          const items = (subStep === 1 ? availableVeggiesFiltered : subStep === 2 ? availableMeatsFiltered : availableStaplesFiltered)
                            .filter(item => {
                              if (!searchQuery) return true;
                              const term = searchQuery.toLowerCase();
                              return item.name.includes(term) || item.alias.includes(term) || item.pinyin.includes(term);
                            });

                          const matchesForbidden = searchQuery && forbiddenFoodsSelected.some(forbidden => 
                            forbidden.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            searchQuery.toLowerCase().includes(forbidden.toLowerCase())
                          );

                          return (
                            <>
                              {matchesForbidden && (
                                <div className="col-span-full bg-red-50 border border-red-200 text-red-800 text-[11px] p-3 rounded-xl font-bold flex items-center gap-2 mb-2 select-none animate-fade-in text-left">
                                  <span>🚫 识食物者提示：您在个人中心设置了忌口避让食材 “{forbiddenFoodsSelected.find(f => f.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.toLowerCase().includes(f.toLowerCase()))}”，此类食材已被系统全局智能过滤。</span>
                                </div>
                              )}
                              {items.length === 0 ? (
                                <div className="col-span-full py-12 text-center flex flex-col items-center justify-center gap-2 w-full">
                                  <span className="text-3xl text-stone-300">🫙</span>
                                  <p className="text-xs text-stone-400 font-bold px-4 leading-relaxed">没有搜索到符合当前设置的食材，请检查是否在偏好设置中被过滤，或者尝试其他食材关键字 🥦</p>
                                </div>
                              ) : (
                                items.map((item) => {
                                  const isSelected = 
                                    subStep === 1 ? selectedVeggies.includes(item.name) :
                                    subStep === 2 ? selectedMeats.includes(item.name) :
                                    selectedStaples.includes(item.name);
                                  return (
                                    <div
                                      key={item.name}
                                      onClick={(e) => handleToggleIngredient(item.name, item.category, e)}
                                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                                        isSelected 
                                          ? 'bg-[#a9c894] border-[#8ba779] text-white shadow-md scale-102 font-bold' 
                                          : 'bg-[#dbf1c4]/60 border-brand-green/20 text-stone-700 hover:bg-[#cbeab0] hover:scale-101'
                                      }`}
                                    >
                                      <span className="text-3xl">{item.emoji}</span>
                                      <span className="text-xs font-black">{item.name}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                                        {item.calories}卡/100g
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 底部固定已选食材栏 (横向滚动 + 已选标签 + 实时热量 + 清空组合) (Img 2 bottom) */}
                    <div className="bg-[#eff7e8] border border-brand-green/20 p-3 rounded-2xl mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-brand-grey flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>已选配料篮 ({basketCount})</span>
                        </span>
                        
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-stone-800">
                            预计总热量：<strong className="text-orange-950 bg-brand-yellow px-1.5 py-0.5 rounded">{selectedBasketCaloriesTotal} 大卡</strong>
                          </span>
                        </div>
                      </div>

                      {/* Horizontal sliding selected labels */}
                      <div className="flex gap-1.5 overflow-x-auto custom-scroll pb-1">
                        {selectedListWithDetails.length === 0 ? (
                          <span className="text-[10px] text-stone-400 italic block py-1 pl-1">您还没有选择任何食材，下方卡片可多选...</span>
                        ) : (
                          selectedListWithDetails.map((food) => (
                            <div 
                              key={`${food.name}-label`}
                              className="bg-white border text-[10px] text-stone-700 font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shrink-0 shadow-sm"
                            >
                              <span>{food.emoji} {food.name} <strong className="text-stone-400 font-mono font-normal">({food.calories}c)</strong></span>
                              <X 
                                className="w-3 h-3 text-stone-400 hover:text-red-500 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleIngredient(food.name, food.category);
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action navigation row */}
                    <div className="flex justify-between items-center mt-4">
                      {/* Trash cleaning button with React popover confirmation */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowClearConfirm(!showClearConfirm);
                          }}
                          className="bg-white hover:bg-rose-50 border border-stone-200 p-2.5 rounded-full shadow-md text-red-500 shrink-0 flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer"
                          title="一键清空所有已选食材"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {showClearConfirm && basketCount > 0 && (
                          <div className="absolute bottom-[115%] left-0 z-50 w-52 p-3 bg-white border-2 border-red-200 rounded-2xl shadow-xl text-left animate-scale-up">
                            <p className="text-[11px] text-stone-700 font-bold mb-2">🤔 确定清空所有已选食材吗？</p>
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setShowClearConfirm(false)}
                                className="px-2.5 py-1 text-[10px] text-stone-500 border rounded-lg hover:bg-stone-50 font-semibold cursor-pointer"
                              >
                                取消
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedVeggies([]);
                                  setSelectedMeats([]);
                                  setSelectedStaples([]);
                                  setSelectionOrder([]);
                                  setShowClearConfirm(false);
                                }}
                                className="px-2.5 py-1 text-[10px] bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold cursor-pointer"
                              >
                                确定清空
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (subStep < 3) setSubStep(prev => prev + 1);
                          else setSubStep(4);
                        }}
                        className="bg-brand-yellow hover:bg-brand-yellow-hover text-stone-800 font-extrabold py-3.5 px-10 rounded-full border border-stone-300 shadow-md text-xs tracking-wide flex items-center gap-1"
                      >
                        <span>选好了，下一步</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Interactive Shopping Cart display popover window */}
                      <div className="relative">
                        <button 
                          id="shopping-cart-btn"
                          onClick={() => setIsBasketOpen(!isBasketOpen)}
                          className="relative p-2.5 bg-white rounded-full border shadow shrink-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer text-brand-green-dark"
                          title="点击查看已选食材详情"
                        >
                          <ShoppingCart className="w-5 h-5 text-brand-green-dark" />
                          {basketCount > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold transition-all duration-200 ${cartBadgePop ? 'scale-125 bg-rose-600' : 'scale-100'}`}>
                              {basketCount}
                            </span>
                          )}
                        </button>

                        {isBasketOpen && (
                          <div className="absolute bottom-[115%] right-0 z-50 w-72 max-h-80 bg-white border border-[#a2c28f]/30 rounded-2xl shadow-2xl p-4 flex flex-col text-left overflow-hidden animate-scale-up">
                            <div className="flex justify-between items-center pb-2 border-b mb-2">
                              <span className="font-extrabold text-xs text-stone-800">🛒 已选食材篮子详情</span>
                              <button 
                                onClick={() => setIsBasketOpen(false)}
                                className="text-stone-400 hover:text-stone-600 font-bold p-0.5 text-xs"
                              >
                                ✕
                              </button>
                            </div>

                            {selectedListWithDetails.length === 0 ? (
                              <div className="text-center py-6 text-[11px] text-stone-400">
                                篮子空空如也，快去上面挑选吧！🥗
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 overflow-y-auto max-h-48 custom-scroll space-y-1.5 pr-1">
                                  {selectedListWithDetails.map((item) => (
                                    <div key={item.name} className="flex justify-between items-center p-1.5 px-2.5 bg-stone-50 rounded-xl border border-stone-150 text-[11px] text-stone-700">
                                      <span className="flex items-center gap-1.5 font-semibold">
                                        <span className="text-sm">{item.emoji}</span>
                                        <span>{item.name}</span>
                                        <span className="text-[9px] text-stone-400 font-light">({item.calories}卡/100g)</span>
                                      </span>
                                      <button 
                                        onClick={() => handleToggleIngredient(item.name, item.category)}
                                        className="text-red-400 hover:text-red-650 hover:bg-stone-200/50 p-1 rounded-md text-[10px]"
                                        title="移除此项"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between items-center text-[10px] font-mono font-bold text-stone-500 shrink-0">
                                  <span>共计：{selectedListWithDetails.length} 样食材</span>
                                  <span>估卡：{selectedBasketCaloriesTotal} kcal</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ====================================================================================== */}
                {/* VIEW 1: EAT WELL (好好吃饭) - SUB VIEW 4 (Pots Matching & Headcount) */}
                {/* ====================================================================================== */}
                {activeTab === 'eatwell' && subStep === 4 && (
                  <div className="flex flex-col flex-1 max-w-[1000px] mx-auto w-full justify-between animate-fade-in text-stone-800">
                    
                    {/* Mode buttons select with Absolute Hover Tooltips */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/50 rounded-xl max-w-[480px] w-full mx-auto mb-4 shrink-0 shadow-sm border border-stone-300/30">
                      <div className="relative">
                        <button 
                          onMouseEnter={() => setHoveredMode('strict')}
                          onMouseLeave={() => setHoveredMode(null)}
                          onClick={() => setMatchingMode('strict')}
                          className={`w-full text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${matchingMode === 'strict' ? 'bg-[#8ca779] text-white shadow' : 'text-stone-600 hover:text-stone-850'}`}
                        >
                          严格匹配
                        </button>
                        {hoveredMode === 'strict' && (
                          <div className="absolute top-[115%] left-1/2 -translate-x-1/2 z-50 w-44 p-2 bg-[#2c3e23] border border-[#8ca779] text-white rounded-lg shadow-xl text-[10px] leading-normal pointer-events-none text-center">
                            严格匹配：只使用所选食材，不添加任何额外食材
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <button 
                          onMouseEnter={() => setHoveredMode('fuzzy')}
                          onMouseLeave={() => setHoveredMode(null)}
                          onClick={() => setMatchingMode('fuzzy')}
                          className={`w-full text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${matchingMode === 'fuzzy' ? 'bg-[#8ca779] text-white shadow' : 'text-stone-600 hover:text-stone-850'}`}
                        >
                          模糊匹配
                        </button>
                        {hoveredMode === 'fuzzy' && (
                          <div className="absolute top-[115%] left-1/2 -translate-x-1/2 z-50 w-44 p-2 bg-[#2c3e23] border border-[#8ca779] text-white rounded-lg shadow-xl text-[10px] leading-normal pointer-events-none text-center">
                            模糊匹配：以所选食材为主，自主智能添加辅料
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <button 
                          onMouseEnter={() => setHoveredMode('survival')}
                          onMouseLeave={() => setHoveredMode(null)}
                          onClick={() => setMatchingMode('survival')}
                          className={`w-full text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${matchingMode === 'survival' ? 'bg-[#8ca779] text-white shadow' : 'text-stone-600 hover:text-stone-850'}`}
                        >
                          荒野生存
                        </button>
                        {hoveredMode === 'survival' && (
                          <div className="absolute top-[115%] left-1/2 -translate-x-1/2 z-50 w-44 p-2 bg-[#2c3e23] border border-[#8ca779] text-white rounded-lg shadow-xl text-[10px] leading-normal pointer-events-none text-center">
                            荒野生存：以极简吃饱为目标的简易快手餐
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Symmetrical Cooking appliances layouts */}
                    <div className="grid grid-cols-3 gap-4 items-center justify-center my-2 flex-1 min-h-[280px]">
                      
                      {/* Left-side Cookware organised by function (Dunce & soup simmer) */}
                      <div className="flex flex-col gap-2 w-full">
                        <div className="text-[9px] text-stone-400 font-bold block mb-0.5 text-left pl-1">🍲 慢饱炖煮系</div>
                        {[
                          { name: '一品炖煮锅', icon: '🍲' },
                          { name: '日式底汤锅', icon: '🫕' },
                          { name: '智能压力锅', icon: '🍛' }
                        ].map((pot) => (
                          <div
                            key={pot.name}
                            onClick={() => {
                              setActivePot(pot.name);
                              setHasSelectedSideCookware(true);
                            }}
                            className={`p-2.5 rounded-xl border-2 text-center flex items-center gap-2 cursor-pointer transition-all duration-200 select-none ${
                              activePot === pot.name 
                                ? 'border-[#8ca779] bg-[#eff7e8] scale-102 shadow-sm font-bold' 
                                : 'border-stone-200/60 bg-white/75 hover:border-[#8ca779]/40'
                            }`}
                          >
                            <span className="text-2xl shrink-0">{pot.icon}</span>
                            <span className="text-[10px] font-black text-stone-700 text-left truncate">{pot.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Center Double-Ear concentric pot based on user references */}
                      <div className="flex flex-col items-center justify-center relative bg-[#ffffff]/35 rounded-3xl border border-white/60 p-4 shadow-sm min-h-[260px]">
                        {/* Food ingredients falling visual indicators - visible only when default central pot is active */}
                        {activePot === '全能能炒能煮大锅' && (
                          <div className="absolute -top-4 h-6 w-full flex items-center justify-center gap-1 pointer-events-none opacity-40 select-none">
                            {selectedListWithDetails.slice(0, 4).map((food, i) => (
                              <span 
                                key={`fall-${i}`} 
                                className="text-xs inline-block animate-bounce"
                              >
                                {food.emoji}
                              </span>
                            ))}
                            {selectedListWithDetails.length > 4 && <span className="text-stone-400 font-mono text-[7px]">...</span>}
                          </div>
                        )}

                        {/* Top-Down Double-Ear Big Universal Pot - Custom Minimalist Line Style */}
                        {(() => {
                          const activePotSpec = (() => {
                            switch (activePot) {
                              case '一品炖煮锅': return { icon: '🍲', label: '一品慢煲炖煮锅' };
                              case '日式底汤锅': return { icon: '🫕', label: '日式和风底汤锅' };
                              case '智能压力锅': return { icon: '🍛', label: '高压精控智能锅' };
                              case '智能空气炸': return { icon: '🍟', label: '无油热风空气炸' };
                              case '多功能蒸锅': return { icon: '🥡', label: '竹香多功能蒸笼' };
                              case '极速微波炉': return { icon: '📟', label: '极速营养微波炉' };
                              default: return { icon: '🍲', label: '极简全能烹饪锅' };
                            }
                          })();

                          return (
                            <div 
                              onClick={() => {
                                if (hasSelectedSideCookware) {
                                  setActivePot('全能能炒能煮大锅');
                                  setHasSelectedSideCookware(false);
                                  showToast('🍳 已成功恢复中央默认全能大锅');
                                }
                              }}
                              className="relative w-[150px] h-[150px] flex items-center justify-center cursor-pointer transition-all duration-350 select-none scale-105 filter drop-shadow-sm animate-bounce-subtle"
                            >
                              {/* Symmetrical Left Ear Handle - Minimalist Thin Line representation */}
                              <div className="absolute left-0 w-4 h-10 rounded-l-lg border border-stone-300 bg-[#ffeb99]/30 border-brand-green/30 -translate-x-[50%] flex items-center justify-center transition-colors">
                                <div className="w-0.5 h-6 border-r border-stone-200"></div>
                              </div>

                              {/* Symmetrical Right Ear Handle - Minimalist Thin Line representation */}
                              <div className="absolute right-0 w-4 h-10 rounded-r-lg border border-stone-300 bg-[#ffeb99]/30 border-brand-green/30 translate-x-[50%] flex items-center justify-center transition-colors">
                                <div className="w-0.5 h-6 border-l border-stone-200"></div>
                              </div>

                              {/* Outer concentric pot rim - Minimalist line circle */}
                              <div className="w-32 h-32 rounded-full border border-[#8ca779] bg-white flex items-center justify-center transition-colors shadow-md ring-2 ring-[#8ca779]/15">
                                {/* Inner concentric soup space */}
                                <div className="w-[85%] h-[85%] rounded-full border border-stone-250 flex items-center justify-center relative overflow-hidden transition-colors bg-[#f4faf0]">
                                  <div className="absolute inset-1.5 rounded-full border border-dashed border-[#8ca779]/30 bg-gradient-to-tr from-[#cbd8c5]/20 to-yellow-50/10 flex flex-col items-center justify-center">
                                    <span className="text-3xl block animate-pulse">{activePotSpec.icon}</span>
                                    <span className="text-[9px] font-sans font-black text-[#5d7350] mt-1 text-center px-1 truncate max-w-[90px]">{activePotSpec.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Centered Cook button representing ingredients down into wok! */}
                        <button 
                          onClick={() => {
                            if (basketCount === 0) {
                              setShowNoIngredientsPopup(true);
                            } else {
                              setSubStep(5);
                            }
                          }}
                          className="bg-brand-yellow hover:bg-[#edd250] text-stone-855 font-black text-[11px] py-1.5 px-4.5 rounded-full border border-stone-400 shadow-md flex items-center gap-1 transition-all active:scale-95 hover:scale-105 cursor-pointer mt-3.5 animate-pulse-subtle"
                        >
                          <Flame className="w-3 h-3 text-rose-500 fill-current animate-pulse" />
                          <span>一键下锅，开始烹饪</span>
                        </button>
                      </div>

                      {/* Right-side Cookware organised by function (Steam and Fryer) */}
                      <div className="flex flex-col gap-2 w-full">
                        <div className="text-[9px] text-stone-400 font-bold block mb-0.5 text-left pl-1">🍟 烘烤爆蒸系</div>
                        {[
                          { name: '智能空气炸', icon: '🍟' },
                          { name: '多功能蒸锅', icon: '🥡' },
                          { name: '极速微波炉', icon: '📟' }
                        ].map((pot) => (
                          <div
                            key={pot.name}
                            onClick={() => {
                              setActivePot(pot.name);
                              setHasSelectedSideCookware(true);
                            }}
                            className={`p-2.5 rounded-xl border-2 text-center flex items-center gap-2 cursor-pointer transition-all duration-205 select-none ${
                              activePot === pot.name 
                                ? 'border-[#8ca779] bg-[#eff7e8] scale-102 shadow-sm font-bold' 
                                : 'border-stone-200/60 bg-white/75 hover:border-[#8ca779]/40'
                            }`}
                          >
                            <span className="text-2xl shrink-0">{pot.icon}</span>
                            <span className="text-[10px] font-black text-stone-700 text-left truncate">{pot.name}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Symmetrical bottom controls bar matching Request 2 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-200/50 pt-5 max-w-[720px] w-full mx-auto shrink-0 mt-5 select-none gap-4">
                      
                      {/* Left: Diner Headcount Setup */}
                      <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-200 p-2 px-3.5 rounded-2xl shrink-0">
                        <span className="text-sm">👥</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={potScale <= 1}
                            onClick={() => setPotScale(prev => Math.max(1, prev - 1))}
                            className="w-5.5 h-5.5 rounded-lg bg-white border border-stone-300 font-extrabold text-xs flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-xs text-[#5d7350] w-6 text-center">{potScale}人份</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (potScale >= 10) {
                                showToast("👥 提示：就餐烹饪人份最多支持 10 人提醒哦！");
                              } else {
                                setPotScale(prev => prev + 1);
                              }
                            }}
                            className="w-5.5 h-5.5 rounded-lg bg-white border border-stone-300 font-extrabold text-xs flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Center: Main Nav Buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSubStep(3)} // Return to staples selection
                          className="bg-[#f5f6f4] hover:bg-stone-200 text-stone-700 font-black text-xs py-2.5 px-4.5 rounded-full transition-all active:scale-95 cursor-pointer"
                        >
                          ← 返回主食挑选
                        </button>

                        <button 
                          onClick={() => setSubStep(5)} // Go to recipes results
                          className="bg-[#8ca779] hover:bg-[#728f60] text-white font-black text-xs py-2.5 px-5.5 rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          智能配餐推荐 →
                        </button>
                      </div>

                      {/* Right: Shopping Cart Button with Popover */}
                      <div className="relative shrink-0">
                        <button 
                          id="shopping-cart-btn"
                          onClick={() => setIsBasketOpen(!isBasketOpen)}
                          className="relative p-2.5 bg-white rounded-full border border-stone-300/80 shadow-xs hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer text-brand-green-dark"
                          title="点击查看已选食材详情"
                        >
                          <ShoppingCart className="w-4 h-4 text-brand-green-dark" />
                          {basketCount > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold transition-all duration-200 ${cartBadgePop ? 'scale-125 bg-rose-600' : 'scale-100'}`}>
                              {basketCount}
                            </span>
                          )}
                        </button>

                        {isBasketOpen && (
                          <div className="absolute bottom-[115%] right-0 z-50 w-72 max-h-80 bg-white border border-[#a2c28f]/30 rounded-2xl shadow-2xl p-4 flex flex-col text-left overflow-hidden animate-scale-up">
                            <div className="flex justify-between items-center pb-2 border-b mb-2">
                              <span className="font-extrabold text-xs text-stone-850">🛒 已选食材篮子详情</span>
                              <button 
                                onClick={() => setIsBasketOpen(false)}
                                className="text-stone-400 hover:text-stone-600 font-bold p-0.5 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-1.5 py-1">
                              {selectedListWithDetails.length === 0 ? (
                                <p className="text-[10px] text-stone-400 italic py-4 text-center">篮子空空如也，请返回挑选食材</p>
                              ) : (
                                selectedListWithDetails.map((food, idx) => (
                                  <div key={`basket-${idx}`} className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-xl border border-stone-100">
                                    <span className="text-[11px] font-black text-stone-750 flex items-center gap-1.5">
                                      <span>{food.emoji}</span>
                                      <span>{food.name}</span>
                                    </span>
                                    <button 
                                      onClick={() => handleToggleIngredient(food.name, food.category)}
                                      className="text-stone-350 hover:text-red-500 text-[10px] font-bold p-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                      删除
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                            {selectedListWithDetails.length > 0 && (
                              <button 
                                onClick={() => {
                                  setSelectedVeggies([]);
                                  setSelectedMeats([]);
                                  setSelectedStaples([]);
                                  setSelectionOrder([]);
                                  setIsBasketOpen(false);
                                  showToast('🧹 已成功清空您的食材篮！');
                                }}
                                className="w-full mt-2 bg-stone-100 hover:bg-red-50 hover:text-red-600 border border-stone-200 py-1.5 rounded-xl text-stone-500 text-[10px] font-extrabold transition-colors text-center"
                              >
                                一键全部清空
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Seasoning Reminder Tip for Request 4.2 */}
                    <div className="max-w-[720px] mx-auto w-full mt-4 bg-amber-50/50 border border-amber-200/40 rounded-xl p-3 text-center text-stone-700 text-[11px] font-medium select-none flex items-center justify-center gap-1.5 shadow-inner leading-relaxed">
                      <span>🧂</span>
                      <span><strong>调味提示：</strong>基础调料辅料（如盐、酱油、食用油、香葱等）系统已为您作为底料配置，您忘记加也不要紧，仅需提示：烹饪时记得适量下锅点缀哦！</span>
                    </div>

                  </div>
                )}

                {activeTab === 'eatwell' && subStep === 5 && (
                  <div className="flex flex-col flex-1 max-w-[1000px] mx-auto w-full justify-between">
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="font-extrabold text-stone-800 text-lg">今日菜谱推荐</h3>
                        <p className="text-[11px] text-[#65705e]">根据您选择的食材和就餐人数 推荐以下健康餐食</p>
                      </div>

                      {/* Ingredient Match Fault Tolerance Card - Requirement 3 */}
                      <div className={`w-full bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4 text-left shadow-2xs relative overflow-hidden flex items-start gap-3 select-none transition-all duration-1000 origin-top ${showMatchWarning ? 'opacity-100 mb-4 scale-100 max-h-[200px]' : 'opacity-0 max-h-0 p-0 mb-0 scale-95 pointer-events-none transform -translate-y-2'}`}>
                        <span className="text-xl mt-0.5 shrink-0">⚠️</span>
                        <div className="space-y-1 text-[11px] text-amber-955">
                          <span className="font-extrabold block text-amber-950">食材储备不足与模式推荐提示</span>
                          <p className="leading-relaxed font-semibold opacity-90 font-sans">
                            您当前的选购食材不够完全凑齐满配要求。为了您的极佳烹饪体验，系统已自动启用<strong>智能柔性推荐算法机制（含模糊匹配、严格推荐、荒野生存模式要求等）</strong>，在此基础上为您<strong>生成了以下最匹配的其他美味推荐</strong>，部分辅料和常见调味可在厨房随取使用，快选一个开始大饱口福吧！
                          </p>
                        </div>
                      </div>

                      {/* Recipe listings cards (vertical list stack with scrolling inside container) */}
                      <div className="flex flex-col gap-4 overflow-y-auto max-h-[440px] pb-4 px-1.5 custom-scroll w-full scroll-smooth">
                        {shownRecipeIds.map((id) => {
                          const recipe = RECIPES_DATABASE.find(r => r.id === id);
                          if (!recipe) return null;
                          const isStarred = starredRecipes.includes(recipe.id);
                          const isSelected = selectedResultsRecipeId === recipe.id;
                          return (
                            <div
                              key={recipe.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedResultsRecipeId(null);
                                  showToast(`❌ 已取消选择菜谱：【${recipe.name}】！请重新选择。`);
                                } else {
                                  setSelectedResultsRecipeId(recipe.id);
                                  showToast(`🎯 已锁定所选菜谱：【${recipe.name}】！可点击右侧直接开始或底部下一步进行烹饪。`);
                                }
                              }}
                              className={`bg-white border rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full text-left relative ${
                                isSelected 
                                  ? 'border-brand-green border-2 bg-brand-green/5 ring-2 ring-brand-green/20' 
                                  : 'border-stone-200 hover:border-[#8ca779]/45'
                              }`}
                            >
                              {/* Selected Status Badge top right */}
                              {isSelected && (
                                <span className="absolute top-3 right-3 bg-brand-green text-white font-extrabold text-[8px] rounded-full px-2 py-0.5 tracking-wider select-none">
                                  ✓ 已选中
                                </span>
                              )}

                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Recipe cover photograph, NO emoji - Requirement 4 */}
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-stone-200 bg-stone-50 shadow-inner relative">
                                  <img 
                                    src={getRecipeImageUrl(recipe.name) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
                                    alt={recipe.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-sans font-black text-xs text-[#2c3523] truncate">{recipe.name}</span>
                                    <span className="text-[9px] font-mono font-black text-amber-955 bg-brand-yellow/80 px-1.5 py-0.5 rounded shrink-0">
                                      约 {Math.round(recipe.calories * (potScale / 3))}卡
                                    </span>
                                  </div>
                                  {/* Star difficulties icons */}
                                  <div className="flex gap-0.5 text-brand-yellow text-[9px] shrink-0 mt-1">
                                    {Array.from({ length: recipe.stars }).map((_, i) => (
                                      <Star key={i} className="w-2.5 h-2.5 fill-current text-[#edd96a]" />
                                    ))}
                                    <span className="text-stone-400 text-[9px] font-sans font-bold ml-1">({recipe.difficulty})</span>
                                  </div>

                                  {/* Note required ingredients - Requirement 4 */}
                                  <div className="text-[10px] text-stone-500 font-medium leading-normal mt-2.5 flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-stone-600 block shrink-0">需要主要食材：</span>
                                    {getRecipeIngredients(recipe.name).map((ing, idx) => (
                                      <span key={idx} className="bg-[#eff7e8]/60 text-[#5d7350] rounded-md px-1.5 py-0.5 border border-[#a2c28f]/20 font-bold whitespace-nowrap">
                                        {ing}
                                      </span>
                                    ))}
                                  </div>

                                </div>
                              </div>

                              {/* Specifications list */}
                              <div className="text-[11px] text-stone-500 font-sans sm:border-l border-dashed border-[#8ca779]/10 sm:px-5 py-2 sm:py-0 space-y-1 shrink-0">
                                <p className="leading-none">⏰ 预计用时：<strong className="text-stone-850 font-black">{recipe.time}分钟</strong></p>
                                <p className="leading-none">👥 就餐分量：<strong className="text-stone-850 font-black">{potScale}人份</strong></p>
                              </div>

                              {/* Footer Action Row */}
                              <div className="flex items-center gap-3 shrink-0 sm:border-l border-dashed border-[#8ca779]/10 sm:pl-5 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-1.5">
                                  {/* Cycle replace key (换一道) */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCycleReplaceRecipe(recipe.id);
                                    }}
                                    className="bg-stone-50 hover:bg-[#eff7e8] border hover:border-brand-green py-2 px-3 rounded-xl text-[10.5px] text-stone-700 font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                                    title="换一道"
                                  >
                                    <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                                    <span>换一道</span>
                                  </button>

                                  {/* Star trigger popup */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rId = recipe.id;
                                      setStarredRecipes(prev => 
                                        prev.includes(rId) ? prev.filter(x => x !== rId) : [...prev, rId]
                                      );
                                      setAnimatingStarId(rId);
                                      setTimeout(() => setAnimatingStarId(null), 400);
                                    }}
                                    className="p-1 focus:outline-none transition-transform duration-100 hover:scale-125 cursor-pointer relative"
                                    title={isStarred ? "取消收藏" : "加入收藏"}
                                  >
                                    <Star className={`w-5.5 h-5.5 transition-colors ${
                                      isStarred ? 'fill-current text-[#edd96a]' : 'text-stone-300 hover:text-[#edd96a]'
                                    } ${
                                      animatingStarId === recipe.id ? 'animate-star-bounce' : ''
                                    }`} />
                                  </button>
                                </div>

                                {/* Active Cook Trigger Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveRecipe(recipe);
                                    setSelectedResultsRecipeId(recipe.id);
                                    setRecipeDetailSource('eatwell_recommend');
                                    if (basketCount === 0) {
                                      setShowNoIngredientsPopup(true);
                                    } else {
                                      setSubStep(6);
                                      setActiveCookingStepIndex(0);
                                    }
                                  }}
                                  className="bg-[#8ca779] hover:bg-[#728f60] text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                                >
                                  开始做
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-3">
                      <button 
                        onClick={() => setSubStep(4)}
                        className="bg-white text-[#5d7350] border border-[#a2c28f]/30 py-2.5 px-6 rounded-full text-xs font-bold cursor-pointer hover:bg-stone-50 transition-colors w-full sm:w-auto text-center"
                      >
                        ← 返回配置锅具与就餐人数
                      </button>

                      <button 
                        disabled={!selectedResultsRecipeId}
                        onClick={() => {
                          if (!selectedResultsRecipeId) return;
                          const foundRecipe = RECIPES_DATABASE.find(r => r.id === selectedResultsRecipeId);
                          if (foundRecipe) {
                            setActiveRecipe(foundRecipe);
                            setRecipeDetailSource('eatwell_recommend');
                            if (basketCount === 0) {
                              setShowNoIngredientsPopup(true);
                            } else {
                              setSubStep(6);
                              setActiveCookingStepIndex(0);
                            }
                          }
                        }}
                        className={`py-2.5 px-6 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                          selectedResultsRecipeId 
                            ? 'bg-[#8ca779] hover:bg-[#728f60] text-white active:scale-95 cursor-pointer' 
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span>确认选择，直接跳转下一步 👨‍🍳</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* ================================================================================= */}
                {/* VIEW 1: EAT WELL (好好吃饭) - SUB VIEW 6 (Active Step guide + Circular Nutrition) */}
                {/* ================================================================================= */}
                {activeTab === 'eatwell' && subStep === 6 && activeRecipe && (
                  <div className="flex flex-col flex-1 max-w-[1100px] mx-auto w-full justify-between animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6 flex-1 items-stretch">
                      
                      {/* Left Column (Images, Basic indicators, Retro TV Bilibili Link) */}
                      <div className="bg-white rounded-3xl border border-[#a2c28f]/20 p-5 flex flex-col justify-between gap-4.5 shadow-sm max-w-[420px] mx-auto w-full">
                        <div className="space-y-4 shrink-0">
                          {/* Image box: Display recipe image with dynamic Unsplash search and default fallback inside */}
                          {getRecipeImageUrl(activeRecipe.name) ? (
                            <div className="h-[150px] rounded-2xl overflow-hidden relative border shadow-inner">
                              <img 
                                src={getRecipeImageUrl(activeRecipe.name)} 
                                alt={activeRecipe.name}
                                className="w-full h-full object-cover object-center"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                                {activeRecipe.name}
                              </div>
                            </div>
                          ) : (
                            <div className="h-[150px] rounded-2xl overflow-hidden relative border shadow-inner bg-gradient-to-br from-[#8caf77]/15 to-[#edd96a]/15 flex flex-col items-center justify-center p-3 text-center">
                              <span className="text-5xl animate-bounce-subtle block mb-1">{activeRecipe.coverEmoji}</span>
                              <span className="text-[10px] font-mono text-stone-400 font-extrabold tracking-wide">🍽️ 识食物者·甄选配食</span>
                              <div className="absolute bottom-2 left-2 bg-[#5d7350]/80 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                                {activeRecipe.name}
                              </div>
                            </div>
                          )}

                          {/* Basic indicators of Left Column */}
                          <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border text-[11px] font-mono leading-relaxed shadow-sm">
                            <div className="flex justify-between border-b pb-1.5 border-stone-200/50">
                              <span className="font-extrabold text-stone-700">菜品基础指标：</span>
                              <span className="text-[#8ca779] font-black text-[9px]">BASIC DATA</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                              <span className="text-stone-600">🕒 预计时长：<strong className="text-stone-800 font-black">{activeRecipe.time}min</strong></span>
                              <span className="text-stone-600">📊 难度等级：<strong className="text-stone-800 font-black">{activeRecipe.difficulty}</strong></span>
                              <span className="text-stone-600">🍽️ 推荐分量：<strong className="text-stone-800 font-black">{potScale}人份</strong></span>
                              <span className="text-orange-950 font-black">🔥 能量值：{activeRecipe.calories} kcal</span>
                            </div>
                          </div>
                        </div>

                        {/* Retro Bilibili TV Container (小电视样式), click anywhere inside to search recipe tutorials. Stretches with flex-1 */}
                        <a 
                          href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(activeRecipe.name + " 做法")}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group relative w-full bg-[#fcefed] hover:bg-[#fae2e0] border-2 border-[#f0c3be] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer flex-1 flex flex-col justify-between mt-3"
                        >
                          {/* TV Antenna Ears */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none col-span-2">
                            <div className="w-[3px] h-3.5 bg-[#f0c3be] rounded-full rotate-[25deg] origin-bottom"></div>
                            <div className="w-[3px] h-3.5 bg-[#f0c3be] rounded-full -rotate-[25deg] origin-bottom"></div>
                          </div>
                          
                          {/* TV outer screen look with friendly, high-contrast, soft botanical theme (No large black area) */}
                          <div className="bg-rose-50/60 rounded-xl p-3.5 flex flex-col items-center justify-center relative flex-1 shadow-inner overflow-hidden min-h-[100px] border border-rose-100/50">
                            {/* Scanlines visual effect */}
                            <div className="absolute inset-x-0 h-0.5 bg-rose-200/10 top-1/4 pointer-events-none"></div>
                            <div className="absolute inset-x-0 h-0.5 bg-rose-200/10 top-2/4 pointer-events-none"></div>
                            <div className="absolute inset-x-0 h-0.5 bg-rose-200/10 top-3/4 pointer-events-none"></div>
                            
                            {/* Red indicator light */}
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>

                            {/* Glowing Play Symbol */}
                            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                              <span className="text-white text-sm ml-0.5">▶</span>
                            </div>
                            
                            <span className="text-xs text-rose-950 font-black opacity-95 mt-2.5 flex items-center gap-1 text-center font-sans">
                              📺 点击区域内任何一处跳转视频教程
                            </span>
                            <span className="text-[8px] text-rose-500/80 font-mono mt-1">BILIBILI RECIPE GUIDE</span>
                          </div>
                          
                          {/* Speaker holes and tiny dials at the bottom of the TV casing */}
                          <div className="flex justify-between items-center mt-2 px-1 text-stone-500 select-none pointer-events-none shrink-0 border-t border-[#f0c3be]/40 pt-2 font-mono">
                            <div className="flex gap-0.5">
                              <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
                              <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
                              <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
                            </div>
                            <div className="flex gap-1.5 text-[8px] font-mono leading-none">
                              <span className="font-bold">VOL ▫▫▪▫ 85%</span>
                              <span className="font-bold">CH 02</span>
                            </div>
                          </div>
                        </a>
                      </div>

                      {/* Right Column: Full-Width Concentric Macronutrient, Split Procedures and Core Instructions View */}
                      <div className="space-y-4 flex flex-col justify-between flex-1">
                        
                        {/* Upper row: Full-width Concentric rings visual dashboard */}
                        {(() => {
                          const totalProps = (activeRecipe.protein + activeRecipe.carbohydrates + activeRecipe.fat) || 1;
                          const proteinPct = Math.round((activeRecipe.protein / totalProps) * 100);
                          const carbPct = Math.round((activeRecipe.carbohydrates / totalProps) * 100);
                          const fatPct = 100 - proteinPct - carbPct;

                          return (
                            <div className="space-y-3 shrink-0">
                              {/* High Nutrition Card */}
                              <div className="bg-white border border-[#a2c28f]/30 rounded-3xl p-5 shadow-xs flex flex-col items-center gap-3 relative select-none">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
                                  <div className="flex items-center gap-4">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                      {/* Center text showing Calories */}
                                      <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-base font-mono font-black text-stone-800 leading-none">{activeRecipe.calories}</span>
                                        <span className="text-[7px] text-stone-400 font-bold uppercase tracking-wider scale-90">千卡 (共)</span>
                                      </div>
                                      
                                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        {/* Fat Track (Radius 42) */}
                                        <circle cx="50" cy="50" r="42" stroke="#fff0f0" strokeWidth="6" fill="transparent" />
                                        <circle 
                                          cx="50" cy="50" r="42" 
                                          stroke="#f28b82" strokeWidth="6" strokeDasharray="263.9" 
                                          strokeDashoffset={263.9 - (263.9 * (fatPct / 100))} 
                                          strokeLinecap="round" fill="transparent" 
                                          className="transition-all duration-500"
                                        />

                                        {/* Carb Track (Radius 33) */}
                                        <circle cx="50" cy="50" r="33" stroke="#fff7e6" strokeWidth="6" fill="transparent" />
                                        <circle 
                                          cx="50" cy="50" r="33" 
                                          stroke="#edd96a" strokeWidth="6" strokeDasharray="207.35" 
                                          strokeDashoffset={207.35 - (207.35 * (carbPct / 100))} 
                                          strokeLinecap="round" fill="transparent" 
                                          className="transition-all duration-500"
                                        />

                                        {/* Protein Track (Radius 24) */}
                                        <circle cx="50" cy="50" r="24" stroke="#eff7e8" strokeWidth="6" fill="transparent" />
                                        <circle 
                                          cx="50" cy="50" r="24" 
                                          stroke="#8ca779" strokeWidth="6" strokeDasharray="150.8" 
                                          strokeDashoffset={150.8 - (150.8 * (proteinPct / 100))} 
                                          strokeLinecap="round" fill="transparent" 
                                          className="transition-all duration-500"
                                        />
                                      </svg>
                                    </div>

                                    <div className="space-y-1 text-left min-w-[130px]">
                                      <span className="block text-xs font-black text-stone-800">🎯 高营养配比健康指标</span>
                                      <span className="text-[8px] text-stone-400 block font-sans">
                                        三大热量底物健康均衡比率
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Legend pill widgets */}
                                  <div className="grid grid-cols-3 sm:grid-cols-1 gap-1.5 shrink-0 w-full sm:w-auto">
                                    <div className="bg-[#eff7e8] border border-[#cbd8c5] rounded-lg px-2.5 py-1 flex flex-col text-left">
                                      <span className="text-[8px] text-[#4d5d44] font-black">🥬 蛋白质</span>
                                      <span className="text-[11px] font-bold text-stone-800 leading-tight">
                                        {activeRecipe.protein}g <span className="font-mono text-[9px] text-[#5d7350]">({proteinPct}%)</span>
                                      </span>
                                    </div>
                                    <div className="bg-[#fff7e6] border border-[#ffe0b3] rounded-lg px-2.5 py-1 flex flex-col text-left">
                                      <span className="text-[8px] text-[#8c5a12] font-black">🍚 碳水化合物</span>
                                      <span className="text-[11px] font-bold text-stone-800 leading-tight">
                                        {activeRecipe.carbohydrates}g <span className="font-mono text-[9px] text-amber-600">({carbPct}%)</span>
                                      </span>
                                    </div>
                                    <div className="bg-[#fff0f0] border border-[#ffd6d6] rounded-lg px-2.5 py-1 flex flex-col text-left">
                                      <span className="text-[8px] text-[#9c2d2d] font-black">🥩 脂肪</span>
                                      <span className="text-[11px] font-bold text-stone-800 leading-tight">
                                        {activeRecipe.fat}g <span className="font-mono text-[9px] text-red-600">({fatPct}%)</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Divider line */}
                                <div className="w-full h-px bg-stone-100 my-1"></div>

                                {/* Integrated Dietary Score Progress Bar */}
                                <div className="w-full text-left space-y-2">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-black text-stone-600 flex items-center gap-1">💖 识食物者专属膳食健康度（Dietary Score）：</span>
                                    <span className="font-mono font-black text-[#5d7350] text-[11px] bg-[#eff7e8] border border-[#a2c28f]/30 px-2 py-0.5 rounded-full">
                                      {(activeRecipe.healthScore || 9.2).toFixed(1)} / 10 分
                                    </span>
                                  </div>
                                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-[#8ca779] h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${(activeRecipe.healthScore || 9.2) * 10}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Required Ingredients for Recipe Detail Page placed above steps card - Requirement 6 */}
                        <div className="bg-[#eff7e8]/50 p-4 rounded-2xl border border-[#a2c28f]/30 text-left shadow-2xs shrink-0">
                          <div className="flex justify-between border-b pb-1.5 border-[#a2c28f]/20 mb-2">
                            <span className="font-extrabold text-[#5d7350] text-xs flex items-center gap-1">🍎 本菜谱所需主要食材：</span>
                            <span className="text-[#8ca779] font-black text-[9px] uppercase font-mono">Ingredients</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 animate-scale-up">
                            {getRecipeIngredients(activeRecipe.name).map((ing, idx) => (
                              <span key={idx} className="bg-white/90 border border-[#a2c28f]/30 px-2.5 py-1 text-[11px] font-black text-[#5d7350] rounded-xl shadow-2xs">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Split bottom section: Only step timeline listing (full 100% width, canceling highlighted step panel) */}
                        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 flex flex-col justify-between shadow-xs flex-1 text-left">
                          <div className="space-y-3 w-full">
                            <span className="block text-xs font-black text-[#5d7350] font-sans flex items-center gap-1 border-b pb-2">
                              📋 智能烹饪详细步骤全流程指引
                            </span>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scroll pr-1">
                              {activeRecipe.steps.map((stepText, idx) => {
                                const isActive = activeCookingStepIndex === idx;
                                const isPassed = activeCookingStepIndex > idx;
                                return (
                                  <div 
                                    key={`timeline-${idx}`}
                                    onClick={() => setActiveCookingStepIndex(idx)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs leading-relaxed flex items-start gap-3.5 ${
                                      isActive 
                                        ? 'bg-[#eff7e8] border-[#8ca779] font-black shadow-sm text-stone-900 border-2 scale-[1.01]' 
                                        : isPassed 
                                        ? 'bg-stone-50/50 border-stone-150 text-stone-400 opacity-60' 
                                        : 'bg-white border-stone-150 text-stone-600 hover:border-stone-200'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 border mt-0.5 ${
                                      isActive 
                                        ? 'bg-[#8ca779] text-white border-[#8ca779]' 
                                        : isPassed 
                                        ? 'bg-[#8ca779]/30 text-white border-[#8ca779]/30' 
                                        : 'bg-white text-stone-550 border-stone-200'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="flex-1 text-left">{stepText}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Standalone Progressive Progress Bar */}
                          <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                              <span className="text-[#5d7350] font-black uppercase tracking-wider">烹饪进展</span>
                              <span className="text-stone-800 font-extrabold">{activeCookingStepIndex + 1} / {activeRecipe.steps.length} 步已学完 ({Math.round(((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-stone-150 h-5 rounded-full overflow-hidden relative border shadow-inner">
                              <div 
                                className="bg-[#8ca779] h-full text-right text-[10px] text-white font-mono font-black flex items-center justify-end pr-3 transition-all duration-300"
                                style={{ width: `${((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100}%` }}
                              >
                                <span>{Math.round(((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom controller anchors */}
                    <div className="flex items-center justify-between mt-5 border-t pt-4 shrink-0">
                      <button 
                        onClick={() => {
                          if (recipeDetailSource === 'random_inspiration') {
                            setActiveTab('inspiration');
                            setInspirationSubView('generator');
                            setSubStep(1);
                          } else if (recipeDetailSource === 'recipe_square') {
                            setActiveTab('inspiration');
                            setInspirationSubView('square');
                            setSubStep(1);
                          } else if (recipeDetailSource === 'profile_starred') {
                            setActiveTab('profile');
                            setSubStep(1);
                          } else {
                            setSubStep(5);
                          }
                        }}
                        className="bg-white text-stone-650 border border-stone-250 px-5 py-2.5 rounded-full text-[11px] font-black shadow-xs cursor-pointer hover:bg-stone-50 transition-colors"
                      >
                        {recipeDetailSource === 'random_inspiration' ? '← 返回随机灵感' : 
                         recipeDetailSource === 'recipe_square' ? '← 返回食谱广场' : 
                         recipeDetailSource === 'profile_starred' ? '← 返回个人中心' : 
                         '← 返回食谱单'}
                      </button>

                      {/* Twin styled control buttons with symmetric size margins */}
                      <div className="flex items-center gap-3">
                        <button
                          disabled={activeCookingStepIndex === 0}
                          onClick={() => setActiveCookingStepIndex(prev => prev - 1)}
                          className={`w-32 py-2.5 px-6 rounded-full border text-xs font-black transition-all active:scale-95 flex items-center justify-center ${
                            activeCookingStepIndex === 0 
                              ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50' 
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 cursor-pointer'
                          }`}
                        >
                          上一步
                        </button>

                        <button
                          onClick={() => {
                            if (activeCookingStepIndex < activeRecipe.steps.length - 1) {
                              setActiveCookingStepIndex(prev => prev + 1);
                            } else {
                              setShowCongratsSuccess(true);
                            }
                          }}
                          className="w-32 py-2.5 px-6 rounded-full border text-xs font-black transition-all active:scale-95 flex items-center justify-center bg-brand-yellow text-stone-850 hover:bg-[#edd96a]/90 border-[#edd96a] shadow-xs cursor-pointer animate-pulse-subtle"
                        >
                          <span>{activeCookingStepIndex === activeRecipe.steps.length - 1 ? '完成本菜' : '下一步骤'}</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          setShowRecipeSharePopup(true);
                          setShowWXQRCode(false);
                        }}
                        className="p-2.5 bg-[#eff7e8] border border-brand-green/30 rounded-full hover:scale-105 transition-transform cursor-pointer"
                        title="打开微信或社区分享"
                      >
                        <Share2 className="w-5 h-5 text-[#8ba779]" />
                      </button>
                    </div>

                  </div>
                )}

                {activeTab === 'inspiration' && (
                  <div className="flex flex-col flex-1 max-w-[950px] mx-auto w-full py-2 animate-fade-in text-left">
                    
                    {/* Unified Selector Sub-tabs for: 1. Search Box, 2. Random Generator, 3. Recipe Square */}
                    <div className="flex bg-[#cbd8c5]/30 p-1 rounded-2xl select-none max-w-lg mx-auto mb-6 w-full shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setInspirationSubView('search');
                          setInspirationSearchQuery('');
                        }}
                        className={`flex-1 py-2 text-center text-[11px] font-black rounded-xl transition-all ${inspirationSubView === 'search' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'}`}
                      >
                        🔍 菜谱搜索
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspirationSubView('generator')}
                        className={`flex-1 py-2 text-center text-[11px] font-black rounded-xl transition-all ${inspirationSubView === 'generator' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'}`}
                      >
                        💡 随机灵感
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspirationSubView('square')}
                        className={`flex-1 py-2 text-center text-[11px] font-black rounded-xl transition-all ${inspirationSubView === 'square' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'}`}
                      >
                        🏛️ 菜谱广场
                      </button>
                    </div>

                    {/* ========================================== */}
                    {/* SUBVIEW A: SMART RECIPE SEARCH (菜谱搜索) */}
                    {/* ========================================== */}
                    {inspirationSubView === 'search' && (
                      <div className="space-y-5 animate-fade-in w-full">
                        {/* Only search box, no redundant elements */}
                        <div className="relative max-w-[500px] mx-auto w-full">
                          <Search className="w-4 h-4 text-[#8ca779] absolute left-4.5 top-3.5 animate-pulse" />
                          <input 
                            type="text"
                            placeholder="搜索感兴趣的健康菜谱... (例如：秋葵、番茄、低卡)"
                            value={inspirationSearchQuery}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInspirationSearchQuery(val);
                              if (val.trim()) {
                                // check forbidden and allergen
                                const check = checkQueryRestrictions(val);
                                if (check) {
                                  showToast(`${check.message}`);
                                  return;
                                }
                                // check taste preference
                                const tasteCheck = checkTastePreferenceRestrictions(val);
                                if (tasteCheck) {
                                  showToast(`${tasteCheck}`);
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (!inspirationSearchQuery.trim()) {
                                  showToast('⚠️ 不能空搜索：请输入想要烹饪或关心的食材、口味、做法关键字！');
                                  return;
                                }

                                const check = checkQueryRestrictions(inspirationSearchQuery);
                                if (check) {
                                  showToast(`${check.message}`);
                                  return;
                                }

                                const tasteCheck = checkTastePreferenceRestrictions(inspirationSearchQuery);
                                if (tasteCheck) {
                                  showToast(`${tasteCheck}`);
                                  return;
                                }

                                showToast(`🔍 识食物者：已为您智能过滤关于【${inspirationSearchQuery}】的推荐菜谱！`);
                              }
                            }}
                            className="w-full bg-white border border-[#c1d9b3]/60 focus:border-[#8ca779] focus:ring-1 focus:ring-[#8ca779]/30 rounded-full pl-11 pr-12 py-3 text-xs outline-none transition-all font-bold placeholder-stone-400 text-stone-850 shadow-xs"
                          />
                          {inspirationSearchQuery && (
                            <button 
                              type="button"
                              onClick={() => setInspirationSearchQuery('')}
                              className="absolute right-4 top-2.5 px-2 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 font-extrabold rounded py-1 transition-colors"
                            >
                              清除
                            </button>
                          )}
                        </div>

                        {/* Preset Hot Tags - Requirement 7 */}
                        <div className="flex flex-wrap items-center gap-1.5 justify-center max-w-[700px] mx-auto pt-1 select-none">
                          <span className="text-[10px] text-stone-400 font-bold shrink-0">💡 智能快捷搜索：</span>
                          {[
                            { label: '低脂轻食 🥦', query: '低脂' },
                            { label: '高卡增肌 🥩', query: '高卡' },
                            { label: '清淡少油 🥬', query: '清淡' },
                            { label: '麻辣香辛 🌶️', query: '麻辣' },
                            { label: '糖醋甜味 🍯', query: '甜' },
                            { label: '家常咸鲜 🧂', query: '咸' },
                            { label: '香煎做法 🍳', query: '煎' },
                            { label: '火热爆炒 🔥', query: '炒' },
                            { label: '营养煲煮 🍲', query: '煮' },
                            { label: '精选蔬菜 🥕', query: '蔬菜' },
                            { label: '丰盛肉食 🍗', query: '肉' },
                            { label: '深海好鱼 🐟', query: '鱼' }
                          ].map(tag => (
                            <button
                              key={tag.label}
                              type="button"
                              onClick={() => {
                                setInspirationSearchQuery(tag.query);
                                showToast(`🔍 识食物者：已筛选关于【${tag.label}】的口味与系列菜谱！`);
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all border cursor-pointer ${
                                inspirationSearchQuery === tag.query
                                  ? 'bg-[#8ca779] text-white border-[#8ca779] shadow-xs'
                                  : 'bg-white text-stone-600 border-stone-200 hover:bg-[#eff7e8]/50 hover:text-[#5d7350] hover:border-[#8ca779]/40'
                              }`}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>

                        {/* Search Results Displayed Freely, like ingredient selectors (No bulky boxes) */}
                        <div className="pt-2">
                          <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-wider block mb-3 px-1.5">
                            {inspirationSearchQuery ? "🎯 识食物者：匹配智能搜寻结果" : "✨ 所有健康推荐菜谱一览"}
                          </h4>

                          {(() => {
                            const filteredRecipes = RECIPES_DATABASE.filter(recipe => {
                              return matchRecipeSearch(recipe, inspirationSearchQuery);
                            });

                            const matchesForbidden = inspirationSearchQuery && forbiddenFoodsSelected.some(forbidden => 
                              forbidden.toLowerCase().includes(inspirationSearchQuery.toLowerCase()) || 
                              inspirationSearchQuery.toLowerCase().includes(forbidden.toLowerCase())
                            );

                            return (
                              <>
                                {matchesForbidden && (
                                  <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] p-3 rounded-2xl font-bold flex items-center gap-2 mb-3 select-none animate-fade-in text-left">
                                    <span>🚫 识食物者常识提示：您在个人中心设置了避让忌口食材 “{forbiddenFoodsSelected.find(f => f.toLowerCase().includes(inspirationSearchQuery.toLowerCase()) || inspirationSearchQuery.toLowerCase().includes(f.toLowerCase()))}”，此类食材及相关食谱已在系统中被全局智能隔离。</span>
                                  </div>
                                )}
                                {filteredRecipes.length === 0 ? (
                                  <div className="py-16 text-center flex flex-col items-center justify-center gap-2.5 bg-stone-50/50 border border-stone-100 rounded-3xl">
                                    <span className="text-4xl text-stone-300">🔍</span>
                                    <p className="text-xs text-stone-400 font-bold px-6 leading-relaxed">没有找到您搜索的健康菜谱，可能是因为该菜谱包含您的忌口或过敏食材，或尝试搜索其他烹调原料 ✨</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {filteredRecipes.map(recipe => (
                                      <div 
                                        key={`search-res-${recipe.id}`}
                                        onClick={() => {
                                          setActiveRecipe(recipe);
                                          setSubStep(6);
                                          setActiveCookingStepIndex(0);
                                          setActiveTab('eatwell');
                                        }}
                                        className="bg-white hover:bg-[#eff7e8]/30 border border-stone-200 hover:border-[#8ca779]/45 p-4 rounded-3xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span className="text-3xl bg-[#eff7e8]/40 p-2.5 rounded-2xl shrink-0 border font-sans">{recipe.coverEmoji}</span>
                                          <div className="min-w-0">
                                            <h5 className="font-extrabold text-xs text-stone-850 truncate">{recipe.name}</h5>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[10px] text-stone-400 font-bold">⏱️ {recipe.time}分</span>
                                              <span className="text-[10px] text-amber-600 font-extrabold font-mono">{recipe.calories} kcal</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveRecipe(recipe);
                                            setSubStep(6);
                                            setActiveCookingStepIndex(0);
                                            setActiveTab('eatwell');
                                          }}
                                          className="p-1 px-3.5 rounded-xl bg-[#eff7e8] hover:bg-brand-green text-brand-green-dark hover:text-white text-[10px] font-bold shrink-0 transition-all border border-brand-green/30 cursor-pointer"
                                        >
                                          开始
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ========================================== */}
                    {/* SUBVIEW B: HEALTHY RECIPE PLAZA (菜谱广场) */}
                    {/* ========================================== */}
                    {inspirationSubView === 'square' && (
                      <div className="space-y-4 animate-fade-in w-full text-left">
                        <div className="border-b pb-3 mb-2">
                          <h4 className="font-extrabold text-sm text-stone-800">全域星级美食菜谱广场</h4>
                          <p className="text-[10px] text-stone-400 mt-1">点击星标，收藏菜谱，收藏后将在【个人中心-我的食谱】中常驻显示。</p>
                        </div>

                        {/* List arranged in Single horizontal line row formatting, with pictures & favorite stars (Goal 5), made scrollable with max height for consistent display regions */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1.5 custom-scroll">
                          {RECIPES_DATABASE.map(recipe => {
                            const isStarred = starredRecipes.includes(recipe.id);
                            return (
                              <div 
                                key={`row-square-${recipe.id}`}
                                onClick={() => {
                                  setActiveRecipe(recipe);
                                  setSubStep(6);
                                  setActiveCookingStepIndex(0);
                                  setActiveTab('eatwell');
                                }}
                                className="bg-white border border-stone-200 hover:border-[#8ca779]/45 p-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-all shadow-sm group"
                              >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  {/* Culinary illustration preview */}
                                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#eff7e8]/50 relative border flex items-center justify-center">
                                    <span className="text-3xl select-none relative z-10">{recipe.coverEmoji}</span>
                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-stone-900/10 via-transparent to-transparent"></div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-black text-[13px] text-stone-850 group-hover:text-brand-green-dark transition-colors truncate">
                                        {recipe.name}
                                      </h4>
                                      <span className="text-[9px] bg-[#eff7e8] text-brand-green-dark px-1.5 py-0.5 rounded-full font-black">
                                        {recipe.difficulty}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                                      步骤概要：{recipe.steps[0]}
                                    </p>

                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-stone-550 font-bold">
                                      <span>🕒 用时: <strong className="text-stone-700">{recipe.time} 分钟</strong></span>
                                      <span>🔥 能量: <strong className="text-stone-700">{recipe.calories} kcal</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {/* Star Toggle Right Side Options (Saves directly to personal center) */}
                                <div className="flex items-center gap-2.5 shrink-0 select-none">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStarredRecipes(prev => 
                                        prev.includes(recipe.id) 
                                          ? prev.filter(id => id !== recipe.id) 
                                          : [...prev, recipe.id]
                                      );
                                    }}
                                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                      isStarred 
                                        ? 'bg-amber-50 border-amber-200 text-amber-500 scale-102 font-black animate-star-bounce' 
                                        : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-amber-500 hover:bg-amber-50/25'
                                    }`}
                                    title="收藏这款菜谱到个人中心"
                                  >
                                    <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveRecipe(recipe);
                                      setSubStep(6);
                                      setActiveCookingStepIndex(0);
                                      setActiveTab('eatwell');
                                    }}
                                    className="bg-[#8ca779] text-white hover:bg-[#728f60] font-black text-[11px] px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                                  >
                                    开始做
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ========================================== */}
                    {/* SUBVIEW C: RANDOM INSPIRATION (随机灵感) */}
                    {/* ========================================== */}
                    {inspirationSubView === 'generator' && (
                      <div className="space-y-4 animate-fade-in w-full text-center relative">

                        <div className="relative pt-2">
                          <h3 className="font-black text-stone-850 text-base tracking-tight flex items-center justify-center gap-1.5">
                            💡 随机灵感推荐
                          </h3>
                        </div>

                        {/* Numerical count selection block */}
                        <div className="bg-gradient-to-r from-stone-50 to-white border border-stone-200/60 rounded-2xl p-4 max-w-[400px] w-full mx-auto shadow-xs flex flex-col items-center gap-2">
                          <span className="text-[11px] font-black text-stone-600 font-sans tracking-wide">🎯 选定要生成的菜式道数</span>
                          <div className="flex items-center gap-6">
                            <button 
                              type="button"
                              onClick={() => setInspirationCount(prev => Math.max(1, prev - 1))}
                              className="bg-[#8ca779] hover:bg-[#728f60] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer"
                            >
                              -
                            </button>
                            
                            <div className="w-14 text-center">
                              <span className="text-2xl font-mono font-black text-stone-850 block leading-none">{inspirationCount}</span>
                              <span className="text-[9px] text-[#5d7350] font-black font-sans uppercase tracking-[0.1em] mt-1 block">道美食</span>
                            </div>

                            <button 
                              type="button"
                              onClick={() => {
                                if (inspirationCount >= 8) {
                                  showToast("💡 提示：做多可选择菜谱数量最多支持 8 道菜推荐哦！");
                                } else {
                                  setInspirationCount(prev => prev + 1);
                                }
                              }}
                              className="bg-[#8ca779] hover:bg-[#728f60] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Arranged grid of all generated recipes with dynamic sizes and strict overflow limits to prevent stretching (Goal 6) */}
                        <div className="max-w-[1000px] mx-auto w-full pt-1">
                          {isGenerated && randomizedRecipes.length > 0 ? (
                            <div className={`grid gap-3.5 max-h-[350px] overflow-y-auto pr-2 custom-scroll text-left ${
                              inspirationCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                              inspirationCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                              inspirationCount === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                              'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                            }`}>
                              {randomizedRecipes.slice(0, Math.min(inspirationCount, randomizedRecipes.length)).map((recipe, index) => {
                                if (!recipe) return null;
                                
                                // Dynamic density styles based on chosen count to automatically arrange sizes
                                const isDense = inspirationCount >= 4;
                                const padClass = isDense ? 'p-3.5' : 'p-5';
                                const minHClass = isDense ? 'min-h-[120px]' : 'min-h-[155px]';
                                const emojiClass = isDense ? 'text-2xl p-2 rounded-xl' : 'text-3xl p-2.5 rounded-2xl';
                                
                                return (
                                  <div 
                                    key={recipe.id}
                                    onClick={() => {
                                      setActiveRecipe(recipe);
                                      setRecipeDetailSource('random_inspiration');
                                      setSubStep(6);
                                      setActiveCookingStepIndex(0);
                                      setActiveTab('eatwell');
                                    }}
                                    className={`bg-white border border-stone-200/85 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#8ca779]/50 transition-all duration-300 cursor-pointer text-left group flex flex-col justify-between ${padClass} ${minHClass}`}
                                  >
                                    {/* Fresh single-item shuffle click button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRefreshSingleInspiration(index);
                                      }}
                                      className="absolute top-3.5 right-3.5 p-1.5 bg-stone-50 hover:bg-[#eff7e8] border border-stone-200 rounded-full text-stone-400 hover:text-brand-green shadow-xs transition-colors z-10 cursor-pointer active:rotate-180 duration-300"
                                      title="换一个"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                    </button>

                                    <div className="space-y-3">
                                      {/* Header Indicator */}
                                      <div className="flex items-center">
                                        <span className="bg-[#eff7e8]/80 text-brand-green-dark text-[9px] font-black px-2 py-0.5 rounded-full font-sans tracking-wider">
                                          第 {index + 1} 道灵感
                                        </span>
                                      </div>

                                      {/* Cover and details */}
                                      <div className="flex items-center gap-3">
                                        <span className={`bg-amber-50 group-hover:bg-[#eff7e8] border shadow-xs transition-colors duration-300 select-none ${emojiClass}`}>
                                          {recipe.coverEmoji}
                                        </span>
                                        <div className="min-w-0">
                                          <h4 className="font-extrabold text-xs text-stone-850 group-hover:text-[#5d7350] transition-colors leading-snug line-clamp-2">
                                            {recipe.name}
                                          </h4>
                                          <p className="text-[9px] text-[#8ca779] font-black mt-0.5">
                                            难度: <strong className="text-stone-700 font-bold">{recipe.difficulty}</strong>
                                          </p>
                                        </div>
                                      </div>

                                      {/* Durations */}
                                      <div className="text-[10px] text-stone-500 font-sans leading-relaxed flex items-center justify-between border-t pt-2 border-stone-100">
                                        <span className="font-bold">⏰ 预计时: <strong className="text-stone-800 font-extrabold">{recipe.time}分钟</strong></span>
                                        <span className="text-orange-950 font-black bg-brand-yellow/55 px-1.5 py-0.5 rounded text-[9.5px]">🔥 {recipe.calories} kcal</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : isGenerated ? (
                            <div className="text-xs text-stone-400 p-8 border border-dashed rounded-3xl">暂无定制生成的推荐备选</div>
                          ) : null}
                        </div>

                        {/* Accumulated statistics */}
                        {isGenerated && randomizedRecipes.length > 0 && (
                          <div className="bg-[#eff7e8]/60 border border-[#a2c28f]/30 rounded-2xl p-4 max-w-[650px] mx-auto shadow-xs text-left grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in my-2">
                            <div>
                              <span className="text-[9px] text-[#526047] block font-black leading-none">总计推荐能量</span>
                              <span className="text-xs font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.calories} kcal</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#526047] block font-black leading-none">总蛋白质质量</span>
                              <span className="text-xs font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.protein} g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#526047] block font-black leading-none">总碳水化合物质量</span>
                              <span className="text-xs font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.carb} g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#526047] block font-black leading-none">综合膳食 GL 指数</span>
                              <span className="text-xs font-mono font-black text-[#5d7350] mt-1 block">GL 4.2 (低GI)</span>
                            </div>
                          </div>
                        )}

                        {/* Magic ritual trigger button & Expanded default recommendations (Goal 6) */}
                        {!isGenerated && (
                          <div className="space-y-6 w-full max-w-[850px] mx-auto px-1 py-3">
                            <div className="flex flex-col items-center gap-2.5 py-1">
                              <button
                                type="button"
                                onClick={handleSpinInspiration}
                                className={`group relative flex items-center gap-3 bg-[#2c3523] hover:bg-[#3d4a31] text-white font-black text-xs py-3.5 px-10 rounded-full shadow-lg hover:shadow-[#8caf77]/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer overflow-hidden ${isSpinning ? 'animate-pulse' : ''}`}
                              >
                                <Lightbulb className={`w-4 h-4 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] ${isSpinning ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                                <span className="tracking-wide">随机一下</span>
                              </button>
                            </div>

                            <div className="text-left border-t border-stone-150/60 pt-5 pr-1 animate-fade-in">
                              <span className="text-[10px] font-black text-stone-400 font-sans block uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                🍳 爆款主厨力推美膳 (为您默认推荐 6 道健康佳肴)
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[290px] overflow-y-auto pr-1.5 custom-scroll">
                                {RECIPES_DATABASE.slice(0, 6).map((recipe) => (
                                  <div 
                                    key={`recommended-${recipe.id}`}
                                    onClick={() => {
                                      setActiveRecipe(recipe);
                                      setSubStep(6);
                                      setActiveCookingStepIndex(0);
                                      setActiveTab('eatwell');
                                    }}
                                    className="bg-white border border-stone-200/80 hover:border-[#8ca779]/50 hover:shadow-md rounded-2xl p-4 cursor-pointer text-left transition-all duration-200 flex flex-col justify-between group shadow-xs hover:-translate-y-0.5"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl bg-amber-50 group-hover:bg-[#eff7e8] p-2 rounded-xl border border-stone-100 shadow-xs select-none transition-colors">{recipe.coverEmoji || '🥘'}</span>
                                      <div className="min-w-0">
                                        <h5 className="font-extrabold text-[11px] text-stone-850 group-hover:text-[#5d7350] transition-colors leading-snug line-clamp-1">{recipe.name}</h5>
                                        <p className="text-[9px] text-[#8ca779] font-bold mt-0.5">热量: {recipe.calories} kcal</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono mt-3.5 pt-2 border-t border-stone-50">
                                      <span>难度: <strong className="text-stone-600 font-bold">{recipe.difficulty}</strong></span>
                                      <span>⏰ {recipe.time} 分钟</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reset controller */}
                        {isGenerated && (
                          <div className="flex justify-center gap-3 mt-4 border-t pt-4 w-full max-w-md mx-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setIsGenerated(false);
                                setRandomizedRecipes(RECIPES_DATABASE.slice(0, 8));
                              }}
                              className="bg-white hover:bg-stone-50 text-stone-600 font-extrabold text-xs py-2.5 px-5 rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>重置初始</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSpinInspiration}
                              className="bg-[#2c3523] hover:bg-[#3b472f] text-white font-extrabold text-xs py-2.5 px-5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                              <span>再来一个</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const currentGenerated = randomizedRecipes.slice(0, Math.min(inspirationCount, randomizedRecipes.length));
                                const currentGeneratedIds = currentGenerated.map(r => r.id);
                                setStarredRecipes(prev => {
                                  const combined = new Set([...prev, ...currentGeneratedIds]);
                                  return Array.from(combined);
                                });
                                // Trigger heart floats for visual reward animation!
                                for (let i = 0; i < 6; i++) {
                                  setTimeout(() => {
                                    setFloatingHearts(hearts => [
                                      ...hearts,
                                      { id: Date.now() + i + Math.random(), left: 30 + Math.random() * 40 }
                                    ]);
                                  }, i * 120);
                                }
                                showToast(`💚 灵感大满足！已将这 ${currentGenerated.length} 道推荐美味一键收藏至您的个人中心！`);
                              }}
                              className="bg-brand-yellow hover:bg-[#e6d363] text-stone-850 font-extrabold text-xs py-2.5 px-5 rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                            >
                              <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                              <span>一键收藏全部 ({Math.min(inspirationCount, randomizedRecipes.length)})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 4: COMMUNTIY PLAZA (交流社区) */}
                {/* ======================================================= */}
                {activeTab === 'community' && (
                  <div className="flex flex-1 overflow-hidden h-full rounded-2xl bg-white border border-[#a2c28f]/10 shadow-sm min-h-[380px]">
                    
                    {/* Left filter options with Profile Bio (Goal 3 & 4) */}
                    <div className="w-[125px] sm:w-[155px] bg-stone-50/55 border-r p-3.5 pt-4 flex flex-col justify-between items-center shrink-0">
                      <div className="w-full text-center space-y-3 font-sans pb-3 flex-1">
                        
                        {/* Left sidebar - removed the community home button from here since we want it on the left of search box */}
                        <div className="flex flex-col items-center pt-2">
                          <div className="w-11 h-11 rounded-full bg-brand-green/10 text-[#8ba779] flex items-center justify-center text-xl font-bold border shadow-inner overflow-hidden shrink-0">
                            {profileAvatar && typeof profileAvatar === 'string' && (profileAvatar.startsWith('blob:') || profileAvatar.startsWith('data:') || profileAvatar.startsWith('http') || profileAvatar.startsWith('/')) ? (
                              <img src={profileAvatar} alt="My avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              profileAvatar
                            )}
                          </div>
                          <span className="text-[10px] font-black text-stone-850 mt-1.5 block font-sans">{profileUsername} (我)</span>
                          {/* Signature detail requested in step 3 - live updated from settings */}
                          <p className="text-[9px] text-[#86927e] font-medium leading-normal italic mt-1 mx-1 line-clamp-2 font-sans">
                            {profileBio}
                          </p>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex flex-col gap-1 w-full text-left pt-1 font-sans">
                          <button 
                            type="button"
                            onClick={() => {
                              setActiveSidebarFilter('all');
                              setSearchQuery('');
                            }}
                            className={`w-full text-left text-[11px] p-2 rounded-xl font-black flex items-center gap-1.5 transition-all duration-200 ${activeSidebarFilter === 'all' ? 'bg-[#eff7e8] text-brand-green-dark scale-102 shadow-xs' : 'text-stone-500 hover:bg-[#eff7e8]/45'}`}
                          >
                            <Sparkles className="w-3" />
                            <span>推荐灵感</span>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => setActiveSidebarFilter('liked')}
                            className={`w-full text-left text-[11px] p-2 rounded-xl font-black flex items-center gap-1.5 transition-all duration-200 ${activeSidebarFilter === 'liked' ? 'bg-[#eff7e8] text-[#5d7350] scale-102 shadow-xs' : 'text-stone-500 hover:bg-[#eff7e8]/45'}`}
                          >
                            <Heart className="w-3" />
                            <span>我给的点赞</span>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => setActiveSidebarFilter('saved')}
                            className={`w-full text-left text-[11px] p-2 rounded-xl font-black flex items-center gap-1.5 transition-all duration-200 ${activeSidebarFilter === 'saved' ? 'bg-[#eff7e8] text-[#5d7350] scale-102 shadow-xs' : 'text-stone-500 hover:bg-[#eff7e8]/45'}`}
                          >
                            <Star className="w-3" />
                            <span>收藏清单</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setActiveSidebarFilter('comments')}
                            className={`w-full text-left text-[11px] p-2 rounded-xl font-black flex items-center gap-1.5 transition-all duration-200 ${activeSidebarFilter === 'comments' ? 'bg-[#eff7e8] text-[#5d7350] scale-102 shadow-xs' : 'text-stone-500 hover:bg-[#eff7e8]/45'}`}
                          >
                            <MessageSquare className="w-3 text-[#cbd8c5] fill-stone-50" />
                            <span>我的评论</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick post button - text removed, only button styles kept (Goal 4) */}
                      <button 
                        type="button"
                        onClick={() => {
                          setCustomPublishSource('community');
                          setCustomPublishTitle('');
                          setCustomPublishBody('');
                          setCustomPublishStars(5);
                          setCustomPublishEmoji('🥘');
                          setCustomPublishImage(null);
                          setPublishToCommunity(true);
                          setPublishToLogs(true);
                          setIsCustomPublishPage(true);
                        }}
                        className="bg-brand-green hover:bg-[#8ba779] text-white w-11 h-11 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer mb-2"
                        title="发布新贴"
                      >
                        <Plus className="w-5 h-5 font-black" />
                      </button>
                    </div>

                    <div className="flex-1 p-4.5 flex flex-col overflow-y-auto max-h-[680px] min-h-[500px] custom-scroll">
                      {activeSidebarFilter === 'comments' ? (
                        <div className="w-full space-y-4 animate-fade-in text-left">
                          
                          {/* Top Home UI Header with clean back action (Request 2.1) */}
                          <div className="flex items-center w-full gap-2 mb-4 shrink-0 select-none">
                            <button 
                              onClick={() => {
                                setActiveSidebarFilter('all');
                                showToast('🔍 已为您切换回到社区主广场首页！');
                              }}
                              className="px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green text-stone-500 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                              title="回到社区初始页"
                            >
                              <Home className="w-3.5 h-3.5 text-stone-600" />
                              <span>返回主广场频道</span>
                            </button>
                          </div>

                          {/* Split column design with central dividing line, without outer border boundaries (Request 2.2) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative pt-1.5">
                            
                            {/* Panel 1: My Comments & Reviews (Border-free) */}
                            <div className="space-y-3.5 min-h-[350px] max-h-[500px] overflow-y-auto custom-scroll pr-3">
                              <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3 select-none">
                                <span className="text-base">📝</span>
                                <span className="text-[11px] font-black text-stone-800 font-sans bg-[#eff7e8]/60 px-2.5 py-0.5 rounded-full">我发表的精彩评论 ({
                                  socialPosts.reduce((acc, p) => acc + p.comments.filter(c => c.name === profileUsername || c.name.includes('(我)')).length, 0)
                                })</span>
                              </div>

                              <div className="space-y-3">
                                {(() => {
                                  const list = socialPosts.flatMap(post => 
                                    post.comments
                                      .filter(c => c.name === profileUsername || c.name.includes('(我)'))
                                      .map(c => ({ post, comment: c }))
                                  );
                                  
                                  return list.length === 0 ? (
                                    <div className="text-[10px] text-stone-300 text-center py-20 italic font-sans font-medium">
                                      🫙 暂无发表过的评论，快去帖子详情页留下您的美食真知灼见吧！
                                    </div>
                                  ) : (
                                    list.map((item, idx) => (
                                      <div 
                                        key={idx}
                                        onClick={() => {
                                          setChosenPost(item.post);
                                          showToast(`📍 已成功为您跳转至帖子【${item.post.title}】的详情讨论区！`);
                                        }}
                                        className="bg-white p-3.5 rounded-2xl border border-stone-150 hover:border-[#8ca779]/45 hover:bg-[#eff7e8]/10 transition-all cursor-pointer flex gap-3 group text-left items-start justify-between shadow-3xs hover:shadow-xs"
                                      >
                                        <div className="flex-1 space-y-1.5 min-w-0">
                                          <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold">
                                            <span className="w-4 h-4 rounded-full bg-[#8ca779] text-white text-[8px] flex items-center justify-center border font-black scale-95 select-none">我</span>
                                            <span className="text-[#5d7350] truncate max-w-[130px] font-sans">原载: 《{item.post.title}》</span>
                                            <span className="font-mono">{item.comment.time || '刚刚'}</span>
                                          </div>
                                          
                                          <p className="text-[11px] text-stone-750 font-bold leading-relaxed font-sans line-clamp-3">
                                            {item.comment.text}
                                          </p>
                                          
                                          <div className="flex items-center gap-2 text-[8px] text-stone-400 font-sans border-t border-dashed border-stone-150 pt-1.5 ">
                                            <span>👍 已获赞 {item.comment.likes || 0}</span>
                                            <span>·</span>
                                            <span className="text-[#5d7350] group-hover:underline font-extrabold">查看探讨现场 →</span>
                                          </div>
                                        </div>

                                        {/* Right-side miniature post layout */}
                                        <div className="w-12 h-12 bg-stone-100 border border-stone-200/60 rounded-xl overflow-hidden flex flex-col items-center justify-center relative shrink-0 shadow-3xs group-hover:scale-102 transition-transform select-none">
                                          {item.post.image ? (
                                            <img src={item.post.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Original Post Cover" />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
                                              <span className="text-xl drop-shadow-xs select-none">{item.post.emoji || item.post.coverEmoji || '🥘'}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Center separator line on medium screens and up (Request 2.2) */}
                            <div className="hidden md:block absolute top-[10px] bottom-[10px] left-1/2 w-px bg-stone-200/70 -translate-x-1/2 select-none pointer-events-none"></div>

                            {/* Panel 2: Replies from others (Border-free) */}
                            <div className="space-y-3.5 min-h-[350px] max-h-[500px] overflow-y-auto custom-scroll pl-3 border-t md:border-t-0 md:pt-0 pt-4 border-stone-100">
                              <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3 select-none">
                                <span className="text-base">🗣️</span>
                                <span className="text-[11px] font-black text-stone-800 font-sans bg-[#eff7e8]/60 px-2.5 py-0.5 rounded-full">我收到的食友回复 ({
                                  socialPosts.reduce((acc, p) => 
                                    acc + p.comments
                                      .filter(c => c.name === profileUsername || c.name.includes('(我)'))
                                      .reduce((sum, c) => sum + (c.replies?.filter(r => r.name !== profileUsername && !r.name.includes('(我)')).length || 0), 0)
                                  , 0)
                                })</span>
                              </div>

                              <div className="space-y-3">
                                {(() => {
                                  const list = socialPosts.flatMap(post => 
                                    post.comments
                                      .filter(c => c.name === profileUsername || c.name.includes('(我)'))
                                      .flatMap(c => 
                                        (c.replies || [])
                                          .filter(r => r.name !== profileUsername && !r.name.includes('(我)'))
                                          .map(r => ({ post, comment: c, reply: r }))
                                      )
                                  );
                                  
                                  return list.length === 0 ? (
                                    <div className="text-[10px] text-stone-300 text-center py-20 italic font-medium font-sans">
                                      🫙 暂无收到其他的评论回复，配合打卡让美食生活更精彩！
                                    </div>
                                  ) : (
                                    list.map((item, idx) => (
                                      <div 
                                        key={idx}
                                        onClick={() => {
                                          setChosenPost(item.post);
                                          showToast(`📍 智能跳转：正在进入【${item.reply.name}】回复您的讨论现场！`);
                                        }}
                                        className="bg-white p-3.5 rounded-2xl border border-stone-150 hover:border-[#8ca779] hover:bg-[#eff7e8]/10 transition-all cursor-pointer space-y-2 group text-left shadow-3xs hover:shadow-xs"
                                      >
                                        <div className="flex justify-between items-center text-[9px] font-bold">
                                          <div className="flex items-center gap-1">
                                            <span className="text-brand-green-dark font-black">{item.reply.name}</span>
                                            <span className="text-stone-450 font-medium">回复了您</span>
                                          </div>
                                          <span className="text-[8px] text-stone-400 font-mono">{item.reply.time || '刚刚'}</span>
                                        </div>

                                        <p className="text-[10px] text-stone-400 leading-relaxed bg-stone-50/80 p-2 rounded-xl italic font-sans">
                                          我的评论: "{item.comment.text}"
                                        </p>

                                        <p className="text-[11px] text-stone-850 font-extrabold leading-relaxed pl-2 border-l-2 border-[#8ca779]">
                                          {item.reply.text}
                                        </p>

                                        <div className="text-[8px] text-[#5d7350] font-black text-right pt-0.5 group-hover:underline">
                                          进入讨论现场对线 →
                                        </div>
                                      </div>
                                    ))
                                  );
                                })()}
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Search and Navigation Bar Line Section */}
                          <div className="flex items-center justify-between w-full max-w-[480px] mx-auto gap-2.5 mb-5 shrink-0 select-none">
                            {/* 1. 社区首页 button (Left of search box, UI only, no text) */}
                            <button 
                              onClick={() => {
                                setActiveSidebarFilter('all');
                                setSearchQuery('');
                                setChosenPost(null);
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green text-stone-500 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 shrink-0"
                              title="回到社区初始页"
                            >
                              <Home className="w-4 h-4 text-stone-600" />
                            </button>

                            {/* Centered Search box */}
                            <div className="relative flex-1">
                              <input 
                                type="text"
                                placeholder="在社区搜索你的热爱"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (!searchQuery.trim()) {
                                      showToast('⚠️ 不能空搜索：请输入作者名字或贴子内容关键词！');
                                      return;
                                    }
                                    showToast(`🔍 已为您筛选社区内包含【${searchQuery}】相关的讨论灵感！`);
                                  }
                                }}
                                className="w-full bg-[#f6f8f5] border border-stone-200 pl-8.5 pr-4 py-2 rounded-full text-[11px] outline-none font-bold transition-all focus:bg-white focus:border-[#8ca779]"
                              />
                              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                            </div>

                            {/* 2. "换一批" button (Right of search box, UI only, no text) */}
                            <button 
                              onClick={() => {
                                setSocialPosts(prev => [...prev].sort(() => Math.random() - 0.5));
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green text-stone-500 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 active:rotate-180 duration-500 shrink-0"
                              title="换一批帖子"
                            >
                              <RotateCw className="w-4 h-4 text-stone-600" />
                            </button>
                          </div>

                          {/* Horizontal sub-tabs selector matching Request 9.1 */}
                          <div className="flex gap-4 justify-center items-center w-full mb-4 select-none">
                            <button
                              type="button"
                              onClick={() => {
                                setCommunityFeedTab('following');
                                if (followedAuthors.length === 0) {
                                  showToast('👤 提示：您尚未关注任何食友，已默认显示您自己发布的美味帖子哦！');
                                } else {
                                  showToast('✨ 已为您切换到关注食友的专属精彩动态流！');
                                }
                              }}
                              className={`px-4.5 py-1 text-[11px] font-sans font-black tracking-wide rounded-full border transition-all duration-300 relative cursor-pointer ${communityFeedTab === 'following' ? 'bg-[#8ca779] text-white border-brand-green/10 shadow-xs' : 'bg-stone-50 text-stone-500 border-stone-200/50 hover:bg-stone-100 hover:text-stone-850'}`}
                            >
                              关注
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCommunityFeedTab('discover');
                                showToast('🌍 成功切回社区发现灵感大广场！');
                              }}
                              className={`px-4.5 py-1 text-[11px] font-sans font-black tracking-wide rounded-full border transition-all duration-300 relative cursor-pointer ${communityFeedTab === 'discover' ? 'bg-[#8ca779] text-white border-brand-green/10 shadow-xs' : 'bg-stone-50 text-stone-500 border-stone-200/50 hover:bg-stone-100 hover:text-stone-850'}`}
                            >
                              发现
                            </button>
                          </div>

                          {/* Displaying listings card in Masonry Waterfall Layout - Varying custom heights instead of fixed height */}
                          {(() => {
                            const matchesForbidden = searchQuery && forbiddenFoodsSelected.some(forbidden => 
                              forbidden.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              searchQuery.toLowerCase().includes(forbidden.toLowerCase())
                            );

                            return (
                              <>
                                {matchesForbidden && (
                                  <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] p-3 rounded-2xl font-bold flex items-center gap-2 mb-4 select-none animate-fade-in text-left">
                                    <span>🚫 识食物者常识提示：您在个人中心设置了避让忌口食材 “{forbiddenFoodsSelected.find(f => f.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.toLowerCase().includes(f.toLowerCase()))}”，包含此类食材的作品动态已被系统全局智能过滤。</span>
                                  </div>
                                )}

                                {filteredSocialPosts.length === 0 ? (
                                  <div className="py-16 text-center flex flex-col items-center justify-center gap-2.5 bg-stone-50/50 border border-stone-100 rounded-3xl w-full">
                                    <span className="text-4xl text-stone-300">📝</span>
                                    <p className="text-xs text-stone-400 font-bold px-6 leading-relaxed">没有找到与之匹配的社区分享贴，快去发布第一篇相关的美味打卡吧 ✍️</p>
                                  </div>
                                ) : (
                                  <div className="columns-2 sm:columns-3 gap-4 space-y-4 pt-1 text-left">
                                    {filteredSocialPosts.map((post, postIdx) => {
                                      const isLiked = post.isLiked;
                                      // Dynamic heights for real-world staggered waterfall list
                                      const heightClass = postIdx % 3 === 0 ? 'h-44' : postIdx % 2 === 0 ? 'h-56' : 'h-48';
                                      
                                      return (
                                        <div 
                                          key={post.id} 
                                          onClick={() => setChosenPost(post)}
                                          className="break-inside-avoid bg-white border border-stone-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group shadow-sm font-sans"
                                        >
                                          {/* Staggered aspect with dynamic height casing */}
                                          <div className={`w-full ${heightClass} bg-gradient-to-br from-[#eff7e8]/30 to-[#f6f8f5]/40 group-hover:from-[#f3f9ee]/60 relative overflow-hidden flex flex-col items-center justify-center border-b transition-colors font-sans`}>
                                            {post.image ? (
                                              <img src={post.image} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="Post Cover" referrerPolicy="no-referrer" />
                                            ) : (
                                              <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm select-none">{post.emoji || post.coverEmoji || '🥘'}</span>
                                            )}
                                          </div>

                                          {/* Footer details */}
                                          <div className="p-3.5 space-y-2 text-left font-sans">
                                            <h4 className="text-[11px] font-extrabold text-stone-850 line-clamp-2 leading-snug group-hover:text-[#5d7350] transition-colors leading-relaxed">
                                              {post.title}
                                            </h4>
                                            
                                            <div className="flex items-center justify-between text-[9px] text-stone-400 border-t border-dashed border-stone-100 pt-2 shrink-0 font-sans">
                                              <span 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setViewingAuthorProfile({
                                                    name: post.author,
                                                    avatar: post.avatar,
                                                    bio: "✨ 元气美食达人 · 小红书特邀创作者 (LV4)",
                                                    followers: "12.8k",
                                                    following: "186",
                                                    likes: `${post.likes + 152} 个赞`,
                                                    posts: socialPosts.filter(p => p.author === post.author)
                                                  });
                                                }}
                                                className="flex items-center gap-1 font-bold text-stone-700 hover:text-brand-green transition-colors cursor-pointer"
                                                title="点击查看博主个人主页"
                                              >
                                                {post.avatar && typeof post.avatar === 'string' && (post.avatar.startsWith('blob:') || post.avatar.startsWith('data:') || post.avatar.startsWith('http') || post.avatar.startsWith('/')) ? (
                                                  <span className="w-5 h-5 rounded-full overflow-hidden inline-block border border-stone-200 shrink-0 bg-stone-50"><img src={post.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></span>
                                                ) : (
                                                  <span className="text-xs">{post.avatar}</span>
                                                )}
                                                <span className="truncate max-w-[65px] font-sans font-bold text-stone-700">{post.author}</span>
                                              </span>
                                              
                                              {/* Dynamic liking action with heart-pop (Goal 5) */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const updated = { ...post, isLiked: !post.isLiked };
                                                  updated.likes += updated.isLiked ? 1 : -1;
                                                  setSocialPosts(prev => prev.map(p => p.id === post.id ? updated : p));
                                                }}
                                                className={`flex items-center gap-1 font-bold transition-all font-sans ${isLiked ? 'text-red-500 scale-105 font-black animate-heart-pop' : 'hover:text-red-500 text-stone-400'}`}
                                              >
                                                <Heart className={`w-3.5 h-3.5 font-sans ${isLiked ? 'fill-current text-red-500' : 'text-stone-300'}`} />
                                                <span>{post.likes}</span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}


                {/* ======================================================= */}
                {/* ======================================================= */}
                {/* VIEW 5: PROFILE PERSONAL (个人中心) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'main' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full space-y-5 animate-fade-in">
                    
                    {/* Identity Hero Dashboard Card (Clean representation) */}
                    <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center relative select-none">
                      
                      <div className="flex flex-col items-center gap-3 w-full text-center">
                        {/* Huge round borderless avatar */}
                        <div className="w-[78px] h-[78px] rounded-full bg-brand-green/10 text-brand-green border-4 border-[#eff7e8] flex items-center justify-center shrink-0 shadow-sm overflow-hidden select-none animate-scale-up">
                          {profileAvatar && typeof profileAvatar === 'string' && (profileAvatar.startsWith('blob:') || profileAvatar.startsWith('data:') || profileAvatar.startsWith('http') || profileAvatar.startsWith('/')) ? (
                            <img src={profileAvatar} alt="My avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-4xl">{profileAvatar}</span>
                          )}
                        </div>
                        
                        <div className="space-y-1 w-full text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-base font-black text-stone-850 font-sans tracking-tight">{profileUsername}</span>
                            <span className="bg-[#8ca779]/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full inline-block">
                              LV3 掌勺学徒
                            </span>
                          </div>

                          {/* Dynamic bio and description */}
                          <p className="text-[11px] text-stone-500 leading-relaxed font-sans font-medium line-clamp-2 max-w-[480px] mx-auto text-center">
                            {profileBio}
                          </p>
                        </div>
                      </div>

                      {/* Xiaohongshu user interactions statistics */}
                      <div className="flex flex-wrap items-center justify-center gap-5 text-[10px] text-stone-500 font-sans border-t border-stone-100 pt-3.5 w-full">
                        <span><strong className="text-stone-850 text-xs font-black">512</strong> 获赞与收藏</span>
                        <span className="text-stone-200">|</span>
                        <span><strong className="text-stone-850 text-xs font-black">42</strong> 关注</span>
                        <span className="text-stone-200">|</span>
                        <span><strong className="text-stone-850 text-xs font-black">98</strong> 粉丝</span>
                        <span className="text-stone-200">|</span>
                        <span><strong className="text-[#5d7350] text-xs font-black">{cookingLogs.length}</strong> 烹饪记录菜数</span>
                      </div>

                    </div>

                    {/* Menu links - completely customized, clean and named exactly as requested */}
                    <div className="space-y-2.5 pt-1 text-left">
                      
                      {/* 1. 我的食谱 */}
                      <button 
                        onClick={() => setActiveProfileTabGroup('recipes')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group"
                      >
                        <span className="text-xs font-extrabold text-stone-750 flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-[#8ca779] group-hover:scale-110 transition-transform" />
                          <span>我的食谱</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-medium font-sans">原创 ({myOriginalRecipes.length}) · 收藏 ({starredRecipes.length}) · 草稿 ({myDraftPosts.length})</span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* 2. 偏好设置 */}
                      <button 
                        onClick={() => setActiveProfileTabGroup('preferences')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group"
                      >
                        <span className="text-xs font-extrabold text-stone-750 flex items-center gap-3">
                          <Settings className="w-4 h-4 text-[#8caf77] group-hover:scale-110 transition-transform" />
                          <span>偏好设置</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400 font-medium">厨艺 · 口味 · 忌口 · 过敏原</span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* 3. 数据统计 */}
                      <button 
                        onClick={() => setActiveProfileTabGroup('statistics')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group"
                      >
                        <span className="text-xs font-extrabold text-stone-750 flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 text-[#edd96a] group-hover:scale-110 transition-transform" />
                          <span>数据统计</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400 font-medium">今日 · 本周摄入分析</span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* 4. 烹饪记录 */}
                      <button 
                        onClick={() => setActiveProfileTabGroup('cooking_logs')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group"
                      >
                        <span className="text-xs font-extrabold text-stone-750 flex items-center gap-3">
                          <ClipboardList className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                          <span>烹饪记录</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400 font-medium">手工打卡与日历日志</span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* 5. 账号设置 */}
                      <button 
                        onClick={() => setActiveProfileTabGroup('account_settings')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group"
                      >
                        <span className="text-xs font-extrabold text-stone-750 flex items-center gap-3">
                          <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span>账号设置</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                    </div>

                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 5: PROFILE - MY RECIPES (原创食谱与草稿双槽) (Img 15) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'recipes' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full text-left">
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => {
                          setActiveProfileTabGroup('main');
                          setEditingRecipeId(null);
                        }}
                        className="p-1 px-3 text-xs bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
                      >
                        ← 返回
                      </button>
                      <span className="text-sm font-black text-stone-850">我的食谱库</span>
                      <div className="w-12"></div>
                    </div>

                    {/* Triple category switcher with counts on only starred tab conforming to request 5 */}
                    <div className="flex bg-[#a2c28f]/10 border border-brand-green/30 rounded-xl overflow-hidden max-w-[360px] w-full mx-auto mb-5 shadow-xs">
                      <button
                        onClick={() => {
                          setRecipeTabMode('original');
                          setViewingMyRecipeDetail(null);
                          setIsEditingInDetail(false);
                        }}
                        className={`flex-1 py-1.5 text-xs font-black transition-all ${recipeTabMode === 'original' ? 'bg-brand-green text-white shadow-sm' : 'text-stone-600 hover:text-stone-850'}`}
                      >
                        原创食谱
                      </button>
                      <button
                        onClick={() => {
                          setRecipeTabMode('starred');
                          setViewingMyRecipeDetail(null);
                          setIsEditingInDetail(false);
                        }}
                        className={`flex-1 py-1.5 text-xs font-black transition-all ${recipeTabMode === 'starred' ? 'bg-brand-green text-white shadow-sm' : 'text-stone-600 hover:text-stone-850'}`}
                      >
                        收藏食谱 ({starredRecipes.length})
                      </button>
                      <button
                        onClick={() => {
                          setRecipeTabMode('draft');
                          setViewingMyRecipeDetail(null);
                          setIsEditingInDetail(false);
                        }}
                        className={`flex-1 py-1.5 text-xs font-black transition-all ${recipeTabMode === 'draft' ? 'bg-brand-green text-white shadow-sm' : 'text-stone-600 hover:text-stone-850'}`}
                      >
                        草稿箱
                      </button>
                    </div>

                    {/* Waterfall layout dynamically rendering depending on state value */}
                    <div className="columns-2 sm:columns-3 gap-4 space-y-4 pt-1 text-left">
                      {(() => {
                        let listToRender: any[] = [];
                        if (recipeTabMode === 'original') {
                          listToRender = myOriginalRecipes;
                        } else if (recipeTabMode === 'starred') {
                          listToRender = RECIPES_DATABASE.filter(r => starredRecipes.includes(r.id));
                        } else {
                          listToRender = myDraftPosts;
                        }

                        if (listToRender.length === 0) {
                          return (
                            <div className="col-span-full py-12 text-center break-inside-avoid bg-white border border-dashed rounded-3xl p-6 text-stone-400 w-full">
                              <span className="block text-2xl mb-1">🥘</span>
                              <span className="text-xs font-bold font-sans">暂无相应的草稿或食谱数据</span>
                            </div>
                          );
                        }

                        return listToRender.map((card, cardIdx) => {
                          const heightClass = cardIdx % 3 === 0 ? 'h-40' : cardIdx % 2 === 0 ? 'h-48' : 'h-44';
                          const finalName = card.title || card.name || '未命名草稿食谱';
                          const finalEmoji = card.emoji || card.coverEmoji || '🥘';
                          
                          return (
                             <div 
                               key={card.id || `recipe-card-${cardIdx}`} 
                               onClick={() => {
                                 setViewingMyRecipeDetail(card);
                                 setIsEditingInDetail(false);
                               }}
                               className="break-inside-avoid bg-white border border-stone-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group shadow-sm font-sans mb-4"
                             >
                               {/* aspect with dynamic height casing matching community page waterfall */}
                               <div className={`w-full ${heightClass} bg-gradient-to-br from-[#eff7e8]/30 to-[#f6f8f5]/40 group-hover:from-[#f3f9ee]/60 relative overflow-hidden flex flex-col items-center justify-center border-b transition-colors font-sans`}>
                                 {/* Big visual Emoji */}
                                 <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm select-none">{finalEmoji}</span>
                                 
                                 <span className="absolute top-3 left-3 bg-stone-900/40 backdrop-blur-xs text-white text-[8px] font-mono font-black px-2 py-0.5 rounded-full">
                                   # {recipeTabMode === 'starred' ? '已收藏' : recipeTabMode === 'original' ? '原创' : '草稿'}
                                 </span>
                               </div>

                               {/* Footer details */}
                               <div className="p-3.5 space-y-2 text-left font-sans">
                                 <h4 className="text-[11px] font-extrabold text-[#3a4730] line-clamp-2 leading-tight group-hover:text-[#5d7350] transition-colors leading-relaxed font-sans font-bold">
                                   {finalName}
                                 </h4>
                                 
                                 <div className="flex items-center justify-between text-[9px] text-[#8ca779] border-t border-dashed border-[#eff7e8] pt-2 shrink-0 font-sans mt-2">
                                   {recipeTabMode === 'draft' ? (
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handlePublishDraftPost(card);
                                       }}
                                       className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-3.5 py-1 rounded-full text-[9.5px] transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center gap-0.5 whitespace-nowrap"
                                     >
                                       🚀 立即发布
                                     </button>
                                   ) : (
                                     <span className="text-stone-400 group-hover:text-[#8ca779] transition-colors font-semibold">
                                       📖 点击查看详情
                                     </span>
                                   )}
                                   
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if (recipeTabMode === 'starred') {
                                         setStarredRecipes(prev => prev.filter(rid => rid !== card.id));
                                       } else if (recipeTabMode === 'original') {
                                         setMyOriginalRecipes(prev => prev.filter(r => r.id !== card.id));
                                       } else {
                                         setMyDraftPosts(prev => prev.filter(r => r.id !== card.id));
                                       }
                                     }}
                                     className="text-red-400 hover:text-red-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                                   >
                                     🗑️ 删除
                                   </button>
                                 </div>
                               </div>
                             </div>
                          );
                        });
                      })()}
                    </div>

                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 5: PROFILE - PREFERENCES (忌口标签列表与厨理小白) (Img 14) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'preferences' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveProfileTabGroup('main')}
                        className="p-1 px-3 text-xs bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border cursor-pointer transition-colors"
                      >
                        ← 返回
                      </button>
                      <span className="text-sm font-black text-stone-850">偏好设置</span>
                      <div className="w-12"></div>
                    </div>

                    <div className="space-y-3 text-left">
                       
                      {/* 1. 厨艺模式 */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
                        <button 
                          onClick={() => setOpenPrefSection(openPrefSection === 'cooking' ? null : 'cooking')}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            🍳 厨艺模式
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
                            {cookingLevel === 'junior' ? '厨房小白' : '厨房大佬'}
                            <span>{openPrefSection === 'cooking' ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {openPrefSection === 'cooking' && (
                          <div className="p-4 border-t border-stone-100 bg-[#fbfcf9] space-y-3 animate-fade-in text-[11px] text-stone-600 text-left">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 w-full">
                              <div>
                                <span className="text-xs font-black text-stone-850 block">智能推荐精准度模式</span>
                                <span className="text-[10px] text-stone-400 block mt-0.5">
                                  {cookingLevel === 'junior' 
                                    ? '当前：厨房小白模式 —— 精准推荐新手友好、描述详尽的好菜' 
                                    : '当前：厨房大佬模式 —— 精准推荐高级调味、充满挑战的名菜'}
                                </span>
                              </div>
                              
                              {/* Sliding Toggle Switch Style (滑动开关样式) */}
                              <div className="flex items-center gap-2 shrink-0 select-none">
                                <span className={`text-[10.5px] font-bold ${cookingLevel === 'junior' ? 'text-[#8ca779] font-black' : 'text-stone-400'}`}>小白</span>
                                <button
                                  type="button"
                                  onClick={() => setCookingLevel(prev => prev === 'junior' ? 'senior' : 'junior')}
                                  className={`w-12 h-6.5 rounded-full relative transition-colors duration-200 outline-none cursor-pointer ${
                                    cookingLevel === 'senior' ? 'bg-[#8ca779]' : 'bg-stone-300'
                                  }`}
                                >
                                  <div 
                                    className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                                      cookingLevel === 'senior' ? 'translate-x-5.5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-[10.5px] font-bold ${cookingLevel === 'senior' ? 'text-[#8ca779] font-black' : 'text-stone-400'}`}>大佬</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. 口味偏好 */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
                        <button 
                          onClick={() => setOpenPrefSection(openPrefSection === 'taste' ? null : 'taste')}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            🌶️ 口味偏好
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
                            {tasteTendency || '请选择'}
                            <span>{openPrefSection === 'taste' ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {openPrefSection === 'taste' && (
                          <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-3.5 text-xs text-stone-600">
                            <div className="space-y-1">
                              <span className="text-[10.5px] font-black text-stone-500 block mb-1">您的口味倾向 (单选)</span>
                              <div className="flex flex-wrap gap-2">
                                {['不挑（默认）', '清淡', '重口', '偏辣', '偏甜', '偏咸'].map((opt) => (
                                  <button 
                                    key={opt}
                                    onClick={() => setTasteTendency(opt)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                      tasteTendency === opt 
                                        ? 'bg-[#8ca779] border-[#8ca779] text-white shadow-xs' 
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                              {tasteTendency !== '不挑（默认）' && (
                                <button
                                  onClick={() => {
                                    setTasteTendency('不挑（默认）');
                                    showToast('📌 已恢复默认关怀口味倾向：不挑（默认）');
                                  }}
                                  className="text-[10px] text-[#5d7350] hover:text-[#415237] underline font-extrabold flex items-center gap-1 cursor-pointer pt-1"
                                >
                                  重置回默认口味偏好
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. 忌口食材 */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
                        <button 
                          onClick={() => setOpenPrefSection(openPrefSection === 'avoid' ? null : 'avoid')}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            🚫 忌口食材
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
                            已避开 {avoidTags.length + customAvoids.length} 款
                            <span>{openPrefSection === 'avoid' ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {openPrefSection === 'avoid' && (
                          <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-4 text-xs text-stone-600 text-left">
                             
                            {/* 快捷标签 */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-stone-500 block">快捷忌口标签 (多选)</span>
                              <div className="flex flex-wrap gap-1.5">
                                {['香菜', '芹菜', '洋葱', '大蒜', '辣椒', '花椒', '生姜', '葱花'].map((tag) => {
                                  const isSelected = avoidTags.includes(tag);
                                  return (
                                    <button 
                                      key={tag}
                                      onClick={() => {
                                        if (isSelected) {
                                          setAvoidTags(prev => prev.filter(t => t !== tag));
                                        } else {
                                          setAvoidTags(prev => [...prev, tag]);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-full border text-[10.5px] font-bold transition-all cursor-pointer ${
                                        isSelected 
                                          ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                      }`}
                                    >
                                      {isSelected ? '✓ ' : ''}{tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 自定义添加 (模糊匹配) */}
                            <div className="space-y-2.5 pt-1 border-t border-dashed border-stone-200">
                              <span className="text-[10px] font-black text-stone-500 block">自定义添加食材：</span>
                               
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="输入想要避让的食材，例如：牛肉、香菇"
                                  value={avoidSearchText}
                                  onChange={(e) => setAvoidSearchText(e.target.value)}
                                  className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-green"
                                />
                                <button 
                                  onClick={() => {
                                    if (!avoidSearchText.trim()) return;
                                    if (!customAvoids.includes(avoidSearchText.trim())) {
                                      setCustomAvoids(prev => [...prev, avoidSearchText.trim()]);
                                    }
                                    setAvoidSearchText('');
                                  }}
                                  className="bg-brand-green hover:bg-brand-green-dark text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer"
                                >
                                  添加 +
                                </button>
                              </div>

                              {/* Fuzzy Suggestions match overlay */}
                              {avoidSearchText.trim().length > 0 && (
                                <div className="bg-white border rounded-xl p-2 w-full max-h-[140px] overflow-y-auto space-y-1 shadow-xs font-mono">
                                  <span className="text-[8px] text-stone-400 block px-1">↓ 模糊搜索库匹配推荐:</span>
                                  {['牛肉', '猪肉', '羊肉', '西红柿', '黄瓜', '菠菜', '香菇', '金针菇', '胡椒', '韭菜', '芝麻']
                                    .filter(item => item.includes(avoidSearchText.trim()))
                                    .map(item => (
                                      <button 
                                        key={item}
                                        onClick={() => {
                                          if (!customAvoids.includes(item)) {
                                            setCustomAvoids(prev => [...prev, item]);
                                          }
                                          setAvoidSearchText('');
                                        }}
                                        className="w-full text-left p-1.5 text-[10.5px] text-stone-700 hover:bg-[#8ca779]/10 rounded-md font-bold transition-colors"
                                      >
                                        🔍 添加 "{item}"
                                      </button>
                                    ))
                                  }
                                </div>
                              )}

                              {/* Displays added customs */}
                              {customAvoids.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[8.5px] font-bold text-stone-400">已避开的自定义食材 (点击可删除):</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {customAvoids.map(custom => (
                                      <button 
                                        key={custom}
                                        onClick={() => setCustomAvoids(prev => prev.filter(c => c !== custom))}
                                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-2 py-1 text-[10px] rounded-md font-bold flex items-center gap-1 transition-colors"
                                      >
                                        <span>{custom}</span>
                                        <span className="text-[8px] text-stone-400">×</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>

                      {/* 4. 过敏原设置 */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
                        <button 
                          onClick={() => setOpenPrefSection(openPrefSection === 'allergens' ? null : 'allergens')}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            🥜 过敏原设置
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
                            已选 {allergens.length} 种过敏类别
                            <span>{openPrefSection === 'allergens' ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {openPrefSection === 'allergens' && (
                          <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-4 text-xs text-stone-600 text-left animate-fade-in">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-stone-500 block mb-1">请勾选您的过敏原 (多选)</span>
                              <div className="flex flex-wrap gap-1.5">
                                {['花生', '坚果', '海鲜', '牛奶', '鸡蛋', '麸质', '大豆'].map((alg) => {
                                  const isSelected = allergens.includes(alg);
                                  return (
                                    <button 
                                      key={alg}
                                      onClick={() => {
                                        if (isSelected) {
                                          setAllergens(prev => prev.filter(a => a !== alg));
                                        } else {
                                          setAllergens(prev => [...prev, alg]);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                        isSelected 
                                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
                                          : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                                      }`}
                                    >
                                      {isSelected ? '✓ ' : ''}{alg}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 自定义过敏原输入 conforming to request 8 */}
                            <div className="space-y-2 pt-3 border-t border-dashed border-stone-200">
                              <span className="text-[10px] font-black text-stone-500 block">添加自定义过敏原：</span>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="输入您的其他过敏食物，例：芒果、荞麦、坚果"
                                  value={allergenSearchText}
                                  onChange={(e) => setAllergenSearchText(e.target.value)}
                                  className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-green font-medium"
                                />
                                <button 
                                  onClick={() => {
                                    if (!allergenSearchText.trim()) return;
                                    const normalized = allergenSearchText.trim();
                                    if (!customAllergens.includes(normalized)) {
                                      setCustomAllergens(prev => [...prev, normalized]);
                                    }
                                    if (!allergens.includes(normalized)) {
                                      setAllergens(prev => [...prev, normalized]);
                                    }
                                    setAllergenSearchText('');
                                  }}
                                  className="bg-[#8ca779] hover:bg-[#728f60] text-white px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all active:scale-95"
                                >
                                  添加 +
                                </button>
                              </div>

                              {customAllergens.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                  {customAllergens.map((alg) => (
                                    <span 
                                      key={alg}
                                      className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-[10.5px] font-bold shadow-xs animate-scale-up"
                                    >
                                      <span>{alg}</span>
                                      <button 
                                        onClick={() => {
                                          setCustomAllergens(prev => prev.filter(a => a !== alg));
                                          setAllergens(prev => prev.filter(a => a !== alg));
                                        }}
                                        className="text-red-500 hover:text-red-700 font-black ml-0.5 cursor-pointer text-xs"
                                        title="删除"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 5. 通知设置 */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
                        <button 
                          onClick={() => setOpenPrefSection(openPrefSection === 'notification' ? null : 'notification')}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            🔔 通知设置
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1.5">
                            {mealReminder ? '已开启用餐提醒' : '已关闭用餐提醒'}
                            <span>{openPrefSection === 'notification' ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {openPrefSection === 'notification' && (
                          <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] text-xs text-stone-600 space-y-3 text-left animate-fade-in">
                            <div className="flex items-center justify-between">
                              <div>
                                <strong className="text-stone-850 block mb-0.5">🍚 就餐提醒提醒服务</strong>
                                <p className="text-[10px] text-stone-400 block font-normal">开启后系统会在到达指定时间在界面或通过通知栏同步提醒好好吃饭</p>
                              </div>
                              <button 
                                onClick={() => setMealReminder(!mealReminder)}
                                className={`w-12 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${mealReminder ? 'bg-brand-green' : 'bg-stone-300'}`}
                              >
                                <span className={`w-5 h-5 rounded-full bg-white block shadow transition-transform ${mealReminder ? 'translate-x-[24px]' : 'translate-x-0'}`}></span>
                              </button>
                            </div>

                            {/* 自定义提醒时间设定 conforming to request 9 */}
                            {mealReminder && (
                              <div className="bg-stone-50 border border-stone-200/50 p-3 rounded-2xl space-y-2 animate-fade-in mt-2 select-none">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black text-stone-500">⏰ 自定义每日提醒时间:</span>
                                  <input 
                                    type="time" 
                                    value={reminderTime}
                                    onChange={(e) => {
                                      setReminderTime(e.target.value);
                                      // 后端接口预留: 当提醒时间更新时，可在此向后端推送接口
                                      // fetch('/api/user/update-reminder-time', { method: 'POST', body: JSON.stringify({ time: e.target.value }) })
                                      console.log("预留给后端的提醒时间接口触发:", e.target.value);
                                    }}
                                    className="bg-white border rounded-lg px-2 py-0.5 text-xs text-stone-700 outline-none focus:border-[#8ca779] font-mono font-bold"
                                  />
                                </div>
                                <div className="text-[9.5px] text-[#8ca779] leading-relaxed">
                                  💡 <strong>后端开发提示</strong>: 设定时间将同步至后端，系统到达 <strong>{reminderTime}</strong> 时即可自动触发提醒及通知。
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 5: PROFILE - STATISTICS (数据统计) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'statistics' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveProfileTabGroup('main')}
                        className="p-1 px-3 text-xs bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
                      >
                        ← 返回
                      </button>
                      <span className="text-sm font-black text-stone-850">膳食碳卡摄量分析周报</span>
                      <div className="w-12"></div>
                    </div>

                    {/* Calorie Stats Card Summary */}
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xs text-left grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">周均摄入热卡</span>
                        <span className="text-sm font-mono font-black text-stone-850 mt-1 block">1,820 kcal</span>
                        <span className="text-[8px] text-[#8ca779] font-black font-semibold">低于每日建议 10% 💚</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">每日卡路里赤字</span>
                        <span className="text-sm font-mono font-black text-stone-850 mt-1 block">-240 kcal</span>
                        <span className="text-[8px] text-rose-500 font-black font-semibold">持续减脂中 🔥</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">蛋白质达标率</span>
                        <span className="text-sm font-mono font-black text-stone-850 mt-1 block">94.2 %</span>
                        <span className="text-[8px] text-brand-green font-semibold">优质高蛋白补充 ⭐</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">综合膳食评级</span>
                        <span className="text-sm font-mono font-black text-brand-green-dark mt-1 block">GL 4.8 (极佳)</span>
                        <span className="text-[8px] text-stone-400 font-semibold">今日状态：平衡健康</span>
                      </div>
                    </div>

                    {/* Beautiful SVG Weekly Intake Graph (Pure reactive Custom SVG) */}
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xs text-left space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-850">📅 每周摄入卡路里趋势 (对比每日基准目标能量值)</span>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-stone-400">
                          <span className="w-2.5 h-2.5 rounded bg-[#8ca779]"></span> <span>已摄入</span>
                          <span className="w-3 h-0.5 border-t border-dashed border-red-500"></span> <span>基准热卡 (2100)</span>
                        </div>
                      </div>

                      {/* SVG bar chart */}
                      <div className="w-full relative h-[180px] bg-stone-50/50 rounded-2xl p-4 overflow-hidden border border-stone-100/50">
                        <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                          <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f3f0" strokeDasharray="3,3" />
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f3f0" strokeDasharray="3,3" />
                          <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f3f0" strokeDasharray="3,3" />
                          
                          <line x1="0" y1="45" x2="500" y2="45" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,4" />
                          
                          <rect x="35" y="52" width="22" height="68" rx="3" fill="#8ca779" />
                          <rect x="100" y="49" width="22" height="71" rx="3" fill="#8ca779" />
                          <rect x="165" y="56" width="22" height="64" rx="3" fill="#8ca779" />
                          <rect x="230" y="42" width="22" height="78" rx="3" fill="#cbd8c5" />
                          <rect x="295" y="60" width="22" height="60" rx="3" fill="#8ca779" />
                          <rect x="360" y="53" width="22" height="67" rx="3" fill="#8ca779" />
                          <rect x="425" y="43" width="22" height="77" rx="3" fill="#ffb703" />
                        </svg>

                        <div className="absolute top-[32px] left-[235px] bg-amber-500 text-white font-mono font-black text-[7px] py-[1px] px-1 rounded shadow-sm opacity-90">
                          2200!
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-black text-stone-400 font-mono px-3.5 mt-2.5">
                          <span>周一</span>
                          <span>周二</span>
                          <span>周三</span>
                          <span>周四</span>
                          <span>周五</span>
                          <span>周六</span>
                          <span>周日</span>
                        </div>
                      </div>
                    </div>

                    {/* Nutrient breakdown bars */}
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xs text-left space-y-3.5">
                      <span className="text-xs font-black text-stone-850 block">🍕 三大膳食大卡摄入占比比例分析</span>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-stone-700">
                            <span>🌾 优质碳水复合物 (全谷物、藜麦、糙米饭)</span>
                            <span className="font-mono text-stone-500">占 50% (达标健康)</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-stone-700">
                            <span>🥩 职业健身高蛋白 (深海鱼、低脂鸡肉、豆制品)</span>
                            <span className="font-mono text-[#8ca779]">占 25% (达标优)</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#8ca779] h-full rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-stone-700">
                            <span>🥑 生态有机不饱和油脂 (坚果、牛油果、初榨油脂)</span>
                            <span className="font-mono text-stone-500">占 25% (均衡)</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-400 h-full rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 5: PROFILE - COOKING LOGS (烹饪记录) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'cooking_logs' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveProfileTabGroup('main')}
                        className="p-1 px-3 text-xs bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
                      >
                        ← 返回
                      </button>
                      <span className="text-sm font-black text-stone-850">个人美味烹调历史日志</span>
                      <div className="w-12"></div>
                    </div>

                    {/* 厨艺等级栏 (Culinary Skill Level Progress Bar Overlay) */}
                    {(() => {
                      const totalCooked = cookingLogs.length;
                      let currentLevelName = '厨房萌新 🥑';
                      let nextLevelName = '烹饪能手 🍳';
                      let baseRequired = 0;
                      let nextRequired = 3;

                      if (totalCooked >= 15) {
                        currentLevelName = '食神宗师 👑';
                        nextLevelName = '已登峰造极';
                        baseRequired = 15;
                        nextRequired = 999;
                      } else if (totalCooked >= 10) {
                        currentLevelName = '珍馐大厨 👨‍🍳';
                        nextLevelName = '食神宗师 👑';
                        baseRequired = 10;
                        nextRequired = 15;
                      } else if (totalCooked >= 6) {
                        currentLevelName = '美食达人 🥗';
                        nextLevelName = '珍馐大厨 👨‍🍳';
                        baseRequired = 6;
                        nextRequired = 10;
                      } else if (totalCooked >= 3) {
                        currentLevelName = '烹饪能手 🍳';
                        nextLevelName = '美食达人 🥗';
                        baseRequired = 3;
                        nextRequired = 6;
                      } else {
                        currentLevelName = '厨房萌新 🥑';
                        nextLevelName = '烹饪能手 🍳';
                        baseRequired = 0;
                        nextRequired = 3;
                      }

                      const dishesToNext = nextRequired - totalCooked;
                      const percent = nextRequired === 999 ? 100 : Math.min(100, Math.max(0, ((totalCooked - baseRequired) / (nextRequired - baseRequired)) * 100));

                      return (
                        <div className="bg-white border border-[#a2c28f]/20 rounded-3xl p-4.5 shadow-xs flex flex-col gap-3 select-none">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] text-stone-400 font-sans tracking-wide">您的厨艺段位</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-[#5d7350]">{currentLevelName}</span>
                                <span className="bg-[#eff7e8] text-brand-green-dark font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded-full border border-[#a2c28f]/20">
                                  累计烹饪做过 {totalCooked} 道菜
                                </span>
                              </div>
                            </div>
                            {nextRequired !== 999 && (
                              <div className="text-right">
                                <span className="block text-[10px] text-stone-400 font-sans">距离下一等级还差</span>
                                <span className="text-xs font-serif font-black text-rose-500">{dishesToNext} 道菜</span>
                              </div>
                            )}
                          </div>

                          {/* Progress slider bar layout */}
                          <div className="space-y-1">
                            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                              <div 
                                style={{ width: `${percent}%` }}
                                className="h-full bg-gradient-to-r from-[#a2c28f] to-[#8ca779] rounded-full transition-all duration-500"
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-stone-400 font-sans">
                              <span>{currentLevelName} ({baseRequired}道)</span>
                              <span>{nextLevelName} {nextRequired !== 999 ? `(${nextRequired}道)` : ''}</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-stone-500 font-sans leading-relaxed pt-1.5 border-t border-stone-100/80 mt-0.5">
                            💡 高手指南：每完成一次烹饪打卡或增加美味编日志，烹调等级积分都会持续成长，向最高殿堂迈进！
                          </p>
                        </div>
                      );
                    })()}

                    {/* Replaced with direct router to central custom publish full page - Requirement 8 */}
                    <div 
                      onClick={() => {
                        setCustomPublishSource('cooking_logs');
                        setCustomPublishTitle('');
                        setCustomPublishBody('');
                        setCustomPublishStars(5);
                        setCustomPublishEmoji('🥘');
                        setCustomPublishImage(null);
                        setPublishToCommunity(false);
                        setPublishToLogs(true);
                        setIsCustomPublishPage(true);
                      }}
                      className="bg-stone-50 border border-dashed border-stone-300 rounded-3xl p-6 text-center hover:bg-[#f3f7f0] hover:border-[#8ca779] transition-all duration-350 cursor-pointer select-none group space-y-2.5"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform text-lg border border-stone-200">
                        📝
                      </div>
                      <div className="space-y-1">
                        <span className="block text-xs font-black text-stone-700">打卡新烹饪历史 / 追加手编美馔记录 (独立打卡页)</span>
                        <span className="block text-[10px] text-stone-400 font-sans">点击进入独立烹饪记录录入与分享工坊，支持一键配图、设定星级并一键录入</span>
                      </div>
                    </div>

                    {/* Timeline logs list - scrollable, limited height so it does not increase page scale! */}
                    <div className="space-y-3 pt-1 max-h-[380px] overflow-y-auto custom-scroll pr-1">
                      {cookingLogs.map((log) => {
                        const isRecipe = RECIPES_DATABASE.some(r => r.name === log.name);
                        return (
                          <div 
                            key={log.id} 
                            onClick={() => {
                              if (isRecipe) {
                                const foundRecipe = RECIPES_DATABASE.find(r => r.name === log.name);
                                if (foundRecipe) {
                                  setActiveRecipe(foundRecipe);
                                  setRecipeDetailSource('profile_starred');
                                  setSubStep(6);
                                  setActiveCookingStepIndex(foundRecipe.steps.length - 1);
                                  setActiveTab('eatwell');
                                  showToast(`🍳 已为您打开历史菜谱详情【${log.name}】`);
                                }
                              } else {
                                setSelectedLogDetail(log);
                                setTempLogName(log.name);
                                setTempLogStars(log.stars);
                                setTempLogNote(log.note);
                                setIsEditingLogDetail(true);
                              }
                            }}
                            className="bg-white border border-stone-150 rounded-2xl p-4.5 flex gap-4 text-left shadow-xs hover:border-[#8ca779]/30 hover:bg-[#eff7e8]/5 transition-all cursor-pointer group active:scale-[0.99]"
                          >
                            <div className="w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center text-2xl border shadow-xs shrink-0 self-start font-sans">
                              {log.emoji || '🥘'}
                            </div>

                            <div className="flex-1 space-y-1.5 min-w-0">
                              <div className="flex items-center justify-between gap-2.5">
                                <h5 className="text-xs font-black text-stone-850 truncate flex items-center gap-1">
                                  <span>{log.name}</span>
                                  {isRecipe && <span className="bg-[#eff7e8] text-brand-green text-[8px] px-1 py-0.5 rounded font-black">菜谱</span>}
                                </h5>
                                <span className="text-[10px] font-mono text-stone-400 block shrink-0">{log.date}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold shrink-0">
                                <span>{'⭐'.repeat(log.stars)}</span>
                              </div>

                              <p className="text-[11px] text-stone-500 leading-relaxed font-sans font-medium bg-stone-50/50 p-2.5 rounded-xl border border-stone-100/40">
                                {log.note}
                              </p>
                              <div className="text-right">
                                <span className="text-[9px] text-[#8ca779] font-black underline opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isRecipe ? '查看原菜谱详情 🔬' : '查看/编辑此打卡 ✍️'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* ======================================================= */}
                {/* VIEW 5: PROFILE - ACCOUNT SETTINGS (账号设置) */}
                {/* ======================================================= */}
                {activeTab === 'profile' && activeProfileTabGroup === 'account_settings' && (
                  <div className="flex flex-col flex-1 max-w-[800px] mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveProfileTabGroup('main')}
                        className="p-1 px-3 text-xs bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
                      >
                        ← 返回
                      </button>
                      <span className="text-sm font-black text-stone-850">资料设置</span>
                      <div className="w-12"></div>
                    </div>

                    <div className="space-y-4">
                      
                      {/* CARD 1: Avatar Settings */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-3.5">
                        <label className="text-xs font-black text-stone-700 block text-stone-500">🎨 选择您喜欢的头像标识 或 上传自定义头像</label>
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          
                          {/* Built-in avatar emojis */}
                          <div className="flex items-center gap-2 animate-scale-up">
                            {['🎒', '👩‍🍳', '👨‍🍳', '🥗', '🍩', '🥑', '🥣'].map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setProfileAvatar(emoji);
                                  showToast('🎉 头像标识已成功更新，稍后点击保存！');
                                }}
                                className={`w-11 h-11 rounded-full border-2 text-xl flex items-center justify-center transition-all cursor-pointer ${profileAvatar === emoji ? 'border-brand-green bg-[#eff7e8] scale-105 shadow-xs' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className="h-6 w-[1px] bg-stone-200"></div>

                          {/* Custom file upload conforming to request 10 */}
                          <div className="flex items-center gap-2.5">
                            <label className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[10.5px] font-black text-stone-600 px-3 py-2 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1">
                              📤 自定义头像上传
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const url = URL.createObjectURL(file);
                                    setProfileAvatar(url);
                                    alert('🎉 头像自定义上传成功！已更新到您的个人中心和主页标识。');
                                  }
                                }}
                              />
                            </label>

                            {profileAvatar && typeof profileAvatar === 'string' && (profileAvatar.startsWith('blob:') || profileAvatar.startsWith('data:') || profileAvatar.startsWith('http')) && (
                              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-brand-green shadow-xs shrink-0 bg-stone-50">
                                <img src={profileAvatar} alt="Custom upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* CARD 2: Nickname Settings */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-2">
                        <label className="text-xs font-black text-stone-700 block">✍️ 博主基本账号昵称</label>
                        <input 
                          type="text"
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          placeholder="如：Vante"
                          className="bg-stone-50/50 border rounded-xl p-2.5 text-xs w-full text-stone-750 outline-none focus:bg-white focus:border-brand-green font-bold transition-all"
                        />
                      </div>

                      {/* CARD 3: Signature Settings */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-2">
                        <label className="text-xs font-black text-stone-700 block">💬 博主个性签语 (Signature)</label>
                        <textarea 
                          rows={2}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="编写一句话，向社区展示您的烹饪美学与态度吧..."
                          className="bg-stone-50/50 border rounded-2xl p-3 text-xs w-full text-stone-750 outline-none focus:bg-white focus:border-brand-green font-semibold transition-all resize-none"
                        />
                      </div>

                      {/* CARD 4: Social Accounts Bindings Widget (Requirement 13) */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-3">
                        <label className="text-xs font-black text-stone-705 block text-stone-500">🔗 第三方账号集成绑定服务 (可滑动查看)</label>
                        
                        <div className="max-h-[190px] overflow-y-auto custom-scroll pr-1.5 space-y-2.5">
                          {/* 1. Mobile */}
                          <div className="bg-stone-50/50 border rounded-2xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl bg-white p-1.5 rounded-xl border flex items-center justify-center shrink-0">📱</span>
                              <div>
                                <span className="text-xs font-black text-stone-800 block">绑定安全手机 (Mobile)</span>
                                <span className="text-[9px] text-stone-400 font-sans font-semibold mt-0.5 block">用于接收短信通知与验证码找回</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-black text-[#5d7350] bg-[#eff7e8] border border-[#a2c28f]/30 px-3 py-1.5 rounded-full shrink-0">
                              138****8513
                            </span>
                          </div>

                          {/* 2. WeChat */}
                          <div className="bg-stone-50/50 border rounded-2xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl bg-white p-1.5 rounded-xl border flex items-center justify-center shrink-0">💬</span>
                              <div>
                                <span className="text-xs font-black text-stone-800 block">绑定微信登录 (WeChat)</span>
                                <span className="text-[9px] text-stone-400 font-sans font-semibold mt-0.5 block">支持微信小程序及设备打卡同步</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                showToast('🎉 正在启动微信开放平台安全授权接口...');
                              }}
                              className="text-[10px] font-mono font-black text-[#5d7350] bg-[#eff7e8] border border-[#a2c28f]/30 px-3 py-1.5 rounded-full shrink-0 hover:bg-[#86a173]/10 transition-colors cursor-pointer"
                            >
                              we_vante8513
                            </button>
                          </div>

                          {/* 3. Bilibili (B站) */}
                          <div className="bg-stone-50/50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl bg-blue-50/50 p-1.5 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">📺</span>
                              <div>
                                <span className="text-xs font-black text-blue-950 block flex items-center gap-1">
                                  <span>绑定哔哩哔哩 (B站)</span>
                                  <span className="text-[8px] bg-pink-100 text-pink-500 font-sans px-1 rounded">HOT</span>
                                </span>
                                <span className="text-[9px] text-stone-400 font-sans font-semibold mt-0.5 block">同步烹饪日志与精彩食谱视频到B站空间</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Backend integration routing endpoint callback integration:
                                // fetch('/api/bind/bilibili', { method: 'POST', body: JSON.stringify({ action: 'link' }) });
                                showToast('📺 正在请求B站安全授权验证接口...');
                                setTimeout(() => {
                                  showToast('🎉 Bilibili(B站) 成功绑定！接口已就绪。');
                                }, 1500);
                              }}
                              className="text-[10px] font-mono font-black text-white bg-[#00a1d6] hover:bg-[#0089b6] border border-[#00a1d6]/30 px-3.5 py-1.5 rounded-full shadow-xs shrink-0 cursor-pointer transition-colors"
                            >
                              立即进行绑定
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => showToast('🎉 保存资料成功！您的基础属性已经更新到了个人中心。✨')}
                          className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-xs py-3 px-8 rounded-full cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1"
                        >
                          💾 保存资料修改
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: '确定要退出登录吗？',
                              message: '确定要退出登录，并以游客身份返回首页吗？',
                              onConfirm: () => {
                                setProfileUsername('游客账户');
                                setProfileAvatar('🥑');
                                setProfileBio('探寻美味灵感的普通吃货 🥗');
                                setActiveProfileTabGroup('main');
                                setActiveTab('eatwell');
                                setSubStep(1);
                                showToast('🔓 已成功退出登录，切换为游客模式');
                              }
                            });
                          }}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs py-3 px-8 rounded-full cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          🚪 退出登录
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                  </>
                )}
              </div>

              {/* BOTTOM FOOTER NAVIGATION TAB BAR (Img 1) - With scanning tag */}
              <nav className="bg-white border-t border-stone-200 h-20 flex items-center justify-around shadow-lg px-2 text-center select-none shrink-0">
                
                <button 
                  onClick={() => {
                    setActiveTab('eatwell');
                    setSubStep(0);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all ${activeTab === 'eatwell' ? 'text-brand-green-dark scale-108 font-bold' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  <Soup className="w-6.5 h-6.5" />
                  <span className="text-xs md:text-[13px] font-sans font-black">好好吃饭</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('inspiration');
                    setInspirationCount(3);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all ${activeTab === 'inspiration' ? 'text-brand-green-dark scale-108 font-bold' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  <Lightbulb className="w-6.5 h-6.5" />
                  <span className="text-xs md:text-[13px] font-sans font-black">随机灵感</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('community');
                    setActiveSidebarFilter('all');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all ${activeTab === 'community' ? 'text-brand-green-dark scale-108 font-bold' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  <Globe className="w-6.5 h-6.5" />
                  <span className="text-xs md:text-[13px] font-sans font-black">交流社区</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setActiveProfileTabGroup('main');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all ${activeTab === 'profile' ? 'text-brand-green-dark scale-108 font-bold' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  <User className="w-6.5 h-6.5" />
                  <span className="text-xs md:text-[13px] font-sans font-black">个人中心</span>
                </button>

              </nav>

              {/* ======================================================= */}
              {/* SUB OVERLAY: MY RECIPE/POST DETAILS & LOCAL EDITOR (Goal 4 & 5) */}
              {/* ======================================================= */}
              {viewingMyRecipeDetail && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in select-none">
                  <div className="bg-white rounded-[2.5rem] w-full max-w-[460px] p-6 text-center shadow-2xl relative overflow-hidden border border-stone-200 text-left animate-scale-up">
                    
                    {/* Close button */}
                    <button 
                      onClick={() => {
                        setViewingMyRecipeDetail(null);
                        setIsEditingInDetail(false);
                      }}
                      className="absolute top-5 right-5 z-20 bg-stone-100 hover:bg-stone-200 p-2 border rounded-full cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4 text-stone-700" />
                    </button>

                    {/* Header Banner */}
                    <div className="text-center pb-3 border-b border-stone-100 mb-4 select-none">
                      <span className="text-xs font-black text-stone-400 font-sans tracking-wide">📖 食谱详情</span>
                    </div>

                    {!isEditingInDetail ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl bg-amber-50 p-3 rounded-2xl border shadow-inner shrink-0 select-none">
                            {viewingMyRecipeDetail.coverEmoji || viewingMyRecipeDetail.emoji || '🥘'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-[#3a4730] text-base leading-snug truncate">
                              {viewingMyRecipeDetail.name || viewingMyRecipeDetail.title || '自定义美味食谱'}
                            </h4>
                            <p className="text-[10px] text-[#8ca779] font-black mt-1">
                              难度: <strong className="text-stone-700 font-extrabold">{viewingMyRecipeDetail.difficulty || '普通'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Cooking info */}
                        <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-3.5 text-xs text-stone-600 font-sans space-y-1.5 shadow-inner select-none">
                          <p>⏰ 预计用时: <strong className="text-stone-850 font-black">{viewingMyRecipeDetail.time || 15} 分钟</strong></p>
                          <p>🔥 能量消耗: <strong className="text-stone-850 font-black">{viewingMyRecipeDetail.calories || 300} kcal</strong></p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-black text-stone-500 block">🍳 烹饪步骤:</span>
                          <div className="max-h-[140px] overflow-y-auto custom-scroll pr-1">
                            <ul className="text-[11.5px] text-stone-600 leading-relaxed font-sans space-y-1 pr-1">
                              {viewingMyRecipeDetail.steps && viewingMyRecipeDetail.steps.length > 0 ? (
                                viewingMyRecipeDetail.steps.map((st: string, idx: number) => (
                                  <li key={idx} className="flex gap-2">
                                    <span className="text-[#8ca779] font-mono font-black select-none">{idx + 1}.</span>
                                    <span>{st}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-stone-400 italic">暂无步骤说明</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Footer Edit button trigger */}
                        <div className="flex gap-2 pt-2 border-t border-stone-100">
                          {viewingMyRecipeDetail.id && (viewingMyRecipeDetail.id.startsWith('or-') || viewingMyRecipeDetail.id.startsWith('df-')) && (
                            <button
                              onClick={() => {
                                setIsEditingInDetail(true);
                                setEditingDetailName(viewingMyRecipeDetail.name || viewingMyRecipeDetail.title || '自定义美味食谱');
                                setEditingDetailEmoji(viewingMyRecipeDetail.coverEmoji || viewingMyRecipeDetail.emoji || '🥘');
                              }}
                              className="bg-brand-yellow hover:bg-[#edd96a] text-stone-850 font-black text-xs py-3 rounded-full flex-1 text-center shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                            >
                              ✏️ 编辑食谱
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // If they want to cook it:
                              setActiveRecipe(viewingMyRecipeDetail);
                              setRecipeDetailSource('profile_starred');
                              setSubStep(6);
                              setActiveCookingStepIndex(0);
                              setActiveTab('eatwell');
                              setViewingMyRecipeDetail(null);
                            }}
                            className="bg-[#8ca779] hover:bg-[#728f60] text-white font-black text-xs py-3 rounded-full flex-1 text-center shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                          >
                            🍳 立即烹饪
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Edit Inputs Casing
                      <div className="space-y-4">
                        <span className="block text-xs font-black text-amber-800">✏️ 正在编辑食谱名称与标志</span>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_3.5fr] gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-stone-500 block">标志 (Emoji)</label>
                            <input 
                              type="text" 
                              value={editingDetailEmoji}
                              onChange={(e) => setEditingDetailEmoji(e.target.value)}
                              className="bg-white border rounded-xl p-2 text-xs w-full text-center outline-none focus:border-brand-green font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-stone-500 block">食谱名称</label>
                            <input 
                              type="text" 
                              value={editingDetailName}
                              onChange={(e) => setEditingDetailName(e.target.value)}
                              className="bg-white border rounded-xl p-2 text-xs w-full outline-none focus:border-brand-green font-bold text-stone-850"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
                          <button 
                            onClick={() => setIsEditingInDetail(false)}
                            className="text-[11px] text-stone-500 px-4 py-2 rounded-xl border hover:bg-stone-100 font-bold cursor-pointer"
                          >
                            取消
                          </button>
                          <button 
                            onClick={() => {
                              if (!editingDetailName.trim()) return;
                              const updated = { ...viewingMyRecipeDetail, name: editingDetailName, coverEmoji: editingDetailEmoji };
                              if (viewingMyRecipeDetail.id.startsWith('or-')) {
                                setMyOriginalRecipes(prev => prev.map(r => r.id === viewingMyRecipeDetail.id ? updated : r));
                              } else if (viewingMyRecipeDetail.id.startsWith('df-')) {
                                setMyDraftRecipes(prev => prev.map(r => r.id === viewingMyRecipeDetail.id ? updated : r));
                              }
                              setViewingMyRecipeDetail(updated);
                              setIsEditingInDetail(false);
                            }}
                            className="bg-brand-green text-white text-[11px] font-extrabold px-5 py-2 rounded-xl hover:bg-brand-green-dark cursor-pointer shadow-sm animate-scale-up"
                          >
                            保存修改
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB OVERLAY: COMMENTS DETAIL CARD MODAL (Img 11) */}
              {/* ======================================================= */}
              {chosenPost && activeTab === 'community' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[850px] h-[590px] overflow-hidden grid grid-cols-1 md:grid-cols-[3fr_2fr] relative shadow-2xl animate-scale-up text-left border border-stone-100">
                    
                    {/* Circle top close */}
                    <button 
                      onClick={() => setChosenPost(null)}
                      className="absolute top-4 left-4 z-20 bg-white hover:bg-stone-50 border border-stone-200 p-2 rounded-full shadow-sm cursor-pointer transition-colors"
                    >
                      <X className="w-5 h-5 text-stone-700" />
                    </button>

                    {/* Left details pane - purely aesthetic food representation with real-time floating heart popups */}
                    <div className="bg-[#eff7e8] flex flex-col justify-between p-7 pt-16 relative overflow-hidden select-none">
                      {/* Heart Pops Overlay */}
                      {floatingHearts.map(heart => (
                        <span 
                          key={heart.id} 
                          style={{ left: `${heart.left}%` }}
                          className="absolute bottom-16 text-3xl pointer-events-none animate-float-heart z-20"
                        >
                          ❤️
                        </span>
                      ))}

                      <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        {chosenPost.image ? (
                          <img src={chosenPost.image} className="w-56 h-56 rounded-3xl object-cover shadow-md select-none animate-bounce-subtle" alt="Post Cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-8xl select-none animate-bounce-subtle drop-shadow-md">{chosenPost.emoji || chosenPost.coverEmoji || '🥘'}</span>
                        )}
                        <div className="text-center space-y-1">
                          <span className="bg-[#8ca779] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            精品美食图卡
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side multi comment streams & ALL actions (Likes, Saves, Comments) concentrated on the right bottom! */}
                    <div className="p-5 flex flex-col justify-between border-l border-stone-100 bg-[#fbfcfb]/40">
                      
                      {/* Content column */}
                      <div className="space-y-4 overflow-y-auto custom-scroll pr-1 flex-1">
                        
                        {/* Upper User Meta Area with FOLLOW button (Clickable to display homepage profile modal) */}
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div 
                            onClick={() => {
                              setViewingAuthorProfile({
                                name: chosenPost.author,
                                avatar: chosenPost.avatar,
                                bio: "✨ 元气美食达人 · 小红书特邀创作者 (LV4)",
                                followers: "12.8k",
                                following: "186",
                                likes: `${chosenPost.likes + 245} 个赞`,
                                posts: socialPosts.filter(p => p.author === chosenPost.author)
                              });
                            }}
                            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
                            title="点击查看博主个人主页"
                          >
                            {chosenPost.avatar && typeof chosenPost.avatar === 'string' && (chosenPost.avatar.startsWith('blob:') || chosenPost.avatar.startsWith('data:') || chosenPost.avatar.startsWith('http') || chosenPost.avatar.startsWith('/')) ? (
                              <span className="w-10 h-10 rounded-full overflow-hidden inline-block border bg-white p-0.5 shadow-xs group-hover:border-brand-green/30 transition-colors shrink-0"><img src={chosenPost.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" /></span>
                            ) : (
                              <span className="text-2xl bg-white p-1 rounded-full shadow-xs border group-hover:border-brand-green/30 transition-colors">{chosenPost.avatar}</span>
                            )}
                            <div>
                              <span className="block font-black text-xs text-stone-850 tracking-tight group-hover:text-brand-green-dark transition-colors">{chosenPost.author}</span>
                              <span className="text-[9px] text-stone-400 block font-semibold font-sans">Gourmet 指导大师 · LV3</span>
                            </div>
                          </div>

                          {/* Interactive User Follow button */}
                          <button
                            onClick={() => {
                              setFollowedAuthors(prev => 
                                prev.includes(chosenPost.author) 
                                  ? prev.filter(a => a !== chosenPost.author) 
                                  : [...prev, chosenPost.author]
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                              followedAuthors.includes(chosenPost.author)
                                ? 'bg-stone-100 text-stone-400 border border-stone-200'
                                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                            }`}
                          >
                            {followedAuthors.includes(chosenPost.author) ? '✓ 已关注' : '+ 关注'}
                          </button>
                        </div>

                        {/* Title Caption Details */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-[13px] text-stone-850 leading-snug">
                            {chosenPost.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                            今天趁着厨房里食材丰富，用我的大炖煮锅一连烹调做出香气腾腾满满好几大碗！低卡均衡少油脂且味道纯粹，全家老小赞不绝口，快来抄作业！
                          </p>
                        </div>

                        {/* Comments Thread with Nested Replies */}
                        <div className="border-t border-stone-100 pt-3">
                          <span className="text-[10px] font-mono text-stone-400 block mb-2.5 font-bold uppercase tracking-wider">
                            💬 社区精彩热评 ({chosenPost.comments.length})
                          </span>
                          
                          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scroll pr-1">
                            {chosenPost.comments.length === 0 ? (
                              <div className="text-[10px] text-stone-300 text-center py-7 font-medium italic">
                                🛋️ 热评区虚位以待，快来说说有什么好玩的好听的吧！
                              </div>
                            ) : (
                              chosenPost.comments.map((comm, idx) => (
                                <div key={comm.id || idx} className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100/40 space-y-2">
                                  
                                  {/* Comment Head Info */}
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <div className="flex items-center gap-1.5 text-stone-700">
                                      <span className="text-brand-green-dark font-black">{comm.name}</span>
                                      {comm.name.includes('(我)') && (
                                        <span className="bg-[#eff7e8] text-[#5d7350] text-[8px] font-black px-1.5 py-[1px] rounded scale-90">
                                          本人
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[8px] text-stone-400 font-mono">{comm.time || '刚刚'}</span>
                                  </div>
                                  
                                  {/* Text Body */}
                                  <p className="text-[11px] text-stone-750 font-medium leading-relaxed font-sans">
                                    {comm.text}
                                  </p>

                                  {/* Interactive comment actions: Like, Dislike, and Click-to-Reply */}
                                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold border-t border-dashed border-stone-100 pt-2">
                                    <div className="flex items-center gap-4">
                                      {/* Like Comment button */}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const updatedComment = { ...comm };
                                          if (updatedComment.userLiked) {
                                            updatedComment.likes -= 1;
                                            updatedComment.userLiked = false;
                                          } else {
                                            updatedComment.likes += 1;
                                            updatedComment.userLiked = true;
                                            if (updatedComment.userDisliked) {
                                              updatedComment.dislikes -= 1;
                                              updatedComment.userDisliked = false;
                                            }
                                          }
                                          const updatedPost = { ...chosenPost };
                                          updatedPost.comments[idx] = updatedComment;
                                          setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updatedPost : p));
                                          setChosenPost(updatedPost);
                                        }}
                                        className={`flex items-center gap-1 transition-colors cursor-pointer ${comm.userLiked ? 'text-rose-500 font-black scale-105' : 'hover:text-rose-500'}`}
                                      >
                                        <span>👍</span>
                                        <span className="font-mono text-[9px]">{comm.likes}</span>
                                      </button>

                                      {/* Dislike Comment button */}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const updatedComment = { ...comm };
                                          if (updatedComment.userDisliked) {
                                            updatedComment.dislikes -= 1;
                                            updatedComment.userDisliked = false;
                                          } else {
                                            updatedComment.dislikes += 1;
                                            updatedComment.userDisliked = true;
                                            if (updatedComment.userLiked) {
                                              updatedComment.likes -= 1;
                                              updatedComment.userLiked = false;
                                            }
                                          }
                                          const updatedPost = { ...chosenPost };
                                          updatedPost.comments[idx] = updatedComment;
                                          setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updatedPost : p));
                                          setChosenPost(updatedPost);
                                        }}
                                        className={`flex items-center gap-1 transition-colors cursor-pointer ${comm.userDisliked ? 'text-stone-800 font-black' : 'hover:text-stone-700'}`}
                                      >
                                        <span>👎</span>
                                        <span className="font-mono text-[9px]">{comm.dislikes}</span>
                                      </button>

                                      {/* Reply direct trigger */}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setActiveReplyCommentIdx(idx);
                                          setCommentReplyText('');
                                        }}
                                        className="hover:text-brand-green text-stone-500 font-black flex items-center gap-0.5 cursor-pointer text-[9px]"
                                      >
                                        <span>💬 回复 ({comm.replies?.length || 0})</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Secondary comments (二级评论) timeline nested replies */}
                                  {comm.replies && comm.replies.length > 0 && (
                                    <div className="bg-[#eff7e8]/35 p-2 rounded-xl mt-1.5 space-y-2 border-l-2 border-brand-green/30 pl-2.5">
                                      {comm.replies.map((reply: any, rIdx: number) => (
                                        <div key={rIdx} className="space-y-0.5 text-left font-sans">
                                          <div className="flex justify-between items-center text-[9px] font-bold text-stone-500">
                                            <span className="text-stone-850 font-black">{reply.name}</span>
                                            <span className="text-[8px] text-stone-400 font-mono">{reply.time || '刚刚'}</span>
                                          </div>
                                          <p className="text-[10px] text-stone-650 leading-relaxed font-sans font-medium">
                                            {reply.text}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                      {/* CONCENTRATED RIGHT-BOTTOM ACTION CORE (點讚+收藏+評論組件) */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 shrink-0 relative">
                        {commentError && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md z-30 animate-pulse">
                            {commentError}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="text" 
                              placeholder={activeReplyCommentIdx !== null 
                                ? `回复 @${chosenPost.comments[activeReplyCommentIdx]?.name || ''}的评论...` 
                                : "写下你的元气饭友热评..."
                              }
                              value={activeReplyCommentIdx !== null ? commentReplyText : currentUserCommentText}
                              onChange={(e) => {
                                if (activeReplyCommentIdx !== null) {
                                  setCommentReplyText(e.target.value);
                                } else {
                                  setCurrentUserCommentText(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (activeReplyCommentIdx !== null) {
                                    handleSubmitReply(activeReplyCommentIdx);
                                  } else {
                                    handleSubmitComment();
                                  }
                                }
                              }}
                              className="w-full bg-[#f6f8f5] border border-stone-200 focus:bg-white focus:border-brand-green-dark p-2.5 pr-14 rounded-2xl text-[11px] font-bold text-stone-750 outline-none transition-all font-sans"
                            />
                            {activeReplyCommentIdx !== null && (
                              <button 
                                onClick={() => {
                                  setActiveReplyCommentIdx(null);
                                  setCommentReplyText('');
                                }}
                                className="absolute right-2.5 top-2.5 bg-stone-200/50 hover:bg-stone-200 text-stone-500 text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                取消
                              </button>
                            )}
                          </div>

                          {/* Concentrated Buttons on the Bottom-Right aligned corner */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            
                            {/* Consolidated Like Button with pop trigger */}
                            <button 
                              onClick={() => {
                                const updated = { ...chosenPost, isLiked: !chosenPost.isLiked };
                                updated.likes += updated.isLiked ? 1 : -1;
                                setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updated : p));
                                setChosenPost(updated);
                                
                                // Spawn float pop hearts
                                triggerHeartPop();
                              }}
                              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                chosenPost.isLiked 
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105 animate-heart-pop' 
                                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-500 hover:bg-rose-50/25'
                              }`}
                              title="点赞帖子"
                            >
                              <Heart className={`w-4 h-4 ${chosenPost.isLiked ? 'fill-current text-rose-500' : ''}`} />
                              <span className="text-[10px] font-mono font-black">{chosenPost.likes}</span>
                            </button>

                            {/* Consolidated Save Button */}
                            <button 
                              onClick={() => {
                                const updated = { ...chosenPost, isSaved: !chosenPost.isSaved };
                                setSocialPosts(prev => prev.map(p => p.id === chosenPost.id ? updated : p));
                                setChosenPost(updated);
                              }}
                              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                chosenPost.isSaved 
                                  ? 'bg-amber-50 border-amber-200 text-amber-500 scale-105 animate-star-bounce' 
                                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-amber-500'
                              }`}
                              title="收藏帖子"
                            >
                              <Star className={`w-4 h-4 ${chosenPost.isSaved ? 'fill-current text-amber-500' : ''}`} />
                            </button>

                            {/* Main Post submit reply or master comment button */}
                            <button
                              onClick={() => {
                                if (activeReplyCommentIdx !== null) {
                                  handleSubmitReply(activeReplyCommentIdx);
                                } else {
                                  handleSubmitComment();
                                }
                              }}
                              className="bg-[#8ca779] hover:bg-[#7ba066] active:scale-95 text-white font-black text-xs py-2.5 px-3.5 rounded-xl cursor-pointer transition-all shadow-xs"
                            >
                              发送
                            </button>

                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB OVERLAY: PUBLISH NEW CREATIVE POST MODAL (Img 13) */}
              {/* ======================================================= */}
              {isPublishingModal && activeTab === 'community' && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[620px] p-5 space-y-4 animate-scale-up relative text-left">
                    
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setIsPublishingModal(false)}
                        className="text-stone-400 hover:text-stone-700 focus:outline-none"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <button 
                        onClick={handlePublishNewPost}
                        className="bg-brand-green text-white font-black text-xs px-6 py-2 rounded-xl shadow-xs hover:bg-brand-green-dark"
                      >
                        发布帖子
                      </button>
                    </div>

                    {/* Canvas stage dashed (Img 13) */}
                    <div className="bg-[#eff7e8] border-2 border-dashed border-[#a9c894] rounded-2xl h-[170px] flex flex-col items-center justify-center gap-2 relative overflow-hidden p-5 text-center shrink-0">
                      {!generatedDraftEmoji ? (
                        <div className="space-y-1">
                          <span className="block text-stone-300 text-2xl">🖼️</span>
                          <span className="text-[11px] font-bold text-[#5d7350] block">从本地相册直接拖拽上传图片</span>
                          <span className="text-[9px] text-[#7ea169] font-semibold">或者点击下方智能按钮一键生成美食图卡</span>
                        </div>
                      ) : (
                        <div className="space-y-1 animate-bounce">
                          <span className="text-6xl">{generatedDraftEmoji}</span>
                        </div>
                      )}

                      {/* Generative buttons grid (Img 13 Bottom) */}
                      <div className="absolute bottom-3 flex gap-2">
                        <button 
                          onClick={handleGenerativeMockAIPic}
                          className="bg-[#a9c894] hover:bg-[#8ba779] text-white text-[9px] font-black py-1 px-3 rounded-lg shadow-sm cursor-pointer"
                        >
                          智能生成食物插图
                        </button>
                        
                        <button 
                          onClick={() => {
                            setGeneratedDraftEmoji('🥦🥑🍗');
                            alert('文字配图：根据本餐[西兰花, 鸡胸肉]自动完成餐盘插画设计！');
                          }}
                          className="bg-white border text-stone-500 hover:bg-stone-50 text-[9px] font-black py-1 px-3 rounded-lg shadow-xs cursor-pointer"
                        >
                          文字识别配图
                        </button>
                      </div>
                    </div>

                    {/* Shared forms matching Manually edited cooking logs - Requirement 15 */}
                    <div className="space-y-3 pt-1 border-t border-stone-100">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-700 font-extrabold text-[11px] uppercase tracking-wide block">🍳 手工烹饪信息采集栏 (与手动记录同款结构)</span>
                        <span className="text-[#8ca779] font-bold text-[9px]">SAME AS MANUAL COOKING LOG</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-500 block">🥘 自定义菜品名称</label>
                          <input 
                            type="text"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="自定义菜品名称 (例如: 妈妈牌红烧排骨)"
                            className="w-full bg-[#f6f8f5] border border-stone-250/70 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white focus:border-[#8ca779]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-500 block">⭐ 烹制打分评星</label>
                          <select 
                            value={newPostStars}
                            onChange={(e) => setNewPostStars(Number(e.target.value))}
                            className="w-full bg-[#f6f8f5] border border-stone-250/70 rounded-xl px-3 py-2 text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#8ca779]"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ 五星级大厨 (精湛)</option>
                            <option value="4">⭐⭐⭐⭐ 四星主厨 (满意)</option>
                            <option value="3">⭐⭐⭐ 三星新手 (勉强)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Captions textarea */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-black text-stone-500 block">📝 烹饪心得感受或随笔分享 (限150字)</label>
                      <div className="bg-stone-50 border rounded-xl overflow-hidden p-3 shadow-inner">
                        <textarea 
                          rows={3}
                          value={newPostCaption}
                          onChange={(e) => setNewPostCaption(e.target.value)}
                          placeholder="写下你今天的厨房收获，添加新配料心得..."
                          className="w-full bg-transparent border-none text-xs outline-none focus:ring-0 leading-relaxed text-stone-800"
                          maxLength={150}
                        />
                        <span className="text-[9px] text-stone-400 text-right block font-mono">
                          {newPostCaption.length} / 150字
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* SUB OVERLAY: CONGRATULATIONS SUCCESS DISH REWARD WINDOW (Goal 5) */}
              {/* ============================================================== */}
              {showCongratsSuccess && activeRecipe && (
                <div className="fixed inset-0 bg-stone-900/75 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in select-none">
                  
                  {/* Floating sparkles behind card - wrapped and hidden on mobile/small screens to prevent overflow */}
                  <div className="absolute pointer-events-none inset-0 overflow-hidden select-none hidden md:block">
                    <span className="absolute top-[20%] left-[15%] text-4xl animate-bounce-subtle duration-300">✨</span>
                    <span className="absolute top-[28%] right-[20%] text-3xl animate-pulse">🌟</span>
                    <span className="absolute bottom-[25%] left-[25%] text-3xl animate-bounce">🎈</span>
                    <span className="absolute bottom-[30%] right-[15%] text-4xl animate-pulse duration-700">✨</span>
                  </div>

                  <div className="bg-white rounded-[2.5rem] w-full max-w-[460px] max-h-[90vh] overflow-y-auto custom-scroll p-6 text-center shadow-2xl relative border-4 border-[#edd96a]/70 animate-scale-up">
                    
                    {/* Concentric shining radiant sunburst backdrop */}
                    <div className="absolute inset-0 bg-radial-gradient from-[#edd96a]/15 via-white to-transparent opacity-60 pointer-events-none"></div>

                    {/* Ribbon header badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#8ca779] text-white px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md mb-5 relative z-10">
                      🏅 厨艺大师认定勋章
                    </div>

                    {/* Cooking completion visual dish */}
                    <div className="relative w-28 h-28 mx-auto bg-stone-50 border-4 border-[#edd96a]/60 rounded-full flex items-center justify-center shadow-lg mb-4 animate-scale-up">
                      <span className="text-6xl">🥢</span>
                      {/* Floating confetti stars */}
                      <span className="absolute -top-1.5 -right-1 text-base text-yellow-400 animate-bounce">⭐</span>
                      <span className="absolute -bottom-1 -left-1 text-base text-yellow-400 animate-pulse">⭐</span>
                    </div>

                    <div className="space-y-3 relative z-10">
                      <h4 className="text-xl font-black text-stone-850 tracking-tight leading-tight">
                        恭喜您完成“<span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">{activeRecipe.name}</span>”菜品的制作！
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans font-medium">
                        做得好！这一套餐食不仅完美搭配了您精心挑选的配料篮，更提供均衡的高营养。相信在识食物者的陪伴下，今天的您会收获满格的自然元气！
                      </p>
                    </div>

                    <div className="my-4"></div>

                    {/* Twin choice buttons */}
                    <div className="flex flex-col gap-2 relative z-10 pt-1.5">
                      <button 
                        onClick={() => {
                          setSubStep(1);
                          setActiveRecipe(null);
                          setShowCongratsSuccess(false);
                          setActiveCookingStepIndex(0);
                        }}
                        className="bg-brand-yellow hover:bg-[#edd96a] text-stone-850 font-black text-xs py-3 rounded-full border border-[#edd96a] shadow-md transition-all active:scale-95 cursor-pointer w-full"
                      >
                        🎉 恭喜完成，立即跳回首页
                      </button>
                      <button 
                        onClick={() => {
                          setShowCongratsSuccess(false);
                          setSubStep(5);
                        }}
                        className="text-[10px] text-stone-400 hover:text-stone-600 font-bold underline transition-colors cursor-pointer"
                      >
                        留在本页再瞧瞧
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* SUB OVERLAY: AUTHOR PERSONAL HOME PAGE (Goal 3 - Xiaohongshu style) */}
              {/* ============================================================== */}
              {viewingAuthorProfile && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in select-none p-4">
                  <div className="bg-white rounded-[2.5rem] w-full max-w-[420px] overflow-hidden shadow-2xl relative border border-stone-100 animate-scale-up text-left">
                    
                    {/* Circle close button */}
                    <button 
                      onClick={() => setViewingAuthorProfile(null)}
                      className="absolute top-4 right-4 z-20 bg-white/85 hover:bg-white border border-stone-200/50 p-2 rounded-full shadow-sm cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4 text-stone-700 font-extrabold" />
                    </button>

                    {/* Banner Top Gradient Decoration */}
                    <div className="h-28 bg-gradient-to-tr from-[#e3f0d8] via-[#eff7e8] to-[#f4ebe1] p-5 relative">
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                    </div>

                    {/* Profile Header Block */}
                    <div className="px-5 pb-5 relative z-10 -mt-10">
                      {/* Avatar Image and Name layout */}
                      <div className="flex items-end justify-between">
                        <div className="w-16 h-16 bg-white p-1 rounded-full shadow-md border-4 border-white select-none animate-bounce-subtle overflow-hidden flex items-center justify-center shrink-0">
                          {viewingAuthorProfile.avatar && typeof viewingAuthorProfile.avatar === 'string' && (viewingAuthorProfile.avatar.startsWith('blob:') || viewingAuthorProfile.avatar.startsWith('data:') || viewingAuthorProfile.avatar.startsWith('http') || viewingAuthorProfile.avatar.startsWith('/')) ? (
                            <img src={viewingAuthorProfile.avatar} alt="Author avatar" className="w-[102%] h-[102%] object-cover rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-3xl">{viewingAuthorProfile.avatar}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFollowedAuthors(prev => 
                              prev.includes(viewingAuthorProfile.name) 
                                ? prev.filter(a => a !== viewingAuthorProfile.name) 
                                : [...prev, viewingAuthorProfile.name]
                            );
                          }}
                          className={`px-5 py-1.5 rounded-full text-xs font-black tracking-wider transition-all cursor-pointer ${
                            followedAuthors.includes(viewingAuthorProfile.name)
                              ? 'bg-stone-100 text-stone-400 border border-stone-200'
                              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-300/30'
                          }`}
                        >
                          {followedAuthors.includes(viewingAuthorProfile.name) ? '✓ 已关注' : '关注 TA'}
                        </button>
                      </div>

                      <div className="mt-3.5 space-y-1">
                        <h4 className="font-black text-lg text-stone-850 flex items-center gap-1.5">
                          {viewingAuthorProfile.name}
                          <span className="text-[9px] bg-red-50 text-red-500 border border-red-200/50 px-2 py-0.5 rounded-full font-sans font-black scale-95">博主专栏</span>
                        </h4>
                        <p className="text-[10px] text-stone-400 font-bold font-sans">
                          {viewingAuthorProfile.bio}
                        </p>
                      </div>

                      {/* Profile numbers grid */}
                      <div className="grid grid-cols-3 gap-2 bg-[#fdfdfd] border border-stone-150 p-2.5 rounded-2xl mt-4 text-center font-mono text-xs shadow-xs">
                        <div>
                          <span className="text-[9px] text-[#526047] block font-black leading-none">关注</span>
                          <span className="text-xs font-black text-stone-850 mt-1 block">{viewingAuthorProfile.following}</span>
                        </div>
                        <div className="border-l border-stone-200 border-dashed">
                          <span className="text-[9px] text-[#526047] block font-black leading-none">粉丝</span>
                          <span className="text-xs font-black text-stone-850 mt-1 block">{viewingAuthorProfile.followers}</span>
                        </div>
                        <div className="border-l border-stone-200 border-dashed">
                          <span className="text-[9px] text-[#526047] block font-black leading-none">获赞与收藏</span>
                          <span className="text-xs font-black text-rose-500 mt-1 block">{viewingAuthorProfile.likes}</span>
                        </div>
                      </div>

                      {/* Display author's published posts (Xiaohongshu style list) */}
                      <div className="mt-5 space-y-3">
                        <span className="text-[10px] font-black text-stone-400 font-mono block uppercase tracking-wider">
                          ✍️ TA的精彩美膳笔记 ({viewingAuthorProfile.posts?.length || 0})
                        </span>
                        
                        <div className="max-h-[200px] overflow-y-auto custom-scroll pr-1">
                          {(!viewingAuthorProfile.posts || viewingAuthorProfile.posts.length === 0) ? (
                            <div className="text-[10px] text-stone-300 text-center py-6 font-medium italic border border-dashed rounded-2xl bg-stone-50/50">
                              🫙 该美食达人暂未发布任何公开笔记哦～
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2.5">
                              {viewingAuthorProfile.posts.map((post: any) => (
                                <div 
                                  key={post.id}
                                  onClick={() => {
                                    setChosenPost(post);
                                    setViewingAuthorProfile(null);
                                  }}
                                  className="bg-white border border-stone-200/90 hover:border-brand-green/40 hover:shadow-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group"
                                >
                                  {/* Thumbnail cover representing Xiaohongshu visual card cover */}
                                  <div className="h-20 bg-gradient-to-br from-[#eff7e8]/30 to-stone-50/40 relative flex items-center justify-center border-b border-stone-100 transition-colors group-hover:bg-[#eff7e8]/50">
                                    <span className="text-3xl select-none transform group-hover:scale-110 transition-transform duration-300">{post.emoji || '🥘'}</span>
                                  </div>
                                  
                                  {/* Metadata */}
                                  <div className="p-2 text-left space-y-1">
                                    <h5 className="font-extrabold text-[10px] text-stone-850 line-clamp-2 leading-tight group-hover:text-[#5d7350] transition-colors">{post.title}</h5>
                                    <div className="flex items-center justify-between text-[8px] text-stone-400 font-mono pt-1 border-t border-stone-50">
                                      <span className="flex items-center gap-0.5 text-stone-500 font-semibold">❤️ {post.likes}</span>
                                      <span>💬 {post.comments?.length || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB OVERLAY: RECIPE DETAIL MULTI-CHANNEL SHARE MODAL */}
              {/* ======================================================= */}
              {showRecipeSharePopup && activeRecipe && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[420px] p-6 text-center shadow-2xl animate-scale-up border border-stone-100 flex flex-col items-center gap-5 relative">
                    <button 
                      onClick={() => {
                        setShowRecipeSharePopup(false);
                        setShowWXQRCode(false);
                      }}
                      className="absolute top-4 right-4 bg-stone-50 hover:bg-stone-100 p-1.5 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-xl shadow-inner mt-2">
                      🔗
                    </div>

                    <div className="space-y-1 w-full">
                      <h4 className="font-sans font-black text-stone-850 text-sm">分享菜谱精选成果</h4>
                      <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                        分享健康美馔「{activeRecipe.name}」，传递厨房正能量
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-2">
                      {/* Left: WeChat sharing channel */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowWXQRCode(true);
                          const shareUrl = `https://shishiwuzhe.com/share/recipe/${activeRecipe.id || 'recipe'}`;
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            showToast('📋 微信分享链接已自动复制至您的剪切板！');
                          }).catch(() => {
                            // fallback
                          });
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${showWXQRCode ? 'bg-emerald-50/70 border-[#8ca779]/50 text-[#345325]' : 'bg-stone-50 border-stone-200/60 hover:bg-stone-100'}`}
                      >
                        <span className="text-2xl">🔗</span>
                        <span className="text-xs font-black">生成微信分享链接</span>
                        <span className="text-[9px] text-[#5d7350] font-bold">一键复制直达无阻分享</span>
                      </button>

                      {/* Right: Community sharing channel */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPublishTitle(`🌟 识食物者甄选推荐：【${activeRecipe.name}】美味食谱分享！`);
                          setCustomPublishBody(`给大家分享一道我用本智能厨具系统刚出锅烹饪的【${activeRecipe.name}】！健康配方比例非常赞：蛋白质 ${activeRecipe.protein}g / 碳水 ${activeRecipe.carbohydrates}g / 脂肪 ${activeRecipe.fat}g，能量值 ${activeRecipe.calories}千卡。健康评测得分极佳，强烈安利大家跟着烹饪指南试一下！`);
                          setCustomPublishEmoji(activeRecipe.coverEmoji || '🥘');
                          setIsCustomPublishPage(true);
                          setShowRecipeSharePopup(false);
                          setShowWXQRCode(false);
                          setActiveTab('community');
                          showToast('📝 成功为您生机配方并生成配图草稿！请在右侧继续您的帖子编辑吧～');
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-stone-50 border border-stone-200/60 hover:bg-stone-100 hover:border-amber-300 transition-all cursor-pointer"
                      >
                        <span className="text-2xl">👩‍🍳</span>
                        <span className="text-xs font-black">发布至社区广场</span>
                        <span className="text-[9px] text-stone-400">生成优质配方干货帖</span>
                      </button>
                    </div>

                    {/* WeChat share link sub-panel if active */}
                    {showWXQRCode && (
                      <div className="w-full bg-[#fdfdfd] border border-[#a2c28f]/30 rounded-2xl p-4 flex flex-col items-start gap-2 animate-scale-up text-left">
                        <span className="text-[10px] font-black text-stone-500 block">✨ 微信专线免扫码分享链接：</span>
                        <div className="flex gap-2 w-full">
                          <input 
                            type="text" 
                            readOnly 
                            value={`https://shishiwuzhe.com/share/recipe/${activeRecipe.id || 'recipe'}`}
                            className="bg-stone-50 border border-stone-250/70 rounded-xl px-3 py-2 text-[11px] font-mono select-all flex-1 outline-none text-stone-700" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const shareUrl = `https://shishiwuzhe.com/share/recipe/${activeRecipe.id || 'recipe'}`;
                              navigator.clipboard.writeText(shareUrl).then(() => {
                                showToast('📋 复制成功！快去微信分享给好友吧～');
                              });
                            }}
                            className="px-4 bg-[#8ca779] text-white text-xs font-black rounded-xl hover:bg-[#728f60] transition-colors cursor-pointer shrink-0"
                          >
                            复制
                          </button>
                        </div>
                        <p className="text-[9px] text-stone-400 leading-normal">
                          💡 提示：该链接支持微信直接点击跳转。已为您成功自动写入剪切板，畅享绿色健康烹饪！
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB OVERLAY: NO INGREDIENTS PASSTHROUGH POPUP */}
              {/* ======================================================= */}
              {showNoIngredientsPopup && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[380px] p-6 text-center shadow-2xl animate-scale-up border border-stone-100 flex flex-col items-center gap-5 relative">
                    <button 
                      onClick={() => setShowNoIngredientsPopup(false)}
                      className="absolute top-4 right-4 bg-stone-50 hover:bg-stone-100 p-1.5 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl shadow-inner mt-2">
                      💡
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-sans font-black text-stone-850 text-sm">您今天还没有挑选食材哦</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans px-2">
                        空空如也的餐盘依旧可以开启烹饪之旅！请挑选：
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2">
                      <button
                        onClick={() => {
                          setShowNoIngredientsPopup(false);
                          setSubStep(5);
                        }}
                        className="w-full bg-[#8ca779] hover:bg-[#728f60] text-white font-extrabold text-xs py-2.5 rounded-full shadow-md transition-all active:scale-95"
                      >
                        直接去智能烹饪（不挑食材）
                      </button>
                      <button
                        onClick={() => {
                          setShowNoIngredientsPopup(false);
                          setSubStep(1);
                        }}
                        className="w-full bg-white hover:bg-stone-50 text-stone-600 border border-stone-250 font-extrabold text-xs py-2.5 rounded-full transition-all active:scale-95"
                      >
                        返回上一步，去选喜欢食材
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB OVERLAY: MANUAL LOG DETAIL & EDIT MODAL (Requirement 12) */}
              {/* ======================================================= */}
              {isEditingLogDetail && selectedLogDetail && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[370px] p-6 text-left shadow-2xl animate-scale-up border border-stone-100 relative space-y-4">
                    <button 
                      onClick={() => setIsEditingLogDetail(false)}
                      className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3 border-b pb-3 border-stone-100">
                      <span className="text-3xl p-1.5 bg-amber-50 rounded-2xl shrink-0">🥘</span>
                      <div>
                        <h4 className="font-sans font-black text-stone-850 text-xs">编辑手工烹调历史</h4>
                        <p className="text-[9px] text-stone-400 font-mono font-semibold">记录标识码: #{selectedLogDetail.id} | 日期: {selectedLogDetail.date}</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-500 block">🥘 自定义菜品名称</label>
                        <input 
                          type="text"
                          value={tempLogName}
                          onChange={(e) => setTempLogName(e.target.value)}
                          className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white focus:border-[#8ca779]"
                        />
                      </div>

                      <div className="space-y-1 margin-t-2">
                        <label className="text-[10px] font-black text-stone-500 block">⭐ 烹制打分评星</label>
                        <select 
                          value={tempLogStars}
                          onChange={(e) => setTempLogStars(Number(e.target.value))}
                          className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#8ca779]"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 五星级大厨 (精湛)</option>
                          <option value="4">⭐⭐⭐⭐ 四星主厨 (满意)</option>
                          <option value="3">⭐⭐⭐ 三星新手 (勉强)</option>
                        </select>
                      </div>

                      <div className="space-y-1 margin-t-2">
                        <label className="text-[10px] font-black text-stone-500 block">📝 制作心得或私密秘方</label>
                        <textarea
                          rows={3}
                          value={tempLogNote}
                          onChange={(e) => setTempLogNote(e.target.value)}
                          className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:border-[#8ca779] resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setCookingLogs(prev => prev.map(log => log.id === selectedLogDetail.id 
                            ? { ...log, name: tempLogName, stars: tempLogStars, note: tempLogNote } 
                            : log
                          ));
                          setIsEditingLogDetail(false);
                          showToast('💾 烹饪打卡记录修改已实时更新。✨');
                        }}
                        className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-xs py-2.5 rounded-full shadow-md transition-all active:scale-95 text-center"
                      >
                        保存修改
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: '确定要删除记录吗？',
                            message: '提示：您确定要删除这一条手工打卡记录吗？',
                            onConfirm: () => {
                              setCookingLogs(prev => prev.filter(log => log.id !== selectedLogDetail.id));
                              setIsEditingLogDetail(false);
                              showToast('🗑️ 已成功从时间线中移除这一条历史打卡。');
                            }
                          });
                        }}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 font-extrabold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95"
                      >
                        删除记录
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* GENERAL CONFIRMATION MODAL OVERLAY */}
              {/* ======================================================= */}
              {confirmModal.isOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2rem] w-full max-w-[340px] p-6 text-center shadow-2xl animate-scale-up border border-stone-150 flex flex-col items-center gap-4.5 relative text-left select-none">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold font-sans">
                      ❓
                    </div>
                    
                    <div className="space-y-1.5 text-center">
                      <h4 className="font-sans font-black text-stone-800 text-sm leading-snug">{confirmModal.title || '操作提示'}</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans px-2">
                        {confirmModal.message}
                      </p>
                    </div>

                    <div className="flex gap-2.5 w-full mt-2">
                      <button
                        onClick={() => {
                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 bg-stone-150 hover:bg-stone-200 text-stone-600 font-extrabold text-xs py-2.5 rounded-full transition-all active:scale-95 cursor-pointer text-center"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          confirmModal.onConfirm();
                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="flex-1 bg-brand-green hover:bg-[#728f60] text-white font-extrabold text-xs py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-center"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* PERSISTENT TOAST COMPONENT (Requirement 3: Elegant botanical top popup notification) */}
              {/* ======================================================= */}
              {toastMessage && (
                <div className="absolute inset-0 z-60 pointer-events-none flex items-center justify-center p-6 animate-toast-center">
                  <div className="bg-[#eff7e8] border-2 border-[#a2c28f] text-[#36482c] text-xs sm:text-sm font-black px-8 py-5 rounded-[2rem] flex flex-col items-center justify-center gap-2.5 shadow-2xl max-w-[280px] text-center backdrop-blur-xs leading-normal">
                    <span className="text-3xl animate-bounce">✨</span>
                    <span>{toastMessage}</span>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* FLYING INGREDIENTS TRANSITIONAL LAYER (Requirement 2) */}
              {/* ======================================================= */}
              {flyingItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    position: 'fixed',
                    left: '0px',
                    top: '0px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    '--start-x': `${item.x}px`,
                    '--start-y': `${item.y}px`,
                    '--target-x': `${(item as any).targetX || (item.x + 100)}px`,
                    '--target-y': `${(item as any).targetY || (item.y + 400)}px`
                  } as React.CSSProperties}
                  className="flying-emoji-node text-3xl select-none"
                >
                  {item.emoji}
                </div>
              ))}

              {/* INLINE ANIMATION STYLESHEET FOR FLY EFFECTS */}
              <style>{`
                @keyframes flyToCenterCart {
                  0% {
                    opacity: 1;
                    transform: translate(var(--start-x), var(--start-y)) scale(1) rotate(0deg);
                  }
                  35% {
                    opacity: 1;
                    transform: translate(calc(var(--start-x) - 15px), calc(var(--start-y) - 60px)) scale(1.3) rotate(-35deg);
                  }
                  100% {
                    opacity: 0.15;
                    transform: translate(var(--target-x), var(--target-y)) scale(0.25) rotate(540deg);
                  }
                }
                .flying-emoji-node {
                  animation: flyToCenterCart 0.85s cubic-bezier(0.1, 0.75, 0.3, 1) forwards;
                }
                @keyframes toastCenterIn {
                  0% {
                    opacity: 0;
                    transform: scale(0.85);
                  }
                  12% {
                    opacity: 1;
                    transform: scale(1.08);
                  }
                  16% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  85% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  100% {
                    opacity: 0;
                    transform: scale(0.92) translateY(8px);
                  }
                }
                .animate-toast-center {
                  animation: toastCenterIn 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
              `}</style>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
