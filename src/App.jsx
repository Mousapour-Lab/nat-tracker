import React, { useState, useMemo } from 'react';
import { 
  Download, Plus, Settings, FolderClosed, BarChart2, 
  LayoutGrid, Brain, ChevronRight, X, AlertCircle, Clock,
  Sun, Moon, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
};

const toPersianNum = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[x]);
};

const getLocalISOTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 16);
};

const initialLogs = [
  {
    id: '1',
    date: '۲۵ مهر ۱۴۰۲ - ۱۸:۳۰',
    situation: 'در جلسه با مدیر پروژه احساس کردم ایده‌ام را به خوبی بیان نکردم و همه متوجه استرس من شدند.',
    emotions: [{ name: 'اضطراب', intensity: 80 }],
    thoughts: [{ text: 'من همیشه گند میزنم', belief: 90 }, { text: 'دیگر به من پروژه نمیدهند', belief: 70 }, { text: 'بقیه از من بهترند', belief: 60 }],
    shameLevel: 45
  },
  {
    id: '2',
    date: '۲۴ مهر ۱۴۰۲ - ۱۰:۱۵',
    situation: 'پیام دوستم را دیر جواب دادم و حس کردم او فکر می‌کند برایش ارزش قائل نیستم.',
    emotions: [{ name: 'عذاب وجدان', intensity: 70 }],
    thoughts: [{ text: 'من دوست بدی هستم', belief: 80 }, { text: 'او دیگر با من حرف نمیزند', belief: 50 }],
    shameLevel: 32
  },
  {
    id: '3',
    date: '۲۲ مهر ۱۴۰۲ - ۲۱:۰۰',
    situation: 'در مهمانی خانوادگی درباره موضوعی اظهار نظر کردم که اشتباه بود و همه خندیدند.',
    emotions: [{ name: 'خجالت', intensity: 90 }],
    thoughts: [{ text: 'من احمقم', belief: 100 }, { text: 'همه فکر میکنند من بی سوادم', belief: 85 }],
    shameLevel: 85
  }
];

const DEFAULT_EMOTIONS = ['غم', 'خشم', 'ترس', 'اضطراب'];

const CustomSlider = ({ value, onChange, label }) => {
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-2 px-1 transition-colors">
        <span>{label}</span>
        <span>{toPersianNum(value)}%</span>
      </div>
      <div className="relative w-full h-6 bg-slate-200 dark:bg-zinc-800 rounded-full flex items-center overflow-visible transition-colors" dir="rtl">
        {/* Filled Track anchored to the right */}
        <div 
          className="absolute right-0 h-full bg-indigo-500 rounded-full pointer-events-none transition-all duration-150"
          style={{ width: `${value}%` }}
        ></div>
        
        {/* Native Input: dir="rtl" makes dragging LEFT increase the value */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-full opacity-0 cursor-pointer z-10 absolute inset-0"
          dir="rtl"
        />

        {/* Visual Thumb correctly positioned */}
        <div 
          className="absolute h-6 w-6 bg-white dark:bg-zinc-100 border-[3px] border-indigo-500 rounded-full pointer-events-none shadow-md transition-all duration-150 z-0 top-0"
          style={{ right: `calc(${value}% - 12px)` }}
        ></div>
      </div>
    </div>
  );
};

const DashboardView = ({ logs, onAddClick, onExport, isDark, toggleTheme, isExporting }) => {
  const logsWithShame = logs.filter(l => l.shameLevel !== null && l.shameLevel !== undefined);
  const avgShame = logsWithShame.length === 0 ? 0 : Math.round(logsWithShame.reduce((acc, log) => acc + log.shameLevel, 0) / logsWithShame.length);

  return (
    <div className="min-h-screen pb-24 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="flex gap-2 items-center">
          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-all">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={onExport} 
            disabled={isExporting}
            className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Download size={16} className="ml-2" />}
            {isExporting ? 'در حال تولید...' : 'خروجی PDF'}
          </button>
        </div>
        <h1 className="text-slate-800 dark:text-zinc-100 font-bold text-lg tracking-wide flex items-center gap-2 transition-colors">
          NAT Tracker <Brain size={20} className="text-indigo-500 dark:text-indigo-400" />
        </h1>
      </div>

      <div className="px-6 mt-6 max-w-screen-xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors">
            <span className="text-slate-500 dark:text-zinc-400 text-xs mb-1">تعداد کل ثبت‌ها</span>
            <span className="text-3xl font-black text-slate-800 dark:text-zinc-100">{toPersianNum(logs.length)}</span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-lg shadow-indigo-900/5 dark:shadow-indigo-900/10 transition-colors">
            <span className="text-indigo-600 dark:text-indigo-300 text-xs mb-1">میانگین شرم</span>
            <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400">٪ {toPersianNum(avgShame)}</span>
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100 mb-4 transition-colors">ثبت‌های اخیر</h2>

        {/* Log List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {logs.map((log) => {
            const topEmotion = log.emotions.length > 0 
              ? log.emotions.reduce((prev, current) => (prev.intensity > current.intensity) ? prev : current)
              : null;

            return (
              <div key={log.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 flex flex-col h-full hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 dark:text-zinc-500 text-xs font-medium flex items-center gap-1 transition-colors">
                    <Clock size={12} /> {toPersianNum(log.date)}
                  </span>
                  
                  {log.shameLevel !== null && log.shameLevel !== undefined ? (
                    <div className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20 transition-colors">
                      شرم {toPersianNum(log.shameLevel)}٪
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 transition-colors">
                      بدون شرم
                    </div>
                  )}

                </div>
                
                <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed mb-4 font-medium transition-colors">
                  {log.situation}
                </p>

                {/* Display Thoughts */}
                {log.thoughts && log.thoughts.length > 0 && (
                  <div className="mb-6 bg-slate-50 dark:bg-zinc-950/50 rounded-xl p-3 space-y-3 border border-slate-100 dark:border-zinc-800/50 transition-colors flex-grow">
                    {log.thoughts.map((thought, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-300 text-xs flex-grow leading-relaxed font-medium transition-colors">
                          {thought.text}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2 py-0.5 rounded-md whitespace-nowrap transition-colors">
                          باور: {toPersianNum(thought.belief)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 items-center mt-auto border-t border-slate-100 dark:border-zinc-800 pt-4 transition-colors">
                  {topEmotion && (
                    <span className="border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/5 transition-colors">
                      {topEmotion.name} {toPersianNum(topEmotion.intensity)}٪
                    </span>
                  )}
                  <span className="flex items-center text-slate-500 dark:text-zinc-400 text-[11px] font-medium bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors">
                    <Brain size={12} className="ml-1 text-slate-400 dark:text-zinc-500" />
                    {toPersianNum(log.thoughts.length)} فکر 
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-24 left-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all z-20 md:left-10 md:bottom-10 md:p-5"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Bottom Nav (Mobile Only) */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-6 py-3 flex justify-between items-center z-10 md:hidden transition-colors">
        <button className="flex flex-col items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition">
          <Settings size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition">
          <FolderClosed size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Resources</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition">
          <BarChart2 size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Analytics</span>
        </button>
        <button className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-1.5 rounded-xl mb-1 transition-colors">
            <LayoutGrid size={20} />
          </div>
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
      </div>
    </div>
  );
};

const AddLogView = ({ onSave, onCancel }) => {
  const [dateTime, setDateTime] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [customEmotionInput, setCustomEmotionInput] = useState('');
  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [thoughts, setThoughts] = useState([{ text: '', belief: 50 }]);
  
  const [hasShame, setHasShame] = useState(true);
  const [shameLevel, setShameLevel] = useState(50);

  const toggleEmotion = (name) => {
    const exists = selectedEmotions.find(e => e.name === name);
    if (exists) {
      setSelectedEmotions(selectedEmotions.filter(e => e.name !== name));
    } else {
      setSelectedEmotions([...selectedEmotions, { name, intensity: 50 }]);
    }
  };

  const updateEmotionIntensity = (name, val) => {
    setSelectedEmotions(selectedEmotions.map(e => e.name === name ? { ...e, intensity: val } : e));
  };

  const handleAddCustomEmotion = (e) => {
    e.preventDefault();
    if (customEmotionInput.trim()) {
      setSelectedEmotions([...selectedEmotions, { name: customEmotionInput.trim(), intensity: 50 }]);
      setCustomEmotionInput('');
      setIsAddingEmotion(false);
    }
  };

  const updateThought = (index, field, value) => {
    const newThoughts = [...thoughts];
    newThoughts[index][field] = value;
    setThoughts(newThoughts);
  };

  const addThought = () => {
    setThoughts([...thoughts, { text: '', belief: 50 }]);
  };

  const handleSetNow = () => {
    setDateTime(getLocalISOTime());
  };

  const handleSave = () => {
    if (!situation.trim()) return alert('لطفا موقعیت را وارد کنید');
    
    const parsedDate = dateTime ? new Date(dateTime) : new Date();
    const formattedDate = new Intl.DateTimeFormat('fa-IR', { 
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(parsedDate);

    const newLog = {
      id: Date.now().toString(),
      date: formattedDate,
      situation,
      emotions: selectedEmotions,
      thoughts: thoughts.filter(t => t.text.trim() !== ''),
      shameLevel: hasShame ? shameLevel : null
    };
    onSave(newLog);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 md:flex md:items-center md:justify-center md:p-4 backdrop-blur-sm overflow-y-auto transition-colors duration-300">
      <div className="bg-white dark:bg-zinc-900 min-h-screen md:min-h-0 md:h-auto md:max-h-[90vh] w-full md:max-w-lg md:rounded-3xl flex flex-col relative shadow-2xl dark:shadow-black border border-transparent dark:border-zinc-800 transition-colors">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 md:rounded-t-3xl transition-colors">
          <button onClick={onCancel} className="text-slate-500 dark:text-zinc-400 font-medium text-sm hover:text-slate-800 dark:hover:text-zinc-200 transition">لغو</button>
          <h1 className="text-slate-800 dark:text-zinc-100 font-bold text-lg flex items-center gap-2 transition-colors">
            NAT Tracker <Brain size={20} className="text-indigo-500 dark:text-indigo-400"/>
          </h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-8 flex-1 overflow-y-auto text-slate-800 dark:text-zinc-100 transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 mb-2 transition-colors">ثبت فکر و هیجان جدید</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm transition-colors">امروز چه چیزی را تجربه کردید؟</p>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2 transition-colors">
              <span className="text-indigo-500">۱.</span> تاریخ و ساعت
            </h3>
            <div className="flex gap-2 items-center">
              <input 
                type="datetime-local" 
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 rounded-xl p-3 text-sm text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors"
                dir="ltr"
              />
              <button 
                onClick={handleSetNow}
                className="shrink-0 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold py-3 px-4 rounded-xl transition border border-transparent dark:border-zinc-700"
              >
                همین الان
              </button>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2 transition-colors">
              <span className="text-indigo-500">۲.</span> موقعیت
            </h3>
            <textarea 
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="چه اتفاقی افتاد؟ کجا بودید؟ چه کسی آنجا بود؟"
              className="w-full bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-28 border border-slate-200 dark:border-zinc-800 transition-colors"
            />
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2 transition-colors">
              <span className="text-indigo-500">۳.</span> هیجان‌ها
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {DEFAULT_EMOTIONS.map(emo => {
                const isSelected = selectedEmotions.some(e => e.name === emo);
                return (
                  <button 
                    key={emo}
                    onClick={() => toggleEmotion(emo)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                      isSelected 
                        ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/10 shadow-sm' 
                        : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-500 hover:text-slate-800 dark:hover:text-zinc-200 bg-white dark:bg-zinc-950'
                    }`}
                  >
                    {emo}
                  </button>
                );
              })}
              
              {isAddingEmotion ? (
                <form onSubmit={handleAddCustomEmotion} className="flex">
                  <input 
                    autoFocus
                    type="text" 
                    value={customEmotionInput}
                    onChange={(e) => setCustomEmotionInput(e.target.value)}
                    placeholder="هیجان دیگر..."
                    className="px-4 py-1.5 rounded-full text-sm border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 w-32 mr-2 transition-colors"
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingEmotion(true)}
                  className="px-4 py-1.5 rounded-full text-sm font-bold border border-transparent bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  افزودن <Plus size={14} />
                </button>
              )}
            </div>

            <div className="space-y-6">
              {selectedEmotions.map((emotion) => (
                <CustomSlider 
                  key={emotion.name}
                  label={emotion.name}
                  value={emotion.intensity}
                  onChange={(val) => updateEmotionIntensity(emotion.name, val)}
                />
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2 transition-colors">
              <span className="text-indigo-500">۴.</span> افکار
            </h3>
            
            <div className="space-y-6 mb-4">
              {thoughts.map((thought, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 relative transition-colors">
                  {thoughts.length > 1 && (
                     <button onClick={() => setThoughts(thoughts.filter((_, i) => i !== idx))} className="absolute top-3 left-3 text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition">
                       <X size={16} />
                     </button>
                  )}
                  <textarea 
                    value={thought.text}
                    onChange={(e) => updateThought(idx, 'text', e.target.value)}
                    placeholder="چه فکری از سرت گذشت؟ (مثلا: من همیشه اشتباه می‌کنم)"
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none resize-none h-16 mb-4 font-medium transition-colors"
                  />
                  <CustomSlider 
                    label="میزان باور"
                    value={thought.belief}
                    onChange={(val) => updateThought(idx, 'belief', val)}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={addThought}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500/50 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-950 transition-colors"
            >
              <Plus size={18} /> افزودن یک فکر دیگر
            </button>
          </div>

          <div className="mb-8 bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 transition-colors">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors">
                <span className="text-indigo-500">۵.</span> میزان شرم
               </h3>
               
               <button
                  onClick={() => setHasShame(!hasShame)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    hasShame
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {hasShame ? 'ثبت می‌شود' : 'شرم نداشتم'}
                  {hasShame ? <ToggleRight size={18} className="text-indigo-600 dark:text-indigo-400"/> : <ToggleLeft size={18} />}
               </button>
            </div>
            
            <div className={`transition-all duration-300 overflow-hidden ${hasShame ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6 font-medium transition-colors">چقدر احساس شرم یا بی‌ارزشی می‌کنید؟</p>
              <CustomSlider 
                label="شرم"
                value={shameLevel}
                onChange={setShameLevel}
              />
            </div>
            
            {!hasShame && (
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-600 text-center py-2 transition-colors">
                احساس شرم برای این موقعیت ثبت نخواهد شد.
              </p>
            )}

          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 md:rounded-b-3xl shrink-0 transition-colors">
          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition flex items-center justify-center gap-2"
          >
            ثبت لاگ
          </button>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  // خواندن اطلاعات از دیتابیس لوکال مرورگر هنگام لود صفحه
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('nat_tracker_logs');
    if (savedLogs) {
      return JSON.parse(savedLogs);
    }
    return initialLogs; // اگه بار اوله، همون دیتای تستی رو نشون میده
  });

  // ذخیره اتوماتیک اطلاعات در مرورگر هر بار که لاگ جدیدی ثبت میشه
  React.useEffect(() => {
    localStorage.setItem('nat_tracker_logs', JSON.stringify(logs));
  }, [logs]);
  const [isDark, setIsDark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf.jsPDF;

      const element = document.getElementById('pdf-export-container');
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff' 
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('NAT_Tracker_Report.pdf');
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveLog = (newLog) => {
    setLogs([newLog, ...logs]);
    setCurrentView('dashboard');
  };

  return (
    <div dir="rtl" className={`font-sans antialiased min-h-screen w-full transition-colors duration-300 ${isDark ? 'dark bg-zinc-950 selection:bg-indigo-500/30 selection:text-indigo-200' : 'bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900'}`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
        body { font-family: 'Vazirmatn', sans-serif; background: ${isDark ? '#09090b' : '#f8fafc'}; transition: background 0.3s ease; }
        input[type=range]:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#3f3f46' : '#cbd5e1'}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${isDark ? '#52525b' : '#94a3b8'}; }
      `}} />

      {/* --- HIDDEN PDF EXPORT CONTAINER --- */}
      <div 
        id="pdf-export-container" 
        className="absolute left-[-9999px] top-0 w-[800px] bg-white text-black p-8 font-sans" 
        dir="rtl"
      >
        <h1 className="text-2xl font-black mb-6 text-center border-b pb-4 border-gray-300">گزارش NAT Tracker</h1>
        <table className="w-full text-right border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 font-bold w-1/6">تاریخ و ساعت</th>
              <th className="border border-gray-300 p-3 font-bold w-1/3">موقعیت</th>
              <th className="border border-gray-300 p-3 font-bold w-1/6">هیجان غالب</th>
              <th className="border border-gray-300 p-3 font-bold w-1/4">افکار</th>
              <th className="border border-gray-300 p-3 font-bold w-1/12 text-center">شرم</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const topEmotion = log.emotions.length > 0 
                ? log.emotions.reduce((prev, current) => (prev.intensity > current.intensity) ? prev : current)
                : null;

              return (
                <tr key={log.id}>
                  <td className="border border-gray-300 p-3 align-top">{toPersianNum(log.date)}</td>
                  <td className="border border-gray-300 p-3 align-top leading-relaxed">{log.situation}</td>
                  <td className="border border-gray-300 p-3 align-top">
                    {topEmotion ? `${topEmotion.name} (${toPersianNum(topEmotion.intensity)}%)` : '-'}
                  </td>
                  <td className="border border-gray-300 p-3 align-top">
                    <ul className="list-disc pr-4 space-y-1">
                      {log.thoughts.map((t, idx) => (
                        <li key={idx}>{t.text} <span className="text-gray-500 text-[10px]">({toPersianNum(t.belief)}%)</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-300 p-3 align-top text-center font-bold">
                    {log.shameLevel !== null && log.shameLevel !== undefined ? `${toPersianNum(log.shameLevel)}%` : 'نداشت'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- STANDARD BROWSER UI --- */}
      <div className="relative w-full max-w-5xl mx-auto md:py-8 h-full min-h-screen">
        <div className="bg-slate-50 dark:bg-zinc-950 md:rounded-[2rem] md:shadow-2xl overflow-hidden relative min-h-screen md:min-h-[850px] md:border border-slate-200 dark:border-zinc-800 transition-colors duration-300">
          
          {currentView === 'dashboard' && (
            <DashboardView 
              logs={logs} 
              onAddClick={() => setCurrentView('add')} 
              onExport={handleExport}
              isDark={isDark}
              toggleTheme={() => setIsDark(!isDark)}
              isExporting={isExporting}
            />
          )}

          {currentView === 'add' && (
             <div className="absolute inset-0 z-50">
                <AddLogView 
                  onSave={handleSaveLog} 
                  onCancel={() => setCurrentView('dashboard')} 
                />
             </div>
          )}

        </div>
      </div>
    </div>
  );
}