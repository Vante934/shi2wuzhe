import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, History, RefreshCw, Sparkles, Check, ChevronRight, Ban, Award, Zap, HeartPulse } from 'lucide-react';
import { ScanItem } from '../types';

interface ScanHistoryEntry {
  id: string;
  date: string;
  name: string;
  image: string;
  calories: number;
  healthScore: number;
  items: ScanItem[];
}

const INITIAL_HISTORY: ScanHistoryEntry[] = [
  {
    id: 'h1',
    date: '昨天 12:30',
    name: '经典胡萝卜牛肉滑蛋饭',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    calories: 520,
    healthScore: 8.5,
    items: [
      { name: '胡萝卜丁', weight: 80, calories: 32 },
      { name: '牛里脊片', weight: 150, calories: 159 },
      { name: '滑熟鸡蛋', weight: 120, calories: 171 },
      { name: '白米饭底', weight: 130, calories: 150 }
    ]
  },
  {
    id: 'h2',
    date: '前天 08:15',
    name: '鳕鱼熟燕麦浓汤',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    calories: 257,
    healthScore: 9.6,
    items: [
      { name: '银鳕鱼排', weight: 100, calories: 105 },
      { name: '熟燕麦片', weight: 80, calories: 120 },
      { name: '绿青豆仁', weight: 40, calories: 32 }
    ]
  }
];

const PRESET_MOCK_PHOTOS = [
  {
    id: 'p1',
    name: '牛排杂蔬彩椒钵 (极佳低碳手选)',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    items: [
      { name: '小排牛排肉', weight: 180, calories: 236 },
      { name: '西红柿小果', weight: 100, calories: 22 },
      { name: '鲜甜西兰花', weight: 120, calories: 41 },
      { name: '爽甜黄彩椒', weight: 70, calories: 18 }
    ],
    glIndex: 2.2,
    healthScore: 9.4
  },
  {
    id: 'p2',
    name: '番茄肥牛排骨杂烩汤 (高能量滋补)',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    items: [
      { name: '肥五花肥牛', weight: 130, calories: 320 },
      { name: '酱小排骨肉', weight: 120, calories: 278 },
      { name: '多汁粉番茄', weight: 150, calories: 33 },
      { name: '鲜香冬菇厚片', weight: 60, calories: 16 }
    ],
    glIndex: 4.1,
    healthScore: 7.9
  },
  {
    id: 'p3',
    name: '鲜虾捞香菇秋葵减脂面 (轻盈卡路里)',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
    items: [
      { name: '大沼熟虾仁', weight: 100, calories: 93 },
      { name: '爽滑鲜秋葵', weight: 90, calories: 33 },
      { name: '高膳食手擀面', weight: 100, calories: 140 },
      { name: '脆香香菇块', weight: 50, calories: 13 }
    ],
    glIndex: 3.5,
    healthScore: 9.7
  }
];

export default function ScanTab() {
  const [scanStep, setScanStep] = useState<number>(0); // 0 setup chooser, 1 scan pending, 2 results report
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  
  // Scanned information reports
  const [chosenImage, setChosenImage] = useState<string>('');
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [detectedItems, setDetectedItems] = useState<ScanItem[]>([]);
  const [glValue, setGlValue] = useState<number>(3.0);
  const [scoreValue, setScoreValue] = useState<number>(8.5);

  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>(INITIAL_HISTORY);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loaderMessage, setLoaderMessage] = useState<string>('正在定位菜盘...');

  // Running mock visual loaders during step 1
  useEffect(() => {
    if (scanStep !== 1) return;

    setProgressPercent(0);
    const logs = [
      { p: 15, m: '📸 正在识取画面主体特征与边缘像素...' },
      { p: 35, m: '🧩 智能提取食物质地、色泽与色彩多维特征...' },
      { p: 55, m: '⚖️ 正在估算实物体积并套用克重质量估计算法...' },
      { p: 75, m: '📊 正在进行GL血糖负荷计算与配比评估...' },
      { p: 90, m: '✨ 正在计算综合膳食多样性健康评分...' },
      { p: 100, m: '✅ 报告配置完成，正在装载营养总览！' }
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        const target = logs[currentLogIndex]?.p || 100;
        if (prev < target) {
          return prev + 2;
        } else {
          setLoaderMessage(logs[currentLogIndex]?.m || '装载完毕');
          if (currentLogIndex < logs.length - 1) {
            currentLogIndex++;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setScanStep(2);
            }, 800);
          }
          return prev;
        }
      });
    }, 45);

    return () => clearInterval(interval);
  }, [scanStep]);

  // Handler for custom mock image uploads
  const handleTriggerMockScan = (photoPreset: typeof PRESET_MOCK_PHOTOS[0]) => {
    setChosenImage(photoPreset.image);
    setDetectedTitle(photoPreset.name);
    setDetectedItems(photoPreset.items);
    setGlValue(photoPreset.glIndex);
    setScoreValue(photoPreset.healthScore);
    
    setIsLiveCamera(false);
    setScanStep(1); // triggers progressive loading animation
  };

  // Handler for mock camera snapping
  const handleCameraSnap = () => {
    // Generate a random mix as camera result
    const randomPreset = PRESET_MOCK_PHOTOS[Math.floor(Math.random() * PRESET_MOCK_PHOTOS.length)];
    setChosenImage(randomPreset.image);
    setDetectedTitle(`实拍：${randomPreset.name}`);
    setDetectedItems(randomPreset.items);
    setGlValue(randomPreset.glIndex);
    setScoreValue(randomPreset.healthScore);
    
    setIsLiveCamera(false);
    setScanStep(1);
    
    // Add to history list post-analysis!
    const newHistory: ScanHistoryEntry = {
      id: `h-${Date.now()}`,
      date: '刚刚',
      name: randomPreset.name,
      image: randomPreset.image,
      calories: randomPreset.items.reduce((acc, curr) => acc + curr.calories, 0),
      healthScore: randomPreset.healthScore,
      items: randomPreset.items
    };
    setScanHistory(prev => [newHistory, ...prev]);
  };

  // Click history to load report instantly without scanning
  const handleSelectHistoryReport = (entry: ScanHistoryEntry) => {
    setChosenImage(entry.image);
    setDetectedTitle(`自博古：${entry.name}`);
    setDetectedItems(entry.items);
    // Derived values
    setGlValue(2.8);
    setScoreValue(entry.healthScore);
    setScanStep(2);
  };

  // Summary calories calculation
  const totalCalories = detectedItems.reduce((acc, item) => acc + item.calories, 0);
  
  // Calculate protein, carbohydrate and lipid fractions to draw inside circular graphs
  const mockCarbFraction = Math.round((totalCalories * 0.45) / 4); // ~45% Carbs
  const mockProteinFraction = Math.round((totalCalories * 0.30) / 4); // ~30% Proteins
  const mockFatFraction = Math.round((totalCalories * 0.25) / 9); // ~25% Fats

  return (
    <div className="flex flex-col flex-1 max-w-[1240px] mx-auto w-full">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-stone-800 tracking-wide flex items-center justify-center gap-1.5 mb-1">
          <span>AI 拍照识别与智能营养报告</span>
          <span className="text-xs bg-[#c9e4b6] border border-brand-green text-stone-700 px-2 py-0.5 rounded-full font-sans font-bold">模块四已激活</span>
        </h2>
        <p className="text-xs text-[#65705e] max-w-[650px] mx-auto">
          无需费时手动打字输入！支持极速实拍模拟、本地多款绝美菜式实物选取识别。自主识取餐盘分量，提供多项GL血糖负荷计算及全面三大核心能量分析！
        </p>
      </div>

      {/* RENDER COMPONENT STATE MACHINE */}
      {scanStep === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 flex-1 items-stretch">
          
          {/* LEFT CHOP: CORE EXCLUSIVE INTERACTIVE CAMERA SHELL OR MOCK ENTRANCES */}
          <div className="bg-white border border-[#a2c28f]/30 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
            {isLiveCamera ? (
              /* REALISTIC SIMULATED CAMERA SHUTTER VIEWPORT */
              <div className="flex-1 bg-black rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 min-h-[360px] border-4 border-stone-800">
                {/* Camera guides overlays */}
                <div className="absolute inset-x-8 top-1/4 bottom-1/4 border-2 border-dashed border-white/25 pointer-events-none rounded-xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-brand-yellow/50 rounded-full animate-ping pointer-events-none"></div>
                
                <div className="flex justify-between items-center text-[10px] text-white/70 font-mono z-10 bg-black/40 px-3 py-1.5 rounded-full">
                  <span>📱 LENS ID: AIS-GOM-PRO</span>
                  <span className="text-brand-yellow flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Live View 焦点已锁定
                  </span>
                </div>

                {/* Subtext info inside viewport */}
                <div className="text-center text-xs text-white bg-black/60 p-3 rounded-xl max-w-[280px] mx-auto backdrop-blur-sm z-10 leading-snug">
                  请对准桌上美食的中心，确保光线充足，餐盘完整无阻挡板
                </div>

                {/* Actions bottom of simulator shutter */}
                <div className="flex items-center justify-around z-10 pt-2 bg-black/30 rounded-xl">
                  <button 
                    onClick={() => setIsLiveCamera(false)}
                    className="text-stone-300 hover:text-white text-xs font-bold"
                  >
                    取消拍摄
                  </button>
                  <button 
                    onClick={handleCameraSnap}
                    className="w-16 h-16 bg-white hover:bg-brand-yellow border-4 border-stone-700 hover:scale-105 transition-transform rounded-full flex items-center justify-center p-0.5"
                  >
                    <span className="w-full h-full bg-transparent border-2 border-stone-800 rounded-full block"></span>
                  </button>
                  <span className="text-stone-500 text-xs font-mono">1.0x AF</span>
                </div>
              </div>
            ) : (
              /* STANDARD SCAN SELECTION INTERFACES */
              <div className="flex flex-col flex-1 justify-center space-y-6 py-6 text-center">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-[#e0f0cc] text-[#8ba779] border-2 border-brand-green rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-stone-800 font-bold text-sm">选择识别上传方式</h3>
                  <p className="text-[11px] text-stone-500">模拟真实拍照与深度多维度算法</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-[420px] mx-auto w-full">
                  <button
                    onClick={() => setIsLiveCamera(true)}
                    className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>启动相机拍摄</span>
                  </button>

                  <div className="flex-1 relative overflow-hidden group">
                    <button
                      className="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-stone-800 font-extrabold text-xs py-3.5 px-6 rounded-xl border border-stone-200 shadow flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-stone-700" />
                      <span>从相册选择一盘</span>
                    </button>
                    {/* Fast presets click overlays over album picker */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-brand-green/95 transition-opacity rounded-xl flex items-center justify-center text-white text-[10px] font-bold gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
                      <span>点击右侧任选一款精美预设直接识别👇</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 max-w-[360px] mx-auto bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-normal">
                  提示：可在右侧列表栏中「快捷预置照」中点击任一个菜式，即可体验高精度识别过程及深度生成的营养总卡。
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CHOP: SELECT PRE SET GRAPHIC LISTS AND HISTORICAL LOGS */}
          <div className="space-y-5 flex flex-col justify-between">
            {/* Presets List */}
            <div className="bg-white border rounded-[2rem] p-5 shadow-sm space-y-3">
              <span className="text-xs text-stone-500 font-bold tracking-wider font-mono block px-1">🍲 快捷测试：精选高逼真餐品照</span>
              
              <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scroll pr-1">
                {PRESET_MOCK_PHOTOS.map((photo) => (
                  <div 
                    key={photo.id}
                    onClick={() => handleTriggerMockScan(photo)}
                    className="flex items-center gap-3 p-2 bg-stone-50 hover:bg-[#eff7e8] border hover:border-brand-green rounded-xl transition-all cursor-pointer text-left"
                  >
                    <img 
                      src={photo.image} 
                      alt={photo.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border shadow-inner"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-black text-stone-800 truncate">{photo.name}</span>
                      <span className="text-[10px] text-brand-green-dark font-mono block">含有 {photo.items.length} 种食材 · 估卡 {photo.items.reduce((a,c)=>a+c.calories,0)} 大卡</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Micro scan records historic lists */}
            <div className="bg-[#eff7e8]/50 border border-brand-green/20 rounded-[2rem] p-5 shadow-inner flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#526047] font-bold tracking-wider font-mono px-1 flex items-center gap-1 mb-2.5">
                  <History className="w-3.5 h-3.5" />
                  <span>最近几次扫描历史记录 ({scanHistory.length})</span>
                </span>

                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scroll pr-1">
                  {scanHistory.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleSelectHistoryReport(rec)}
                      className="flex items-center justify-between p-2.5 bg-white border border-brand-green/10 rounded-xl cursor-pointer hover:bg-white/80 select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={rec.image} 
                          alt={rec.name} 
                          referrerPolicy="no-referrer" 
                          className="w-8 h-8 object-cover rounded shadow"
                        />
                        <div className="min-w-0">
                          <span className="block text-[11px] font-bold text-stone-700 truncate">{rec.name}</span>
                          <span className="text-[9px] text-[#8ca779] font-mono">{rec.date}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-amber-950 bg-brand-yellow px-1.5 py-0.5 rounded shadow-sm">{rec.calories}卡</span>
                        <ChevronRight className="w-3 h-3 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-brand-green/10 text-[10px] text-stone-400 text-center font-mono">
                数据安全提示：由于处于 Preview 环境，模型报告均采用沙盒缓存
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SCANNING ACTIVE LOADER SCREEN */}
      {scanStep === 1 && (
        <div className="bg-[#1e2417] border border-[#a2c28f]/20 rounded-[2.5rem] p-10 py-16 text-center text-white flex flex-col justify-center items-center min-h-[420px] shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle pulsating radar rings */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2115] to-[#14180f]"></div>
          
          <div className="relative w-40 h-40 flex items-center justify-center bg-[#2c3523] rounded-full border border-[#8ba779]/20 shadow-xxl z-10 animate-pulse">
            <div className="absolute inset-2 border-4 border-[#8ba779]/10 rounded-full animate-ping"></div>
            <div className="absolute inset-6 border-2 border-dashed border-brand-green/30 rounded-full animate-spin-slow"></div>
            <Camera className="w-12 h-12 text-brand-yellow animate-bounce" />
          </div>

          <div className="space-y-3 max-w-[500px] w-full z-10">
            <h4 className="font-sans font-black text-sm text-brand-yellow flex items-center justify-center gap-1.5">
              <span>Gourmet-AI 正在进行智能图像分析</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </h4>
            
            <p className="text-xs text-stone-300 font-mono italic px-4 bg-black/30 py-2.5 rounded-xl border border-white/5 min-h-[46px] flex items-center justify-center">
              {loaderMessage}
            </p>

            {/* Progressive Meter Bar */}
            <div className="w-full bg-black/40 h-8 rounded-full border border-white/5 overflow-hidden relative">
              <div 
                className="bg-brand-green h-full text-right text-[10px] text-slate-900 font-mono font-bold flex items-center justify-end pr-4 transition-all duration-100 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN STEP 2: SCANNED REPORT RESULTS CARD */}
      {scanStep === 2 && (
        <div className="bg-white border rounded-[2rem] p-6 shadow-sm flex flex-col gap-6 animate-scale-up">
          
          {/* Header row with back trigger */}
          <div className="flex items-center justify-between border-b pb-4">
            <button
              onClick={() => setScanStep(0)}
              className="flex items-center gap-1 text-slate-600 hover:text-brand-green text-xs font-bold bg-stone-50 border px-3 py-1.5 rounded-xl"
            >
              <span>← 返回扫描页</span>
            </button>
            <span className="text-sm font-black text-stone-800 animate-pulse">🥗 扫一扫AI营养能量报告</span>
            <div className="flex items-center gap-1.5 text-xs text-brand-green-dark bg-[#eff7e8] border border-brand-green/20 px-3 py-1.5 rounded-xl font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>智能识别成功</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.3fr] gap-6">
            
            {/* Left: display original chosen image */}
            <div className="space-y-4">
              <div className="bg-stone-50 border rounded-2xl p-2.5 shadow-inner">
                <div className="h-[240px] md:h-[280px] rounded-xl overflow-hidden relative border shadow">
                  <img 
                    src={chosenImage} 
                    alt="Scanned Food" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating badge image tag */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-brand-yellow font-sans font-black text-[10px] px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <span>{detectedTitle}</span>
                  </div>
                </div>
              </div>

              {/* Identified Items Checklist (识别到的食物列表 ✅) */}
              <div className="bg-[#eff7e8]/40 border border-[#a2c28f]/20 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-green/20 pb-2">
                  <span className="text-xs font-black text-brand-green-dark flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>识别到的餐盘食材列表 ({detectedItems.length})</span>
                  </span>
                  <span className="text-[10px] text-[#526047] font-mono">估计份量 (克) - 热量 (卡)</span>
                </div>

                <div className="space-y-1.5">
                  {detectedItems.map((item, idx) => (
                    <div 
                      key={`${item.name}-${idx}`}
                      className="flex items-center justify-between py-2 px-3 bg-white/75 border border-brand-green/10 rounded-xl text-xs font-sans text-stone-700 hover:bg-white-100"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-6 font-mono text-[11px] font-bold">
                        <span className="text-stone-500">{item.weight}g</span>
                        <span className="text-orange-950 bg-brand-yellow px-2 py-0.5 rounded">{item.calories} 大卡</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Nutrition Overview Card (营养总览卡片 ✅) */}
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-5">
                
                <div className="flex items-center gap-2 border-b pb-3 border-stone-100">
                  <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-xs font-black text-stone-800">三大宏量营养素与体成分汇总报告</span>
                </div>

                {/* Big calories representation ring stats box */}
                <div className="grid grid-cols-[110px_1fr] gap-6 items-center">
                  {/* SVG progress circle and values */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* background circle */}
                      <circle cx="50" cy="50" r="42" stroke="#ebebeb" strokeWidth="8" fill="transparent" />
                      {/* progress circle */}
                      <circle 
                        cx="50" cy="50" r="42" 
                        stroke="#8ba779" strokeWidth="9" fill="transparent" 
                        strokeDasharray={263.8}
                        strokeDashoffset={263.8 * (1 - totalCalories / 1000)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="text-center">
                      <span className="block text-xl font-mono font-black text-stone-800">{totalCalories}</span>
                      <span className="text-[10px] text-stone-400 font-bold block leading-none">总大卡</span>
                    </div>
                  </div>

                  {/* Three protein fraction bars */}
                  <div className="space-y-3 font-mono">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-emerald-800 flex items-center gap-1">💪 蛋白质 (30%)</span>
                        <span className="text-stone-700">{mockProteinFraction}g (120卡)</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-amber-800 flex items-center gap-1">🌾 碳水化合物 (45%)</span>
                        <span className="text-stone-700">{mockCarbFraction}g (180卡)</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-orange-900 flex items-center gap-1">🥑 脂肪量 (25%)</span>
                        <span className="text-stone-700">{mockFatFraction}g (100卡)</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-orange-400 h-full rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GL Index & Balance Health Level */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  
                  {/* GL Index Card */}
                  <div className="bg-[#fcf8e3] border border-yellow-200 p-4 rounded-2xl space-y-1 leading-normal">
                    <div className="flex items-center gap-1 text-[11px] text-yellow-800 font-bold">
                      <Zap className="w-4.5 h-4.5" />
                      <span>血糖负荷 (GL)</span>
                    </div>
                    <span className="block text-lg font-mono font-black text-amber-950">{glValue} <span className="text-[10px] font-sans font-bold text-green-700">(低GL负荷)</span></span>
                    <p className="text-[9px] text-stone-500 leading-snug">
                      复合膳食比例均衡，餐后糖类缓慢代谢，是减脂和稳定能量的黄金模型。
                    </p>
                  </div>

                  {/* Rating score 1-10 Card */}
                  <div className="bg-[#dff0d8] border border-green-200 p-4 rounded-2xl space-y-1 leading-normal">
                    <div className="flex items-center gap-1 text-[11px] text-green-800 font-bold">
                      <Award className="w-4.5 h-4.5" />
                      <span>多维健康评分</span>
                    </div>
                    <span className="block text-lg font-mono font-black text-slate-800">{scoreValue} <span className="text-[10px] font-sans font-bold text-[#8ca779]">/ 10分</span></span>
                    <p className="text-[9px] text-stone-500 leading-snug">
                      食材种类丰富度得分9.8，低油脂烹制配选，非常推荐日常食用！
                    </p>
                  </div>

                </div>

              </div>

              {/* Retry scan bottom option */}
              <div className="flex justify-center">
                <button
                  onClick={() => setScanStep(0)}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-xs py-3.5 px-10 rounded-full shadow-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>重新扫描餐盘</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
