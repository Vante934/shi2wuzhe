import { Heart, Sparkles, FileEdit, Bookmark } from 'lucide-react';
import { communityApi, recipeApi } from '../../api';
import type { SocialPost, Recipe } from '../../types';

type RecipeTabMode = 'published' | 'savedPosts' | 'drafts' | 'savedRecipes';

interface MyRecipesPageProps {
  /* 4 个 tab 的数据 */
  publishedPosts: SocialPost[];
  savedPosts: SocialPost[];
  drafts: SocialPost[];
  savedRecipes: Recipe[];

  /* 刷新 */
  refreshPublished: () => void;
  refreshSavedPosts: () => void;
  refreshDrafts: () => void;
  refreshSavedRecipes: () => void;

  /* 当前 tab */
  recipeTabMode: RecipeTabMode;
  setRecipeTabMode: (m: RecipeTabMode) => void;

  /* 打开帖子详情（4 个 tab 里前 3 个都是帖子，可用 PostDetailModal） */
  onOpenPost: (post: SocialPost) => void;
  /* 打开菜谱详情（食谱收藏用） */
  onOpenRecipe: (recipe: Recipe) => void;

  /* 编辑草稿 */
  onEditDraft: (post: SocialPost) => void;

  onBack: () => void;
  showToast: (msg: string) => void;
}

export default function MyRecipesPage({
  publishedPosts, savedPosts, drafts, savedRecipes,
  refreshPublished, refreshSavedPosts, refreshDrafts, refreshSavedRecipes,
  recipeTabMode, setRecipeTabMode,
  onOpenPost, onOpenRecipe, onEditDraft,
  onBack, showToast,
}: MyRecipesPageProps) {

  // ===== 当前 tab 的数据 + 渲染规则 =====
  let listToRender: any[] = [];
  if (recipeTabMode === 'published') listToRender = publishedPosts;
  else if (recipeTabMode === 'savedPosts') listToRender = savedPosts;
  else if (recipeTabMode === 'drafts') listToRender = drafts;
  else listToRender = savedRecipes;

  const getEmptyText = () => {
    if (recipeTabMode === 'published') return '暂无原创发布，去社区发一条吧';
    if (recipeTabMode === 'savedPosts') return '暂无社区收藏，去社区收藏喜欢的帖子吧';
    if (recipeTabMode === 'drafts') return '暂无草稿，发布工坊里编辑一半的内容会出现在这里';
    return '暂无收藏食谱，菜谱详情页点击收藏后会出现在这里';
  };

  const TabBtn = ({ id, label, icon, count }: any) => (
    <button
      onClick={() => {
        setRecipeTabMode(id);
        // 切 tab 时刷新对应数据
        if (id === 'published') refreshPublished();
        else if (id === 'savedPosts') refreshSavedPosts();
        else if (id === 'drafts') refreshDrafts();
        else if (id === 'savedRecipes') refreshSavedRecipes();
      }}
      className={`flex-1 py-3 text-base font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
        recipeTabMode === id ? 'bg-brand-green text-white shadow-sm' : 'text-stone-600 hover:text-stone-850'
      }`}
    >
      {icon}
      <span>{label}{typeof count === 'number' ? ` (${count})` : ''}</span>
    </button>
  );
  
  // ===== 删除/取消收藏：4 个 tab 4 种逻辑 =====
  const handleRemove = async (item: any) => {
    try {
      if (recipeTabMode === 'published') {
        await communityApi.deletePost(item.id);
        showToast('已删除');
        refreshPublished();
      } else if (recipeTabMode === 'drafts') {
        await communityApi.deletePost(item.id);
        showToast('草稿已删除');
        refreshDrafts();
      } else if (recipeTabMode === 'savedPosts') {
        await communityApi.collectPost(Number(item.id));
        showToast('已取消收藏');
        refreshSavedPosts();
      } else if (recipeTabMode === 'savedRecipes') {
        await recipeApi.toggleCollect(item.id);
        showToast('已取消收藏');
        refreshSavedRecipes();
      }
    } catch (err) {
      console.error('删除/取消收藏失败', err);
      showToast('操作失败');
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full text-left overflow-hidden">

      {/* 顶部栏 */}
      <div className="relative flex items-center justify-center mb-6 shrink-0 mt-2">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-sm bg-white text-stone-600 rounded-xl hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
        >
          ← 返回
        </button>
        <span className="text-xl font-black text-stone-850">我的食谱</span>
      </div>

      {/* 4 栏 Tab */}
      <div className="flex bg-[#a2c28f]/10 border border-brand-green/30 rounded-2xl overflow-hidden max-w-[860px] w-full mx-auto mb-6 shadow-sm shrink-0">
        <TabBtn id="published"    label="原创发布" icon={<Sparkles className="w-4 h-4" />} count={publishedPosts.length} />
        <TabBtn id="savedPosts"   label="社区收藏" icon={<Heart className="w-4 h-4" />}    count={savedPosts.length} />
        <TabBtn id="drafts"       label="草稿箱"   icon={<FileEdit className="w-4 h-4" />} count={drafts.length} />
        <TabBtn id="savedRecipes" label="食谱收藏" icon={<Bookmark className="w-4 h-4" />} count={savedRecipes.length} />
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-2">
        {listToRender.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center select-none">
            <p className="text-base text-stone-400 font-bold px-6 leading-relaxed text-center">
              {getEmptyText()}
            </p>
          </div>
        ) : (
          <div className="columns-3 lg:columns-4 gap-5 text-left">
            {listToRender.map((card, cardIdx) => {
              const heightClass = cardIdx % 3 === 0 ? 'h-56' : cardIdx % 2 === 0 ? 'h-64' : 'h-60';
              const isRecipeTab = recipeTabMode === 'savedRecipes';
              const finalName = card.title || card.name || '未命名';
              const finalEmoji = card.coverEmoji || card.emoji || '🥘';
              const cover = card.image;

              const tabLabel =
                recipeTabMode === 'published' ? '原创' :
                recipeTabMode === 'savedPosts' ? '已收藏' :
                recipeTabMode === 'drafts' ? '草稿' : '已收藏';

              return (
                <div
                  key={card.id || `card-${cardIdx}`}
                  onClick={() => {
                    if (isRecipeTab) onOpenRecipe(card);
                    else onOpenPost(card);
                  }}
                  className="break-inside-avoid bg-white border border-stone-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group shadow-sm font-sans mb-5"
                >
                  <div className={`w-full ${heightClass} bg-gradient-to-br from-[#eff7e8]/30 to-[#f6f8f5]/40 group-hover:from-[#f3f9ee]/60 relative overflow-hidden flex flex-col items-center justify-center border-b`}>
                    {cover ? (
                      <img src={cover} alt={finalName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm select-none">{finalEmoji}</span>
                    )}
                    <span className="absolute top-3 left-3 bg-stone-900/40 backdrop-blur-xs text-white text-[10px] font-mono font-black px-2.5 py-1 rounded-full">
                      # {tabLabel}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 text-left font-sans">
                    <h4 className="text-[14px] font-extrabold text-[#3a4730] line-clamp-2 leading-tight group-hover:text-[#5d7350] transition-colors">
                      {finalName}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] border-t border-dashed border-[#eff7e8] pt-2.5 shrink-0 font-sans gap-1">

                      {recipeTabMode === 'drafts' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditDraft(card); }}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-extrabold px-2.5 py-1 rounded-full text-[13px] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(card); }}
                            className="text-red-400 hover:text-red-700 font-bold cursor-pointer text-[12px]"
                          >
                            删除
                          </button>
                        </>
                      )}

                      {recipeTabMode === 'published' && (
                        <>
                          <span className="text-stone-400 font-semibold text-[12px]">点击查看详情</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(card); }}
                            className="text-red-400 hover:text-red-700 font-bold cursor-pointer text-[12px]"
                          >
                            删除
                          </button>
                        </>
                      )}

                      {recipeTabMode === 'savedPosts' && (
                        <>
                          <span className="text-stone-400 font-semibold text-[12px]">点击查看详情</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(card); }}
                            className="text-red-400 hover:text-red-700 font-bold cursor-pointer text-[12px]"
                          >
                            取消收藏
                          </button>
                        </>
                      )}

                      {recipeTabMode === 'savedRecipes' && (
                        <>
                          <span className="text-stone-400 font-semibold text-[12px]">点击查看详情</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(card); }}
                            className="text-red-400 hover:text-red-700 font-bold cursor-pointer text-[12px]"
                          >
                            取消收藏
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}