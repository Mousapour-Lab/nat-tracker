import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Plus, Brain, ChevronRight, X, Clock,
  Sun, Moon, ToggleLeft, ToggleRight, Loader2, Check,
  BookOpen, MessageSquare, LayoutGrid, FileText,
  Trash2, Edit2, Printer
} from 'lucide-react';

// ─────────────────────────── CONSTANTS ───────────────────────────

const EMOTION_COLORS = {
  'اضطراب':     { hex: '#f59e0b', bgL: '#fef3c7', bgD: 'rgba(245,158,11,0.15)', txL: '#92400e', txD: '#fbbf24', bdL: '#fcd34d', bdD: 'rgba(245,158,11,0.35)' },
  'غم':         { hex: '#3b82f6', bgL: '#dbeafe', bgD: 'rgba(59,130,246,0.15)',  txL: '#1e40af', txD: '#60a5fa', bdL: '#93c5fd', bdD: 'rgba(59,130,246,0.35)' },
  'خشم':        { hex: '#ef4444', bgL: '#fee2e2', bgD: 'rgba(239,68,68,0.15)',   txL: '#991b1b', txD: '#f87171', bdL: '#fca5a5', bdD: 'rgba(239,68,68,0.35)'  },
  'ترس':        { hex: '#8b5cf6', bgL: '#ede9fe', bgD: 'rgba(139,92,246,0.15)',  txL: '#5b21b6', txD: '#a78bfa', bdL: '#c4b5fd', bdD: 'rgba(139,92,246,0.35)' },
  'عذاب وجدان': { hex: '#14b8a6', bgL: '#ccfbf1', bgD: 'rgba(20,184,166,0.15)', txL: '#0f766e', txD: '#2dd4bf', bdL: '#5eead4', bdD: 'rgba(20,184,166,0.35)' },
  'خجالت':      { hex: '#ec4899', bgL: '#fce7f3', bgD: 'rgba(236,72,153,0.15)', txL: '#9d174d', txD: '#f472b6', bdL: '#f9a8d4', bdD: 'rgba(236,72,153,0.35)' },
  'شادی':       { hex: '#22c55e', bgL: '#dcfce7', bgD: 'rgba(34,197,94,0.15)',   txL: '#15803d', txD: '#4ade80', bdL: '#86efac', bdD: 'rgba(34,197,94,0.35)'  },
  'ناامیدی':    { hex: '#6b7280', bgL: '#f3f4f6', bgD: 'rgba(107,114,128,0.15)',txL: '#374151', txD: '#9ca3af', bdL: '#d1d5db', bdD: 'rgba(107,114,128,0.35)' },
  'شرم':        { hex: '#4c1d95', bgL: '#f5f3ff', bgD: 'rgba(76,29,149,0.15)',  txL: '#5b21b6', txD: '#c4b5fd', bdL: '#ddd6fe', bdD: 'rgba(76,29,149,0.35)' },
  'حسادت':      { hex: '#84cc16', bgL: '#f7fee7', bgD: 'rgba(132,204,22,0.15)',  txL: '#3f6212', txD: '#a3e635', bdL: '#bef264', bdD: 'rgba(132,204,22,0.35)' },
  'دلتنگی':     { hex: '#a78bfa', bgL: '#ede9fe', bgD: 'rgba(167,139,250,0.15)', txL: '#5b21b6', txD: '#c4b5fd', bdL: '#ddd6fe', bdD: 'rgba(167,139,250,0.35)'},
  'تنهایی':     { hex: '#6366f1', bgL: '#e0e7ff', bgD: 'rgba(99,102,241,0.15)',  txL: '#3730a3', txD: '#818cf8', bdL: '#a5b4fc', bdD: 'rgba(99,102,241,0.35)' },
  'ناامنی':     { hex: '#f97316', bgL: '#ffedd5', bgD: 'rgba(249,115,22,0.15)',  txL: '#9a3412', txD: '#fb923c', bdL: '#fdba74', bdD: 'rgba(249,115,22,0.35)' },
};

const getEC = (name, dark) => {
  const c = EMOTION_COLORS[name];
  if (!c) return { bg: dark ? 'rgba(99,102,241,0.15)' : '#e0e7ff', tx: dark ? '#818cf8' : '#3730a3', bd: dark ? 'rgba(99,102,241,0.35)' : '#a5b4fc', hex: '#6366f1' };
  return { bg: dark ? c.bgD : c.bgL, tx: dark ? c.txD : c.txL, bd: dark ? c.bdD : c.bdL, hex: c.hex };
};

const DEFAULT_EMOTIONS = ['اضطراب','غم','خشم','ترس','عذاب وجدان','خجالت','شرم','شادی','ناامیدی','دلتنگی','تنهایی','حسادت','ناامنی'];

const COGNITIVE_ERRORS = [
  { id:1,  name:'ذهن خوانی',                   desc:'فرض می‌گذارید که می‌دانید آدم‌ها چه فکر می‌کنند، بی‌آنکه شواهد کافی در مورد افکارشان داشته باشید.',  ex:'او فکر می‌کند من یک بازنده‌ام.' },
  { id:2,  name:'پیش گویی',                     desc:'آینده را پیش بینی می‌کنید. پیش بینی می‌کنید که اوضاع بدتر خواهد شد یا خطری در پیش است.',           ex:'در امتحان قبول نخواهم شد. یا: این شغل را به دست نخواهم آورد.' },
  { id:3,  name:'فاجعه سازی',                   desc:'بر این باورید که آنچه اتفاق افتاده آنچنان دردناک و غیرقابل تحمل خواهد بود که شما نمی‌توانید آن را تحمل کنید.',  ex:'اگر در امتحان رد شوم، وحشتناک است.' },
  { id:4,  name:'برچسب زدن',                    desc:'یک ویژگی منفی خیلی کلی را به خود و دیگران نسبت می‌دهید.',                                              ex:'من دوست داشتنی نیستم. یا: او بی‌لیاقت است.' },
  { id:5,  name:'دست کم گرفتن جنبه‌های مثبت',  desc:'مدعی هستید که دستاوردهای مثبت شما یا دیگران ناچیز و جزئی هستند.',                                    ex:'این وظیفه زن خانه است. یا: این موفقیت‌ها مهم نیستند، خیلی آسان به دست آمدند.' },
  { id:6,  name:'فیلتر منفی',                   desc:'تقریباً منحصراً بر جنبه‌های منفی متمرکز می‌شوید و به ندرت به جنبه‌های مثبت توجه می‌کنید.',             ex:'اگر گاهی به یاد بیازید متوجه می‌شوید که چه تعداد آدم‌هایی مرا دوست ندارند.' },
  { id:7,  name:'تعمیم افراطی',                 desc:'صرفاً براساس یک رویداد خاص، یک الگوی کلی منفی را استنباط می‌کنید.',                                  ex:'این اتفاق همیشه برای من پیش می‌آید. انگار من خیلی جاها شکست می‌خورم.' },
  { id:8,  name:'تفکر دو قطبی',                 desc:'آدم‌ها یا اتفاق‌ها را به صورت همه یا هیچ می‌بینند.',                                                    ex:'همه مرا کنار گذاشته‌اند. یا: وقت تلف کردن بود.' },
  { id:9,  name:'بایدها',                        desc:'رویدادها را بر مبنای این‌که چطور باید بودند تفسیر می‌کنید، نه بر مبنای آنکه واقعاً چطور هستند.',      ex:'باید خوب عمل کنم، و اگر خوب عمل نکنم یعنی شکست خورده‌ام.' },
  { id:10, name:'شخصی سازی',                    desc:'به خاطر اتفاقات ناخوشایند منفی، تقصیر زیادی را به صورت غیرمنصفانه به خود نسبت می‌دهید.',              ex:'ازدواجم به بن بست رسید، چون من شکست خوردم.' },
  { id:11, name:'مقصر دانستن',                  desc:'فرد دیگری را منبع اصلی احساسات منفی‌تان می‌دانید و مسئولیت تغییر خودتان را نمی‌پذیرید.',              ex:'تقصیر اوست که من الان این گونه احساس می‌کنم.' },
  { id:12, name:'مقایسه‌های غیرمنصفانه',        desc:'اتفاق‌ها را براساس استانداردهایی تفسیر می‌کنید که واقع‌بینانه نیستند.',                                 ex:'او در مقایسه با من موفق‌تر است. یا: دیگران بهتر از من امتحان دادند.' },
  { id:13, name:'همیشه پشیمان بودن',            desc:'تمرکز ذهنی با این‌که از این‌ها عمل کنم بهتر از آن‌ها می‌توانستم عمل کنم، به جای توجه به کارهایی که الان می‌توانم بهتر انجام بدهم.', ex:'اگر تلاش کرده بودم می‌توانستم شغل بهتری داشته باشم.' },
  { id:14, name:'چه می‌شود اگر؟',               desc:'یک سلسله سؤالات «چه می‌شود اگر؟» می‌پرسید و از پاسخی که به خود می‌دهید هرگز راضی نیستید.',          ex:'درست، ولی اگر مضطرب شوم چه؟ یا: اگر نتوانم درست نفس بکشم چه؟' },
  { id:15, name:'استدلال هیجانی',               desc:'اجازه می‌دهید که احساساتتان، تفسیرتان از واقعیت را هدایت کنند.',                                        ex:'احساس افسردگی می‌کنم، و این یعنی ازدواجم به بن بست خورده است.' },
  { id:16, name:'ناتوانی در عدم تأیید شواهد',  desc:'همه مدارک یا شواهد بر علیه افکار منفی‌تان را رد می‌کنید. در نتیجه افکارتان قابل رد کردن نیستند.',     ex:'موضوع واقعاً این نیست، مشکلات عمیق‌تر از این حرف‌ها هستند.' },
  { id:17, name:'برخورد قضاوتی',               desc:'خودتان، دیگران و اتفاق‌ها را به جای توصیف، پذیرش یا درک، به صورت سیاه و سفید ارزیابی می‌کنید.',      ex:'در دانشگاه خوب درس نخواندم. یا: ببین چقدر موفق است، من نیستم.' },
];

const NOTE_COLORS = ['#f59e0b','#22c55e','#3b82f6','#ec4899','#a78bfa','#f97316'];
const SHAMSI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

const loadScript = src => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) return res();
  const s = document.createElement('script');
  s.src = src; s.onload = res; s.onerror = () => rej(new Error(src));
  document.head.appendChild(s);
});

const toPersianNum = n => n.toString().replace(/\d/g, x => '۰۱۲۳۴۵۶۷۸۹'[x]);
const padZero = n => n < 10 ? '۰' + toPersianNum(n) : toPersianNum(n);

// دریافت قطعات تاریخ شمسی
const getShamsiParts = () => {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', calendar: 'persian'
  }).formatToParts(d);
  const val = type => parseInt(parts.find(p => p.type === type)?.value || 0);
  return { y: val('year'), m: val('month'), d: val('day'), h: val('hour'), min: val('minute') };
};

// تبدیل قطعات به رشته متنی تمیز
const formatShamsi = ({y, m, d, h, min}) => {
  return `${toPersianNum(d)} ${SHAMSI_MONTHS[m-1]} ${toPersianNum(y)} - ${padZero(h)}:${padZero(min)}`;
};

const getShamsiNow = () => formatShamsi(getShamsiParts());

// ─────────────────────────── MICRO COMPONENTS ───────────────────────────

const InitialLoading = () => (
  <div style={{position:'fixed',inset:0,background:'#09090b',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
    <Brain size={64} color="#6366f1" style={{animation:'pulse-ring 1.5s infinite ease-out'}} />
    <h2 style={{color:'white',marginTop:24,fontSize:20,fontWeight:900,letterSpacing:'-0.5px'}}>در حال آماده‌سازی...</h2>
    <p style={{color:'#a1a1aa',fontSize:13,marginTop:8}}>فضای شخصی‌سازی شده شما</p>
  </div>
);

const SaveAnimation = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,pointerEvents:'none'}}>
      <div style={{position:'relative'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'rgba(34,197,94,0.4)',animation:'pulse-ring 0.8s ease-out 0.2s both'}}/>
        <div style={{
          background:'#22c55e',borderRadius:'50%',width:80,height:80,
          display:'flex',alignItems:'center',justifyContent:'center',
          animation:'popIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards',
          boxShadow:'0 0 40px rgba(34,197,94,0.5)'
        }}>
          <Check size={38} color="white" strokeWidth={3}/>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ msg }) => {
  if (!msg) return null;
  return (
    <div style={{
      position:'fixed',bottom:90,left:'50%', transform:'translateX(-50%)',
      background:'#18181b',color:'#f4f4f5', padding:'10px 20px',borderRadius:12,zIndex:9998,
      fontSize:13,fontWeight:700, animation:'slideUpFade 2.5s ease-in-out forwards',
      boxShadow:'0 4px 20px rgba(0,0,0,0.5)', whiteSpace:'nowrap',border:'1px solid #3f3f46'
    }}>{msg}</div>
  );
};

// اسلایدر با متد مقیاس معکوس (Scale Inversion)
// 👑 این روش در استودیوهای رده بالا استفاده می‌شه. مرورگر فکر می‌کنه داره چپ‌به‌راست کار می‌کنه،
// ولی چشم کاربر یک اسلایدر راست‌به‌چپ با هیت‌باکس ۱۰۰٪ بی‌نقص رو می‌بینه. هیچ نیازی به دستکاری RTL نیست.
const CustomSlider = ({ value, onChange, label, color = '#6366f1' }) => (
  <div style={{ width:'100%', marginBottom:16 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700, marginBottom:8, color }}>
      <span>{label}</span>
      <span>{toPersianNum(value)}%</span>
    </div>
    {/* آینه‌ای کردن کل کانتینر برای فریب دادن موتور تاچ مرورگر */}
    <div style={{ position:'relative', width:'100%', height:24, borderRadius:12, background:'rgba(128,128,128,0.15)', transform: 'scaleX(-1)' }}>
      
      {/* نوار پر شده (چون آینه شده، از دید کاربر از راست پر می‌شه) */}
      <div style={{
        position:'absolute', left:0, top:0, height:'100%',
        width:`${value}%`, borderRadius:12, background:color,
        pointerEvents:'none', transition:'width .1s ease-out'
      }}/>
      
      {/* thumb سفارشی و نامرئی از نظر تاچ */}
      <div style={{
        position:'absolute', top:0,
        left:`calc(${value}% - 12px)`, /* محاسبه بر اساس چپ (آینه شده) */
        width:24, height:24, borderRadius:'50%',
        background:'white', border:`3px solid ${color}`,
        boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
        transition:'left .1s ease-out',
        zIndex:5, pointerEvents:'none'
      }}/>
      
      {/* اینپوت استاندارد LTR. بدون درگیری با باگ‌های RTL */}
      <input
        type="range" min="0" max="100"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          position:'absolute', top:0, left:0,
          width:'100%', height:'100%',
          opacity: 0, cursor:'pointer',
          zIndex:10, margin:0, padding:0,
          WebkitAppearance:'none', appearance:'none'
        }}
      />
    </div>
  </div>
);

// ─────────────────────────── FAB MENU ───────────────────────────

const FABMenu = ({ onAddLog, onAddNote }) => {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: <FileText size={18}/>, label:'تکلیف / یادداشت',  action: onAddNote, color:'#ec4899' },
    { icon: <Brain size={18}/>,    label:'ثبت افکار',     action: onAddLog,  color:'#6366f1' },
  ];
  return (
    <div style={{position:'fixed',bottom:80,left:20,zIndex:100}} className="md:bottom-10 md:left-10">
      {open && (
        <div style={{position:'absolute',bottom:68,left:0,display:'flex',flexDirection:'column',gap:10,alignItems:'flex-start'}}>
          {items.map((item,i)=>(
            <button key={i} onClick={()=>{setOpen(false);item.action();}}
              style={{
                display:'flex',alignItems:'center',gap:10, background:item.color,color:'white',
                border:'none',borderRadius:14, padding:'10px 16px',
                fontSize:13,fontWeight:700,cursor:'pointer', boxShadow:`0 4px 20px ${item.color}60`,
                animation:`fabExpand .25s cubic-bezier(.34,1.56,.64,1) ${i*0.07}s both`, whiteSpace:'nowrap'
              }}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={()=>setOpen(!open)} style={{
        width:56,height:56,borderRadius:18, background:'#6366f1',color:'white',border:'none',
        display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        boxShadow:'0 0 24px rgba(99,102,241,0.5)', transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
        transform: open ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
      }}>
        <Plus size={28} strokeWidth={2.5}/>
      </button>
    </div>
  );
};

// ─────────────────────────── MODALS ───────────────────────────

const CognitiveErrorsModal = ({ onClose, isDark }) => {
  const bg   = isDark ? '#09090b' : '#f8fafc';
  const card = isDark ? '#18181b' : '#ffffff';
  const bd   = isDark ? '#27272a' : '#e2e8f0';
  const tx   = isDark ? '#f4f4f5' : '#1e293b';
  const sub  = isDark ? '#a1a1aa' : '#475569';
  const ex   = isDark ? '#d4d4d8' : '#374151';
  const exBg = isDark ? '#27272a' : '#f8fafc';

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:isDark?'rgba(0,0,0,0.85)':'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',display:'flex',justifyContent:'center'}}>
      <div style={{background:bg,width:'100%',maxWidth:640,display:'flex',flexDirection:'column',animation:'slideInUp .3s ease-out'}}>
        <div style={{position:'sticky',top:0,zIndex:10,background:isDark?'rgba(9,9,11,.92)':'rgba(248,250,252,.92)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${bd}`,padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={onClose} style={{color:sub,fontSize:14,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>بستن ✕</button>
          <h1 style={{color:tx,fontWeight:900,fontSize:18,display:'flex',alignItems:'center',gap:8}}>
            <BookOpen size={20} color="#6366f1"/> خطاهای شناختی
          </h1>
          <div style={{width:40}}/>
        </div>
        <div style={{padding:'24px 20px',flex:1,overflowY:'auto'}}>
          <p style={{color:sub,fontSize:13,textAlign:'center',marginBottom:20,lineHeight:1.7}}>
            این فهرست خطاهای رایج در تفکر را نشان می‌دهد. یادتان باشد همه انسان‌ها گاهی این خطاها را دارند.
          </p>
          {COGNITIVE_ERRORS.map((err,i)=>(
            <div key={err.id} style={{background:card,border:`1px solid ${bd}`,borderRadius:16,padding:'18px 20px',marginBottom:10,animation:`fadeSlideIn .3s ease-out ${i*0.035}s both`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <span style={{background:'#6366f1',color:'white',borderRadius:8,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,flexShrink:0}}>
                  {toPersianNum(err.id)}
                </span>
                <h3 style={{color:tx,fontWeight:900,fontSize:15,margin:0}}>{err.name}</h3>
              </div>
              <p style={{color:sub,fontSize:13,lineHeight:1.8,marginBottom:10}}>{err.desc}</p>
              <div style={{background:exBg,border:`1px solid ${bd}`,borderRadius:10,padding:'10px 14px'}}>
                <span style={{color:'#6366f1',fontSize:11,fontWeight:700}}>مثال: </span>
                <span style={{color:ex,fontSize:13,fontStyle:'italic'}}>«{err.ex}»</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SessionNotesModal = ({ notes, onSave, onDelete, onClose, isDark, startAdding, showToast }) => {
  const [adding, setAdding] = useState(startAdding);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    setAdding(startAdding);
  }, [startAdding]);

  const bg   = isDark ? '#09090b' : '#f8fafc';
  const card = isDark ? '#18181b' : '#ffffff';
  const bd   = isDark ? '#27272a' : '#e2e8f0';
  const tx   = isDark ? '#f4f4f5' : '#1e293b';
  const sub  = isDark ? '#a1a1aa' : '#475569';
  const inp  = isDark ? '#09090b' : '#f8fafc';

  const iStyle = {
    width:'100%',boxSizing:'border-box',
    background:inp,border:`1px solid ${bd}`,borderRadius:12,
    padding:'12px 14px',color:tx,fontSize:13,
    fontFamily:'Vazirmatn,sans-serif',resize:'none',outline:'none'
  };

  const handleEditReq = (note) => {
    setEditingId(note.id);
    setQ(note.question);
    setA(note.answer);
    setColor(note.color);
    setAdding(true);
  };

  const handleSave = () => {
    if (!q.trim() || !a.trim()) {
      showToast('لطفا فیلدهای سوال و جواب را پر کنید');
      return;
    }
    onSave({
      id: editingId || Date.now().toString(),
      date: getShamsiNow(),
      question: q.trim(), answer: a.trim(), color
    });
    setQ(''); setA(''); setEditingId(null); setAdding(false);
  };

  const cancelAdd = () => {
    setQ(''); setA(''); setEditingId(null); setAdding(false);
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:isDark?'rgba(0,0,0,0.85)':'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',display:'flex',justifyContent:'center'}}>
      <div style={{background:bg,width:'100%',maxWidth:640,display:'flex',flexDirection:'column',animation:'slideInUp .3s ease-out'}}>
        <div style={{position:'sticky',top:0,zIndex:10,background:isDark?'rgba(9,9,11,.92)':'rgba(248,250,252,.92)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${bd}`,padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={onClose} style={{color:sub,fontSize:14,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>بستن ✕</button>
          <h1 style={{color:tx,fontWeight:900,fontSize:18,display:'flex',alignItems:'center',gap:8}}>
            <MessageSquare size={20} color="#ec4899"/> تکلیف / یادداشت
          </h1>
          <button onClick={()=>setAdding(true)} disabled={adding} style={{background:adding?'transparent':'#ec4899',color:adding?'transparent':'white',border:'none',borderRadius:10,padding:'7px 14px',fontSize:13,fontWeight:700,cursor:adding?'default':'pointer'}}>
            + جدید
          </button>
        </div>

        <div style={{padding:'20px',flex:1,overflowY:'auto'}}>
          {adding && (
            <div style={{background:card,border:`2px solid #ec4899`,borderRadius:18,padding:20,marginBottom:20,animation:'popIn .25s ease-out'}}>
              <h3 style={{color:tx,fontWeight:900,marginBottom:14,fontSize:15}}>{editingId ? 'ویرایش یادداشت 📝' : 'یادداشت جدید 📝'}</h3>
              <div style={{marginBottom:12}}>
                <label style={{color:sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>سوال یا تکلیف تراپیست</label>
                <textarea value={q} onChange={e=>setQ(e.target.value)} rows={3} placeholder="تراپیست از شما چه خواست؟" style={iStyle}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{color:'#ec4899',fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>جواب شما (بدون کمک هوش مصنوعی 🧠)</label>
                <textarea value={a} onChange={e=>setA(e.target.value)} rows={5} placeholder="جواب خودتان را اینجا بنویسید..." style={iStyle}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{color:sub,fontSize:12,fontWeight:700,display:'block',marginBottom:8}}>رنگ برچسب</label>
                <div style={{display:'flex',gap:8}}>
                  {NOTE_COLORS.map(c=>(
                    <button key={c} onClick={()=>setColor(c)} style={{
                      width:28,height:28,borderRadius:'50%',background:c,border:'none',cursor:'pointer',
                      outline:color===c?`3px solid white`:'none', boxShadow:color===c?`0 0 0 5px ${c}50`:'none',
                      transform:color===c?'scale(1.2)':'scale(1)', transition:'all .2s'
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={cancelAdd} style={{flex:1,padding:'11px',borderRadius:12,background:isDark?'#27272a':'#f1f5f9',color:sub,border:'none',fontSize:13,fontWeight:700,cursor:'pointer'}}>لغو</button>
                <button onClick={handleSave} style={{flex:2,padding:'11px',borderRadius:12,background:'#ec4899',color:'white',border:'none',fontSize:13,fontWeight:700,cursor:'pointer'}}>{editingId ? 'بروزرسانی ✓' : 'ذخیره یادداشت ✓'}</button>
              </div>
            </div>
          )}

          {notes.length===0 && !adding ? (
            <div style={{textAlign:'center',padding:'60px 24px',color:sub}}>
              <MessageSquare size={48} style={{margin:'0 auto 14px',opacity:.3,display:'block'}}/>
              <p style={{fontWeight:700,marginBottom:6}}>یادداشتی ندارید</p>
              <p style={{fontSize:13}}>از دکمه «+ جدید» استفاده کنید</p>
            </div>
          ) : notes.map((note,i)=>(
            <div key={note.id} style={{
              background:card,border:`1px solid ${bd}`,borderRadius:16,
              padding:20,marginBottom:12,borderRight:`4px solid ${note.color}`,
              animation:`fadeSlideIn .3s ease-out ${i*0.05}s both`
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{background:note.color+'25',color:note.color,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20}}>{toPersianNum(note.date)}</span>
                <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  {deleteConfirm === note.id ? (
                    <>
                      <button onClick={() => { onDelete(note.id); setDeleteConfirm(null); }} style={{background:'#ef4444',color:'white',border:'none',padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer'}}>حذف</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{background:isDark?'#27272a':'#e2e8f0',color:tx,border:'none',padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer'}}>لغو</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditReq(note)} style={{color: sub, background: 'none', border: 'none', cursor: 'pointer', padding: 4}} title="ویرایش">
                        <Edit2 size={16}/>
                      </button>
                      <button onClick={() => setDeleteConfirm(note.id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4}} title="حذف">
                        <Trash2 size={16}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div style={{background:note.color+'15',borderRadius:10,padding:'10px 14px',marginBottom:10,border:`1px solid ${note.color}35`}}>
                <span style={{color:note.color,fontSize:11,fontWeight:700}}>سوال تراپیست: </span>
                <p style={{color:tx,fontSize:13,margin:'4px 0 0',lineHeight:1.7}}>{note.question}</p>
              </div>
              <p style={{color:sub,fontSize:13,lineHeight:1.8}}>{note.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddLogModal = ({ onSave, onClose, isDark, initialData, showToast }) => {
  const [dateStr, setDateStr] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({y: 1403, m: 1, d: 1, h: 12, min: 0});
  
  const [situation, setSituation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isAddingEmo, setIsAddingEmo] = useState(false);
  const [thoughts, setThoughts] = useState([{text:'',belief:50}]);
  const [hasShame, setHasShame] = useState(true);
  const [shameLevel, setShameLevel] = useState(50);

  useEffect(() => {
    if (initialData) {
      setSituation(initialData.situation);
      setSelectedEmotions(initialData.emotions);
      setThoughts(initialData.thoughts);
      setHasShame(initialData.hasShame);
      setShameLevel(initialData.shameLevel !== null ? initialData.shameLevel : 50);
      setDateStr(initialData.date);
    } else {
      setDateStr(getShamsiNow());
    }
  }, [initialData]);

  const bg   = isDark ? '#09090b' : '#f8fafc';
  const card = isDark ? '#18181b' : '#ffffff';
  const bd   = isDark ? '#27272a' : '#e2e8f0';
  const tx   = isDark ? '#f4f4f5' : '#1e293b';
  const sub  = isDark ? '#a1a1aa' : '#475569';

  const selectStyle = {
    flex: 1, background: isDark ? '#09090b' : '#f8fafc', color: tx,
    border: `1px solid ${bd}`, borderRadius: 10, padding: '8px',
    fontSize: 14, outline: 'none', textAlign: 'center', fontFamily: 'Vazirmatn'
  };

  const toggleEmo = name => {
    const exists = selectedEmotions.find(e=>e.name===name);
    setSelectedEmotions(exists
      ? selectedEmotions.filter(e=>e.name!==name)
      : [...selectedEmotions,{name,intensity:50}]
    );
  };

  const addCustomEmo = () => {
    const v = customInput.trim();
    if (v && !selectedEmotions.find(e=>e.name===v)) {
      setSelectedEmotions([...selectedEmotions,{name:v,intensity:50}]);
    }
    setCustomInput(''); setIsAddingEmo(false);
  };

  const handleSave = () => {
    // 👑 جایگزینی alert بلاک‌شده در محیط‌های سَندباکس 👑
    if (!situation.trim()) {
      showToast('لطفا موقعیت را وارد کنید تا لاگ ثبت شود.');
      return;
    }
    onSave({
      id: initialData ? initialData.id : Date.now().toString(),
      date: dateStr,
      situation,
      emotions: selectedEmotions,
      thoughts: thoughts.filter(t=>t.text.trim()!==''),
      hasShame,
      shameLevel: hasShame ? shameLevel : null
    });
  };

  const openDateModal = () => {
    setTempDate(getShamsiParts());
    setShowDatePicker(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{background:isDark?'rgba(0,0,0,0.85)':'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)'}}>
      {showDatePicker && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
          <div style={{background:card,padding:20,borderRadius:20,width:'90%',maxWidth:360,border:`1px solid ${bd}`,boxShadow:'0 10px 40px rgba(0,0,0,0.5)',animation:'popIn .2s ease-out'}}>
            <h3 style={{color:tx,fontWeight:900,marginBottom:16,textAlign:'center'}}>انتخاب تاریخ و زمان</h3>
            
            <div style={{display:'flex',gap:8,marginBottom:12}} dir="rtl">
              <select value={tempDate.d} onChange={e=>setTempDate({...tempDate, d:parseInt(e.target.value)})} style={selectStyle}>
                {[...Array(31)].map((_,i)=><option key={i+1} value={i+1}>{toPersianNum(i+1)}</option>)}
              </select>
              <select value={tempDate.m} onChange={e=>setTempDate({...tempDate, m:parseInt(e.target.value)})} style={selectStyle}>
                {SHAMSI_MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select value={tempDate.y} onChange={e=>setTempDate({...tempDate, y:parseInt(e.target.value)})} style={selectStyle}>
                {[...Array(20)].map((_,i)=><option key={1395+i} value={1395+i}>{toPersianNum(1395+i)}</option>)}
              </select>
            </div>

            <div style={{display:'flex',gap:8,marginBottom:20}} dir="ltr">
              <select value={tempDate.h} onChange={e=>setTempDate({...tempDate, h:parseInt(e.target.value)})} style={selectStyle}>
                {[...Array(24)].map((_,i)=><option key={i} value={i}>{padZero(i)}</option>)}
              </select>
              <span style={{color:tx,alignSelf:'center',fontWeight:'bold'}}>:</span>
              <select value={tempDate.min} onChange={e=>setTempDate({...tempDate, min:parseInt(e.target.value)})} style={selectStyle}>
                {[...Array(60)].map((_,i)=><option key={i} value={i}>{padZero(i)}</option>)}
              </select>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowDatePicker(false)} style={{flex:1,padding:'10px',background:bg,color:sub,border:`1px solid ${bd}`,borderRadius:12,fontWeight:700,fontFamily:'Vazirmatn',cursor:'pointer'}}>لغو</button>
              <button onClick={()=>{ setDateStr(formatShamsi(tempDate)); setShowDatePicker(false); }} style={{flex:2,padding:'10px',background:'#6366f1',color:'white',border:'none',borderRadius:12,fontWeight:700,fontFamily:'Vazirmatn',cursor:'pointer'}}>تایید ✓</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:bg,minHeight:'100vh',width:'100%',maxWidth:520,margin:'0 auto',display:'flex',flexDirection:'column',animation:'slideInUp .3s ease-out'}}>
        <div style={{position:'sticky',top:0,zIndex:10,background:isDark?'rgba(9,9,11,.92)':'rgba(248,250,252,.92)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${bd}`,padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={onClose} style={{color:sub,fontSize:14,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>لغو ✕</button>
          <h1 style={{color:tx,fontWeight:900,fontSize:17,display:'flex',alignItems:'center',gap:8}}>
            {initialData ? 'ویرایش فکر' : 'ثبت فکر جدید'} <Brain size={18} color="#6366f1"/>
          </h1>
          <div style={{width:40}}/>
        </div>

        <div style={{padding:'24px 20px',flex:1}}>
          <div style={{marginBottom:24}}>
            <h3 style={{color:sub,fontSize:12,fontWeight:700,marginBottom:8}}>۱. تاریخ و ساعت</h3>
            <div style={{display:'flex',gap:8}}>
              <button onClick={openDateModal} style={{flex:1,background:card,border:`1px solid ${bd}`,borderRadius:12,padding:'11px 14px',color:tx,fontSize:13,textAlign:'right',fontFamily:'Vazirmatn',cursor:'pointer'}}>
                {dateStr}
              </button>
              <button onClick={()=>setDateStr(getShamsiNow())}
                style={{flexShrink:0,background:isDark?'#27272a':'#e2e8f0',color:tx,border:'none',borderRadius:12,padding:'11px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                همین الان
              </button>
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{color:sub,fontSize:12,fontWeight:700,marginBottom:8}}>۲. موقعیت</h3>
            <textarea value={situation} onChange={e=>setSituation(e.target.value)}
              placeholder="چه اتفاقی افتاد؟ کجا بودید؟" rows={4}
              style={{width:'100%',boxSizing:'border-box',background:card,border:`1px solid ${bd}`,borderRadius:14,padding:'12px 14px',color:tx,fontSize:13,fontFamily:'Vazirmatn,sans-serif',resize:'none',outline:'none'}}
            />
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{color:sub,fontSize:12,fontWeight:700,marginBottom:10}}>۳. هیجان‌ها</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {DEFAULT_EMOTIONS.map(emo=>{
                const sel = selectedEmotions.some(e=>e.name===emo);
                const ec = getEC(emo, isDark);
                return (
                  <button key={emo} onClick={()=>toggleEmo(emo)} style={{
                    padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,
                    border:`1.5px solid ${sel?ec.bd:isDark?'#3f3f46':'#e2e8f0'}`,
                    background:sel?ec.bg:isDark?'#27272a':'#f8fafc',
                    color:sel?ec.tx:isDark?'#71717a':'#64748b',
                    cursor:'pointer', transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
                    transform:sel?'scale(1.05)':'scale(1)', boxShadow:sel?`0 2px 10px ${ec.hex}40`:''
                  }}>{emo}</button>
                );
              })}
              {isAddingEmo ? (
                <div style={{display:'flex',gap:6}}>
                  <input autoFocus value={customInput} onChange={e=>setCustomInput(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addCustomEmo()} placeholder="هیجان دیگر..."
                    style={{background:card,border:`1px solid ${bd}`,borderRadius:20,padding:'6px 12px',color:tx,fontSize:12,outline:'none',width:100}}
                  />
                  <button onClick={addCustomEmo} style={{background:'#6366f1',color:'white',border:'none',borderRadius:20,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>✓</button>
                </div>
              ) : (
                <button onClick={()=>setIsAddingEmo(true)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,border:`1.5px dashed ${isDark?'#3f3f46':'#cbd5e1'}`,background:'none',color:'#6366f1',cursor:'pointer'}}>
                  + دیگر
                </button>
              )}
            </div>
            <div>
              {selectedEmotions.map(emo=>{
                const ec = getEC(emo.name, isDark);
                return (
                  <CustomSlider key={emo.name} label={emo.name} value={emo.intensity} color={ec.hex}
                    onChange={v=>setSelectedEmotions(selectedEmotions.map(e=>e.name===emo.name?{...e,intensity:v}:e))}
                  />
                );
              })}
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{color:sub,fontSize:12,fontWeight:700,marginBottom:10}}>۴. افکار</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:10}}>
              {thoughts.map((t,i)=>(
                <div key={i} style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:14,position:'relative'}}>
                  {thoughts.length>1&&(
                    <button onClick={()=>setThoughts(thoughts.filter((_,j)=>j!==i))}
                      style={{position:'absolute',top:10,left:10,background:'none',border:'none',cursor:'pointer',color:isDark?'#52525b':'#94a3b8'}}>
                      <X size={14}/>
                    </button>
                  )}
                  <textarea value={t.text} onChange={e=>{const n=[...thoughts];n[i].text=e.target.value;setThoughts(n);}}
                    placeholder="چه فکری از سرت گذشت؟" rows={2}
                    style={{width:'100%',background:'transparent',border:'none',outline:'none',color:tx,fontSize:13,fontFamily:'Vazirmatn,sans-serif',resize:'none',marginBottom:10}}
                  />
                  <CustomSlider label="میزان باور" value={t.belief}
                    onChange={v=>{const n=[...thoughts];n[i].belief=v;setThoughts(n);}}
                  />
                </div>
              ))}
            </div>
            <button onClick={()=>setThoughts([...thoughts,{text:'',belief:50}])}
              style={{width:'100%',padding:'11px',border:`2px dashed ${isDark?'#3f3f46':'#cbd5e1'}`,borderRadius:12,background:'none',color:'#6366f1',fontSize:13,fontWeight:700,cursor:'pointer'}}>
              + افزودن فکر دیگر
            </button>
          </div>

          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:14,padding:16,marginBottom:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:hasShame?14:0}}>
              <h3 style={{color:sub,fontSize:12,fontWeight:700}}>۵. میزان شرم</h3>
              <button onClick={()=>setHasShame(!hasShame)} style={{
                display:'flex',alignItems:'center',gap:6,
                background:hasShame?(isDark?'rgba(99,102,241,0.2)':'#e0e7ff'):(isDark?'#27272a':'#f1f5f9'),
                color:hasShame?'#6366f1':sub,
                border:'none',borderRadius:10,padding:'7px 12px',fontSize:12,fontWeight:700,cursor:'pointer',
                transition:'all .2s'
              }}>
                {hasShame?<ToggleRight size={16}/>:<ToggleLeft size={16}/>}
                {hasShame?'ثبت می‌شود':'بدون شرم'}
              </button>
            </div>
            <div style={{maxHeight:hasShame?100:0,overflow:'hidden',transition:'max-height .3s ease'}}>
              <p style={{color:sub,fontSize:12,marginBottom:10}}>چقدر احساس شرم یا بی‌ارزشی دارید؟</p>
              <CustomSlider label="شرم" value={shameLevel} onChange={setShameLevel} color="#8b5cf6"/>
            </div>
            {!hasShame&&<p style={{color:isDark?'#52525b':'#94a3b8',fontSize:11,fontWeight:600,textAlign:'center',marginTop:4}}>احساس شرم ثبت نمی‌شود</p>}
          </div>
        </div>

        <div style={{padding:'14px 20px',borderTop:`1px solid ${bd}`,background:card}}>
          <button onClick={handleSave} style={{
            width:'100%',background:'#6366f1',color:'white',
            border:'none',borderRadius:14,padding:'14px',
            fontSize:15,fontWeight:900,cursor:'pointer',
            boxShadow:'0 0 20px rgba(99,102,241,0.4)', transition:'all .2s'
          }}>
            {initialData ? 'بروزرسانی لاگ ✓' : 'ثبت لاگ ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ logs, sessionNotes, onExportPDF, onExportWord, onPrint, isDark, toggleTheme, isExporting, openCognitive, openNotes, onEditLog, onDeleteLog, showToast }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const logsWithShame = logs.filter(l=>l.hasShame&&l.shameLevel!=null);
  const avgShame = logsWithShame.length===0?0:Math.round(logsWithShame.reduce((a,l)=>a+l.shameLevel,0)/logsWithShame.length);

  const bg   = isDark ? '#09090b' : '#f8fafc';
  const card = isDark ? '#18181b' : '#ffffff';
  const bd   = isDark ? '#27272a' : '#e2e8f0';
  const tx   = isDark ? '#f4f4f5' : '#1e293b';
  const sub  = isDark ? '#71717a' : '#64748b';

  return (
    <div style={{minHeight:'100vh',paddingBottom:100,background:bg,transition:'background .3s'}}>
      <div style={{position:'sticky',top:0,zIndex:10,background:isDark?'rgba(9,9,11,0.9)':'rgba(248,250,252,0.9)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${bd}`,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:6}}>
          <button onClick={onPrint} title="پرینت مستقیم" style={{
            display:'flex',alignItems:'center',justifyContent:'center',
            background:'none',border:`1px solid ${bd}`,borderRadius:10,
            padding:'8px',color:'#6366f1',cursor:'pointer'
          }}>
            <Printer size={18}/>
          </button>
          
          <button onClick={onExportWord} title="خروجی Word" style={{
            display:'flex',alignItems:'center',justifyContent:'center',
            background:'none',border:`1px solid ${bd}`,borderRadius:10,
            padding:'8px',color:'#6366f1',cursor:'pointer'
          }}>
            <FileText size={18}/>
          </button>

          <button onClick={onExportPDF} disabled={isExporting} title="خروجی PDF" style={{
            display:'flex',alignItems:'center',justifyContent:'center',
            background:'none',border:`1px solid ${bd}`,borderRadius:10,
            padding:'8px',color:'#6366f1',cursor:'pointer'
          }}>
            {isExporting ? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>}
          </button>
        </div>
        
        <h1 style={{color:tx,fontWeight:900,fontSize:17,display:'flex',alignItems:'center',gap:8}}>
          NAT Tracker <Brain size={19} color="#6366f1"/>
        </h1>
      </div>

      <div style={{padding:'20px',maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
          <div style={{background:card,border:`1px solid ${bd}`,borderRadius:20,padding:'16px',display:'flex',flexDirection:'column',alignItems:'center',boxShadow:isDark?'0 4px 20px rgba(0,0,0,0.3)':'0 2px 12px rgba(0,0,0,0.06)'}}>
            <span style={{color:sub,fontSize:12,marginBottom:4}}>تعداد ثبت‌ها</span>
            <span style={{color:tx,fontSize:32,fontWeight:900}}>{toPersianNum(logs.length)}</span>
          </div>
          <div style={{background:isDark?'rgba(99,102,241,0.12)':'#eef2ff',border:`1px solid ${isDark?'rgba(99,102,241,0.25)':'#c7d2fe'}`,borderRadius:20,padding:'16px',display:'flex',flexDirection:'column',alignItems:'center',boxShadow:'0 2px 12px rgba(99,102,241,0.1)'}}>
            <span style={{color:'#6366f1',fontSize:12,marginBottom:4}}>میانگین شرم</span>
            <span style={{color:'#6366f1',fontSize:32,fontWeight:900}}>{toPersianNum(avgShame)}٪</span>
          </div>
        </div>

        <h2 style={{color:tx,fontWeight:900,fontSize:18,marginBottom:14}}>ثبت‌های من</h2>
        
        {logs.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 24px',color:sub}}>
             <Brain size={48} style={{margin:'0 auto 14px',opacity:.3,display:'block'}}/>
             <p style={{fontWeight:700}}>هیچ فکری ثبت نشده</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
            {logs.map((log,li)=>{
              const topEmo = log.emotions.length>0 ? log.emotions.reduce((p,c)=>p.intensity>c.intensity?p:c) : null;
              const ec = topEmo ? getEC(topEmo.name, isDark) : null;

              return (
                <div key={log.id} style={{
                  position: 'relative',
                  background:card,border:`1px solid ${bd}`,borderRadius:20,padding:'18px',
                  display:'flex',flexDirection:'column', transition:'all .25s',
                  animation:`fadeSlideIn .4s ease-out ${li*0.06}s both`,
                  boxShadow:isDark?'0 2px 12px rgba(0,0,0,0.2)':'0 2px 12px rgba(0,0,0,0.04)'
                }}>
                  {/* 👑 مدال اختصاصی حذف که جایگزین window.confirm شده است 👑 */}
                  {deleteConfirmId === log.id && (
                    <div style={{position:'absolute',inset:0,background:card,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',gap:10,zIndex:20,flexDirection:'column'}}>
                      <span style={{color:tx,fontSize:14,fontWeight:900,marginBottom:10}}>آیا این لاگ حذف شود؟</span>
                      <div style={{display:'flex',gap:10}}>
                        <button onClick={() => { onDeleteLog(log.id); setDeleteConfirmId(null); }} style={{background:'#ef4444',color:'white',border:'none',padding:'8px 16px',borderRadius:10,fontWeight:700,cursor:'pointer'}}>بله، حذف کن</button>
                        <button onClick={() => setDeleteConfirmId(null)} style={{background:isDark?'#27272a':'#e2e8f0',color:tx,border:'none',padding:'8px 16px',borderRadius:10,fontWeight:700,cursor:'pointer'}}>لغو</button>
                      </div>
                    </div>
                  )}

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{color:sub,fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                      <Clock size={11}/> {toPersianNum(log.date)}
                    </span>
                    {log.hasShame&&log.shameLevel!=null ? (
                      <span style={{background:isDark?'rgba(99,102,241,0.15)':'#eef2ff',color:'#6366f1',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8}}>
                        شرم {toPersianNum(log.shameLevel)}٪
                      </span>
                    ) : (
                      <span style={{background:isDark?'#27272a':'#f8fafc',color:sub,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:8}}>بدون شرم</span>
                    )}
                  </div>

                  <p style={{color:tx,fontSize:13,lineHeight:1.7,marginBottom:16,fontWeight:500}}>{log.situation}</p>

                  {topEmo&&(
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
                      <span style={{
                        background:ec.bg,color:ec.tx, border:`1.5px solid ${ec.bd}`,
                        fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,
                        display:'flex',alignItems:'center',gap:4
                      }}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:ec.hex,flexShrink:0}}/>
                        {topEmo.name} {toPersianNum(topEmo.intensity)}٪
                      </span>
                    </div>
                  )}

                  {log.thoughts&&log.thoughts.length>0&&(
                    <div style={{marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${bd}`}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: 6, color: sub, fontSize: 12, fontWeight: 700}}>
                          <MessageSquare size={14}/> افکار ({toPersianNum(log.thoughts.length)})
                        </h4>
                        
                        <div style={{display: 'flex', gap: 8}}>
                            <button onClick={() => onEditLog(log)} style={{color: sub, background: 'none', border: 'none', cursor: 'pointer', padding: 4}} title="ویرایش">
                              <Edit2 size={16}/>
                            </button>
                            <button onClick={() => setDeleteConfirmId(log.id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4}} title="حذف">
                              <Trash2 size={16}/>
                            </button>
                        </div>
                      </div>
                      
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {log.thoughts.map((th, i) => (
                          <div key={i} style={{
                            background: isDark ? '#1f1f22' : '#f8fafc',
                            border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
                            borderRadius: 14, padding: '12px 14px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10
                          }}>
                            <span style={{
                              background: isDark ? '#09090b' : '#e2e8f0', color: tx, fontSize: 11, fontWeight: 700,
                              padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap'
                            }}>باور {toPersianNum(th.belief)}٪</span>
                            
                            <span style={{color: tx, fontSize: 13, fontWeight: 600, lineHeight: 1.6, textAlign: 'right', flex: 1}}>{th.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        position:'fixed',bottom:0,width:'100%',
        background:isDark?'rgba(9,9,11,0.95)':'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)',
        borderTop:`1px solid ${bd}`, padding:'10px 20px 16px',
        display:'flex',justifyContent:'space-around',alignItems:'center', zIndex:50
      }}>
        <button onClick={openCognitive} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:sub}}>
          <BookOpen size={21}/>
          <span style={{fontSize:10,fontWeight:600}}>خطاهای شناختی</span>
        </button>
        <button onClick={toggleTheme} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:sub}}>
          {isDark?<Sun size={21}/>:<Moon size={21}/>}
          <span style={{fontSize:10,fontWeight:600}}>{isDark?'روشن':'تاریک'}</span>
        </button>
        <div style={{width:60}}/>
        <button style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:'#6366f1'}}>
          <div style={{background:'rgba(99,102,241,0.12)',padding:'6px',borderRadius:10}}>
            <LayoutGrid size={21}/>
          </div>
          <span style={{fontSize:10,fontWeight:700}}>داشبورد</span>
        </button>
        <button onClick={()=>openNotes(false)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:sub}}>
          <MessageSquare size={21}/>
          <span style={{fontSize:10,fontWeight:600}}>جلسه</span>
        </button>
      </div>
    </div>
  );
};

const PdfTable = ({ logs }) => (
  <div id="export-container-data" style={{position:'absolute',left:-9999,top:0,width:860,background:'white',color:'black',padding:36,fontFamily:'Vazirmatn,serif'}} dir="rtl">
    <h1 style={{textAlign:'center',fontSize:22,fontWeight:900,marginBottom:24,borderBottom:'2px solid #e2e8f0',paddingBottom:12}}>گزارش NAT Tracker</h1>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,textAlign:'right'}}>
      <thead>
        <tr style={{background:'#f8fafc'}}>
          <th style={{border:'1px solid #e2e8f0',padding:'10px 12px',fontWeight:800,width:'14%'}}>تاریخ و ساعت</th>
          <th style={{border:'1px solid #e2e8f0',padding:'10px 12px',fontWeight:800,width:'30%'}}>موقعیت</th>
          <th style={{border:'1px solid #e2e8f0',padding:'10px 12px',fontWeight:800,width:'14%'}}>هیجان غالب</th>
          <th style={{border:'1px solid #e2e8f0',padding:'10px 12px',fontWeight:800,width:'30%'}}>افکار</th>
          <th style={{border:'1px solid #e2e8f0',padding:'10px 12px',fontWeight:800,width:'12%',textAlign:'center'}}>شرم</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log=>{
          const top = log.emotions.length>0?log.emotions.reduce((p,c)=>p.intensity>c.intensity?p:c):null;
          return (
            <tr key={log.id}>
              <td style={{border:'1px solid #e2e8f0',padding:'10px 12px',verticalAlign:'top'}}>{toPersianNum(log.date)}</td>
              <td style={{border:'1px solid #e2e8f0',padding:'10px 12px',verticalAlign:'top',lineHeight:1.7}}>{log.situation}</td>
              <td style={{border:'1px solid #e2e8f0',padding:'10px 12px',verticalAlign:'top'}}>{top?`${top.name} (${toPersianNum(top.intensity)}%)`:'—'}</td>
              <td style={{border:'1px solid #e2e8f0',padding:'10px 12px',verticalAlign:'top'}}>
                <ul style={{paddingRight:16,margin:0}}>
                  {log.thoughts.map((t,i)=>(
                    <li key={i} style={{marginBottom:4}}>{t.text} <span style={{color:'#6366f1',fontSize:10}}>({toPersianNum(t.belief)}%)</span></li>
                  ))}
                </ul>
              </td>
              <td style={{border:'1px solid #e2e8f0',padding:'10px 12px',verticalAlign:'top',textAlign:'center',fontWeight:700}}>
                {log.hasShame&&log.shameLevel!=null?`${toPersianNum(log.shameLevel)}%`:'نداشت'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  
  const [modals, setModals] = useState({ addLog: false, cognitive: false, notes: false });
  const [notesStartAdding, setNotesStartAdding] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const [isDark, setIsDark]     = useState(true);
  const [isExporting, setExp]   = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [toast, setToast]       = useState('');
  const toastTimer = useRef(null);

  const [logs, setLogs] = useState(()=>{
    try { const s=localStorage.getItem('nat_tracker_logs'); return s?JSON.parse(s):[]; } catch{ return []; }
  });

  const [sessionNotes, setNotes] = useState(()=>{
    try { const s=localStorage.getItem('nat_tracker_notes'); return s?JSON.parse(s):[]; } catch{ return []; }
  });

  useEffect(() => {
    setTimeout(() => setAppLoading(false), 900);
  }, []);

  useEffect(()=>{ localStorage.setItem('nat_tracker_logs',JSON.stringify(logs)); }, [logs]);
  useEffect(()=>{ localStorage.setItem('nat_tracker_notes',JSON.stringify(sessionNotes)); }, [sessionNotes]);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(''), 2500);
  };

  const openModal = (name) => setModals(m => ({ ...m, [name]: true }));
  const closeModal = (name) => setModals(m => ({ ...m, [name]: false }));

  const handleSaveLog = (newLog) => {
    if (editingLog) {
      setLogs(logs.map(l => l.id === newLog.id ? newLog : l));
      showToast('✓ لاگ ویرایش شد');
    } else {
      setLogs([newLog, ...logs]);
      showToast('✓ لاگ جدید ثبت شد');
    }
    setEditingLog(null);
    closeModal('addLog');
    setShowSave(true);
    setTimeout(()=>setShowSave(false), 2000);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    openModal('addLog');
  };

  const handleDeleteLog = (id) => {
    setLogs(logs.filter(l => l.id !== id));
    showToast('✕ لاگ حذف شد');
  };

  const handleSaveNote = (note) => {
    const exists = sessionNotes.find(n => n.id === note.id);
    if (exists) {
      setNotes(sessionNotes.map(n => n.id === note.id ? note : n));
      showToast('✓ یادداشت ویرایش شد');
    } else {
      setNotes([note, ...sessionNotes]);
      showToast('✓ یادداشت جدید ذخیره شد');
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(sessionNotes.filter(n => n.id !== id));
    showToast('✕ یادداشت حذف شد');
  };

  const handleExportPDF = async () => {
    setExp(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const el = document.getElementById('export-container-data');
      if (!el) return;
      const canvas = await window.html2canvas(el,{scale:2,useCORS:true,backgroundColor:'#ffffff'});
      const pdf = new window.jspdf.jsPDF('p','mm','a4');
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,w,(canvas.height*w)/canvas.width);
      pdf.save('NAT_Tracker_Report.pdf');
      showToast('✓ PDF دانلود شد');
    } catch(e){ console.error(e); showToast('خطا در خروجی PDF'); }
    finally { setExp(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('export-container-data').innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if(!printWindow) return showToast('پاپ‌آپ مرورگر مسدود شده است. لطفا آن را باز کنید.'); // 👑 Alert removed 👑
    
    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>پرینت گزارش NAT</title>
          <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
          <style>
            body { font-family: 'Vazirmatn', sans-serif; padding: 20px; color: black; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportWord = () => {
    const content = document.getElementById('export-container-data').innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'><head><meta charset='utf-8'><title>NAT Report</title><style>body { font-family: Tahoma, Arial, sans-serif; }</style></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'NAT_Tracker_Report.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
    showToast('✓ فایل Word دانلود شد');
  };

  if (appLoading) return <InitialLoading />;

  return (
    <div dir="rtl" className={isDark?'dark':''} style={{fontFamily:'Vazirmatn,sans-serif',minHeight:'100vh', background: isDark?'#09090b':'#f8fafc', color: isDark?'#f4f4f5':'#1e293b'}}>
      {/* 👑 دیگه نیازی به استایل‌های کثیف WebKit نیست. اسلایدر LTR کاملاً نامرئی کار خودش رو می‌کنه 👑 */}
      <PdfTable logs={logs}/>
      <SaveAnimation show={showSave}/>
      <Toast msg={toast}/>

      <DashboardView
        logs={logs} sessionNotes={sessionNotes}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        onPrint={handlePrint}
        isDark={isDark}
        toggleTheme={()=>setIsDark(!isDark)}
        isExporting={isExporting}
        openCognitive={()=>openModal('cognitive')}
        openNotes={(autoAdd) => {
          setNotesStartAdding(autoAdd === true);
          openModal('notes');
        }}
        onEditLog={handleEditLog}
        onDeleteLog={handleDeleteLog}
        showToast={showToast}
      />

      <FABMenu
        onAddLog={() => { setEditingLog(null); openModal('addLog'); }}
        onAddNote={() => { setNotesStartAdding(true); openModal('notes'); }}
      />

      {modals.addLog && (
        <AddLogModal 
           initialData={editingLog}
           onSave={handleSaveLog} 
           onClose={() => { setEditingLog(null); closeModal('addLog'); }} 
           isDark={isDark}
           showToast={showToast}
        />
      )}

      {modals.cognitive && (
        <CognitiveErrorsModal onClose={() => closeModal('cognitive')} isDark={isDark}/>
      )}

      {modals.notes && (
        <SessionNotesModal
          notes={sessionNotes}
          startAdding={notesStartAdding}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onClose={() => closeModal('notes')}
          isDark={isDark}
          showToast={showToast}
        />
      )}
    </div>
  );
}
