// 引入React核心钩子函数
import React, { useState, useMemo, useEffect, useRef } from 'react';
// 引入当前登录用户自定义钩子
import { useCurrentUser } from './hooks/useCurrentUser';
// 引入偏好设置自定义钩子
import { usePreferences } from './hooks/usePreferences';
// 顶部品牌标题栏公共组件
import BrandHeader from './components/shared/BrandHeader';
// 底部导航标签栏公共组件
import BottomTabBar from './components/shared/BottomTabBar';
// 全局轻提示弹窗公共组件
import GlobalToast from './components/shared/GlobalToast';
// 食材飞入动画层公共组件（选中食材飞入购物车动画）
import FlyingItemLayer from './components/shared/FlyingItemLayer';
// Vue代码导出面板组件
import VueExporterPanel from './components/shared/VueExporterPanel';
// 界面调试预设面板组件
import InspectorPanel from './components/shared/InspectorPanel';
// 自定义发布弹窗页面（发社区/烹饪日志）
import CustomPublishPage from './components/overlays/CustomPublishPage';
// 通用二次确认弹窗组件
import ConfirmModal from './components/shared/ConfirmModal';
// 未选择食材提示弹窗
import NoIngredientsModal from './components/overlays/NoIngredientsModal';
// 烹饪完成恭喜弹窗
import CongratsModal from './components/overlays/CongratsModal';
// 菜谱分享弹窗
import RecipeShareModal from './components/overlays/RecipeShareModal';
// 烹饪日志编辑弹窗
import CookingLogEditModal from './components/overlays/CookingLogEditModal';
// 社区帖子详情弹窗
import PostDetailModal from './components/community/PostDetailModal';
// 作者主页弹窗
import AuthorProfileModal from './components/community/AuthorProfileModal';
// 个人菜谱详情浮层
import RecipeDetailOverlay from './components/profile/RecipeDetailOverlay';
// 欢迎启动页（EatWell第一步）
import WelcomePage from './components/eatwell/WelcomePage';
// 个人数据统计页面
import StatisticsPage from './components/profile/StatisticsPage';
// 账号设置页面
import AccountSettingsPage from './components/profile/AccountSettingsPage';
// 个人中心主页
import ProfileMainPage from './components/profile/ProfileMainPage';
// 我的菜谱页面（原创/收藏/草稿）
import MyRecipesPage from './components/profile/MyRecipesPage';
// 烹饪打卡日志页面
import CookingLogsPage from './components/profile/CookingLogsPage';
// 口味忌口偏好设置页面
import PreferencesPage from './components/profile/PreferencesPage';
// 社区交流广场页面
import CommunityPage from './components/community/CommunityPage';
// 食材选择页面（选蔬菜/肉类/主食）
import FoodSelectorPage from './components/eatwell/FoodSelectorPage';
// 锅具匹配选择页面
import PotSelectorPage from './components/eatwell/PotSelectorPage';
// 匹配菜谱推荐结果页面
import RecipeResultPage from './components/eatwell/RecipeResultPage';
// 菜谱分步烹饪详情页面
import RecipeDetailPage from './components/eatwell/RecipeDetailPage';
// 灵感随机菜谱生成页面
import InspirationPage from './components/inspiration/InspirationPage';
// 烹饪日志操作逻辑钩子
import { useCookingLogs } from './hooks/useCookingLogs';
// 社区帖子互动操作钩子（点赞/评论/关注）
import { useCommunityActions } from './hooks/useCommunityActions';
// EatWell食材选择核心逻辑钩子
import { useFoodSelection } from './hooks/useFoodSelection';
// 全局Toast提示钩子
import { useToast } from './hooks/useToast';
// 灵感随机菜谱生成逻辑钩子
import { useInspiration } from './hooks/useInspiration';
// 发布内容编辑器逻辑钩子
import { usePublishComposer } from './hooks/usePublishComposer';
// 菜谱TS类型定义
import { Recipe } from './types';
// 全局菜谱静态数据库
import { RECIPES_DATABASE } from './data';

import CookingLogEditorPage from './components/overlays/CookingLogEditorPage';
import CookingLogViewerModal from './components/overlays/CookingLogViewerModal';
import { useMyRecipesData } from './hooks/useMyRecipesData';
import { useMyCollects } from './hooks/useMyCollects';
import LoginPage from './pages/LoginPage';
import { storage } from './api';
import { userApi } from './api';

// 应用根组件
function App() {
  // ============================================================================
  // 界面调试、代码导出控制器
  // ============================================================================
  const [activeInspectorView, setActiveInspectorView] = useState<string>('free');
  const [isExporterPanelOpen, setIsExporterPanelOpen] = useState(false);

  // 烹饪日志独立编辑界面
  const [isCookingLogEditorPage, setIsCookingLogEditorPage] = useState(false);
  const [editingCookingLog, setEditingCookingLog] = useState<any | null>(null);
  const [viewingCookingLog, setViewingCookingLog] = useState<any | null>(null);
  

  // ============================================================================
  // 底部主导航标签控制器（四大模块：吃好/灵感/社区/个人）
  // ============================================================================
  const [activeTab, setActiveTab] = useState<'eatwell' | 'inspiration' | 'community' | 'profile'>('eatwell');
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

  /**
   * 搜索词校验工具方法：检测搜索食材是否属于忌口/过敏原
   */
  const checkQueryRestrictions = (query: string) => {
    if (!query) return null;
    const qLower = query.toLowerCase().trim();
    if (qLower.length === 0) return null;
    
    const matchedForbidden = forbiddenFoodsSelected.find(f => 
      f.toLowerCase().includes(qLower) || qLower.includes(f.toLowerCase())
    );
    if (matchedForbidden) {
      return {
        type: 'forbidden',
        message: '该食材已在偏好设置中被过滤'
      };
    }

    const matchedAllergen = allergens.find(a => 
      a.toLowerCase().includes(qLower) || qLower.includes(a.toLowerCase())
    );
    if (matchedAllergen) {
      return {
        type: 'allergen',
        message: '该食材已标记为过敏原'
      };
    }

    return null;
  };

  /**
   * 口味偏好过滤校验
   */
  const checkTastePreferenceRestrictions = (query: string) => {
    if (!query || tasteTendency === '不挑（默认）') return null;
    const qLower = query.toLowerCase().trim();
    if (qLower.length === 0) return null;

    const tasteKeywords = [
      { name: '清淡', keywords: ['清淡', '不辣', '素'] },
      { name: '重口', keywords: ['重口', '麻辣', '重油', '油腻'] },
      { name: '偏辣', keywords: ['辣', '香辣', '辣椒', '剁椒', '红油'] },
      { name: '偏甜', keywords: ['甜', '糖', '蜜'] },
      { name: '偏咸', keywords: ['咸', '盐', '重咸'] },
      { name: '偏酸', keywords: ['酸', '醋', '柠檬'] }
    ];

    const matchedFilteredTaste = tasteKeywords.find(t => 
      t.name !== tasteTendency && t.keywords.some(kw => qLower.includes(kw))
    );

    if (matchedFilteredTaste) {
      return `您已过滤该口味 请在偏好设置中修改`;
    }
    return null;
  };
  
  // EatWell页面搜索框输入内容状态
  const [searchQuery, setSearchQuery] = useState('');

  // 用户收藏菜谱ID数组
  const [starredRecipes, setStarredRecipes] = useState<string[]>([]);
  const {collectedRecipes,refreshCollects,} = useMyCollects();
  const [animatingStarId, setAnimatingStarId] = useState<string | null>(null);

  // 全局轻提示解构
  const { toastMessage, showToast } = useToast();
  // ⭐ 这三个 state 必须在 useFoodSelection 之前声明，否则报"声明之前已使用"
  const [cookingLevel, setCookingLevel] = useState<'junior' | 'senior'>('junior');
  const [forbiddenFoodsSelected, setForbiddenFoodsSelected] = useState<string[]>(['洋葱头']);
  const [allergens, setAllergens] = useState<string[]>(['牛奶']);

  // ============ 烹饪日志模块逻辑抽取 ============
  const {
    cookingLogs,
    setCookingLogs,
    selectedLogDetail,
    isEditingLogDetail,
    tempLogName,
    tempLogNote,
    tempLogStars,
    setTempLogName,
    setTempLogNote,
    setTempLogStars,
    openManualLogEdit,
    closeLogEdit,
    saveLogEdit,
    deleteLog,
    addCookingLog,
    updateCookingLog,
  } = useCookingLogs();

  // ============ EatWell食材选择核心逻辑抽取 ============
  const food = useFoodSelection({ forbiddenFoodsSelected, cookingLevel, allergens });
  const {
    subStep, setSubStep,
    selectedVeggies, setSelectedVeggies,
    selectedMeats, setSelectedMeats,
    selectedStaples, setSelectedStaples,
    selectionOrder, setSelectionOrder,
    activePot, setActivePot,
    potScale, setPotScale,
    matchingMode, setMatchingMode,
    hasSelectedSideCookware, setHasSelectedSideCookware,
    isBasketOpen, setIsBasketOpen,
    showClearConfirm, setShowClearConfirm,
    cartBadgePop,
    shownRecipeIds, setShownRecipeIds,
    selectedResultsRecipeId, setSelectedResultsRecipeId,
    showMatchWarning,
    activeRecipe, setActiveRecipe,
    activeCookingStepIndex, setActiveCookingStepIndex,
    recipeDetailSource, setRecipeDetailSource,
    showNoIngredientsPopup, setShowNoIngredientsPopup,
    showCongratsSuccess, setShowCongratsSuccess,
    showRecipeSharePopup, setShowRecipeSharePopup,
    showWXQRCode, setShowWXQRCode,
    flyingItems,
    basketCount,
    selectedListWithDetails,
    selectedBasketCaloriesTotal,
    availableVeggiesFiltered,
    availableMeatsFiltered,
    availableStaplesFiltered,
    handleToggleIngredient,
    handleCycleReplaceRecipe,
    matchedRecipes,
    matchDegraded,
    matchingLoading,
    refetchMatchedRecipes,
  } = food;

  // ============ 灵感随机菜谱模块逻辑抽取 ============
  const inspiration = useInspiration({ forbiddenFoodsSelected,  });
  const {
    inspirationSubView, setInspirationSubView,
    inspirationSearchQuery, setInspirationSearchQuery,
    inspirationCount, setInspirationCount,
    isSpinning, setIsSpinning,
    isGenerated, setIsGenerated,
    isBulbGlow, setIsBulbGlow,
    randomizedRecipes, setRandomizedRecipes,
    aggregatedRandomNutrition,
    handleSpinInspiration,
    handleRefreshSingleInspiration,
  } = inspiration;

  // ============ 发布编辑器模块逻辑抽取 ============
  const publish = usePublishComposer();
  const {
    isCustomPublishPage, setIsCustomPublishPage,
    customPublishSource, setCustomPublishSource,
    publishToCommunity, setPublishToCommunity,
    publishToLogs, setPublishToLogs,
    customPublishTitle, setCustomPublishTitle,
    customPublishBody, setCustomPublishBody,
    customPublishEmoji, setCustomPublishEmoji,
    customPublishImage, setCustomPublishImage,
    customPublishImages, setCustomPublishImages,
    customPublishTags, setCustomPublishTags,
    customPublishStars, setCustomPublishStars,
    openComposer,
  } = publish;


  // 个人中心二级tab分组标识
  const [activeProfileTabGroup, setActiveProfileTabGroup] = useState<'main' | 'recipes' | 'preferences' | 'statistics' | 'cooking_logs' | 'account_settings'>('main');
  // 我的菜谱页面tab
  const [recipeTabMode, setRecipeTabMode] = useState<'published' | 'savedPosts' | 'drafts' | 'savedRecipes'>('published');
  // 个性化扩展偏好状态
  const [tasteTendency, setTasteTendency] = useState<string>('不挑（默认）');
  const [avoidTags, setAvoidTags] = useState<string[]>(['香菜', '大蒜']);
  const [customAvoids, setCustomAvoids] = useState<string[]>([]);
  const [avoidSearchText, setAvoidSearchText] = useState('');
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [allergenSearchText, setAllergenSearchText] = useState('');
  const [mealReminder, setMealReminder] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState('12:00');

  // 用户原创菜谱初始模拟数据
  const [myOriginalRecipes, setMyOriginalRecipes] = useState<any[]>([
    { id: 'or-1', name: '秘制黄金汤汁西兰花锅', coverEmoji: '🥦🍯', calories: 245, time: 8, difficulty: '入门', steps: ['西兰花洗净', '大火清炒'] },
    { id: 'or-2', name: '清脆滑嫩水煮捞芥兰', coverEmoji: '🥬🍤', calories: 180, time: 6, difficulty: '入门', steps: ['芥兰灼水', '淋上海鲜原汁酱油'] },
    { id: 'or-3', name: '一人食超低卡手擀面', coverEmoji: '🍝🍄', calories: 310, time: 10, difficulty: '比较容易', steps: ['手擀面下水', '煮熟捞出拌菌菇酱'] }
  ]);
  const [myDraftRecipes, setMyDraftRecipes] = useState<any[]>([
    { id: 'df-1', name: '高高炖锅海产什锦汤', coverEmoji: '🍲🦀', calories: 350, time: 20, difficulty: '中等', steps: ['备鲜虾和什锦贝类', '慢火吊汤'] },
    { id: 'df-2', name: '小白电热锅胡萝卜滑饭', coverEmoji: '🍚🍗', calories: 420, time: 15, difficulty: '入门', steps: ['备胡萝卜碎及滑鸡肉丁', '拌饭同蒸'] }
  ]);
  const [myDraftPosts, setMyDraftPosts] = useState<any[]>([
    { id: 'draft-post-1', title: '自制高纤维全麦三明治，控糖减脂推荐！🥪🥦', emoji: '🥪🥦🍳', date: '2026-05-30', author: 'Vante' },
    { id: 'draft-post-2', title: '五花肉大火焖白菜，暖乎乎太香了 🥘🥬', emoji: '🥘🥬🥩', date: '2026-05-29', author: 'Vante' }
  ]);

  // 菜谱详情编辑状态
  const [viewingMyRecipeDetail, setViewingMyRecipeDetail] = useState<any | null>(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState<boolean>(false);
  const [editingDetailName, setEditingDetailName] = useState('');
  const [editingDetailEmoji, setEditingDetailEmoji] = useState('🍲');

  // 防抖定时器Ref
  const prefSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSyncRef = useRef(true);

  /**
   * 偏好数据自动同步后端防抖副作用
   */
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    if (prefSaveTimerRef.current) {
      clearTimeout(prefSaveTimerRef.current);
    }
    prefSaveTimerRef.current = setTimeout(() => {
      const mergedAvoids = Array.from(new Set([
        ...forbiddenFoodsSelected,
        ...avoidTags,
        ...customAvoids,
      ]));

      const mergedAllergens = Array.from(new Set([
        ...allergens,
        ...customAllergens,
      ]));

      savePreferencesToServer({
        cookingLevel,
        tasteTendency,
        avoidIngredients: mergedAvoids,
        allergens: mergedAllergens,
        commonTools: [activePot].filter(Boolean),
        mealReminder,
        reminderTime,
      });
    }, 1000);

    return () => {
      if (prefSaveTimerRef.current) clearTimeout(prefSaveTimerRef.current);
    };
  }, [
    cookingLevel,
    tasteTendency,
    forbiddenFoodsSelected,
    avoidTags,
    customAvoids,
    allergens,
    customAllergens,
    mealReminder,
    reminderTime,
    activePot,
  ]);

  // 就餐提醒弹窗防重复标记
  const alertTriggeredRef = useRef(false);

  /**
   * 定时就餐提醒轮询副作用
   */
useEffect(() => {
  if (!mealReminder) {
    alertTriggeredRef.current = false;
    return;
  }

  // 页面加载时主动请求通知权限（用户首次会看到浏览器弹窗询问"是否允许通知"）
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  const timer = setInterval(() => {
    const now = new Date();
    const currentHrsMins = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (currentHrsMins === reminderTime) {
      if (!alertTriggeredRef.current) {
        // 优先用系统通知（电脑右下角弹窗，类似微信通知）
        if ('Notification' in window && Notification.permission === 'granted') {
          // 显示系统级通知（在网页外面，桌面右下角弹出）
          const notification = new Notification('🍽️ 识食物者就餐提醒', {
            body: `到达您设定的就餐时间 ${reminderTime} 啦！好好吃饭，元气满满！`,
            icon: '/favicon.ico',         // 通知图标（可选）
            tag: 'meal-reminder',          // 同 tag 的通知会替换不会堆积
            requireInteraction: false,     // false=自动消失，true=要手动关闭
          });

          // 点击通知时自动聚焦回浏览器窗口
          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // 5秒后自动关闭
          setTimeout(() => notification.close(), 5000);
        } else {
          // 用户拒绝通知权限，降级为浏览器弹窗
          alert(`识食物者就餐提醒：到达您设定的就餐时间 ${reminderTime} 啦！好好吃饭，元气满满！`);
        }
        alertTriggeredRef.current = true;
      }
    } else {
      alertTriggeredRef.current = false;
    }
  }, 30000);
  return () => clearInterval(timer);
}, [mealReminder, reminderTime]);

  // ⭐ 新增：登录弹窗控制
  const [showLoginModal, setShowLoginModal] = useState(false);
  // 当前登录用户信息解构
  const { user: currentUser } = useCurrentUser();

  // ============ 后端偏好配置钩子解构 ============
  const {
    preferences: serverPreferences,
    saveToServer: savePreferencesToServer,
  } = usePreferences();

  /**
   * 后端偏好数据同步到本地状态副作用
   */
  useEffect(() => {
    setCookingLevel(serverPreferences.cookingLevel);
    setTasteTendency(serverPreferences.tasteTendency);
    setForbiddenFoodsSelected(serverPreferences.avoidIngredients);
    setAllergens(serverPreferences.allergens);
    setMealReminder(serverPreferences.mealReminder);
    setReminderTime(serverPreferences.reminderTime);
  }, [serverPreferences]);

  // 个人资料基础信息状态
    // 个人资料基础信息状态
  // ⭐ 账号(account)：注册时定，只读，对应后端 userName
  // ⭐ 昵称(nickname)：可改，对应后端 nickName，用于显示给其他用户
  const [profileNickname, setProfileNickname] = useState('Vante');
  const [profileAccount, setProfileAccount] = useState('vante');
  const [profileBio, setProfileBio] = useState('识食物者为俊杰，今天也有好好吃饭！');
  const [profileRegion, setProfileRegion] = useState('吉林');
  const [profileConstellation, setProfileConstellation] = useState('天秤座');
  const [profileGender, setProfileGender] = useState('♀');
  const [profileAvatar, setProfileAvatar] = useState('🎒');

  // ============ 社区帖子互动逻辑钩子解构 ============
  const {
    socialPosts,
    setSocialPosts,
    filteredSocialPosts,
    activeSidebarFilter, setActiveSidebarFilter,
    communityFeedTab, setCommunityFeedTab,
    chosenPost, setChosenPost,
    viewingAuthorProfile, setViewingAuthorProfile,
    followedAuthors, setFollowedAuthors,
    currentUserCommentText, setCurrentUserCommentText,
    commentReplyText, setCommentReplyText,
    activeReplyCommentIdx, setActiveReplyCommentIdx,
    commentError,
    floatingHearts, setFloatingHearts,
    triggerHeartPop,
    handleSubmitComment,
    handleSubmitReply,
    togglePostLike,         // 新增
    togglePostCollect,      // 新增
    refreshPostList,        // 新增（可选，给"换一批"按钮）
    loadMorePosts,    // ⭐ 新增
    loadingMore,      // ⭐ 新增
    } = useCommunityActions({
    profileUsername: profileNickname,   // ⭐ 社区显示作者用昵称，hook 入参名不动避免改 hook
    searchQuery,
    showToast,
  });

  const myRecipes = useMyRecipesData();

  // ⭐ 游客操作统一拦截：只 Toast，不弹登录窗（首页除外）
  const guardGuest = (action: () => void, tipMessage?: string) => {
    if (currentUser.isGuest || !currentUser.isLogged) {
      showToast(tipMessage || '该功能需要登录后使用，请先登录或注册');
      return;
    }
    action();
  };

  /**
   * 登录用户信息同步到个人资料状态副作用
   */
  useEffect(() => {
    if (currentUser.isLogged) {
      setProfileNickname(currentUser.nickname);     // ⭐ 改：username → nickname
      setProfileAccount(currentUser.account);       // ⭐ 新增：账号同步
      setProfileBio(currentUser.bio);
      setProfileRegion(currentUser.region);
      setProfileConstellation(currentUser.constellation);
      setProfileGender(currentUser.gender);
      setProfileAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  useEffect(() => {
  if (!storage.getToken()) return;
  userApi.getProfileStats()
    .then((res) => {
      if (res.data) setProfileStats(res.data as any);
    })
    .catch((err) => console.warn('[App] 拉个人统计失败', err));
}, [activeTab]);  // 切到 profile tab 时重新拉

  /**
   * 调试面板预设快速跳转页面方法
   */
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
        setActiveCookingStepIndex(1);
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
        setChosenPost(null)
        setActiveSidebarFilter('all')
        break;
      case 'module6-post-detail':
        setActiveTab('community');
        setChosenPost(socialPosts[1])
        break;
      case 'module6-publish':
        setActiveTab('community');
        setChosenPost(null)
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
        setRecipeTabMode('published');
        break;
      case 'module7-cook-history':
        setActiveTab('profile');
        setActiveProfileTabGroup('main');
        showToast('已在"个人中心主页"为您激活烹饪熟练度（12道菜）和历史获赞（512次）等烹饪历史统计！');
        break;
      case 'module7-account-settings':
        setActiveTab('profile');
        setActiveProfileTabGroup('preferences');
        showToast('已在偏好设置下方展示账号选项、基础提示级别及厨房等级设置！');
        break;
      default:
        break;
    }
  };
    // ============================================================
    // 把草稿/原创食谱补全成详情页能用的格式（防止点烹饪空白）
    // ============================================================
    const normalizeRecipeForDetail = (card: any) => ({
      id: card.id,
      name: card.title || card.name || '未命名食谱',
      title: card.title || card.name || '未命名食谱',
      emoji: card.emoji || card.coverEmoji || '🥘',
      coverEmoji: card.emoji || card.coverEmoji || '🥘',
      image: card.image || null,
      difficulty: card.difficulty || '普通',
      duration: card.duration || 15,
      calories: card.calories || 300,
      steps: card.steps || card.body || card.note || card.caption || '暂无步骤说明，快去补充吧！',
      ingredients: card.ingredients || [],
      tags: card.tags || [],
      stars: card.stars || 0,
      ...card,
    }); 
    
    const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
    const [editingRecipeType, setEditingRecipeType] = useState<'original' | 'draft' | null>(null);

    const [profileStats, setProfileStats] = useState({
    cookingCount: 0,
    likeAndCollectCount: 0,
    followingCount: 0,
    followerCount: 0,
  });
    
    /**
   * 草稿帖子一键发布到社区方法
   */
  const handlePublishDraftPost = (draft: any) => {
    const fresh = {
      id: String(socialPosts.length + 1),
      author: profileNickname,
      avatar: profileAvatar,
      emoji: draft.emoji || '🌾🍲',
      title: draft.title || draft.name || '未命名草稿食谱',
      likes: 1,
      comments: [],
      isLiked: false,
      isSaved: false
    };
    setSocialPosts((prev) => [fresh, ...prev])
    setMyDraftPosts(prev => prev.filter(d => d.id !== draft.id));
    showToast('发布成功！已同步到社区广场，快去看看吧！');
  };

  // 关键：判断当前页面是否需要"撑满整个屏幕"
  // 满足以下任一条件就撑满：
  //   1. 当前在社区广场页（activeTab === 'community'）
  //   2. 当前在菜谱详情页（activeTab === 'eatwell' && subStep === 6）
  const isFullWidthPage =
    activeTab === 'community' ||
    (activeTab === 'eatwell' && subStep === 6);
    (activeTab === 'profile' && activeProfileTabGroup !== 'main');
    isCookingLogEditorPage; 

  // ====================== 页面DOM渲染开始 ======================
  return (
    // 全局最外层容器
    <div className="min-h-screen bg-[#333d29] flex flex-col select-none overflow-x-hidden">

      {/* 整体左右分栏工作区 */}
      <main className="w-full flex flex-col flex-1">        
        {/* 左侧调试预设面板 */}
        <InspectorPanel
          activeInspectorView={activeInspectorView}
          onSelectPreset={handleSelectInspectorPreset}
        />

        {/* 右侧模拟器主交互区域 */}
        <div className="flex flex-col flex-1 ">
          
          {/* 判断是否打开Vue代码导出面板 */}
          {isExporterPanelOpen ? (
            <VueExporterPanel onClose={() => setIsExporterPanelOpen(false)} />
          ) : (
            
            /* 手机模拟器外壳容器：淡绿色背景、纵向弹性布局、占满剩余高度 */
            <div className="bg-[#eaf6d9] overflow-hidden relative flex flex-col flex-1 min-h-screen pb-20">
              
              {/* ============================================================================
                   屏幕主内容渲染容器（核心改动！）
                  
                  改造前：
                    <div className="flex-1 p-6 relative flex flex-col w-full max-w-[1400px] mx-auto">
                    问题：所有页面都被强制限制最大宽度 1400px，并居中
                          → 社区广场、菜谱详情页内容贴不到屏幕边缘
                  
                  改造后：
                    根据上面定义的 isFullWidthPage 判断当前页面是否撑满
                    - isFullWidthPage 为 true（社区/菜谱详情）：
                        max-w-none  → 不限制宽度，撑满整个屏幕
                        px-4 py-6   → 左右仅 16px 小内边距，几乎贴边
                    - isFullWidthPage 为 false（其他页面）：
                        max-w-[1400px] → 保持原来 1400px 居中布局
                        p-6            → 保持原来 24px 内边距
                  ============================================================================ */}
              <div className={`flex-1 relative flex flex-col w-full mx-auto ${
                isFullWidthPage
                  ? 'max-w-none px-4 py-6'      //  撑满屏幕 + 小内边距（贴边）
                  : 'max-w-[1400px] p-6'        // 其他页面保持原状
              }`}>
                {/* 判断是否打开自定义发布编辑器 */}
                {isCustomPublishPage ? (                
                <CustomPublishPage
                  customPublishSource={customPublishSource}
                  customPublishTitle={customPublishTitle}
                  customPublishBody={customPublishBody}
                  customPublishEmoji={customPublishEmoji}
                  customPublishImages={customPublishImages}
                  customPublishTags={customPublishTags}
                  customPublishStars={customPublishStars}
                  customPublishImage={customPublishImage}
                  publishToCommunity={publishToCommunity}
                  publishToLogs={publishToLogs}
                  socialPosts={socialPosts}
                  cookingLogs={cookingLogs}
                  profileUsername={profileNickname}
                  profileAvatar={profileAvatar}
                  setCustomPublishTitle={setCustomPublishTitle}
                  setCustomPublishBody={setCustomPublishBody}
                  setCustomPublishEmoji={setCustomPublishEmoji}
                  setCustomPublishImages={setCustomPublishImages}
                  setCustomPublishTags={setCustomPublishTags}
                  setCustomPublishStars={setCustomPublishStars}
                  setSocialPosts={setSocialPosts}
                  setCookingLogs={setCookingLogs}
                  showToast={showToast}
                  setActiveTab={setActiveTab}
                  setActiveProfileTabGroup={setActiveProfileTabGroup}
                  setActiveSidebarFilter={setActiveSidebarFilter}

                  /*  新增 4 个 props */
                  editingRecipeId={editingRecipeId}
                  editingRecipeType={editingRecipeType}
                  setMyOriginalRecipes={setMyOriginalRecipes}
                  setMyDraftPosts={setMyDraftPosts}

                  /*  只保留这一个 onClose（合并后的版本） */
                  onClose={() => {
                    setIsCustomPublishPage(false);
                    setEditingRecipeId(null);
                    setEditingRecipeType(null);
                    setIsCookingLogEditorPage(false);
                    setEditingCookingLog(null);
                  }}
                />
                ) : (
                  <>
                    {/* EatWell模块顶部四步进度条（仅1-4分步展示） */}
                    {activeTab === 'eatwell' && subStep >= 1 && subStep <= 4 && (
                      <div className="max-w-[1500px] w-full mx-auto mb-4 bg-white/40 
                      backdrop-blur-md border border-white/60 rounded-full px-5 py-3 shadow-md relative overflow-hidden shrink-0 flex items-center justify-between">
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-[#8ca779]/20 rounded-full transition-all duration-300"
                          style={{ width: `${(subStep / 4) * 100}%` }}
                        ></div>
                        
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
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full 
                                transition-all text-base font-black md:text-[16px] cursor-pointer hover:scale-105 
                                active:scale-95 duration-200 ${
                                  isCurrent 
                                    ? 'bg-[#8ca779] text-white shadow-md' 
                                    : isPassed 
                                    ? 'text-[#36482c] hover:bg-[#8ca779]/10' 
                                    : 'text-stone-500 opacity-70 hover:opacity-100 hover:bg-stone-50/50'
                                }`}
                                title={`跳转至：${stepNum}. ${item.label}`}
                              >
                                <span className="text-[18px]" >{stepNum}. {item.label}</span>
                                <span className="text-[20px]" >{item.icon}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* EatWell页面左右全局切换箭头按钮 */}
                    {activeTab === 'eatwell' && (
                      <>
                        {/* 左箭头：上一步 */}
                        {subStep > 0 && subStep < 6 && (
                          <button
                            id="eatwell-slider-prev-arrow"
                            onClick={() => setSubStep(prev => Math.max(0, prev - 1))}
                            className="absolute -left-25 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 
                            bg-white/95 rounded-full border-2 border-stone-300 shadow-2xl flex 
                            items-center justify-center text-stone-700 font-serif text-xl md:text-2xl 
                            font-black hover:bg-white hover:scale-110 active:scale-95 transition-all 
                            z-40 cursor-pointer animate-pulse-subtle"
                            title="上一步/上一页"
                          >
                            &lt;
                          </button>
                        )}
                        {/* 右箭头：下一步 */}
                        {subStep < 6 && (
                          <button
                            id="eatwell-slider-next-arrow"
                            onClick={() => {
                              if (subStep < 5) {
                                setSubStep(prev => prev + 1);
                              } else {
                                if (!selectedResultsRecipeId) {
                                  showToast("请先选择列表中的菜谱，再进行烹饪哦！");
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
                            className="absolute -right-25 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 
                            bg-white/95 rounded-full border-2 border-stone-300 shadow-2xl flex items-center 
                            justify-center text-stone-700 font-serif text-xl md:text-2xl font-black hover:bg-white 
                            hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer animate-pulse-subtle"
                            title="下一步/下一页"
                          >
                            &gt;
                          </button>
                        )}
                      </>
                    )}

                    {/* EatWell 0分步：欢迎启动页 */}
                    {activeTab === 'eatwell' && subStep === 0 && (
                    <WelcomePage
                      onStart={() => setSubStep(1)}
                      onClickAnywhere={() => {
                        // ⭐ 已登录 OR 已选择游客模式 → 直接走正常流程
                        // 只有「完全没选过身份」的首次访问才弹登录注册
                        if (currentUser.isLogged || storage.isGuest()) {
                          setSubStep(1);
                        } else {
                          setShowLoginModal(true);
                        }
                      }}
                    />
                  )}

                    {/* EatWell 1/2/3分步：食材选择页面 */}
                    {activeTab === 'eatwell' && subStep >= 1 && subStep <= 3 && (
                      <FoodSelectorPage
                        subStep={subStep as 1 | 2 | 3}
                        setSubStep={setSubStep}
                        availableVeggiesFiltered={availableVeggiesFiltered}
                        availableMeatsFiltered={availableMeatsFiltered}
                        availableStaplesFiltered={availableStaplesFiltered}
                        selectedVeggies={selectedVeggies}
                        selectedMeats={selectedMeats}
                        selectedStaples={selectedStaples}
                        selectedListWithDetails={selectedListWithDetails}
                        selectedBasketCaloriesTotal={selectedBasketCaloriesTotal}
                        basketCount={basketCount}
                        forbiddenFoodsSelected={forbiddenFoodsSelected}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isBasketOpen={isBasketOpen}
                        setIsBasketOpen={setIsBasketOpen}
                        showClearConfirm={showClearConfirm}
                        setShowClearConfirm={setShowClearConfirm}
                        cartBadgePop={cartBadgePop}
                        handleToggleIngredient={handleToggleIngredient}
                        setSelectedVeggies={setSelectedVeggies}
                        setSelectedMeats={setSelectedMeats}
                        setSelectedStaples={setSelectedStaples}
                        setSelectionOrder={setSelectionOrder}
                        checkQueryRestrictions={checkQueryRestrictions}
                        showToast={showToast}
                      />
                    )}

                    {/* EatWell 4分步：锅具选择页面 */}
                    {activeTab === 'eatwell' && subStep === 4 && (
                      <PotSelectorPage
                        matchingMode={matchingMode}
                        setMatchingMode={setMatchingMode}
                        activePot={activePot}
                        setActivePot={setActivePot}
                        hasSelectedSideCookware={hasSelectedSideCookware}
                        setHasSelectedSideCookware={setHasSelectedSideCookware}
                        potScale={potScale}
                        setPotScale={setPotScale}
                        basketCount={basketCount}
                        selectedListWithDetails={selectedListWithDetails}
                        selectedBasketCaloriesTotal={selectedBasketCaloriesTotal}
                        cartBadgePop={cartBadgePop}
                        isBasketOpen={isBasketOpen}
                        setIsBasketOpen={setIsBasketOpen}
                        handleToggleIngredient={handleToggleIngredient}
                        setSelectedVeggies={setSelectedVeggies}
                        setSelectedMeats={setSelectedMeats}
                        setSelectedStaples={setSelectedStaples}
                        setSelectionOrder={setSelectionOrder}
                        setSubStep={setSubStep}
                        setShowNoIngredientsPopup={setShowNoIngredientsPopup}
                        showToast={showToast}
                      />
                    )}

                    {/* EatWell 5分步：菜谱推荐结果列表 */}
                    {activeTab === 'eatwell' && subStep === 5 && (
                      <RecipeResultPage
                        shownRecipeIds={shownRecipeIds}
                        matchedRecipes={matchedRecipes}
                        matchDegraded={matchDegraded}
                        matchingLoading={matchingLoading}
                        refetchMatchedRecipes={refetchMatchedRecipes}
                        starredRecipes={starredRecipes}
                        animatingStarId={animatingStarId}
                        selectedResultsRecipeId={selectedResultsRecipeId}
                        showMatchWarning={showMatchWarning}
                        potScale={potScale}
                        basketCount={basketCount}
                        setSelectedResultsRecipeId={setSelectedResultsRecipeId}
                        setStarredRecipes={setStarredRecipes}
                        setAnimatingStarId={setAnimatingStarId}
                        handleCycleReplaceRecipe={handleCycleReplaceRecipe}
                        setActiveRecipe={setActiveRecipe}
                        setRecipeDetailSource={setRecipeDetailSource}
                        setShowNoIngredientsPopup={setShowNoIngredientsPopup}
                        setSubStep={setSubStep}
                        setActiveCookingStepIndex={setActiveCookingStepIndex}
                        showToast={showToast}
                      />
                    )}

                    {/* ⭐ EatWell 6分步：菜谱分步烹饪详情（此页面会自动撑满整个屏幕） */}
                    {activeTab === 'eatwell' && subStep === 6 && activeRecipe && (
                      <RecipeDetailPage
                        recipe={activeRecipe}
                        potScale={potScale}
                        activeCookingStepIndex={activeCookingStepIndex}
                        recipeDetailSource={recipeDetailSource}
                        setActiveCookingStepIndex={setActiveCookingStepIndex}
                        setSubStep={setSubStep}
                        setActiveTab={setActiveTab}
                        setInspirationSubView={setInspirationSubView}
                        setShowCongratsSuccess={setShowCongratsSuccess}
                        setShowRecipeSharePopup={setShowRecipeSharePopup}
                        setShowWXQRCode={setShowWXQRCode}
                      />
                    )}

                    {/* 灵感菜谱生成页面 */}
                    {activeTab === 'inspiration' && (
                      <InspirationPage
                        inspirationSubView={inspirationSubView}
                        setInspirationSubView={setInspirationSubView}
                        inspirationSearchQuery={inspirationSearchQuery}
                        setInspirationSearchQuery={setInspirationSearchQuery}
                        starredRecipes={starredRecipes}
                        setStarredRecipes={setStarredRecipes}
                        inspirationCount={inspirationCount}
                        setInspirationCount={setInspirationCount}
                        randomizedRecipes={randomizedRecipes}
                        isSpinning={isSpinning}
                        isGenerated={isGenerated}
                        setIsGenerated={setIsGenerated}
                        setRandomizedRecipes={setRandomizedRecipes}
                        aggregatedRandomNutrition={aggregatedRandomNutrition}
                        forbiddenFoodsSelected={forbiddenFoodsSelected}
                        handleSpinInspiration={handleSpinInspiration}
                        handleRefreshSingleInspiration={handleRefreshSingleInspiration}
                        checkQueryRestrictions={checkQueryRestrictions}
                        checkTastePreferenceRestrictions={checkTastePreferenceRestrictions}
                        setActiveRecipe={setActiveRecipe}
                        setRecipeDetailSource={setRecipeDetailSource}
                        setSubStep={setSubStep}
                        setActiveCookingStepIndex={setActiveCookingStepIndex}
                        setActiveTab={setActiveTab}
                        setFloatingHearts={setFloatingHearts}
                        cookingLevel={cookingLevel}
                        showToast={showToast}
                      />
                    )}

                    {/* ⭐ 社区广场页面（此页面会自动撑满整个屏幕） */}
                    {activeTab === 'community' && (
                      <CommunityPage
                        socialPosts={socialPosts}
                        filteredSocialPosts={filteredSocialPosts}
                        forbiddenFoodsSelected={forbiddenFoodsSelected}
                        followedAuthors={followedAuthors}
                        profileUsername={profileNickname}
                        profileAvatar={profileAvatar}
                        profileBio={profileBio}
                        activeSidebarFilter={activeSidebarFilter}
                        setActiveSidebarFilter={setActiveSidebarFilter}
                        communityFeedTab={communityFeedTab}
                        setCommunityFeedTab={setCommunityFeedTab}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setSocialPosts={setSocialPosts}
                        setChosenPost={setChosenPost}
                        setViewingAuthorProfile={setViewingAuthorProfile}
                        showToast={showToast}
                        togglePostLike={(postId) => guardGuest(() => togglePostLike(postId), '点赞功能需要登录后使用，请先登录或注册')}
                        refreshPostList={refreshPostList}
                        loadMorePosts={loadMorePosts}     // ⭐ 新增
                        loadingMore={loadingMore}         // ⭐ 新增
                        onOpenPublishPage={() => {
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
                      />
                    )}

                    {/* 个人中心主页 */}
                    {activeTab === 'profile' && activeProfileTabGroup === 'main' && (
                    <ProfileMainPage
                      profileNickname={profileNickname}
                      profileAccount={profileAccount}
                      profileBio={currentUser.isGuest ? '' : profileBio}
                      profileAvatar={profileAvatar}
                      cookingLogsCount={currentUser.isGuest ? 0 : cookingLogs.length}
                      myOriginalRecipesCount={currentUser.isGuest ? 0 : myOriginalRecipes.length}
                      starredRecipesCount={currentUser.isGuest ? 0 : starredRecipes.length}
                      myDraftPostsCount={currentUser.isGuest ? 0 : myDraftPosts.length}
                      likeAndCollectCount={profileStats.likeAndCollectCount}
                      followingCount={profileStats.followingCount}
                      followerCount={profileStats.followerCount}
                        onGoRecipes={() => {
                          setActiveProfileTabGroup('recipes');
                          myRecipes.refresh.all();
                        }}
                        onGoPreferences={() => setActiveProfileTabGroup('preferences')}
                        onGoStatistics={() => setActiveProfileTabGroup('statistics')}
                        onGoCookingLogs={() => setActiveProfileTabGroup('cooking_logs')}
                        onGoAccountSettings={() => setActiveProfileTabGroup('account_settings')}
                        isGuest={currentUser.isGuest}
                        onShowLogin={() => setShowLoginModal(true)}
                      />
                    )}

                    {/* 我的菜谱页面 */}
                    {activeTab === 'profile' && activeProfileTabGroup === 'recipes' && (
                    <MyRecipesPage
                      publishedPosts={myRecipes.publishedPosts}
                      savedPosts={myRecipes.savedPosts}
                      drafts={myRecipes.drafts}
                      savedRecipes={myRecipes.savedRecipes}

                      refreshPublished={myRecipes.refresh.published}
                      refreshSavedPosts={myRecipes.refresh.savedPosts}
                      refreshDrafts={myRecipes.refresh.drafts}
                      refreshSavedRecipes={myRecipes.refresh.savedRecipes}

                      recipeTabMode={recipeTabMode}
                      setRecipeTabMode={setRecipeTabMode}

                      /* 帖子卡片点开 → 复用社区的 PostDetailModal */
                      onOpenPost={(post) => {
                        setChosenPost(post);
                      }}

                      /* 菜谱卡片点开 → 复用 RecipeDetailOverlay */
                      onOpenRecipe={(recipe) => {
                        setViewingMyRecipeDetail(normalizeRecipeForDetail(recipe));
                      }}

                      /* 草稿编辑 → 跳发布工坊 */
                      onEditDraft={(card) => {
                        setCustomPublishTitle(card.title || '');
                        setCustomPublishBody(card.caption || '');
                        setCustomPublishEmoji(card.coverEmoji || card.emoji || '🥘');
                        setCustomPublishImages(() => card.image ? [card.image] : []);
                        setCustomPublishTags(() => card.tags || []);
                        setCustomPublishStars(card.stars || 5);
                        setCustomPublishSource('community');

                        setEditingRecipeId(card.id);
                        setEditingRecipeType('draft');

                        setIsCustomPublishPage(true);
                      }}

                      onBack={() => setActiveProfileTabGroup('main')}
                      showToast={showToast}
                    />
                  )}

                    {/* 口味忌口偏好设置页面 */}
                    {activeTab === 'profile' && activeProfileTabGroup === 'preferences' && (
                      <PreferencesPage
                        cookingLevel={cookingLevel}
                        setCookingLevel={setCookingLevel}
                        tasteTendency={tasteTendency}
                        setTasteTendency={setTasteTendency}
                        avoidTags={avoidTags}
                        setAvoidTags={setAvoidTags}
                        customAvoids={customAvoids}
                        setCustomAvoids={setCustomAvoids}
                        avoidSearchText={avoidSearchText}
                        setAvoidSearchText={setAvoidSearchText}
                        allergens={allergens}
                        setAllergens={setAllergens}
                        customAllergens={customAllergens}
                        setCustomAllergens={setCustomAllergens}
                        allergenSearchText={allergenSearchText}
                        setAllergenSearchText={setAllergenSearchText}
                        mealReminder={mealReminder}
                        setMealReminder={setMealReminder}
                        reminderTime={reminderTime}
                        setReminderTime={setReminderTime}
                        onBack={() => setActiveProfileTabGroup('main')}
                        showToast={showToast}
                      />
                    )}

                    {/* 烹饪数据统计页面 */}
                    {activeTab === 'profile' && activeProfileTabGroup === 'statistics' && (
                      <StatisticsPage
                        onBack={() => setActiveProfileTabGroup('main')}
                      />
                    )}

                      {/* 烹饪打卡日志列表页面 */}
                      {activeTab === 'profile' && activeProfileTabGroup === 'cooking_logs' && !isCookingLogEditorPage && (
                        <CookingLogsPage
                          cookingLogs={cookingLogs}
                          onBack={() => setActiveProfileTabGroup('main')}
                          /* 新建：打开独立编辑界面 */
                          onOpenPublishLog={() => {
                            setEditingCookingLog(null);
                            setIsCookingLogEditorPage(true);
                          }}
                          /* 编辑：把当前 log 传进去 */
                          onClickManualLog={(log) => {
                            setViewingCookingLog(log);
                          }}
                        />
                      )}

                      {/* 独立编辑界面渲染：必须在 个人中心 > 烹饪记录 子tab 下 */}
                      {activeTab === 'profile' && activeProfileTabGroup === 'cooking_logs' && isCookingLogEditorPage && (
                        <CookingLogEditorPage
                          editingLog={editingCookingLog}
                          cookingLogs={cookingLogs}
                          addCookingLog={addCookingLog}
                          updateCookingLog={updateCookingLog}
                          setCookingLogs={setCookingLogs}
                          onClose={() => {
                            setIsCookingLogEditorPage(false);
                            setEditingCookingLog(null);
                          }}
                          showToast={showToast}
                        />
                      )}

                    {/* 账号密码基础设置页面 */}
                    {activeTab === 'profile' && activeProfileTabGroup === 'account_settings' && (
                      <AccountSettingsPage
                        profileNickname={profileNickname}
                        profileAccount={profileAccount}
                        profileBio={profileBio}
                        profileAvatar={profileAvatar}
                        setProfileNickname={setProfileNickname}
                        setProfileBio={setProfileBio}
                        setProfileAvatar={setProfileAvatar}
                        onBack={() => setActiveProfileTabGroup('main')}
                        showToast={showToast}
                        onRequestLogout={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: '确定要退出登录吗？',
                            message: '退出后将返回到登录页，您可重新登录或以游客身份继续浏览。',
                            onConfirm: () => {
                              import('./api').then(({ authApi, storage }) => {
                                authApi.logout();
                                storage.clearAll();  // 清干净所有缓存（包括游客标记）
                                window.location.reload();
                              });
                            }
                          });
                        }}
                      />
                    )}
                  </>
                )}

              </div>

              {/* 底部四大模块导航栏 */}
              <BottomTabBar
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                onResetSubStep={() => setSubStep(0)}
                onResetInspirationCount={() => setInspirationCount(3)}
                onResetCommunityFilter={() => setActiveSidebarFilter('all')}
                onResetProfileTab={() => setActiveProfileTabGroup('main')}
              />

              {/* 个人原创菜谱详情浮层弹窗 */}
              <RecipeDetailOverlay
                detail={viewingMyRecipeDetail}
                isEditing={isEditingInDetail}
                editingName={editingDetailName}
                editingEmoji={editingDetailEmoji}
                setIsEditing={setIsEditingInDetail}
                setEditingName={setEditingDetailName}
                setEditingEmoji={setEditingDetailEmoji}
                setMyOriginalRecipes={setMyOriginalRecipes}
                setMyDraftRecipes={setMyDraftRecipes}
                setDetail={setViewingMyRecipeDetail}
                onCookNow={() => {
                  setActiveRecipe(viewingMyRecipeDetail);
                  setRecipeDetailSource('profile_starred');
                  setSubStep(6);
                  setActiveCookingStepIndex(0);
                  setActiveTab('eatwell');
                  setViewingMyRecipeDetail(null);
                }}
                onClose={() => {
                  setViewingMyRecipeDetail(null);
                  setIsEditingInDetail(false);
                }}
              />

              <PostDetailModal
                post={chosenPost && (activeTab === 'community' || activeTab === 'profile')? chosenPost : null}
                followedAuthors={followedAuthors}
                floatingHearts={floatingHearts}
                currentUserCommentText={currentUserCommentText}
                commentReplyText={commentReplyText}
                activeReplyCommentIdx={activeReplyCommentIdx}
                commentError={commentError}
                profileUsername={profileNickname}
                setSocialPosts={setSocialPosts}
                setChosenPost={setChosenPost}
                setFollowedAuthors={setFollowedAuthors}
                setCurrentUserCommentText={setCurrentUserCommentText}
                setCommentReplyText={setCommentReplyText}
                setActiveReplyCommentIdx={setActiveReplyCommentIdx}
                setViewingAuthorProfile={setViewingAuthorProfile}
                triggerHeartPop={triggerHeartPop}
                handleSubmitComment={handleSubmitComment}
                handleSubmitReply={handleSubmitReply}
                togglePostLike={(postId) => guardGuest(() => togglePostLike(postId), '点赞功能需要登录后使用，请先登录或注册')}
                togglePostCollect={(postId) => guardGuest(() => togglePostCollect(postId), '收藏功能需要登录后使用，请先登录或注册')}
                onClose={() => setChosenPost(null)}
              />

                <CongratsModal
                  isOpen={showCongratsSuccess && !!activeRecipe}
                  recipeName={activeRecipe?.name || ''}
                  onBackHome={() => {
                    /* ⭐ 写入烹饪记录（标记 fromRecipe: true） */
                    if (activeRecipe) {
                      const today = new Date().toISOString().slice(0, 10);
                      const newLog: any = {
                        id: `recipe-${activeRecipe.id}-${Date.now()}`,
                        name: activeRecipe.name,
                        date: today,
                        stars: 5,
                        note: `完成菜谱：${activeRecipe.name}`,
                        emoji: activeRecipe.coverEmoji || '🥘',
                        duration: activeRecipe.time || 15,
                        fromRecipe: true,         // ⭐ 关键标记
                        recipeId: activeRecipe.id,
                      };
                      addCookingLog(newLog);
                    }

                    setSubStep(1);
                    setActiveRecipe(null);
                    setShowCongratsSuccess(false);
                    setActiveCookingStepIndex(0);
                  }}
                  onStayHere={() => {
                    /* ⭐ 同样在停留页时也写入 */
                    if (activeRecipe) {
                      const today = new Date().toISOString().slice(0, 10);
                      const newLog: any = {
                        id: `recipe-${activeRecipe.id}-${Date.now()}`,
                        name: activeRecipe.name,
                        date: today,
                        stars: 5,
                        note: `完成菜谱：${activeRecipe.name}`,
                        emoji: activeRecipe.coverEmoji || '🥘',
                        duration: activeRecipe.time || 15,
                        fromRecipe: true,
                        recipeId: activeRecipe.id,
                      };
                      addCookingLog(newLog);
                    }

                    setShowCongratsSuccess(false);
                    setSubStep(5);
                  }}
                />

              <AuthorProfileModal
                authorProfile={viewingAuthorProfile}
                followedAuthors={followedAuthors}
                setFollowedAuthors={setFollowedAuthors}
                onClose={() => setViewingAuthorProfile(null)}
                onSelectPost={(post) => {
                  setChosenPost(post);
                  setViewingAuthorProfile(null);
                }}
              />

              <RecipeShareModal
                isOpen={showRecipeSharePopup && !!activeRecipe}
                recipeName={activeRecipe?.name || ''}
                recipeId={activeRecipe?.id || ''}
                recipeProtein={activeRecipe?.protein || 0}
                recipeCarbs={activeRecipe?.carbohydrates || 0}
                recipeFat={activeRecipe?.fat || 0}
                recipeCalories={activeRecipe?.calories || 0}
                recipeCoverEmoji={activeRecipe?.coverEmoji || '🥘'}
                showWXQRCode={showWXQRCode}
                setShowWXQRCode={setShowWXQRCode}
                onClose={() => {
                  setShowRecipeSharePopup(false);
                  setShowWXQRCode(false);
                }}
                showToast={showToast}
                onSelectCommunityShare={() => {
                  if (!activeRecipe) return;
                  setCustomPublishTitle(`识食物者甄选推荐：【${activeRecipe.name}】美味食谱分享！`);
                  setCustomPublishBody(`给大家分享一道我刚出锅的【${activeRecipe.name}】！配方比例非常赞：
                  蛋白质 ${activeRecipe.protein}g / 碳水 ${activeRecipe.carbohydrates}g / 脂肪 ${activeRecipe.fat}g，能量值 ${activeRecipe.calories}千卡。
                  健康评测得分极佳，强烈安利大家跟着烹饪指南试一下！`);
                  setCustomPublishEmoji(activeRecipe.coverEmoji || '🥘');
                  setIsCustomPublishPage(true);
                  setShowRecipeSharePopup(false);
                  setShowWXQRCode(false);
                  setActiveTab('community');
                  showToast('成功为您生成配方并生成配图草稿！请在右侧继续您的帖子编辑吧～');
                }}
              />

              <NoIngredientsModal
              isOpen={showNoIngredientsPopup}
              onClose={() => setShowNoIngredientsPopup(false)}
              onProceed={() => {
                // "直接去烹饪"：关闭弹窗 + 直接进详情页
                setShowNoIngredientsPopup(false);
                setSubStep(6);
                setActiveCookingStepIndex(0);
                showToast('已跳转到菜谱详情，尽情烹饪吧！');
              }}
              onGoBack={() => {
                setShowNoIngredientsPopup(false);
                setSubStep(1);
              }}
            />

              <CookingLogEditModal
                isOpen={isEditingLogDetail}
                log={selectedLogDetail}
                tempLogName={tempLogName}
                tempLogStars={tempLogStars}
                tempLogNote={tempLogNote}
                setTempLogName={setTempLogName}
                setTempLogStars={setTempLogStars}
                setTempLogNote={setTempLogNote}
                onClose={closeLogEdit}
                onSave={() => {
                  saveLogEdit();
                  showToast('烹饪记录已实时更新');
                }}
                onDelete={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: '确定要删除记录吗？',
                    message: '提示：确定要删除这条打卡记录吗？',
                    onConfirm: () => {
                      deleteLog();
                      showToast('已成功移除这条历史。');
                    }
                  });
                }}
              />
              {/* 烹饪记录查看弹窗：点击列表先弹出，再点编辑跳编辑界面 */}
              <CookingLogViewerModal
                log={viewingCookingLog}
                onClose={() => setViewingCookingLog(null)}
                onEdit={() => {
                  /* 点编辑：把这条 log 传给编辑器，关闭查看弹窗 */
                  setEditingCookingLog(viewingCookingLog);
                  setViewingCookingLog(null);
                  setIsCookingLogEditorPage(true);
                }}
                onDelete={() => {
                  if (!viewingCookingLog) return;
                  setConfirmModal({
                    isOpen: true,
                    title: '确定要删除这条烹饪记录吗？',
                    message: '删除后将无法恢复，请谨慎操作。',
                    onConfirm: () => {
                      setCookingLogs((prev) => prev.filter((l) => l.id !== viewingCookingLog.id));
                      setViewingCookingLog(null);
                      showToast('烹饪记录已删除');
                    },
                  });
                }}
              />

              {/* ⭐ 游客/未登录时的登录注册弹窗（弹窗模式：只保留卡片，去掉外围背景装饰） */}
              {showLoginModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="relative w-full max-w-xl mx-4 bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <button
                      onClick={() => setShowLoginModal(false)}
                      className="absolute top-3 right-3 z-20 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-500 hover:text-stone-800 font-black text-lg cursor-pointer border border-stone-200"
                    >
                      ✕
                    </button>
                    <LoginPage
                      isModalMode
                      onLoginSuccess={() => {
                        setShowLoginModal(false);
                        if (activeTab === 'eatwell' && subStep === 0) {
                          setSubStep(1);
                        }
                        window.location.reload();
                      }}
                      onGoGuest={() => {
                        // ⭐ 弹窗内点游客 → 关闭弹窗，并标记游客模式，避免再次弹出
                        storage.setGuestMode();
                        setShowLoginModal(false);
                      }}
                    />
                  </div>
                </div>
              )}
              <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
              />
              <GlobalToast message={toastMessage} />
              <FlyingItemLayer items={flyingItems} />

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

// ====================================================
// 登录守卫包装层 - 独立于 App 组件，保证 Hooks 规则
// ====================================================
export default function AppWithAuth() {
  const [hasIdentity, setHasIdentity] = useState<boolean>(() => {
    const token = localStorage.getItem('shi2wuzhe_token');
    const guest = localStorage.getItem('shi2wuzhe_guest_mode');
    console.log('[AppWithAuth] 启动身份判断:', { token: !!token, guest });
    return !!token || guest === '1';
  });

  if (!hasIdentity) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          console.log('🟢 登录成功');
          localStorage.removeItem('shi2wuzhe_guest_mode');
          setHasIdentity(true);
        }}
        onGoGuest={() => {
          console.log('🟢 游客模式');
          localStorage.setItem('shi2wuzhe_guest_mode', '1');
          setHasIdentity(true);
        }}
      />
    );
  }

  return <App />;
}
