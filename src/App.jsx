import { useState, useRef, createContext, useContext, useEffect } from "react";
import { supabase } from "./supabase";

// ── Language System ──────────────────────────────────────────────────
const LangContext = createContext("th");
const useLang = () => useContext(LangContext);

const T = {
  // App name & header
  appName:        {th:"ภาษีฟรีแลนซ์",       en:"Freelance Tax"},
  appSub:         {th:"จัดการเงิน · ภาษี · การลงทุน", en:"Money · Tax · Investment"},
  hello:          {th:"สวัสดี",              en:"Hello"},
  year:           {th:"ปี",                  en:"Year"},
  // Tabs
  tabLearn:       {th:"เรียนรู้",            en:"Learn"},
  tabMoney:       {th:"เงิน",               en:"Money"},
  tabPlan:        {th:"วางแผน",             en:"Plan"},
  tabGoals:       {th:"เป้าหมาย",           en:"Goals"},
  tabSummary:     {th:"สรุป",               en:"Summary"},
  // Login
  signIn:         {th:"เข้าสู่ระบบ",        en:"Sign In"},
  register:       {th:"สมัครสมาชิก",        en:"Register"},
  signInGoogle:   {th:"เข้าสู่ระบบด้วย Google", en:"Sign in with Google"},
  registerGoogle: {th:"สมัครด้วย Google",   en:"Register with Google"},
  orEmail:        {th:"หรือใช้อีเมล",       en:"or use email"},
  yourName:       {th:"ชื่อของคุณ",         en:"Your name"},
  email:          {th:"อีเมล",              en:"Email"},
  password:       {th:"รหัสผ่าน",           en:"Password"},
  forgotPass:     {th:"ลืมรหัสผ่าน?",      en:"Forgot password?"},
  guestLabel:     {th:"ทดลองใช้แบบไม่ต้องสมัคร", en:"Try without signing up"},
  guestSub:       {th:"เข้าดูเนื้อหาได้ทั้งหมด ไม่มีข้อผูกมัด", en:"Full access, no commitment"},
  privacy:        {th:"🔒 ข้อมูลของคุณปลอดภัยและเป็นส่วนตัว", en:"🔒 Your data is safe and private"},
  // Onboarding
  ob1Title:       {th:"เข้าใจภาษีง่ายๆ",   en:"Understand Tax Easily"},
  ob1Sub:         {th:"ไม่ต้องมีพื้นฐาน",  en:"No background needed"},
  ob1Desc:        {th:"แอปนี้จะอธิบายเรื่องภาษีฟรีแลนซ์ให้เข้าใจได้ใน 5 นาที", en:"This app explains freelance tax in 5 minutes"},
  ob2Title:       {th:"ติดตามการเงิน",      en:"Track Your Money"},
  ob2Sub:         {th:"รายได้ — ค่าใช้จ่าย", en:"Income — Expenses"},
  ob2Desc:        {th:"บันทึกรายรับ-รายจ่ายทุกเดือน เห็นชัดว่าเงินไปไหน", en:"Record monthly income & expenses, see where money goes"},
  ob3Title:       {th:"วางแผน & ความฝัน",   en:"Plan & Dream"},
  ob3Sub:         {th:"เงินเหลือ → ลงทุน → เป้าหมาย", en:"Surplus → Invest → Goals"},
  ob3Desc:        {th:"รู้ว่าเงินที่เหลือควรเอาไปไว้ที่ไหน และเก็บเงินเพื่อความฝันของคุณ", en:"Know where to put your extra money and save for your dreams"},
  next:           {th:"ถัดไป →",            en:"Next →"},
  skip:           {th:"ข้าม",               en:"Skip"},
  start:          {th:"เริ่มใช้งาน →",      en:"Get Started →"},
  // Common
  calculate:      {th:"คำนวณ",              en:"Calculate"},
  close:          {th:"ปิด",                en:"Close"},
  add:            {th:"+ เพิ่ม",            en:"+ Add"},
  save:           {th:"บันทึก",             en:"Save"},
  cancel:         {th:"ยกเลิก",             en:"Cancel"},
  delete:         {th:"ลบ",                 en:"Delete"},
  baht:           {th:"฿",                  en:"฿"},
  perMonth:       {th:"เดือนละ",            en:"/mo"},
  perYear:        {th:"ต่อปี",              en:"/yr"},
  month:          {th:"เดือน",              en:"mo"},
  months:         {th:"เดือน",              en:"months"},
};

function t(key, lang) {
  return T[key]?.[lang] ?? T[key]?.th ?? key;
}

const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MONTH_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const YEAR_TH = new Date().getFullYear() + 543;
const NOW_MONTH = new Date().getMonth();
const EXPENSE_CATS = ["🏠 ที่พัก","🚗 เดินทาง","🍜 อาหาร","📱 โทรศัพท์","💊 สุขภาพ","📚 พัฒนาตัวเอง","🎮 บันเทิง","👗 เสื้อผ้า","💼 อุปกรณ์งาน","🔧 อื่นๆ"];
const INVEST_OPTIONS = [
  {id:"emergency",icon:"🛡️",label:"เงินสำรองฉุกเฉิน",desc:"เก็บไว้ 3–6 เดือนของค่าใช้จ่าย",color:"#4A7C3F",bg:"#F0FFF0"},
  {id:"savings",  icon:"🏦",label:"ฝากธนาคาร",       desc:"ดอกเบี้ยสูงสุดฝากออมทรัพย์",  color:"#2E6DA4",bg:"#E8F5FF"},
  {id:"ssf",      icon:"📊",label:"กองทุน SSF/RMF",  desc:"ลดภาษีได้สูงสุด 30% ของรายได้",color:"#7A4FA0",bg:"#F5F0FF"},
  {id:"stock",    icon:"📈",label:"หุ้น / ETF",       desc:"ลงทุนระยะยาว ความเสี่ยงปานกลาง",color:"#B8860B",bg:"#FFF8DC"},
  {id:"crypto",   icon:"₿", label:"คริปโต",           desc:"ความเสี่ยงสูง ผลตอบแทนสูง",    color:"#C04848",bg:"#FFF0F0"},
  {id:"gold",     icon:"🥇",label:"ทองคำ",            desc:"สินทรัพย์ปลอดภัย ป้องกันเงินเฟ้อ",color:"#B8860B",bg:"#FFF8DC"},
];
const GOAL_PRESETS = [
  {emoji:"✈️",label:"เที่ยวต่างประเทศ"},{emoji:"🏠",label:"ซื้อบ้าน/คอนโด"},
  {emoji:"🚗",label:"ซื้อรถ"},{emoji:"💍",label:"แต่งงาน"},
  {emoji:"📱",label:"ซื้ออุปกรณ์"},{emoji:"🎓",label:"เรียนต่อ"},
  {emoji:"💼",label:"ทุนธุรกิจ"},{emoji:"🏖️",label:"เที่ยวในประเทศ"},
  {emoji:"🌟",label:"อื่นๆ"},
];
const OWNER_EMAIL = "aonlovejdr11@gmail.com";
const fmt = n => Math.round(n||0).toLocaleString("th-TH");
const fmtK = n => n>=1000?`${(n/1000).toFixed(n%1000===0?0:1)}K`:fmt(n);

function calcPersonalTax(income) {
  const taxable = Math.max(0, income - income*0.6 - 60000);
  const brackets = [[150000,0],[150000,.05],[200000,.1],[250000,.15],[250000,.2],[Infinity,.25]];
  let tax=0,rem=taxable;
  for(const [lim,rate] of brackets){if(rem<=0)break;tax+=Math.min(rem,lim)*rate;rem-=lim;}
  return {taxable, tax, monthly:tax/12};
}

function calcCorpTax(revenue) {
  const profit = revenue * 0.30;
  let corpTax = profit<=300000?0:profit<=3000000?(profit-300000)*0.15:(3000000-300000)*0.15+(profit-3000000)*0.20;
  const salary = Math.min(revenue*0.4, 1200000);
  const {tax:salaryTax} = calcPersonalTax(salary);
  const totalTax = corpTax + salaryTax;
  return {profit, corpTax, salaryTax, salary, totalTax, tax:corpTax, taxable:profit, monthly:totalTax/12};
}

const initData = () => Array.from({length:12},(_,i)=>({month:i,income:0,incomes:[],expenses:[]}));

// ── Google Icon ──────────────────────────────────────────────────────
function GIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48" style={{flexShrink:0}}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>;
}

// ── Onboarding ───────────────────────────────────────────────────────
function Onboarding({onDone}) {
  const lang=useLang();
  const SLIDES=[
    {emoji:"💡",title:t("ob1Title",lang),sub:t("ob1Sub",lang),desc:t("ob1Desc",lang)},
    {emoji:"💰",title:t("ob2Title",lang),sub:t("ob2Sub",lang),desc:t("ob2Desc",lang)},
    {emoji:"🌟",title:t("ob3Title",lang),sub:t("ob3Sub",lang),desc:t("ob3Desc",lang)},
  ];
  const [i,setI]=useState(0);const [fade,setFade]=useState(false);const s=SLIDES[i];
  const go=()=>{if(i===SLIDES.length-1){onDone();return;}setFade(true);setTimeout(()=>{setI(i+1);setFade(false);},180);};
  return <div className="ob"><div className={`ob-body ${fade?"ob-fade":""}`}>
    <div className="ob-ring"><span className="ob-em">{s.emoji}</span></div>
    <div className="ob-dots">{SLIDES.map((_,j)=><div key={j} className={`od ${j===i?"od-on":""}`}/>)}</div>
    <div className="ob-t1">{s.title}</div><div className="ob-t2">{s.sub}</div><div className="ob-t3">{s.desc}</div>
    <button className="ob-btn" onClick={go}>{i===SLIDES.length-1?t("start",lang):t("next",lang)}</button>
    {i<SLIDES.length-1&&<button className="ob-skip" onClick={onDone}>{t("skip",lang)}</button>}
  </div></div>;
}

// ── Login ────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const lang=useLang();
  const [mode,setMode]=useState("login");const [name,setName]=useState("");const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");const [err,setErr]=useState("");const [loading,setLoading]=useState(false);

  const submit=async()=>{
    setErr("");
    if(mode==="register"&&!name.trim()){setErr(lang==="th"?"กรุณาใส่ชื่อ":"Please enter your name");return;}
    if(!email.includes("@")){setErr(lang==="th"?"อีเมลไม่ถูกต้อง":"Invalid email");return;}
    if(pass.length<6){setErr(lang==="th"?"รหัสผ่านต้องมีอย่างน้อย 6 ตัว":"Password must be at least 6 characters");return;}
    setLoading(true);
    if(mode==="register"){
      const {data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name}}});
      if(error){setErr(error.message);setLoading(false);return;}
      if(data.user){
        await supabase.from("profiles").upsert({id:data.user.id,name:name||email.split("@")[0],email:email});
        onLogin(name||email.split("@")[0], data.user.id, email);
      }
    } else {
      const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error){setErr(lang==="th"?"อีเมลหรือรหัสผ่านไม่ถูกต้อง":"Invalid email or password");setLoading(false);return;}
      if(data.user){
        const {data:profile}=await supabase.from("profiles").select("name").eq("id",data.user.id).single();
        onLogin(profile?.name||email.split("@")[0], data.user.id, email);
      }
    }
    setLoading(false);
  };

  return <div className="lw">
    <div className="ldeco"><div className="ldc c1"/><div className="ldc c2"/><div className="ldc c3"/></div>
    <div className="lbrand"><div className="licon">🧾</div><div className="ltitle">{t("appName",lang)}</div><div className="lsub">{t("appSub",lang)}</div></div>
    <div className="lcard">
      <div className="lor"><div className="lorline"/><span className="lortext">{lang==="th"?"เข้าสู่ระบบด้วยอีเมล":"Sign in with email"}</span><div className="lorline"/></div>
      <div className="ltabs"><button className={`ltb ${mode==="login"?"ltb-on":""}`} onClick={()=>{setMode("login");setErr("");}}>{t("signIn",lang)}</button><button className={`ltb ${mode==="register"?"ltb-on":""}`} onClick={()=>{setMode("register");setErr("");}}>{t("register",lang)}</button></div>
      {mode==="register"&&<><label className="ll">{t("yourName",lang)}</label><input className="li" placeholder={lang==="th"?"เช่น สมชาย ใจดี":"e.g. John Smith"} value={name} onChange={e=>setName(e.target.value)}/></>}
      <label className="ll">{t("email",lang)}</label><input className="li" type="email" placeholder="example@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
      <label className="ll">{t("password",lang)}</label><input className="li" type="password" placeholder={mode==="register"?(lang==="th"?"อย่างน้อย 6 ตัวอักษร":"At least 6 characters"):"••••••••"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      {err&&<div className="lerr">⚠️ {err}</div>}
      <button className={`lbtn ${loading?"lbtn-load":""}`} onClick={submit} disabled={loading}>{loading?<span className="gspin"/>:mode==="login"?t("signIn",lang):t("register",lang)}</button>
      {mode==="login"&&<div className="lforgot">{t("forgotPass",lang)}</div>}
    </div>
    <button className="guest-btn" onClick={()=>onLogin("ผู้ทดลองใช้", null, null)}>
      <span className="guest-icon">👀</span>
      <div className="guest-txt"><div className="guest-lbl">{t("guestLabel",lang)}</div><div className="guest-sub">{t("guestSub",lang)}</div></div>
      <span className="guest-arr">→</span>
    </button>
    <div className="lfooter">{t("privacy",lang)}</div>
  </div>;
}

// ── Learn Tab ────────────────────────────────────────────────────────
const FAQ=[
  {q:"ฟรีแลนซ์ต้องเสียภาษีไหม?",a:"ต้องครับ! ถ้ารายได้เกิน 60,000 บาท/ปี ต้องยื่นภาษี แต่ไม่แปลว่าต้องจ่าย เพราะยังมีค่าลดหย่อนช่วยอีก",tag:"พื้นฐาน",color:"#E8B84B"},
  {q:"ภาษีคำนวณจากอะไร?",a:"จาก 'เงินได้สุทธิ' = รายได้ − ค่าใช้จ่าย(60%) − ลดหย่อนส่วนตัว(60,000) − ลดหย่อนอื่นๆ",tag:"คำนวณ",color:"#5BA3D9"},
  {q:"ค่าลดหย่อนคืออะไร?",a:"ตัวช่วยลดฐานภาษี เช่น ลดหย่อนส่วนตัว 60,000 บาท, ประกันชีวิต, RMF/SSF ยิ่งลดหย่อนมาก ยิ่งเสียภาษีน้อย",tag:"ลดหย่อน",color:"#6ABF6A"},
  {q:"ควรจดบริษัทดีไหม?",a:"ถ้ารายได้เกิน 1–2 ล้านบาท/ปี การจดบริษัทมักประหยัดภาษีกว่า เพราะหักค่าใช้จ่ายได้มากกว่า และอัตรา SME อยู่ที่ 15–20% เทียบกับบุคคลสูงสุด 35%",tag:"บริษัท",color:"#7A4FA0"},
  {q:"ต้องยื่นภาษีเมื่อไหร่?",a:"ปีละ 1 ครั้ง ช่วงมกราคม–มีนาคม ของปีถัดไป ยื่นออนไลน์ได้ที่ efiling.rd.go.th ไม่ต้องไปสำนักงาน",tag:"ขั้นตอน",color:"#A07FD0"},
];
function LearnTab() {
  const [open,setOpen]=useState(null);
  const [taxType,setTaxType]=useState("personal");
  const [income,setIncome]=useState("");
  const [result,setResult]=useState(null);
  const calc=()=>{
    const inc=parseFloat(income)||0;
    if(taxType==="personal"){const r=calcPersonalTax(inc);setResult({type:"personal",inc,...r});}
    else{const r=calcCorpTax(inc);setResult({type:"company",inc,...r});}
  };
  return <div className="tab-content">
    <div className="learn-hero"><div className="lh-badge">ความรู้พื้นฐาน</div><div className="lh-title">ภาษีฟรีแลนซ์<br/>ไม่ยากอย่างที่คิด</div><div className="lh-sub">คำถามที่คนมักสงสัย ตอบให้เข้าใจใน 1 นาที</div></div>
    <div className="faq-list">{FAQ.map((l,i)=>(
      <div key={i} className={`faq-card ${open===i?"faq-open":""}`} onClick={()=>setOpen(open===i?null:i)}>
        <div className="faq-row"><span className="faq-tag" style={{background:l.color+"22",color:l.color}}>{l.tag}</span><div className="faq-q">{l.q}</div><span className="faq-chev">{open===i?"▲":"▼"}</span></div>
        {open===i&&<div className="faq-a">{l.a}</div>}
      </div>
    ))}</div>

    <div className="learn-calc">
      <div className="lc-title">🧮 คำนวณภาษีคร่าวๆ</div>
      <div className="lc-sub">เลือกประเภทก่อน แล้วใส่รายได้ทั้งปี</div>

      {/* Tax type toggle */}
      <div className="tax-toggle">
        <button className={`ttbtn ${taxType==="personal"?"ttbtn-on":""}`} onClick={()=>{setTaxType("personal");setResult(null);}}>
          <span style={{fontSize:20}}>👤</span>
          <div><div className="ttbtn-lbl">บุคคลธรรมดา</div><div className="ttbtn-sub">อัตราขั้นบันได 0–35%</div></div>
        </button>
        <button className={`ttbtn ${taxType==="company"?"ttbtn-on ttbtn-corp":""}`} onClick={()=>{setTaxType("company");setResult(null);}}>
          <span style={{fontSize:20}}>🏢</span>
          <div><div className="ttbtn-lbl">นิติบุคคล (บริษัท)</div><div className="ttbtn-sub">SME 15–20% flat</div></div>
        </button>
      </div>
      {taxType==="company"&&<div className="corp-tip">💡 เหมาะกับฟรีแลนซ์ที่จดบริษัทรับงาน — หักค่าใช้จ่ายได้มากกว่า และอัตราภาษีนิ่งกว่า โดยเฉพาะรายได้เกิน 1 ล้านบาท/ปี</div>}

      <div className="lc-row">
        <input className="lc-inp" type="number" placeholder={taxType==="personal"?"รายได้ทั้งปี (บาท)":"รายได้บริษัท/ปี (บาท)"} value={income} onChange={e=>setIncome(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calc()}/>
        <button className="lc-btn" onClick={calc}>คำนวณ</button>
      </div>

      {result&&result.type==="personal"&&(
        <div className="lc-result">
          <div className="lcr-row"><span>รายได้ทั้งปี</span><span className="lcr-v">{fmt(result.inc)} ฿</span></div>
          <div className="lcr-row"><span>หักค่าใช้จ่าย 60%</span><span className="lcr-v neg">−{fmt(result.inc*0.6)} ฿</span></div>
          <div className="lcr-row"><span>หักลดหย่อนส่วนตัว</span><span className="lcr-v neg">−60,000 ฿</span></div>
          <div className="lcr-row base"><span>เงินได้สุทธิ</span><span className="lcr-v">{fmt(result.taxable)} ฿</span></div>
          <div className={`lcr-tax ${result.tax===0?"lct-safe":"lct-warn"}`}>
            <div className="lct-label">👤 ภาษีบุคคลธรรมดา / ปี</div>
            <div className="lct-val">{result.tax===0?"ไม่ต้องจ่าย 🎉":`${fmt(result.tax)} บาท`}</div>
            {result.tax>0&&<div className="lct-mo">≈ เดือนละ {fmt(result.monthly)} บาท</div>}
          </div>
        </div>
      )}
      {result&&result.type==="company"&&(
        <div className="lc-result">
          <div className="lcr-row"><span>รายได้บริษัท</span><span className="lcr-v">{fmt(result.inc)} ฿</span></div>
          <div className="lcr-row"><span>หักค่าใช้จ่ายธุรกิจ ~70%</span><span className="lcr-v neg">−{fmt(result.inc*0.7)} ฿</span></div>
          <div className="lcr-row base"><span>กำไรสุทธิ</span><span className="lcr-v">{fmt(result.profit)} ฿</span></div>
          <div className="lcr-tax" style={{background:"#F5F0FF"}}>
            <div className="lct-label" style={{color:"#7A4FA0"}}>🏢 ภาษีนิติบุคคล (SME)</div>
            <div className="lct-val" style={{color:"#7A4FA0"}}>{fmt(result.corpTax)} บาท</div>
            <div className="lct-mo" style={{color:"#A07FD0"}}>อัตราเฉลี่ย {result.profit>0?((result.corpTax/result.profit)*100).toFixed(1):0}%</div>
          </div>
          {result.salaryTax>0&&<div className="lcr-tax" style={{background:"#FFF5F0",marginTop:8}}>
            <div className="lct-label" style={{color:"#C04848"}}>👤 ภาษีเงินเดือนตัวเอง (สมมติ {fmt(result.salary)} ฿/ปี)</div>
            <div className="lct-val" style={{color:"#C04848"}}>{fmt(result.salaryTax)} บาท</div>
          </div>}
          <div className="lcr-tax" style={{background:"#E8F5FF",marginTop:8}}>
            <div className="lct-label" style={{color:"#2E6DA4"}}>📊 ภาษีรวมทั้งหมด</div>
            <div className="lct-val" style={{color:"#2E6DA4"}}>{fmt(result.totalTax)} บาท</div>
            <div className="lct-mo" style={{color:"#5BA3D9"}}>เทียบบุคคลธรรมดา: ประหยัดได้ ~{fmt(Math.max(0,calcPersonalTax(result.inc).tax-result.totalTax))} บาท/ปี</div>
          </div>
        </div>
      )}
    </div>

    <div className="rate-card">
      <div className="rate-title">{taxType==="personal"?"👤 อัตราภาษีบุคคลธรรมดา":"🏢 อัตราภาษีนิติบุคคล (SME)"}</div>
      {(taxType==="personal"?[["0 – 150,000","ยกเว้น","#4A7C3F"],["150,001 – 300,000","5%","#2E6DA4"],["300,001 – 500,000","10%","#B8860B"],["500,001 – 750,000","15%","#B8860B"],["750,001 – 1,000,000","20%","#C04848"],["1,000,001 – 2,000,000","25%","#C04848"],["2,000,001+","35%","#8B0000"]]:[["กำไรสุทธิ 0 – 300,000","ยกเว้น","#4A7C3F"],["300,001 – 3,000,000","15%","#B8860B"],["3,000,001+","20%","#C04848"]]).map(([r,p,c],i)=>(
        <div className="rate-row" key={i}><span className="rate-range">{r}</span><span className="rate-pct" style={{color:c}}>{p}</span></div>
      ))}
      {taxType==="company"&&<div className="rate-note">* คำนวณจากกำไรสุทธิ ไม่ใช่รายได้ทั้งหมด — เหมาะกับผู้มีรายได้เกิน 1–2 ล้านบาท/ปี</div>}
    </div>
  </div>;
}

// ── Money Tab ────────────────────────────────────────────────────────
function AddSheet({title,onSave,onClose,hasCategory,isIncome}) {
  const [desc,setDesc]=useState("");const [amount,setAmount]=useState("");const [cat,setCat]=useState(EXPENSE_CATS[0]);
  const save=()=>{if(!amount)return;onSave({id:Date.now(),desc:desc||(hasCategory?cat:isIncome?"รายได้":"รายการ"),amount:parseFloat(amount),cat:hasCategory?cat:null});onClose();};
  return <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="sheet">
      <div className="sheet-pill"/>
      <div className="sheet-ttl">{title}</div>
      {hasCategory&&<div className="cat-scroll">{EXPENSE_CATS.map(c=><button key={c} className={`cat-chip ${cat===c?"cat-on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div>}
      <input className="sinp" placeholder={isIncome?"ชื่อรายได้ เช่น งานออกแบบ Logo":"รายละเอียด (ไม่บังคับ)"} value={desc} onChange={e=>setDesc(e.target.value)}/>
      <input className="sinp sinp-lg" type="number" placeholder="จำนวนเงิน (บาท)" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/>
      <div className="sheet-btns"><button className="sbtn-c" onClick={onClose}>ยกเลิก</button><button className="sbtn-s" onClick={save}>บันทึก ✓</button></div>
    </div>
  </div>;
}



// ── EditIncomeSheet ───────────────────────────────────────────────────
function EditIncomeSheet({entry, onSave, onClose}) {
  const [desc, setDesc] = useState(entry.desc||"");
  const [amount, setAmount] = useState(String(entry.amount||""));
  const save = () => {
    if(!amount) return;
    onSave({...entry, desc: desc||"รายได้", amount: parseFloat(amount)});
    onClose();
  };
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet">
        <div className="sheet-pill"/>
        <div className="sheet-ttl">✏️ แก้ไขรายได้</div>
        <label className="ish-sec-label">ชื่อรายได้</label>
        <input className="sinp" placeholder="เช่น งานออกแบบ Logo" value={desc} onChange={e=>setDesc(e.target.value)}/>
        <label className="ish-sec-label">จำนวนเงิน (บาท)</label>
        <input className="sinp sinp-lg" type="number" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/>
        <div className="sheet-btns" style={{marginTop:8}}>
          <button className="sbtn-c" onClick={onClose}>ยกเลิก</button>
          <button className="sbtn-s" onClick={save}>บันทึก ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── EditExpenseSheet ──────────────────────────────────────────────────
function EditExpenseSheet({entry, onSave, onClose}) {
  const [desc, setDesc] = useState(entry.desc||"");
  const [amount, setAmount] = useState(String(entry.amount||""));
  const [cat, setCat] = useState(entry.cat||EXPENSE_CATS[0]);
  const save = () => {
    if(!amount) return;
    onSave({...entry, desc: desc||cat, amount: parseFloat(amount), cat});
    onClose();
  };
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet">
        <div className="sheet-pill"/>
        <div className="sheet-ttl">✏️ แก้ไขค่าใช้จ่าย</div>
        <div className="cat-scroll" style={{marginBottom:10}}>
          {EXPENSE_CATS.map(c=><button key={c} className={`cat-chip ${cat===c?"cat-on":""}`} onClick={()=>setCat(c)}>{c}</button>)}
        </div>
        <label className="ish-sec-label">รายละเอียด</label>
        <input className="sinp" placeholder="รายละเอียด (ไม่บังคับ)" value={desc} onChange={e=>setDesc(e.target.value)}/>
        <label className="ish-sec-label">จำนวนเงิน (บาท)</label>
        <input className="sinp sinp-lg" type="number" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/>
        <div className="sheet-btns" style={{marginTop:8}}>
          <button className="sbtn-c" onClick={onClose}>ยกเลิก</button>
          <button className="sbtn-s" onClick={save}>บันทึก ✓</button>
        </div>
      </div>
    </div>
  );
}


function EditRecSheet({editRec, optColor, onSave, onClose}) {
  const [note, setNote] = useState(editRec.note||"");
  const [amount, setAmount] = useState(String(editRec.amount||""));
  const save = () => {
    if(!amount) return;
    onSave({...editRec, note, amount: parseFloat(amount)});
  };
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet">
        <div className="sheet-pill"/>
        <div className="sheet-ttl">✏️ แก้ไขรายการ</div>
        <input className="sinp" placeholder="หมายเหตุ" value={note} onChange={e=>setNote(e.target.value)}/>
        <input className="sinp sinp-lg" type="number" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/>
        <div className="sheet-btns" style={{marginTop:8}}>
          <button className="sbtn-c" onClick={onClose}>ยกเลิก</button>
          <button className="sbtn-s" style={{background:optColor||"#2C2510"}} onClick={save}>บันทึก ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── DocAddSheet — rich document form ─────────────────────────────────
function DocAddSheet({monthIdx, onSave, onClose}) {
  const [company, setCompany]   = useState("");
  const [docType, setDocType]   = useState("หนังสือรับรองหัก ณ ที่จ่าย");
  const [recipient, setRecipient] = useState("");
  const [link, setLink]         = useState("");
  const [note, setNote]         = useState("");
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const fileRef = useRef();

  const DOC_TYPES = [
    "หนังสือรับรองหัก ณ ที่จ่าย",
    "ใบแจ้งหนี้ (Invoice)",
    "ใบเสร็จรับเงิน",
    "สลิปโอนเงิน",
    "สัญญาจ้าง",
    "อื่นๆ",
  ];

  const handleFile = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({name:f.name, dataUrl:ev.target.result, size:(f.size/1024).toFixed(1)+" KB"});
      if(f.type.startsWith("image/")) setPreview(ev.target.result);
    };
    reader.readAsDataURL(f);
    e.target.value="";
  };

  const save = () => {
    if(!company && !link && !file) return;
    onSave({
      id: Date.now(),
      company: company||"",
      docType: docType||"",
      recipient: recipient||"",
      link: link||"",
      note: note||"",
      name: file?.name || (company ? `${company} — ${docType}` : "เอกสาร"),
      dataUrl: file?.dataUrl||"",
      size: file?.size||"",
      date: new Date().toLocaleDateString("th-TH"),
      monthIdx,
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet" style={{maxHeight:"90vh"}}>
        <div className="sheet-pill"/>
        <div className="sheet-ttl">📎 บันทึกเอกสารรายได้</div>

        <div className="ish-sec-label">ประเภทเอกสาร</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
          {DOC_TYPES.map(t=><button key={t} onClick={()=>setDocType(t)}
            style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${docType===t?"#E8B84B":"#EDE8D8"}`,background:docType===t?"#FFF3C4":"#FFF",color:docType===t?"#B8860B":"#A89660",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>
            {t}
          </button>)}
        </div>

        <div className="ish-sec-label">กิจการ / บริษัท</div>
        <input className="sinp" placeholder="เช่น บริษัท โซล อเมซซิ่ง จำกัด" value={company} onChange={e=>setCompany(e.target.value)}/>

        <div className="ish-sec-label">ออกให้กับ</div>
        <input className="sinp" placeholder="เช่น นางสาว จารชิกา แก้ววรรณา" value={recipient} onChange={e=>setRecipient(e.target.value)}/>

        <div className="ish-sec-label">Link เอกสาร (ถ้ามี)</div>
        <input className="sinp" placeholder="https://..." value={link} onChange={e=>setLink(e.target.value)} type="url"/>
        {link&&<a href={link} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#2E6DA4",display:"block",marginTop:-6,marginBottom:10,wordBreak:"break-all"}}>🔗 {link.substring(0,50)}{link.length>50?"...":""}</a>}

        <div className="ish-sec-label">หมายเหตุ</div>
        <input className="sinp" placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)" value={note} onChange={e=>setNote(e.target.value)}/>

        <div className="ish-sec-label">แนบไฟล์ (ไม่บังคับ)</div>
        {preview&&<img src={preview} alt="preview" style={{width:"100%",borderRadius:10,marginBottom:8,maxHeight:160,objectFit:"cover"}}/>}
        {file&&!preview&&<div style={{background:"#F5EFE0",borderRadius:10,padding:"10px 13px",marginBottom:8,fontSize:12,color:"#2C2510",fontWeight:600}}>📄 {file.name} · {file.size}</div>}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={()=>fileRef.current.click()} style={{flex:1,background:"#FFF",border:"1.5px dashed #D4C99A",borderRadius:11,padding:12,fontSize:13,color:"#A89660",fontWeight:600,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>
            {file?"🔄 เปลี่ยนไฟล์":"📎 แนบรูป / PDF"}
          </button>
          {file&&<button onClick={()=>{setFile(null);setPreview(null);}} style={{background:"#FFF0F0",border:"1.5px solid #F0AAAA",borderRadius:11,padding:"12px 14px",color:"#C04848",cursor:"pointer",fontSize:13}}>🗑</button>}
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={handleFile}/>

        <div className="sheet-btns">
          <button className="sbtn-c" onClick={onClose}>ยกเลิก</button>
          <button className="sbtn-s" onClick={save}>บันทึกเอกสาร ✓</button>
        </div>
      </div>
    </div>
  );
}

function MoneyTab({data,setData,userId,saveIncome,saveIncomeEntry,saveExpense,userPlan,onPaywall,docsState,setDocsState,saveDocToDB,deleteDocFromDB}) {
  const [sel,setSel]=useState(NOW_MONTH);const [sheet,setSheet]=useState(null);
  const [editIncEntry,setEditIncEntry]=useState(null);
  const [editExpEntry,setEditExpEntry]=useState(null);
  const docs=docsState||Array.from({length:12},()=>[]);
  const [showDocSheet,setShowDocSheet]=useState(false);
  const docRef=useRef();
  const m=data[sel];
  const totalInc=(m.incomes&&m.incomes.length>0)?m.incomes.reduce((s,e)=>s+e.amount,0):m.income;
  const totalExp=m.expenses.reduce((s,e)=>s+e.amount,0);const net=totalInc-totalExp;
  const annualInc=data.reduce((s,d)=>s+((d.incomes&&d.incomes.length>0)?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income),0);const {monthly:taxMo}=calcPersonalTax(annualInc);
  const addIncome=(entry)=>{
    const newEntry={id:Date.now(),desc:entry.desc||"รายได้",amount:parseFloat(entry.amount),date:new Date().toLocaleDateString("th-TH")};
    setData(d=>d.map((r,i)=>i===sel?{...r,incomes:[...(r.incomes||[]),newEntry]}:r));
    if(saveIncomeEntry)saveIncomeEntry(sel,newEntry);
  };
  const updateIncome=(updated)=>{
    setData(d=>d.map((r,i)=>i===sel?{...r,incomes:(r.incomes||[]).map(e=>e.id===updated.id?updated:e)}:r));
    if(saveIncomeEntry)saveIncomeEntry(sel,updated);
  };
  const delIncome=(id,amount)=>{
    setData(d=>d.map((r,i)=>i===sel?{...r,incomes:(r.incomes||[]).filter(e=>e.id!==id)}:r));
    if(userId)supabase.from('income_entries').delete().eq('id',id).eq('user_id',userId);
  };
  const addExp=entry=>{setData(d=>d.map((r,i)=>i===sel?{...r,expenses:[...r.expenses,entry]}:r));if(saveExpense)saveExpense(sel,entry);};
  const updateExp=(updated)=>{
    setData(d=>d.map((r,i)=>i===sel?{...r,expenses:r.expenses.map(e=>e.id===updated.id?updated:e)}:r));
    if(userId)supabase.from('expenses').update({name:updated.desc,amount:updated.amount,cat:updated.cat}).eq('id',updated.id).eq('user_id',userId);
  };
  const delExp=async id=>{setData(d=>d.map((r,i)=>i===sel?{...r,expenses:r.expenses.filter(e=>e.id!==id)}:r));if(userId){await supabase.from('expenses').delete().eq('id',id).eq('user_id',userId);}};
  const expPct=Math.min((totalExp/Math.max(m.income,1))*100,100);
  return <div className="tab-content">
    <div className="month-scroll">{MONTHS_TH.map((mo,i)=><button key={i} className={`mo-chip ${sel===i?"mo-on":""}`} onClick={()=>setSel(i)}>{mo}{data[i].income>0&&<span className="mo-dot"/>}</button>)}</div>
    <div className="money-hero">
      <div className="mh-month">{MONTH_FULL[sel]} {YEAR_TH}</div>
      <div className="mh-cols">
        <div className="mhc"><div className="mhc-label">รายได้</div><div className="mhc-val inc">{fmt(totalInc)}<span className="mhc-unit"> ฿</span></div></div>
        <div className="mhc-sep"/>
        <div className="mhc"><div className="mhc-label">ค่าใช้จ่าย</div><div className="mhc-val exp">{fmt(totalExp)}<span className="mhc-unit"> ฿</span></div></div>
        <div className="mhc-sep"/>
        <div className="mhc"><div className="mhc-label">คงเหลือ</div><div className={`mhc-val ${net>=0?"inc":"exp"}`}>{fmt(Math.abs(net))}<span className="mhc-unit"> ฿</span></div></div>
      </div>
      {m.income>0&&<div className="flow-bar-wrap"><div className="flow-bar"><div className="flow-seg flow-exp" style={{width:`${expPct}%`}}/><div className="flow-seg flow-tax" style={{width:`${Math.min((taxMo/m.income)*100,100)}%`}}/></div><div className="flow-legend"><span><span className="fleg exp"/> ค่าใช้จ่าย {Math.round(expPct)}%</span><span><span className="fleg tax"/> ภาษีประมาณ</span></div></div>}
    </div>
    <div className="sec-hd">
      <span>💰 รายได้เดือนนี้</span>
      <button className="sec-add" onClick={()=>setSheet("income")}>+ เพิ่มรายได้</button>
    </div>
    {totalInc===0
      ?<div className="empty-card" onClick={()=>setSheet("income")}>แตะเพื่อบันทึกรายได้ เช่น งานออกแบบ ถ่ายภาพ →</div>
      :<div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:8}}>
        {(m.incomes&&m.incomes.length>0)?m.incomes.map(inc=>(
          <div key={inc.id} style={{background:"#FFF",border:"1.5px solid #EDE8D8",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"#F0FFF4",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💰</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#2C2510"}}>{inc.desc||"รายได้"}</div>
              <div style={{fontSize:11,color:"#A89660",marginTop:2}}>{inc.date}</div>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:"#4A7C3F"}}>+{fmt(inc.amount)} ฿</div>
            <button className="del-btn" style={{marginRight:2}} onClick={()=>setEditIncEntry(inc)}>✏️</button>
            <button className="del-btn" onClick={()=>delIncome(inc.id,inc.amount)}>🗑</button>
          </div>
        )):(
          <div style={{background:"#FFF",border:"1.5px solid #EDE8D8",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"#F0FFF4",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💰</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#2C2510"}}>รายได้</div></div>
            <div style={{fontSize:15,fontWeight:800,color:"#4A7C3F"}}>+{fmt(m.income)} ฿</div>
          </div>
        )}
        <div style={{background:"#F0FFF4",border:"1.5px solid #B8D89A",borderRadius:11,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>รวมรายได้เดือนนี้</span>
          <span style={{fontSize:16,fontWeight:800,color:"#4A7C3F"}}>{fmt(totalInc)} ฿</span>
        </div>
      </div>
    }
    <div className="sec-hd"><span>📤 ค่าใช้จ่าย</span><button className="sec-add" onClick={()=>setSheet("expense")}>+ เพิ่ม</button></div>
    {m.expenses.length===0?<div className="empty-card" onClick={()=>setSheet("expense")}>ยังไม่มีค่าใช้จ่าย แตะเพื่อเพิ่ม →</div>:<>{m.expenses.map(e=><div className="exp-row" key={e.id}><span className="exp-cat-ico">{e.cat?.split(" ")[0]||"💸"}</span><div className="exp-info"><div className="exp-name">{e.desc}</div><div className="exp-cat">{e.cat||"ค่าใช้จ่าย"}</div></div><div className="exp-amt">−{fmt(e.amount)} ฿</div><button className="del-btn" style={{marginRight:2}} onClick={()=>setEditExpEntry(e)}>✏️</button><button className="del-btn" onClick={()=>delExp(e.id)}>🗑</button></div>)}<div className="exp-total">รวม <strong>{fmt(totalExp)} บาท</strong></div></>}
    {totalInc>0&&<div className={`net-card ${net>=0?"net-pos":"net-neg"}`}><div className="net-label">{net>=0?"💚 เงินคงเหลือ":"🔴 รายจ่ายเกินรายได้"}</div><div className="net-val">{fmt(Math.abs(net))} บาท</div>{net>0&&<div className="net-hint">→ เอาไปวางแผนได้ในแท็บ "วางแผน"</div>}</div>}
    {/* ── เอกสารรายได้ ── */}
    <div className="sec-hd" style={{marginTop:4}}>
      <span>📎 เอกสารรายได้เดือนนี้</span>
      <button className="sec-add" onClick={()=>setShowDocSheet(true)}>+ เพิ่มเอกสาร</button>
    </div>
    {docs[sel].length===0
      ?<div className="empty-card" onClick={()=>setShowDocSheet(true)}>แตะเพื่อบันทึกสลิป ใบหัก ณ ที่จ่าย หรือ Link เอกสาร →</div>
      :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
        {docs[sel].map(d=><div key={d.id} style={{background:"#FFF",border:"1.5px solid #EDE8D8",borderRadius:12,padding:"12px 13px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:d.link||d.note?8:0}}>
            <span style={{fontSize:20,flexShrink:0}}>{d.dataUrl&&d.dataUrl.startsWith("data:image")?"🖼️":d.dataUrl?"📄":"🔗"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{d.docType||"เอกสาร"}</div>
              {d.company&&<div style={{fontSize:11,color:"#6B5E3C",marginTop:1}}>{d.company}</div>}
              {d.recipient&&<div style={{fontSize:11,color:"#A89660"}}>ถึง: {d.recipient}</div>}
              <div style={{fontSize:10,color:"#C4B88A",marginTop:2}}>{d.date}</div>
            </div>
            <button className="del-btn" onClick={()=>{setDocsState(prev=>prev.map((arr,i)=>i===sel?arr.filter(x=>x.id!==d.id):arr));if(deleteDocFromDB)deleteDocFromDB(d.id);}}>🗑</button>
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {d.link&&<a href={d.link} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><button style={{background:"#E8F5FF",border:"none",color:"#2E6DA4",fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>🔗 เปิด Link</button></a>}
            {d.dataUrl&&<a href={d.dataUrl} download={d.name}><button style={{background:"#FFF3C4",border:"none",color:"#B8860B",fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>⬇ ดาวน์โหลด</button></a>}
            {d.note&&<span style={{fontSize:11,color:"#A89660",padding:"5px 0"}}>💬 {d.note}</span>}
          </div>
        </div>)}
      </div>
    }
    {showDocSheet&&<DocAddSheet monthIdx={sel} onSave={doc=>{setDocsState(prev=>prev.map((arr,i)=>i===sel?[...arr,doc]:arr));if(saveDocToDB)saveDocToDB(sel,doc);}} onClose={()=>setShowDocSheet(false)}/>}
    {editIncEntry&&<EditIncomeSheet entry={editIncEntry} onSave={updated=>{updateIncome(updated);setEditIncEntry(null);}} onClose={()=>setEditIncEntry(null)}/>}
    {editExpEntry&&<EditExpenseSheet entry={editExpEntry} onSave={updated=>{updateExp(updated);setEditExpEntry(null);}} onClose={()=>setEditExpEntry(null)}/>}
    {sheet&&<AddSheet title={sheet==="income"?"+ เพิ่มรายได้":"เพิ่มค่าใช้จ่าย"} hasCategory={sheet==="expense"} isIncome={sheet==="income"} onSave={sheet==="income"?addIncome:addExp} onClose={()=>setSheet(null)}/>}
  </div>;
}

// ── Invest Sheet (with goal linking) ────────────────────────────────
function InvestSheet({opt,selMonth,savings,onSave,onClose,goals,onDepositGoal,onEditRec}) {
  const [month,setMonth]=useState(selMonth);const [amount,setAmount]=useState("");const [note,setNote]=useState("");const [linkedGoal,setLinkedGoal]=useState(null);
  const existing=savings[opt.id]?.[month]||[];const totalMo=existing.reduce((s,r)=>s+r.amount,0);
  const save=()=>{
    if(!amount)return;
    const entry={id:Date.now(),amount:parseFloat(amount),note:note||opt.label,date:new Date().toLocaleDateString("th-TH"),goalId:linkedGoal||null};
    onSave(opt.id,month,entry);
    if(linkedGoal&&onDepositGoal) onDepositGoal(linkedGoal,{id:Date.now()+1,amount:parseFloat(amount),note:`${opt.icon} ${opt.label}${note?" — "+note:""}`,date:new Date().toLocaleDateString("th-TH")});
    setAmount("");setNote("");setLinkedGoal(null);
  };
  const del=id=>onSave(opt.id,month,null,id);
  return <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="sheet" style={{maxHeight:"88vh"}}>
      <div className="sheet-pill"/>
      <div className="inv-sheet-hd" style={{borderLeft:`4px solid ${opt.color}`}}><div className="inv-sh-icon" style={{background:opt.bg}}>{opt.icon}</div><div><div className="inv-sh-title">{opt.label}</div><div className="inv-sh-desc">{opt.desc}</div></div></div>
      <div className="ish-sec-label">เลือกเดือน</div>
      <div className="ish-months">{MONTHS_TH.map((mo,i)=>{const has=(savings[opt.id]?.[i]||[]).length>0;return <button key={i} className={`ish-mo ${month===i?"ish-mo-on":""}`} style={month===i?{background:opt.color,borderColor:opt.color}:{}} onClick={()=>setMonth(i)}>{mo}{has&&<span className="ish-mo-dot"/>}</button>;})}</div>
      <div className="ish-sec-label">{MONTH_FULL[month]} — บันทึก{opt.label}</div>
      {existing.length>0?<div className="ish-records">{existing.map(r=><div className="ish-rec" key={r.id}><div className="ish-rec-dot" style={{background:opt.color}}/><div className="ish-rec-info"><div className="ish-rec-note">{r.note}{r.goalId&&<span className="ish-rec-goal-tag">🌟</span>}</div><div className="ish-rec-date">{r.date}</div></div><div className="ish-rec-amt" style={{color:opt.color}}>+{fmt(r.amount)} ฿</div><button className="del-btn" style={{marginRight:2}} onClick={()=>onEditRec&&onEditRec(r)}>✏️</button><button className="del-btn" onClick={()=>del(r.id)}>🗑</button></div>)}<div className="ish-month-total">รวม{MONTHS_TH[month]} <strong style={{color:opt.color}}>{fmt(totalMo)} บาท</strong></div></div>:<div className="ish-empty">ยังไม่มีบันทึกในเดือนนี้</div>}
      {/* Goal linking */}
      {goals&&goals.filter(g=>g.saved<g.target).length>0&&<div className="ish-goal-link">
        <div className="ish-goal-label">🌟 นับรวมในเป้าหมายด้วยไหม?</div>
        <div className="ish-goal-opts">
          <button className={`ish-goal-btn ${!linkedGoal?"ish-goal-on":""}`} onClick={()=>setLinkedGoal(null)}>ไม่ระบุ</button>
          {goals.filter(g=>g.saved<g.target).map(g=><button key={g.id} className={`ish-goal-btn ${linkedGoal===g.id?"ish-goal-on":""}`} style={linkedGoal===g.id?{borderColor:"#7A4FA0",background:"#F5F0FF",color:"#7A4FA0"}:{}} onClick={()=>setLinkedGoal(g.id)}>{g.emoji} {g.name}</button>)}
        </div>
      </div>}
      <div className="ish-form">
        <input className="sinp" placeholder={`หมายเหตุ เช่น ซื้อ ${opt.label} ครั้งที่ 1`} value={note} onChange={e=>setNote(e.target.value)}/>
        <div className="ish-amt-row"><input className="sinp sinp-lg" type="number" placeholder="จำนวนเงิน (บาท)" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/><button className="ish-save-btn" style={{background:opt.color}} onClick={save}>บันทึก</button></div>
      </div>
    </div>
  </div>;
}

// ── Plan Tab ─────────────────────────────────────────────────────────
function PlanTab({data,setData,savings,setSavings,goals,onDepositGoal,userId,saveGoalToDB,saveSavingToDB,deleteSavingFromDB}) {
  const totalIncome=data.reduce((s,d)=>s+(d.incomes&&d.incomes.length>0?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income),0);const totalExp=data.reduce((s,d)=>s+d.expenses.reduce((ss,e)=>ss+e.amount,0),0);
  const {tax}=calcPersonalTax(totalIncome);const afterTax=Math.max(0,totalIncome-totalExp-tax);
  const [openOpt,setOpenOpt]=useState(null);const [selMonth]=useState(NOW_MONTH);
  const [editRecState,setEditRecState]=useState(null);
  const handleSave=(optId,monthIdx,entry,delId)=>{
    setSavings(prev=>{const cur=prev[optId]?.[monthIdx]||[];const upd=delId?cur.filter(r=>r.id!==delId):[...cur,entry];return {...prev,[optId]:{...(prev[optId]||{}),[monthIdx]:upd}};});
    if(delId&&deleteSavingFromDB) deleteSavingFromDB(delId);
    if(entry&&saveSavingToDB) saveSavingToDB(optId,monthIdx,entry);
  };
  const totalForOpt=id=>Object.values(savings[id]||{}).flat().reduce((s,r)=>s+r.amount,0);
  const grandTotal=INVEST_OPTIONS.reduce((s,o)=>s+totalForOpt(o.id),0);
  return <div className="tab-content">
    <div className="plan-hero">
      <div className="ph-label">เงินคงเหลือหลังหักทุกอย่าง (ปีนี้)</div>
      <div className="ph-val">{fmt(afterTax)} <span className="ph-unit">บาท</span></div>
      <div className="ph-rows">
        <div className="ph-row"><span>รายได้รวม</span><span className="phv-inc">{fmt(totalIncome)} ฿</span></div>
        <div className="ph-row"><span>ค่าใช้จ่ายรวม</span><span className="phv-exp">−{fmt(totalExp)} ฿</span></div>
        <div className="ph-row"><span>ภาษีประมาณ</span><span className="phv-exp">−{fmt(tax)} ฿</span></div>
        <div className="ph-row ph-row-bold"><span>เงินที่เหลือจริง</span><span>{fmt(afterTax)} ฿</span></div>
      </div>
    </div>
    <div className="rule-card">
      <div className="rule-title">📐 กฎ 50/30/20</div>
      <div className="rule-rows">{[{pct:50,label:"ความจำเป็น",desc:"ที่พัก อาหาร เดินทาง",color:"#E8B84B"},{pct:30,label:"ความต้องการ",desc:"ท่องเที่ยว ของฟุ่มเฟือย",color:"#5BA3D9"},{pct:20,label:"ออม/ลงทุน",desc:"กองทุน หุ้น ทองคำ",color:"#6ABF6A"}].map(r=><div className="rule-row" key={r.label}><div className="rule-bar-wrap"><div className="rule-bar-fill" style={{width:`${r.pct}%`,background:r.color}}/></div><div className="rule-info"><span className="rule-pct" style={{color:r.color}}>{r.pct}%</span><span className="rule-label">{r.label}</span><span className="rule-amt">{fmt(afterTax*r.pct/100)} ฿</span></div><div className="rule-desc">{r.desc}</div></div>)}</div>
    </div>
    {grandTotal>0&&<div className="savings-bar-card"><div className="sbc-top"><span className="sbc-label">ออม/ลงทุนสะสมปีนี้</span><span className="sbc-total">{fmt(grandTotal)} ฿</span></div><div className="sbc-track">{INVEST_OPTIONS.map(o=>{const t=totalForOpt(o.id);if(!t)return null;return <div key={o.id} className="sbc-seg" style={{width:`${(t/grandTotal)*100}%`,background:o.color}}/>;})}</div></div>}
    <div className="sec-hd" style={{padding:"0 0 8px"}}><span>🌱 กดการ์ดเพื่อบันทึกการออม</span></div>
    <div className="invest-list">{INVEST_OPTIONS.map(opt=>{const total=totalForOpt(opt.id);const moTotal=(savings[opt.id]?.[NOW_MONTH]||[]).reduce((s,r)=>s+r.amount,0);const hasAny=total>0;return <div className="invest-card inv-tappable" key={opt.id} style={{borderColor:hasAny?opt.color+"88":opt.color+"33"}} onClick={()=>setOpenOpt(opt)}>
      <div className="inv-left"><div className="inv-icon" style={{background:opt.bg}}>{opt.icon}</div><div><div className="inv-label">{opt.label}</div><div className="inv-desc">{opt.desc}</div>{moTotal>0&&<div className="inv-this-month" style={{color:opt.color}}>เดือนนี้ +{fmt(moTotal)} ฿</div>}</div></div>
      <div className="inv-right">{hasAny?<><div className="inv-total-val" style={{color:opt.color}}>{fmt(total)} ฿</div><div className="inv-total-label">สะสมปีนี้</div></>:<div className="inv-tap-hint" style={{color:opt.color+"99"}}>แตะเพื่อบันทึก</div>}</div>
    </div>;})}
    </div>
    <div className="invest-note">💡 แตะการ์ด → เลือกเดือน → ใส่จำนวน → เลือกเป้าหมายที่จะนับรวมได้ด้วย</div>
    {editRecState&&<EditRecSheet editRec={editRecState.rec} optColor={editRecState.color} onSave={(updated)=>{handleSave(editRecState.optId,editRecState.month,updated);setEditRecState(null);}} onClose={()=>setEditRecState(null)}/>}
      {openOpt&&<InvestSheet opt={openOpt} selMonth={selMonth} savings={savings} onSave={handleSave} onClose={()=>setOpenOpt(null)} goals={goals} onDepositGoal={onDepositGoal} onEditRec={(r)=>setEditRecState({rec:r,optId:openOpt.id,month:selMonth,color:openOpt.color})}/>}
  </div>;
}

// ── Goal Sheet ───────────────────────────────────────────────────────
function GoalSheet({existing,onSave,onClose}) {
  const [emoji,setEmoji]=useState(existing?.emoji||"✈️");const [name,setName]=useState(existing?.name||"");
  const [target,setTarget]=useState(existing?.target||"");const [deadline,setDeadline]=useState(existing?.deadline||"");
  const mo=()=>{if(!deadline)return null;const [y,m]=deadline.split("-").map(Number);const now=new Date();return Math.max(1,(y-now.getFullYear())*12+(m-now.getMonth()-1));};
  const moLeft=mo();const need=moLeft?Math.ceil((parseFloat(target||0)-(existing?.saved||0))/moLeft):0;
  const save=()=>{if(!name.trim()||!target)return;onSave({id:existing?.id||Date.now(),emoji,name,target:parseFloat(target),deadline,saved:existing?.saved||0,deposits:existing?.deposits||[]});onClose();};
  return <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="sheet" style={{maxHeight:"88vh"}}>
      <div className="sheet-pill"/>
      <div className="sheet-ttl">{existing?"แก้ไขเป้าหมาย":"เพิ่มเป้าหมายใหม่"}</div>
      <div className="gs-emoji-row">{GOAL_PRESETS.map(p=><button key={p.emoji} className={`gs-emoji-btn ${emoji===p.emoji?"gs-emoji-on":""}`} onClick={()=>{setEmoji(p.emoji);if(!name)setName(p.label);}}><span style={{fontSize:22}}>{p.emoji}</span><span className="gs-emoji-label">{p.label}</span></button>)}</div>
      <label className="ish-sec-label">ชื่อเป้าหมาย</label><input className="sinp" placeholder="เช่น ไปเที่ยวญี่ปุ่นปลายปี" value={name} onChange={e=>setName(e.target.value)}/>
      <label className="ish-sec-label">เงินที่ต้องการ (บาท)</label><input className="sinp sinp-lg" type="number" placeholder="เช่น 50000" value={target} onChange={e=>setTarget(e.target.value)}/>
      <label className="ish-sec-label">กำหนดเวลา</label><input className="sinp" type="month" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
      {moLeft&&parseFloat(target||0)>0&&<div className="gs-calc-hint"><span>📅 เหลืออีก {moLeft} เดือน → ต้องเก็บเดือนละประมาณ</span><span className="gs-calc-amt">{fmt(need)} บาท</span></div>}
      <div className="sheet-btns" style={{marginTop:8}}><button className="sbtn-c" onClick={onClose}>ยกเลิก</button><button className="sbtn-s" onClick={save}>บันทึกเป้าหมาย ✓</button></div>
    </div>
  </div>;
}

// ── Goal Detail Sheet (monthly tracker) ─────────────────────────────
function GoalDetailSheet({goal, onDeposit, onDeleteDeposit, onClose}) {
  const [addMonth, setAddMonth] = useState(NOW_MONTH);
  const [amount, setAmount]     = useState("");
  const [note, setNote]         = useState("");

  // group deposits by month index
  const byMonth = Array.from({length:12}, () => []);
  (goal.deposits||[]).forEach(d => {
    // date stored as localeDateString — parse month from note or fallback to addMonth
    // We store monthIdx on deposit when saving
    const mi = d.monthIdx ?? NOW_MONTH;
    byMonth[mi].push(d);
  });

  const monthlyTarget = goal.deadline ? (() => {
    const [y,m] = goal.deadline.split("-").map(Number);
    const now = new Date();
    const totalMo = Math.max(1,(y-now.getFullYear())*12+(m-now.getMonth()-1)+
      (goal.deposits?.length>0?0:0)); // use remaining months from now
    const remaining = Math.max(1,(y-now.getFullYear())*12+(m-now.getMonth()-1));
    return Math.ceil((goal.target - goal.saved) / remaining);
  })() : 0;

  const save = () => {
    if(!amount) return;
    onDeposit(goal.id, {
      id: Date.now(),
      amount: parseFloat(amount),
      note: note || MONTH_FULL[addMonth],
      date: new Date().toLocaleDateString("th-TH"),
      monthIdx: addMonth,
    });
    setAmount(""); setNote("");
  };

  const pct = Math.min((goal.saved / goal.target) * 100, 100);
  const remaining = goal.target - goal.saved;

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet" style={{maxHeight:"92vh"}}>
        <div className="sheet-pill"/>

        {/* Header */}
        <div className="gd-header">
          <span className="gd-emoji">{goal.emoji}</span>
          <div className="gd-meta">
            <div className="gd-name">{goal.name}</div>
            {goal.deadline&&<div className="gd-dl">🗓 {goal.deadline.replace("-","/")} · เหลือ {remaining>0?fmt(remaining):"ครบแล้ว"} บาท</div>}
          </div>
        </div>

        {/* Overall progress */}
        <div className="gd-prog-card">
          <div className="gd-prog-nums">
            <span className="gd-saved">{fmt(goal.saved)} ฿</span>
            <span className="gd-pct">{Math.round(pct)}%</span>
            <span className="gd-target">{fmt(goal.target)} ฿</span>
          </div>
          <div className="gd-prog-track">
            <div className="gd-prog-fill" style={{width:`${pct}%`, background:pct>=100?"#6ABF6A":"#E8B84B"}}/>
          </div>
          {monthlyTarget>0&&remaining>0&&(
            <div className="gd-hint">ต้องเก็บเดือนละ <strong style={{color:"#B8860B"}}>{fmt(monthlyTarget)} บาท</strong> เพื่อให้ถึงเป้า</div>
          )}
        </div>

        {/* Monthly timeline */}
        <div className="ish-sec-label" style={{marginBottom:10}}>ประวัติการออมรายเดือน</div>
        <div className="gd-timeline">
          {MONTHS_TH.map((mo, mi) => {
            const deps = byMonth[mi];
            const moTotal = deps.reduce((s,d)=>s+d.amount,0);
            const isOnTrack = monthlyTarget > 0 && moTotal >= monthlyTarget;
            const hasData   = deps.length > 0;
            const isPast    = mi <= NOW_MONTH;
            return (
              <div key={mi} className={`gd-mo-row ${addMonth===mi?"gd-mo-sel":""}`}
                onClick={()=>setAddMonth(mi)}>
                <div className="gd-mo-left">
                  <div className={`gd-mo-badge ${hasData?(isOnTrack?"gd-mo-ok":"gd-mo-partial"):"gd-mo-empty"}`}>
                    {hasData ? (isOnTrack?"✓":"·") : (isPast?"–":"○")}
                  </div>
                  <span className="gd-mo-name">{mo}</span>
                </div>
                <div className="gd-mo-mid">
                  {hasData && (
                    <div className="gd-mo-bar-track">
                      <div className="gd-mo-bar-fill" style={{
                        width: monthlyTarget>0 ? `${Math.min((moTotal/monthlyTarget)*100,100)}%` : "100%",
                        background: isOnTrack ? "#6ABF6A" : "#E8B84B"
                      }}/>
                    </div>
                  )}
                </div>
                <div className="gd-mo-right">
                  {hasData ? (
                    <span className={`gd-mo-amt ${isOnTrack?"gd-mo-amt-ok":""}`}>+{fmt(moTotal)} ฿</span>
                  ) : (
                    <span className="gd-mo-add-hint">{addMonth===mi?"← เพิ่มที่นี่":"แตะ"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Deposit list for selected month */}
        {byMonth[addMonth].length > 0 && (
          <div className="gd-dep-list">
            <div className="ish-sec-label">{MONTH_FULL[addMonth]} — รายละเอียด</div>
            {byMonth[addMonth].map(d=>(
              <div className="gd-dep-row" key={d.id}>
                <span className="gd-dep-dot"/>
                <div className="gd-dep-info">
                  <div className="gd-dep-note">{d.note}</div>
                  <div className="gd-dep-date">{d.date}</div>
                </div>
                <div className="gd-dep-amt">+{fmt(d.amount)} ฿</div>
                <button className="del-btn" onClick={()=>onDeleteDeposit(goal.id,d.id)}>🗑</button>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        <div className="gd-add-form">
          <div className="gd-add-title">+ เพิ่มยอดออม — <strong>{MONTH_FULL[addMonth]}</strong></div>
          <input className="sinp" placeholder="หมายเหตุ (ไม่บังคับ)" value={note} onChange={e=>setNote(e.target.value)}/>
          <div className="ish-amt-row">
            <input className="sinp sinp-lg" type="number" placeholder="จำนวนเงิน (บาท)"
              value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}/>
            <button className="ish-save-btn" style={{background:"#E8B84B",color:"#2C2510"}} onClick={save}>บันทึก</button>
          </div>
        </div>

        <button className="sbtn-c" style={{width:"100%",marginTop:4}} onClick={onClose}>ปิด</button>
      </div>
    </div>
  );
}


// ── Retirement Planner ───────────────────────────────────────────────
function RetirementPlanner({onClose, userId}) {
  const [age,    setAge]    = useState("30");
  const [retAge, setRetAge] = useState("55");
  const [lifeAge,setLifeAge]= useState("85");
  const [expense,setExpense]= useState("");
  const [inflation,setInflation]=useState("3");
  const [returnRate,setReturn]  = useState("6");
  const [currentSavings,setCurSav]=useState("0");
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved plan from Supabase on open
  useEffect(()=>{
    if(!userId||loaded) return;
    supabase.from("retirement_plans").select("*").eq("user_id",userId).single().then(({data:rp})=>{
      if(rp){
        setAge(String(rp.age||30));setRetAge(String(rp.ret_age||55));setLifeAge(String(rp.life_age||85));
        setExpense(String(rp.expense||""));setCurSav(String(rp.current_savings||0));
        setInflation(String(rp.inflation||3));setReturn(String(rp.return_rate||6));
      }
      setLoaded(true);
    });
  },[userId]);

  // Auto-calc when any input changes
  useEffect(()=>{ if(loaded&&expense) calcSilent(); },[age,retAge,lifeAge,expense,inflation,returnRate,currentSavings,loaded]);

  const calcSilent = () => { calc(); };

  const calc = () => {
    const a   = parseInt(age)||30;
    const ra  = parseInt(retAge)||55;
    const la  = parseInt(lifeAge)||85;
    const exp = parseFloat(expense)||0;
    const inf = (parseFloat(inflation)||3) / 100;
    const ret = (parseFloat(returnRate)||6) / 100;
    const cur = parseFloat(currentSavings)||0;

    const yearsToRetire = Math.max(1, ra - a);
    const yearsInRetire = Math.max(1, la - ra);

    // ค่าใช้จ่ายต่อเดือนตอนเกษียณ (ปรับเงินเฟ้อ)
    const expAtRetire = exp * Math.pow(1 + inf, yearsToRetire);

    // เงินที่ต้องมีทั้งหมดวันเกษียณ (Present Value of annuity ใช้ real rate)
    // real monthly rate after inflation
    const monthlyRealRate = (ret - inf) / 12;
    const months = yearsInRetire * 12;
    let totalNeeded;
    if(Math.abs(monthlyRealRate) < 0.0001) {
      totalNeeded = expAtRetire * months;
    } else {
      // PV of annuity
      totalNeeded = expAtRetire * (1 - Math.pow(1+monthlyRealRate,-months)) / monthlyRealRate;
    }

    // เงินที่ออมไว้แล้วจะงอกเป็นเท่าไหร่ตอนเกษียณ
    const monthlyRetRate = ret / 12;
    const currentGrown = cur * Math.pow(1+monthlyRetRate, yearsToRetire*12);

    // เงินที่ยังขาด
    const shortfall = Math.max(0, totalNeeded - currentGrown);

    // ต้องเก็บเดือนละเท่าไหร่ (FV of annuity)
    const totalMonths = yearsToRetire * 12;
    let monthlySave;
    if(monthlyRetRate < 0.0001) {
      monthlySave = shortfall / totalMonths;
    } else {
      monthlySave = shortfall * monthlyRetRate / (Math.pow(1+monthlyRetRate,totalMonths)-1);
    }

    // Projection: wealth path year by year
    const path = [];
    let wealth = cur;
    for(let y=0; y<=yearsToRetire; y++){
      path.push({year: new Date().getFullYear()+y, wealth: Math.round(wealth), phase:"save"});
      wealth = (wealth + monthlySave*12) * (1+ret);
    }
    const wealthAtRetire = path[path.length-1].wealth;
    for(let y=1; y<=yearsInRetire; y++){
      const drawdown = expAtRetire * 12 * Math.pow(1+inf,y);
      wealth = (wealth - drawdown) * (1+ret*0.5); // conservative in retirement
      path.push({year: new Date().getFullYear()+yearsToRetire+y, wealth:Math.max(0,Math.round(wealth)), phase:"retire"});
    }

    setResult({
      yearsToRetire, yearsInRetire,
      expAtRetire, totalNeeded,
      currentGrown, shortfall,
      monthlySave: Math.max(0, monthlySave),
      wealthAtRetire,
      path,
      onTrack: currentGrown >= totalNeeded,
    });
  };

  const fmtM = n => {
    if(n>=1000000000) return `${(n/1000000000).toFixed(1)} พันล.`;
    if(n>=1000000)    return `${(n/1000000).toFixed(1)} ล.`;
    if(n>=1000)       return `${(n/1000).toFixed(0)}K`;
    return fmt(n);
  };

  const maxWealth = result ? Math.max(...result.path.map(p=>p.wealth),1) : 1;
  const retireYear = new Date().getFullYear() + (parseInt(retAge)||55)-(parseInt(age)||30);

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet" style={{maxHeight:"94vh"}}>
        <div className="sheet-pill"/>
        <div className="rp-header">
          <span style={{fontSize:28}}>💰</span>
          <div>
            <div className="rp-title">วางแผนเกษียณ</div>
            <div className="rp-sub">คำนวณเงินที่ต้องเตรียมก่อนเกษียณ</div>
          </div>
        </div>

        {/* Input grid */}
        <div className="rp-section-label">ข้อมูลส่วนตัว</div>
        <div className="rp-age-row">
          {[
            {label:"อายุปัจจุบัน",val:age,set:setAge,unit:"ปี",emoji:"🧑"},
            {label:"อายุเกษียณ",val:retAge,set:setRetAge,unit:"ปี",emoji:"🏖️"},
            {label:"อายุขัยที่คาด",val:lifeAge,set:setLifeAge,unit:"ปี",emoji:"👴"},
          ].map(f=>(
            <div className="rp-age-card" key={f.label}>
              <div className="rp-age-emoji">{f.emoji}</div>
              <div className="rp-age-label">{f.label}</div>
              <input className="rp-age-inp" type="number" value={f.val}
                onChange={e=>f.set(e.target.value)}/>
              <div className="rp-age-unit">{f.unit}</div>
            </div>
          ))}
        </div>

        <div className="rp-section-label" style={{marginTop:14}}>ค่าใช้จ่าย & ผลตอบแทน</div>
        <div className="rp-inputs">
          <div className="rp-inp-row">
            <div className="rp-inp-label">💸 ค่าใช้จ่ายต่อเดือนตอนนี้</div>
            <div className="rp-inp-field">
              <input className="sinp" type="number" placeholder="เช่น 30000" value={expense}
                onChange={e=>setExpense(e.target.value)} style={{marginBottom:0}}/>
              <span className="rp-inp-unit">บาท/เดือน</span>
            </div>
          </div>
          <div className="rp-inp-row">
            <div className="rp-inp-label">🏦 เงินออมที่มีแล้วตอนนี้</div>
            <div className="rp-inp-field">
              <input className="sinp" type="number" placeholder="เช่น 500000" value={currentSavings}
                onChange={e=>setCurSav(e.target.value)} style={{marginBottom:0}}/>
              <span className="rp-inp-unit">บาท</span>
            </div>
          </div>
          <div className="rp-rate-row">
            <div className="rp-rate-card">
              <div className="rp-rate-label">📈 เงินเฟ้อ</div>
              <div className="rp-rate-inp-wrap">
                <input className="rp-rate-inp" type="number" step="0.5" value={inflation}
                  onChange={e=>setInflation(e.target.value)}/>
                <span className="rp-rate-unit">%/ปี</span>
              </div>
            </div>
            <div className="rp-rate-card">
              <div className="rp-rate-label">💹 ผลตอบแทนออม</div>
              <div className="rp-rate-inp-wrap">
                <input className="rp-rate-inp" type="number" step="0.5" value={returnRate}
                  onChange={e=>setReturn(e.target.value)}/>
                <span className="rp-rate-unit">%/ปี</span>
              </div>
            </div>
          </div>
        </div>

        <button className="rp-calc-btn" onClick={calc}>{result?"คำนวณใหม่ →":"คำนวณ →"}</button>
        {result&&userId&&<button onClick={async()=>{
          await supabase.from("retirement_plans").upsert({user_id:userId,age:parseInt(age),ret_age:parseInt(retAge),life_age:parseInt(lifeAge),expense:parseFloat(expense),inflation:parseFloat(inflation),return_rate:parseFloat(returnRate),current_savings:parseFloat(currentSavings||0)},{onConflict:"user_id"});
          setSaved(true);setTimeout(()=>setSaved(false),2500);
        }} style={{width:"100%",background:saved?"#4A7C3F":"#2C2510",color:"#FFF3C4",border:"none",borderRadius:12,padding:13,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Sarabun',sans-serif",marginBottom:10,transition:"background .3s"}}>
          {saved?"✅ บันทึกแล้ว!":"💾 บันทึกแผนเกษียณ"}
        </button>}

        {result && (<>
          {/* Key results */}
          <div className={`rp-result-hero ${result.onTrack?"rp-safe":"rp-warn"}`}>
            <div className="rp-hero-icon">{result.onTrack?"✅":"⚠️"}</div>
            <div className="rp-hero-text">
              <div className="rp-hero-title">{result.onTrack?"เงินพอเกษียณ!":"ต้องเพิ่มการออม"}</div>
              <div className="rp-hero-sub">
                {result.onTrack
                  ? `เงินออมปัจจุบันเพียงพอแล้ว`
                  : `ต้องออมเดือนละ ${fmt(Math.round(result.monthlySave))} บาท`}
              </div>
            </div>
          </div>

          <div className="rp-cards">
            {[
              {icon:"💸",label:"ค่าใช้จ่าย/เดือนตอนเกษียณ",val:`${fmt(Math.round(result.expAtRetire))} บาท`,sub:"ปรับเงินเฟ้อแล้ว"},
              {icon:"🏦",label:"เงินที่ต้องมีตอนเกษียณ",val:`${fmtM(result.totalNeeded)} บาท`,sub:"เพื่อใช้จนสิ้นอายุขัย"},
              {icon:"⏳",label:"เหลือเวลาเก็บเงิน",val:`${result.yearsToRetire} ปี`,sub:`เกษียณปี ${retireYear+543}`},
              {icon:"💰",label:"ต้องออมเดือนละ",val:`${fmt(Math.round(result.monthlySave))} บาท`,sub:"ที่ผลตอบแทน "+returnRate+"%/ปี",highlight:true},
            ].map(c=>(
              <div key={c.label} className={`rp-card ${c.highlight?"rp-card-hl":""}`}>
                <div className="rp-card-icon">{c.icon}</div>
                <div className="rp-card-label">{c.label}</div>
                <div className={`rp-card-val ${c.highlight?"rp-card-val-hl":""}`}>{c.val}</div>
                <div className="rp-card-sub">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Wealth Path Chart */}
          <div className="rp-section-label" style={{marginTop:14}}>Wealth Path — เส้นทางความมั่งคั่ง</div>
          <div className="rp-chart">
            <div className="rp-chart-bars">
              {result.path.filter((_,i)=>i%2===0).map((p,i)=>(
                <div key={i} className="rp-bar-col">
                  <div className="rp-bar-wrap">
                    <div className={`rp-bar ${p.phase==="retire"?"rp-bar-retire":"rp-bar-save"}`}
                      style={{height:`${Math.max(2,(p.wealth/maxWealth)*100)}%`}}/>
                  </div>
                  <div className="rp-bar-label">
                    {p.year===retireYear&&<div className="rp-retire-marker">เกษียณ</div>}
                    {i%4===0&&<span>{p.year-2500+2543}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="rp-chart-legend">
              <span><span className="rpc-dot save"/>ช่วงออมเงิน</span>
              <span><span className="rpc-dot retire"/>ช่วงเกษียณ</span>
            </div>
            <div className="rp-chart-ymax">{fmtM(maxWealth)}</div>
          </div>

          {/* Scenarios */}
          <div className="rp-section-label" style={{marginTop:14}}>สมมติสถานการณ์</div>
          <div className="rp-scenarios">
            {[
              {label:"ผลตอบแทนต่ำ (4%)", rate:4, color:"#C04848"},
              {label:"ปานกลาง (6%)", rate:6, color:"#E8B84B"},
              {label:"สูง (8%)", rate:8, color:"#4A7C3F"},
            ].map(s=>{
              const r = s.rate/100; const rm = r/12;
              const n = result.yearsToRetire*12;
              const need = result.totalNeeded;
              const cg = parseFloat(currentSavings||0)*Math.pow(1+rm,n);
              const sf = Math.max(0,need-cg);
              const ms = sf>0&&rm>0.0001 ? sf*rm/(Math.pow(1+rm,n)-1) : sf/n;
              return (
                <div key={s.label} className="rp-scenario-row">
                  <span className="rps-dot" style={{background:s.color}}/>
                  <span className="rps-label">{s.label}</span>
                  <span className="rps-val" style={{color:s.color}}>เก็บเดือนละ {fmt(Math.round(ms))} ฿</span>
                </div>
              );
            })}
          </div>

          <div className="rp-note">* การคำนวณเป็นการประมาณการ ควรปรึกษาที่ปรึกษาการเงินสำหรับการวางแผนจริง</div>
          <button className="rp-calc-btn" style={{background:"#4A7C3F",marginTop:8}} onClick={async()=>{
            if(userId){
              await supabase.from("retirement_plans").upsert({user_id:userId,age:parseInt(age),ret_age:parseInt(retAge),life_age:parseInt(lifeAge),expense:parseFloat(expense),current_savings:parseFloat(currentSavings||0),inflation:parseFloat(inflation),return_rate:parseFloat(returnRate),monthly_save:Math.round(result.monthlySave),total_needed:Math.round(result.totalNeeded),updated_at:new Date().toISOString()},{onConflict:"user_id"});
            }
            
          }}>💾 บันทึกแผนเกษียณ</button>
        </>)}

        <button className="sbtn-c" style={{width:"100%",marginTop:12}} onClick={onClose}>ปิด</button>
      </div>
    </div>
  );
}

// ── Goals Tab ────────────────────────────────────────────────────────
function GoalsTab({data,goals,setGoals,savings,userId,saveGoalToDB}) {
  const [showAdd,setShowAdd]=useState(false);const [editGoal,setEditGoal]=useState(null);const [detailGoal,setDetailGoal]=useState(null);const [showRetirement,setShowRetirement]=useState(false);
  const totalInc=data.reduce((s,d)=>s+(d.incomes&&d.incomes.length>0?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income),0);const totalExp=data.reduce((s,d)=>s+d.expenses.reduce((ss,e)=>ss+e.amount,0),0);
  const {tax}=calcPersonalTax(totalInc);const totalSaved=Object.values(savings).flatMap(m=>Object.values(m)).flat().reduce((s,r)=>s+r.amount,0);
  const totalGoalSaved=goals.reduce((s,g)=>s+g.saved,0);const netLeft=Math.max(0,totalInc-totalExp-tax-totalSaved-totalGoalSaved);
  const saveGoal=g=>{setGoals(prev=>{const ex=prev.find(x=>x.id===g.id);return ex?prev.map(x=>x.id===g.id?g:x):[...prev,g];});if(saveGoalToDB)saveGoalToDB(g);};
  const delGoal=async id=>{setGoals(prev=>prev.filter(g=>g.id!==id));if(userId){await supabase.from('goals').delete().eq('id',id).eq('user_id',userId);}};
  const doDeposit=(goalId,dep)=>{setGoals(prev=>prev.map(g=>g.id===goalId?{...g,saved:g.saved+dep.amount,deposits:[...(g.deposits||[]),dep]}:g));if(saveGoalToDB){const g=goals.find(x=>x.id===goalId);if(g)saveGoalToDB({...g,saved:g.saved+dep.amount,deposits:[...(g.deposits||[]),dep]});}};
  const doDeleteDeposit=(goalId,depId)=>setGoals(prev=>prev.map(g=>{if(g.id!==goalId)return g;const dep=g.deposits?.find(d=>d.id===depId);const newSaved=Math.max(0,g.saved-(dep?.amount||0));return {...g,saved:newSaved,deposits:(g.deposits||[]).filter(d=>d.id!==depId)};}));
  const moLeft=dl=>{if(!dl)return null;const [y,m]=dl.split("-").map(Number);const now=new Date();return Math.max(1,(y-now.getFullYear())*12+(m-now.getMonth()-1));};
  return <div className="tab-content">
    <div className="goals-snap">
      <div className="gsnap-title">💡 ภาพรวมการเงินของคุณ</div>
      <div className="gsnap-rows">
        {[{label:"รายได้รวม",val:totalInc,color:"#4A7C3F",pre:"+"},{label:"ค่าใช้จ่าย",val:totalExp,color:"#C04848",pre:"−"},{label:"ภาษีประมาณ",val:tax,color:"#C04848",pre:"−"},{label:"ออม/ลงทุน",val:totalSaved,color:"#2E6DA4",pre:"−"},{label:"เป้าหมาย",val:totalGoalSaved,color:"#7A4FA0",pre:"−"}].map(r=><div className="gsnap-row" key={r.label}><span className="gsnap-label">{r.label}</span><div className="gsnap-bar-track"><div className="gsnap-bar-fill" style={{width:`${totalInc>0?Math.min((r.val/totalInc)*100,100):0}%`,background:r.color+"44"}}/></div><span className="gsnap-val" style={{color:r.color}}>{r.pre}{fmt(r.val)} ฿</span></div>)}
        <div className="gsnap-divider"/>
        <div className="gsnap-row gsnap-net"><span>เหลือใช้จริง</span><div className="gsnap-bar-track"><div className="gsnap-bar-fill" style={{width:`${totalInc>0?Math.min((netLeft/totalInc)*100,100):0}%`,background:"#E8B84B"}}/></div><span style={{color:"#B8860B",fontWeight:800}}>{fmt(netLeft)} ฿</span></div>
      </div>
    </div>
    {/* Retirement banner */}
    <div className="retirement-banner" onClick={()=>setShowRetirement(true)}>
      <div className="rb-glow"/>
      <div className="rb-left">
        <div className="rb-icon-wrap">
          <span className="rb-icon">💰</span>
        </div>
        <div>
          <div className="rb-eyebrow">แผนการเงิน</div>
          <div className="rb-title">วางแผนเกษียณ</div>
          <div className="rb-sub">คำนวณว่าต้องเก็บเดือนละเท่าไหร่ เพื่อเกษียณสบาย</div>
        </div>
      </div>
      <div className="rb-cta">
        <span className="rb-cta-text">แตะเพื่อคำนวณ</span>
        <span className="rb-arr">→</span>
      </div>
    </div>
    <div className="sec-hd"><span>🌟 ความฝัน & เป้าหมาย</span><button className="sec-add" onClick={()=>setShowAdd(true)}>+ เพิ่ม</button></div>
    {goals.length===0?<div className="goals-empty" onClick={()=>setShowAdd(true)}><div style={{fontSize:40,marginBottom:10}}>🌟</div><div style={{fontWeight:700,color:"#2C2510",marginBottom:4}}>ยังไม่มีเป้าหมาย</div><div style={{fontSize:13,color:"#A89660"}}>แตะเพื่อเพิ่มความฝันแรกของคุณ</div></div>:
    <div className="goals-list">{goals.map(g=>{const pct=Math.min((g.saved/g.target)*100,100);const mo=moLeft(g.deadline);const need=mo?Math.ceil((g.target-g.saved)/mo):0;const done=pct>=100;return <div className="goal-card" key={g.id} style={{borderColor:done?"#6ABF6A":"#EDE8D8"}}>
      {done&&<div className="goal-done-badge">🎉 สำเร็จแล้ว!</div>}
      <div className="goal-top"><div className="goal-emoji-wrap">{g.emoji}</div><div className="goal-meta"><div className="goal-name">{g.name}</div>{g.deadline&&<div className="goal-deadline">🗓 {g.deadline.replace("-","/")} {mo?`· เหลือ ${mo} เดือน`:""}</div>}</div><div className="goal-actions"><button className="goal-act-btn" onClick={()=>setEditGoal(g)}>✏️</button><button className="goal-act-btn" onClick={()=>delGoal(g.id)}>🗑</button></div></div>
      <div className="goal-prog-wrap"><div className="goal-prog-track"><div className="goal-prog-fill" style={{width:`${pct}%`,background:done?"#6ABF6A":"#E8B84B"}}/></div><div className="goal-prog-nums"><span style={{color:done?"#4A7C3F":"#B8860B",fontWeight:700}}>{fmt(g.saved)} ฿</span><span style={{color:"#A89660"}}>{Math.round(pct)}%</span><span style={{color:"#2C2510",fontWeight:700}}>{fmt(g.target)} ฿</span></div></div>
      {!done&&mo&&need>0&&<div className="goal-hint">ต้องเก็บเดือนละ <strong>{fmt(need)} บาท</strong> เพื่อให้ถึงเป้า</div>}
      {/* Monthly mini-timeline preview */}
      <div className="goal-mo-preview">
        {MONTHS_TH.map((mo,mi)=>{
          const deps=(g.deposits||[]).filter(d=>d.monthIdx===mi);
          const moTotal=deps.reduce((s,d)=>s+d.amount,0);
          const mNeed=g.deadline?(()=>{const [y,mm]=g.deadline.split("-").map(Number);const now=new Date();const rem=Math.max(1,(y-now.getFullYear())*12+(mm-now.getMonth()-1));return Math.ceil((g.target-g.saved)/rem);})():0;
          const ok=moTotal>=mNeed&&mNeed>0;
          const has=moTotal>0;
          return <div key={mi} className="goal-mo-dot-wrap" title={`${mo}: ${has?fmt(moTotal)+" ฿":"ยังไม่มี"}`}>
            <div className={`goal-mo-dot-cell ${has?(ok?"gmc-ok":"gmc-partial"):"gmc-empty"}`}/>
            <div className="goal-mo-dot-lbl">{mo}</div>
          </div>;
        })}
      </div>
      <button className="goal-deposit-btn" onClick={()=>setDetailGoal(g)}>
        {(g.deposits||[]).length>0?"📅 ดูและแก้ไขรายเดือน →":"+ เพิ่มยอดที่ออมได้"}
      </button>
    </div>;})}
    </div>}
    {(showAdd||editGoal)&&<GoalSheet existing={editGoal} onSave={saveGoal} onClose={()=>{setShowAdd(false);setEditGoal(null);}}/>}
    {showRetirement&&<RetirementPlanner onClose={()=>setShowRetirement(false)} userId={userId}/>}
    {detailGoal&&<GoalDetailSheet goal={detailGoal} onDeposit={(gid,dep)=>{doDeposit(gid,dep);setDetailGoal(prev=>({...prev,saved:prev.saved+dep.amount,deposits:[...(prev.deposits||[]),dep]}));}} onDeleteDeposit={(gid,did)=>{doDeleteDeposit(gid,did);setDetailGoal(prev=>{const d=prev.deposits?.find(x=>x.id===did);return {...prev,saved:Math.max(0,prev.saved-(d?.amount||0)),deposits:(prev.deposits||[]).filter(x=>x.id!==did)};});}} onClose={()=>setDetailGoal(null)}/>}
  </div>;
}

// ── Summary Tab ──────────────────────────────────────────────────────
function SummaryTab({data,goals,savings,userPlan,onPaywall}) {
  const totalInc=data.reduce((s,d)=>s+(d.incomes&&d.incomes.length>0?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income),0);const totalExp=data.reduce((s,d)=>s+d.expenses.reduce((ss,e)=>ss+e.amount,0),0);
  const {taxable,tax}=calcPersonalTax(totalInc);const net=totalInc-totalExp-tax;
  const maxInc=Math.max(...data.map(d=>(d.incomes&&d.incomes.length>0?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income)),1);
  const catMap={};data.forEach(m=>m.expenses.forEach(e=>{const k=e.cat||"อื่นๆ";catMap[k]=(catMap[k]||0)+e.amount;}));
  const cats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const totalSaved=Object.values(savings).flatMap(m=>Object.values(m)).flat().reduce((s,r)=>s+r.amount,0);
  return <div className="tab-content">
    <div className="sum-hero">
      <div className="sh-eye">ภาพรวมปี {YEAR_TH}</div>
      <div className="sh-big">{fmt(totalInc)}<span className="sh-unit"> บาท</span></div>
      <div className="sh-divider"/>
      <div className="sh-rows">
        <div className="sh-row"><span>ค่าใช้จ่ายรวม</span><span className="shr-neg">−{fmt(totalExp)} ฿</span></div>
        <div className="sh-row"><span>ภาษีประมาณ</span><span className="shr-neg">−{fmt(tax)} ฿</span></div>
        <div className="sh-row"><span>ออม/ลงทุน</span><span style={{color:"#90D080",fontWeight:700}}>−{fmt(totalSaved)} ฿</span></div>
        <div className="sh-row sh-bold"><span>เงินคงเหลือจริง</span><span style={{color:"#FFF3C4"}}>{fmt(Math.max(0,net-totalSaved))} ฿</span></div>
      </div>
    </div>
    <div className={`tax-res ${tax===0?"tr-safe":"tr-warn"}`}><div className="tr-label">ภาษีที่ต้องจ่ายปีนี้</div><div className="tr-val">{tax===0?"ไม่ต้องจ่าย 🎉":`${fmt(tax)} บาท`}</div><div className="tr-note">{tax===0?"แต่ยังต้องยื่นแบบถ้ารายได้ > 60,000 บ./ปี":"ยื่นออนไลน์ที่ efiling.rd.go.th ภายในมีนาคม"}</div></div>
    <div className="sec-hd2">รายได้รายเดือน</div>
    <div className="mo-bars">{data.map((d,i)=>{const t=(d.incomes&&d.incomes.length>0?d.incomes.reduce((ss,e)=>ss+e.amount,0):d.income);const pct=(t/maxInc)*100;return <div className="mob-row" key={i}><div className="mob-label">{MONTHS_TH[i]}</div><div className="mob-track"><div className="mob-inc" style={{width:`${pct}%`}}/><div className="mob-exp" style={{width:`${Math.min((d.expenses.reduce((s,e)=>s+e.amount,0)/Math.max(t,1))*100,100)}%`}}/></div><div className="mob-val">{t>0?`${fmtK(t)} ฿`:"—"}</div></div>;})}</div>
    {goals&&goals.length>0&&<><div className="sec-hd2">🌟 ความคืบหน้าเป้าหมาย</div>{goals.map(g=>{const pct=Math.min((g.saved/g.target)*100,100);return <div className="sum-goal-row" key={g.id}><span style={{fontSize:20}}>{g.emoji}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{g.name}</span><span style={{fontSize:12,color:"#A89660"}}>{Math.round(pct)}%</span></div><div className="sbc-track" style={{height:6,marginBottom:0}}><div style={{width:`${pct}%`,height:"100%",background:pct>=100?"#6ABF6A":"#E8B84B",borderRadius:3}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:11,color:"#A89660"}}>{fmt(g.saved)} ฿</span><span style={{fontSize:11,color:"#2C2510",fontWeight:700}}>{fmt(g.target)} ฿</span></div></div></div>;})}</>}
    {cats.length>0&&<><div className="sec-hd2">ค่าใช้จ่ายตามหมวด</div><div className="cat-breakdown">{cats.map(([cat,amt])=><div className="cb-row" key={cat}><span className="cb-icon">{cat.split(" ")[0]}</span><div className="cb-info"><div className="cb-name">{cat}</div><div className="cb-bar-wrap"><div className="cb-bar" style={{width:`${(amt/cats[0][1])*100}%`}}/></div></div><span className="cb-amt">{fmt(amt)} ฿</span></div>)}</div></>}
    <a href="https://efiling.rd.go.th" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><div className="efiling-cta"><div><div className="ef-t">ยื่นภาษีออนไลน์</div><div className="ef-s">efiling.rd.go.th</div></div><span className="ef-arr">→</span></div></a>
    <button onClick={()=>{if(userPlan==="free"){onPaywall&&onPaywall("Export รายงาน PDF");}else{}}} style={{width:"100%",background:"#FFF",border:"1.5px solid #EDE8D8",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontFamily:"'Sarabun',sans-serif",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>📄</span><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:800,color:"#2C2510"}}>Export รายงานปี {YEAR_TH}</div><div style={{fontSize:11,color:"#A89660",marginTop:2}}>{userPlan==="free"?"🔒 ต้องการแพ็กเกจ Pro":"สร้าง PDF สรุปรายปี"}</div></div></div>
      <span style={{fontSize:18,color:userPlan==="free"?"#C4B88A":"#E8B84B"}}>→</span>
    </button>
  </div>;
}


// ── Paywall Popup ─────────────────────────────────────────────────────
function PaywallPopup({feature, onClose, onUpgrade}) {
  return <div style={{position:"fixed",inset:0,background:"rgba(44,37,16,.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:"#FFFDF5",borderRadius:"24px 24px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:430,boxShadow:"0 -8px 40px rgba(44,37,16,.2)"}} onClick={e=>e.stopPropagation()}>
      <div style={{width:40,height:4,background:"#EDE8D8",borderRadius:2,margin:"0 auto 20px"}}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:40,marginBottom:10}}>🔒</div>
        <div style={{fontSize:18,fontWeight:800,color:"#2C2510",marginBottom:6}}>ฟีเจอร์ Pro</div>
        <div style={{fontSize:13,color:"#A89660",lineHeight:1.6}}>"{feature}" ต้องการแพ็กเกจ Pro<br/>อัปเกรดเพื่อใช้งานได้ทันที</div>
      </div>
      {/* Plan options */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[
          {name:"Pro",price:"99฿",period:"/เดือน",color:"#E8B84B",popular:true},
          {name:"Pro+",price:"199฿",period:"/เดือน",color:"#7A4FA0"},
        ].map(pl=><div key={pl.name} style={{flex:1,background:pl.color+"11",border:`1.5px solid ${pl.color}44`,borderRadius:14,padding:"12px 10px",textAlign:"center",cursor:"pointer",position:"relative"}} onClick={()=>{onClose(); setPaywallFeature && setPaywallFeature("อัปเกรด");}}>
          {pl.popular&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:"#E8B84B",color:"#2C2510",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,whiteSpace:"nowrap"}}>ยอดนิยม</div>}
          <div style={{fontSize:15,fontWeight:800,color:pl.color,marginBottom:2}}>{pl.name}</div>
          <div style={{fontSize:20,fontWeight:800,color:"#2C2510"}}>{pl.price}<span style={{fontSize:11,color:"#A89660",fontWeight:400}}>{pl.period}</span></div>
        </div>)}
      </div>
      <button style={{width:"100%",background:"#E8B84B",border:"none",borderRadius:12,padding:14,fontSize:15,fontWeight:800,color:"#2C2510",cursor:"pointer",fontFamily:"'Sarabun',sans-serif",marginBottom:10}} onClick={()=>{onClose(); setPaywallFeature && setPaywallFeature("อัปเกรด");}}>
        อัปเกรดเลย →
      </button>
      <button style={{width:"100%",background:"none",border:"none",color:"#A89660",fontSize:13,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}} onClick={onClose}>ยังไม่ตอนนี้</button>
    </div>
  </div>;
}

// ── Root App ─────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("onboard");const [user,setUser]=useState(null);const [userId,setUserId]=useState(null);const [tab,setTab]=useState("learn");
  const [data,setData]=useState(initData());const [goals,setGoals]=useState([]);const [savings,setSavings]=useState({});
  const [docsState,setDocsState]=useState(Array.from({length:12},()=>[]));
  const lang="th";

  // Auto-restore session
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){
        supabase.from("profiles").select("name").eq("id",session.user.id).single().then(({data:p})=>{
          setUser(p?.name||session.user.email.split("@")[0]);
          setUserId(session.user.id);
          setUserEmail(session.user.email);
          if(session.user.email===OWNER_EMAIL) setUserPlan("proplus");
          setScreen("app");
          loadUserData(session.user.id);
        });
      } else {
        setScreen("onboard");
      }
    });
  },[]);

  const loadUserData = async(uid)=>{
    const year = new Date().getFullYear();
    // Load income + expenses
    const {data:mdata}=await supabase.from("monthly_data").select("*").eq("user_id",uid).eq("year",year);
    const {data:incEntries}=await supabase.from("income_entries").select("*").eq("user_id",uid).eq("year",year);
    const {data:exps}=await supabase.from("expenses").select("*").eq("user_id",uid).eq("year",year);
    const {data:gdata}=await supabase.from("goals").select("*").eq("user_id",uid);
    // Load savings
    const {data:svdata}=await supabase.from("savings").select("*").eq("user_id",uid);
    // Load docs (metadata only, not dataUrl to save bandwidth)
    const {data:docsdata}=await supabase.from("docs").select("id,month_idx,name,size,date,data_url,company,doc_type,recipient,link,note").eq("user_id",uid).eq("year",year);

    if(mdata){
      const newData=initData();
      mdata.forEach(m=>{const idx=m.month;if(newData[idx])newData[idx].income=m.income;});
      if(incEntries)incEntries.forEach(e=>{const idx=e.month_idx;if(newData[idx]){if(!newData[idx].incomes)newData[idx].incomes=[];newData[idx].incomes.push({id:e.id,desc:e.description,amount:e.amount,date:e.date});}});
      if(exps)exps.forEach(e=>{const idx=e.month;if(newData[idx])newData[idx].expenses.push({id:e.id,desc:e.name,amount:e.amount,cat:e.cat,date:e.date||""});});
      setData(newData);
    }
    if(gdata)setGoals(gdata.map(g=>({...g,saved:g.saved||0,deposits:g.deposits||[]})));

    // Rebuild savings state: { optId: { monthIdx: [entries] } }
    if(svdata && svdata.length>0){
      const sv={};
      svdata.forEach(r=>{
        if(!sv[r.opt_id]) sv[r.opt_id]={};
        if(!sv[r.opt_id][r.month_idx]) sv[r.opt_id][r.month_idx]=[];
        sv[r.opt_id][r.month_idx].push({id:r.id,amount:r.amount,note:r.note,date:r.date,goalId:r.goal_id});
      });
      setSavings(sv);
    }

    // Rebuild docs state: array of 12 months
    if(docsdata && docsdata.length>0){
      const docArr=Array.from({length:12},()=>[]);
      docsdata.forEach(d=>{
        const mi=d.month_idx;
        if(mi>=0&&mi<12) docArr[mi].push({id:d.id,name:d.name,size:d.size,date:d.date,dataUrl:d.data_url,company:d.company||'',docType:d.doc_type||'',recipient:d.recipient||'',link:d.link||'',note:d.note||''});
      });
      setDocsState(docArr);
    }
  };

  const saveIncome = async(monthIdx, income)=>{
    if(!userId)return;
    await supabase.from("monthly_data").upsert({user_id:userId,month:monthIdx,year:new Date().getFullYear(),income:income},{onConflict:"user_id,month,year"});
  };

  const saveIncomeEntry = async(monthIdx, entry)=>{
    if(!userId)return;
    await supabase.from("income_entries").upsert({
      id: entry.id,
      user_id: userId,
      month_idx: monthIdx,
      year: new Date().getFullYear(),
      description: entry.desc||"รายได้",
      amount: entry.amount,
      date: entry.date||"",
    },{onConflict:"id"});
    // Also update total in monthly_data
    await supabase.from("monthly_data").upsert({user_id:userId,month:monthIdx,year:new Date().getFullYear(),income:entry.amount},{onConflict:"user_id,month,year"});
  };

  const saveExpense = async(monthIdx, exp)=>{
    if(!userId)return;
    await supabase.from("expenses").insert({user_id:userId,month:monthIdx,year:new Date().getFullYear(),name:exp.name,amount:exp.amount,cat:exp.cat});
  };

  const saveGoalToDB = async(goal)=>{
    if(!userId)return;
    await supabase.from("goals").upsert({...goal,user_id:userId},{onConflict:"id"});
  };

  const saveSavingToDB = async(optId, monthIdx, entry)=>{
    if(!userId) return;
    await supabase.from("savings").upsert({
      id: entry.id,
      user_id: userId,
      opt_id: optId,
      month_idx: monthIdx,
      amount: entry.amount,
      note: entry.note||"",
      date: entry.date||"",
      goal_id: entry.goalId||null,
    },{onConflict:"id"});
  };

  const deleteSavingFromDB = async(id)=>{
    if(!userId) return;
    await supabase.from("savings").delete().eq("id",id).eq("user_id",userId);
  };

  const saveDocToDB = async(monthIdx, doc)=>{
    if(!userId) return;
    await supabase.from("docs").upsert({
      id: doc.id,
      user_id: userId,
      month_idx: monthIdx,
      year: new Date().getFullYear(),
      name: doc.name||"",
      data_url: doc.dataUrl||"",
      size: doc.size||"",
      date: doc.date||"",
      company: doc.company||"",
      doc_type: doc.docType||"",
      recipient: doc.recipient||"",
      link: doc.link||"",
      note: doc.note||"",
    },{onConflict:"id"});
  };

  const deleteDocFromDB = async(id)=>{
    if(!userId) return;
    await supabase.from("docs").delete().eq("id",id).eq("user_id",userId);
  };

  const TABS=[
    {key:"learn",  icon:"💡", label:"เรียนรู้"},
    {key:"money",  icon:"💰", label:"การเงิน"},
    {key:"plan",   icon:"🌱", label:"วางแผน"},
    {key:"goals",  icon:"🌟", label:"ความฝัน"},
    {key:"summary",icon:"📊", label:"สรุปปี"},
  ];
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [userEmail,setUserEmail]=useState(null);
  const [paywallFeature,setPaywallFeature]=useState(null);
  const [userPlan,setUserPlan]=useState("proplus"); // everyone free for now
  const depositToGoal=(goalId,dep)=>setGoals(prev=>prev.map(g=>g.id===goalId?{...g,saved:g.saved+dep.amount,deposits:[...(g.deposits||[]),dep]}:g));
  const handleLogout=async()=>{await supabase.auth.signOut();setUser(null);setUserId(null);setData(initData());setGoals([]);setSavings({});setDocsState(Array.from({length:12},()=>[]));setScreen("login");};
  if(screen==="onboard")return <LangContext.Provider value={lang}><Shell lang={lang}><Onboarding onDone={()=>setScreen("login")}/></Shell></LangContext.Provider>;
  if(screen==="login")  return <LangContext.Provider value={lang}><Shell lang={lang}><Login onLogin={(u,uid,email)=>{setUser(u);setUserId(uid);setUserEmail(email);if(email===OWNER_EMAIL)setUserPlan("proplus");setScreen("app");if(uid)loadUserData(uid);}}/></Shell></LangContext.Provider>;
  return <LangContext.Provider value={lang}><div className="app">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body,html{font-family:'Sarabun',sans-serif;background:#FFFDF5;}
      .app{max-width:430px;margin:0 auto;min-height:100vh;background:#FFFDF5;display:flex;flex-direction:column;width:100%;}
      .hdr{background:#FFFDF5;border-bottom:1.5px solid #EDE8D8;padding:10px 16px;position:sticky;top:0;z-index:30;}
      .hdr-top{display:flex;align-items:center;justify-content:space-between;}
      .hdr-brand{display:flex;align-items:center;gap:8px;}
      .hdr-icon{width:32px;height:32px;background:#E8B84B;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;}
      .hdr-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#2C2510;}
      .hdr-user{font-size:10px;color:#A89660;margin-top:1px;}
      .hdr-right{display:flex;align-items:center;gap:8px;}
      .hdr-year{font-size:10px;color:#A89660;font-weight:600;}
      .hdr-out{background:#F5EFE0;border:1.5px solid #EDE8D8;color:#A89660;width:26px;height:26px;border-radius:50%;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
      .hdr-menu-btn{background:#2C2510;border:none;color:#FFF3C4;width:34px;height:34px;border-radius:10px;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s;}
      .hdr-menu-btn:active{opacity:.75;}
      .bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#FFFDF5;border-top:1.5px solid #EDE8D8;display:grid;grid-template-columns:repeat(5,1fr);z-index:40;padding-bottom:env(safe-area-inset-bottom);}
      .bnav-btn{padding:8px 0 10px;border:none;background:none;cursor:pointer;font-family:'Sarabun',sans-serif;display:flex;flex-direction:column;align-items:center;gap:1px;color:#C4B88A;transition:color .2s;}
      .bnav-btn.on{color:#2C2510;}
      .bnav-icon{font-size:15px;}
      .bnav-lbl{font-size:8px;font-weight:700;}
      .bnav-pip{width:12px;height:3px;border-radius:2px;background:#E8B84B;opacity:0;margin-top:1px;transition:opacity .2s;}
      .bnav-btn.on .bnav-pip{opacity:1;}
      .tab-content{padding:14px 16px 20px;width:100%;box-sizing:border-box;}
      /* Learn */
      .learn-hero{background:linear-gradient(135deg,#2C2510,#4A3E22);border-radius:18px;padding:20px;margin-bottom:14px;color:#FFF3C4;}
      .lh-badge{display:inline-block;background:#E8B84B33;color:#E8B84B;font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;margin-bottom:10px;}
      .lh-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;line-height:1.3;margin-bottom:6px;}
      .lh-sub{font-size:13px;color:#A89660;}
      .faq-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
      .faq-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:14px;padding:13px;cursor:pointer;}
      .faq-open{border-color:#E8B84B;background:#FFFDF5;}
      .faq-row{display:flex;align-items:flex-start;gap:9px;}
      .faq-tag{font-size:10px;font-weight:800;padding:2px 8px;border-radius:10px;white-space:nowrap;flex-shrink:0;margin-top:2px;}
      .faq-q{flex:1;font-size:13px;font-weight:700;color:#2C2510;line-height:1.4;}
      .faq-chev{color:#C4B88A;font-size:10px;flex-shrink:0;margin-top:3px;}
      .faq-a{margin-top:10px;font-size:13px;color:#6B5E3C;line-height:1.75;padding-top:10px;border-top:1px solid #EDE8D8;}
      /* Tax toggle */
      .tax-toggle{display:flex;gap:8px;margin-bottom:12px;}
      .ttbtn{flex:1;display:flex;align-items:center;gap:8px;background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:12px;padding:10px 11px;cursor:pointer;font-family:'Sarabun',sans-serif;text-align:left;transition:all .2s;}
      .ttbtn-on{border-color:#E8B84B;background:#FFF8DC;}
      .ttbtn-corp{border-color:#7A4FA0!important;background:#F5F0FF!important;}
      .ttbtn-lbl{font-size:12px;font-weight:800;color:#2C2510;}
      .ttbtn-sub{font-size:9px;color:#A89660;margin-top:1px;}
      .corp-tip{background:#F5F0FF;border:1.5px solid #C4AAFF;border-radius:10px;padding:10px 12px;font-size:12px;color:#6A4FA0;margin-bottom:12px;line-height:1.6;}
      .learn-calc{background:#FFF;border:1.5px solid #EDE8D8;border-radius:18px;padding:16px;margin-bottom:14px;}
      .lc-title{font-size:14px;font-weight:800;color:#2C2510;margin-bottom:3px;}
      .lc-sub{font-size:12px;color:#A89660;margin-bottom:10px;}
      .lc-row{display:flex;gap:8px;margin-bottom:10px;}
      .lc-inp{flex:1;padding:10px 12px;border:1.5px solid #EDE8D8;border-radius:10px;font-size:14px;font-family:'Sarabun',sans-serif;outline:none;background:#FFFDF5;color:#2C2510;}
      .lc-inp:focus{border-color:#E8B84B;}
      .lc-btn{background:#2C2510;color:#FFF3C4;border:none;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;}
      .lc-result{border:1.5px solid #EDE8D8;border-radius:12px;overflow:hidden;}
      .lcr-row{display:flex;justify-content:space-between;padding:9px 13px;font-size:13px;border-bottom:1px solid #F5EFE0;color:#6B5E3C;}
      .lcr-v{font-weight:700;color:#2C2510;}
      .lcr-v.neg{color:#C04848;}
      .lcr-row.base{background:#FFF8DC;font-weight:700;}
      .lcr-tax{padding:14px;text-align:center;}
      .lct-safe{background:#F0FFF4;}
      .lct-warn{background:#FFF5F0;}
      .lct-label{font-size:11px;font-weight:800;color:#A89660;margin-bottom:4px;}
      .lct-val{font-size:20px;font-weight:800;color:#2C2510;}
      .lct-mo{font-size:11px;color:#A89660;margin-top:4px;}
      .rate-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:14px;padding:14px;margin-bottom:14px;}
      .rate-title{font-size:13px;font-weight:800;color:#2C2510;margin-bottom:10px;}
      .rate-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F5EFE0;font-size:12px;color:#6B5E3C;}
      .rate-row:last-child{border:none;}
      .rate-pct{font-weight:800;}
      .rate-note{font-size:11px;color:#A89660;padding:8px 0 2px;line-height:1.6;}
      /* Money tab */
      .month-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none;}
      .month-scroll::-webkit-scrollbar{display:none;}
      .mo-chip{flex-shrink:0;padding:6px 11px;border-radius:20px;border:1.5px solid #EDE8D8;background:#FFFDF5;color:#A89660;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;position:relative;transition:all .2s;}
      .mo-on{background:#2C2510;color:#FFF3C4;border-color:#2C2510;}
      .mo-dot{position:absolute;top:4px;right:4px;width:5px;height:5px;background:#E8B84B;border-radius:50%;}
      .money-hero{background:#2C2510;border-radius:16px;padding:16px;margin-bottom:14px;color:#FFF3C4;}
      .mh-month{font-size:11px;color:#A89660;margin-bottom:10px;font-weight:600;}
      .mh-cols{display:flex;align-items:center;}
      .mhc{flex:1;text-align:center;}
      .mhc-label{font-size:10px;color:#A89660;font-weight:600;margin-bottom:3px;}
      .mhc-val{font-size:17px;font-weight:800;}
      .mhc-val.inc{color:#90D080;}
      .mhc-val.exp{color:#FF9090;}
      .mhc-unit{font-size:11px;font-weight:600;}
      .mhc-sep{width:1px;height:32px;background:#4A3E22;}
      .flow-bar-wrap{margin-top:12px;padding-top:12px;border-top:1px solid #4A3E22;}
      .flow-bar{height:6px;background:#4A3E22;border-radius:3px;overflow:hidden;display:flex;margin-bottom:6px;}
      .flow-seg{height:100%;}
      .flow-exp{background:#FF9090;}
      .flow-tax{background:#FFD060;}
      .flow-legend{display:flex;gap:12px;font-size:10px;color:#A89660;}
      .fleg{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:3px;vertical-align:middle;}
      .fleg.exp{background:#FF9090;}
      .fleg.tax{background:#FFD060;}
      .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
      .sec-hd span{font-size:13px;font-weight:800;color:#2C2510;}
      .sec-add{background:#FFF3C4;border:1.5px solid #E8B84B;color:#B8860B;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;font-family:'Sarabun',sans-serif;}
      .empty-card{background:#FFF;border:1.5px dashed #D4C99A;border-radius:12px;padding:14px;text-align:center;font-size:13px;color:#C4B88A;cursor:pointer;margin-bottom:10px;font-weight:600;}
      .income-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:12px;padding:13px;display:flex;align-items:center;gap:12px;margin-bottom:10px;}
      .ic-emoji{font-size:26px;}
      .ic-label{font-size:11px;color:#A89660;font-weight:600;}
      .ic-amt{font-size:17px;font-weight:800;color:#2C2510;}
      .exp-row{background:#FFF;border:1.5px solid #EDE8D8;border-radius:11px;padding:11px;display:flex;align-items:center;gap:9px;margin-bottom:7px;}
      .exp-cat-ico{font-size:20px;flex-shrink:0;}
      .exp-info{flex:1;}
      .exp-name{font-size:13px;font-weight:600;color:#2C2510;}
      .exp-cat{font-size:11px;color:#A89660;margin-top:1px;}
      .exp-amt{font-size:13px;font-weight:800;color:#C04848;white-space:nowrap;}
      .del-btn{background:#F5EFE0;border:none;color:#C4B88A;width:26px;height:26px;border-radius:7px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .exp-total{text-align:right;font-size:12px;color:#A89660;margin-bottom:10px;}
      .net-card{border-radius:14px;padding:14px;margin-bottom:14px;text-align:center;}
      .net-pos{background:#F0FFF4;border:1.5px solid #B8D89A;}
      .net-neg{background:#FFF0F0;border:1.5px solid #F0AAAA;}
      .net-label{font-size:12px;font-weight:700;color:#6B5E3C;margin-bottom:5px;}
      .net-val{font-size:24px;font-weight:800;color:#2C2510;}
      .net-hint{font-size:12px;color:#A89660;margin-top:5px;}
      /* Sheet */
      .overlay{position:fixed;inset:0;background:rgba(44,37,16,.5);z-index:50;display:flex;flex-direction:column;justify-content:flex-end;backdrop-filter:blur(3px);}
      .sheet{background:#FFFDF5;border-radius:24px 24px 0 0;padding:18px 18px 32px;max-height:82vh;overflow-y:auto;}
      .sheet-pill{width:36px;height:4px;background:#EDE8D8;border-radius:2px;margin:0 auto 12px;}
      .sheet-ttl{font-size:17px;font-weight:800;color:#2C2510;margin-bottom:12px;}
      .cat-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;margin-bottom:8px;}
      .cat-scroll::-webkit-scrollbar{display:none;}
      .cat-chip{flex-shrink:0;padding:6px 11px;border-radius:20px;border:1.5px solid #EDE8D8;background:#FFFDF5;color:#A89660;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;}
      .cat-on{background:#2C2510;color:#FFF3C4;border-color:#2C2510;}
      .sinp{width:100%;padding:11px 13px;border:1.5px solid #EDE8D8;border-radius:10px;font-size:14px;font-family:'Sarabun',sans-serif;outline:none;background:#FFF;color:#2C2510;margin-bottom:9px;display:block;}
      .sinp:focus{border-color:#E8B84B;}
      .sinp-lg{font-size:17px;font-weight:700;}
      .sheet-btns{display:flex;gap:8px;}
      .sbtn-c{background:#F5EFE0;color:#A89660;border:none;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;}
      .sbtn-s{flex:1;background:#2C2510;color:#FFF3C4;border:none;padding:12px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;}
      /* Plan */
      .plan-hero{background:linear-gradient(135deg,#2C2510,#4A3E22);border-radius:18px;padding:20px;margin-bottom:14px;color:#FFF3C4;}
      .ph-label{font-size:11px;color:#A89660;margin-bottom:5px;font-weight:600;}
      .ph-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#FFF3C4;margin-bottom:12px;}
      .ph-unit{font-size:16px;}
      .ph-rows{display:flex;flex-direction:column;gap:0;}
      .ph-row{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid #4A3E22;font-size:12px;color:#A89660;}
      .ph-row-bold{color:#FFF3C4;font-weight:700;}
      .phv-inc{color:#90D080;font-weight:700;}
      .phv-exp{color:#FF9090;font-weight:700;}
      .rule-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:16px;padding:14px;margin-bottom:14px;}
      .rule-title{font-size:13px;font-weight:800;color:#2C2510;margin-bottom:10px;}
      .rule-rows{display:flex;flex-direction:column;gap:9px;}
      .rule-row{display:flex;flex-direction:column;gap:4px;}
      .rule-bar-wrap{height:5px;background:#F5EFE0;border-radius:3px;overflow:hidden;}
      .rule-bar-fill{height:100%;border-radius:3px;}
      .rule-info{display:flex;align-items:center;gap:7px;}
      .rule-pct{font-size:13px;font-weight:800;width:34px;}
      .rule-label{flex:1;font-size:13px;font-weight:700;color:#2C2510;}
      .rule-amt{font-size:12px;font-weight:700;color:#2C2510;}
      .rule-desc{font-size:10px;color:#A89660;padding-left:41px;}
      .savings-bar-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:14px;padding:12px;margin-bottom:12px;}
      .sbc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
      .sbc-label{font-size:12px;font-weight:700;color:#2C2510;}
      .sbc-total{font-size:15px;font-weight:800;color:#2C2510;}
      .sbc-track{height:10px;background:#F5EFE0;border-radius:5px;overflow:hidden;display:flex;margin-bottom:8px;}
      .sbc-seg{height:100%;}
      .invest-list{display:flex;flex-direction:column;gap:8px;margin-bottom:8px;}
      .invest-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:14px;padding:13px;display:flex;align-items:center;justify-content:space-between;}
      .inv-tappable{cursor:pointer;transition:all .15s;}
      .inv-tappable:active{transform:scale(.97);}
      .inv-left{display:flex;align-items:center;gap:10px;flex:1;}
      .inv-icon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
      .inv-label{font-size:13px;font-weight:700;color:#2C2510;}
      .inv-desc{font-size:11px;color:#A89660;margin-top:1px;}
      .inv-this-month{font-size:11px;font-weight:700;margin-top:3px;}
      .inv-right{text-align:right;flex-shrink:0;}
      .inv-total-val{font-size:15px;font-weight:800;}
      .inv-total-label{font-size:10px;color:#A89660;text-align:right;margin-top:2px;}
      .inv-tap-hint{font-size:11px;font-weight:700;}
      .invest-note{font-size:11px;color:#A89660;margin-bottom:14px;text-align:center;}
      /* InvestSheet */
      .inv-sheet-hd{display:flex;align-items:center;gap:11px;background:#FFFDF5;border-radius:12px;padding:11px 13px;margin-bottom:14px;}
      .inv-sh-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0;}
      .inv-sh-title{font-size:15px;font-weight:800;color:#2C2510;}
      .inv-sh-desc{font-size:11px;color:#A89660;margin-top:2px;}
      .ish-sec-label{font-size:10px;font-weight:800;color:#A89660;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;display:block;}
      .ish-months{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
      .ish-mo{padding:5px 10px;border-radius:20px;border:1.5px solid #EDE8D8;background:#FFFDF5;color:#A89660;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;position:relative;transition:all .15s;}
      .ish-mo-on{color:#FFF;}
      .ish-mo-dot{position:absolute;top:2px;right:2px;width:5px;height:5px;background:#E8B84B;border-radius:50%;}
      .ish-records{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;}
      .ish-rec{display:flex;align-items:center;gap:8px;background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:10px;padding:9px 11px;}
      .ish-rec-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
      .ish-rec-info{flex:1;}
      .ish-rec-note{font-size:12px;font-weight:600;color:#2C2510;}
      .ish-rec-date{font-size:10px;color:#A89660;}
      .ish-rec-amt{font-size:12px;font-weight:800;white-space:nowrap;}
      .ish-rec-goal-tag{font-size:10px;margin-left:4px;}
      .ish-month-total{text-align:right;font-size:11px;color:#A89660;padding-right:2px;}
      .ish-empty{text-align:center;padding:14px;color:#C4B88A;font-size:12px;background:#FFFDF5;border:1.5px dashed #EDE8D8;border-radius:10px;margin-bottom:12px;}
      .ish-goal-link{background:#FFF8DC;border:1.5px solid #E8B84B44;border-radius:11px;padding:11px;margin-bottom:10px;}
      .ish-goal-label{font-size:11px;font-weight:800;color:#B8860B;margin-bottom:7px;}
      .ish-goal-opts{display:flex;flex-wrap:wrap;gap:6px;}
      .ish-goal-btn{padding:5px 11px;border-radius:20px;border:1.5px solid #EDE8D8;background:#FFF;color:#A89660;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;transition:all .15s;}
      .ish-goal-on{border-color:#E8B84B!important;background:#FFF3C4!important;color:#B8860B!important;}
      .ish-form{display:flex;flex-direction:column;}
      .ish-amt-row{display:flex;gap:8px;}
      .ish-save-btn{color:#FFF;border:none;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Sarabun',sans-serif;white-space:nowrap;}
      /* Goals tab */
      .goals-snap{background:linear-gradient(135deg,#2C2510,#4A3E22);border-radius:18px;padding:18px;margin-bottom:14px;}
      .gsnap-title{font-size:13px;font-weight:800;color:#FFF3C4;margin-bottom:10px;}
      .gsnap-rows{display:flex;flex-direction:column;gap:5px;}
      .gsnap-row{display:flex;align-items:center;gap:8px;font-size:12px;color:#A89660;}
      .gsnap-label{width:70px;flex-shrink:0;font-weight:600;}
      .gsnap-bar-track{flex:1;height:5px;background:#4A3E2266;border-radius:3px;overflow:hidden;}
      .gsnap-bar-fill{height:100%;border-radius:3px;transition:width .6s ease;}
      .gsnap-val{width:88px;text-align:right;font-weight:700;flex-shrink:0;font-size:11px;}
      .gsnap-divider{border-top:1px solid #4A3E22;margin:4px 0;}
      .gsnap-net{color:#FFF3C4;font-weight:800;font-size:13px;}
      .goals-empty{background:#FFF;border:1.5px dashed #D4C99A;border-radius:18px;padding:30px;text-align:center;cursor:pointer;margin-bottom:14px;}
      .goals-list{display:flex;flex-direction:column;gap:12px;margin-bottom:14px;}
      .goal-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:18px;padding:14px;position:relative;overflow:hidden;}
      .goal-done-badge{position:absolute;top:10px;right:10px;background:#E8F5E0;color:#4A7C3F;font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;}
      .goal-top{display:flex;align-items:flex-start;gap:11px;margin-bottom:11px;}
      .goal-emoji-wrap{font-size:30px;flex-shrink:0;line-height:1;}
      .goal-meta{flex:1;}
      .goal-name{font-size:15px;font-weight:800;color:#2C2510;margin-bottom:2px;}
      .goal-deadline{font-size:11px;color:#A89660;}
      .goal-actions{display:flex;gap:5px;flex-shrink:0;}
      .goal-act-btn{background:#F5EFE0;border:none;width:26px;height:26px;border-radius:7px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;}
      .goal-prog-wrap{margin-bottom:9px;}
      .goal-prog-track{height:9px;background:#F5EFE0;border-radius:5px;overflow:hidden;margin-bottom:5px;}
      .goal-prog-fill{height:100%;border-radius:5px;transition:width .6s ease;}
      .goal-prog-nums{display:flex;justify-content:space-between;font-size:11px;}
      .goal-hint{font-size:11px;color:#A89660;margin-bottom:9px;background:#FFF8DC;border-radius:8px;padding:7px 10px;}
      .goal-dep{display:flex;align-items:center;gap:6px;font-size:11px;color:#6B5E3C;margin-bottom:4px;}
      .goal-dep-dot{width:6px;height:6px;border-radius:50%;background:#E8B84B;flex-shrink:0;}
      .goal-dep-note{flex:1;}
      .goal-dep-amt{color:#4A7C3F;font-weight:700;}
      .goal-dep-date{color:#C4B88A;}
      .goal-deposit-btn{width:100%;background:#FFF3C4;border:1.5px solid #E8B84B;color:#B8860B;border-radius:10px;padding:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Sarabun',sans-serif;margin-top:7px;}
      /* Goal monthly mini-preview on card */
      .goal-mo-preview{display:flex;gap:3px;margin-bottom:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;}
      .goal-mo-preview::-webkit-scrollbar{display:none;}
      .goal-mo-dot-wrap{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;}
      .goal-mo-dot-cell{width:18px;height:18px;border-radius:5px;background:#F5EFE0;}
      .gmc-ok{background:#6ABF6A;}
      .gmc-partial{background:#E8B84B;}
      .gmc-empty{background:#F5EFE0;border:1px dashed #EDE8D8;}
      .goal-mo-dot-lbl{font-size:7px;color:#C4B88A;font-weight:700;}
      /* GoalDetailSheet */
      .gd-header{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
      .gd-emoji{font-size:36px;flex-shrink:0;}
      .gd-meta{flex:1;}
      .gd-name{font-size:17px;font-weight:800;color:#2C2510;}
      .gd-dl{font-size:12px;color:#A89660;margin-top:2px;}
      .gd-prog-card{background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:14px;padding:14px;margin-bottom:16px;}
      .gd-prog-nums{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
      .gd-saved{font-size:18px;font-weight:800;color:#E8B84B;}
      .gd-pct{font-size:13px;color:#A89660;font-weight:700;}
      .gd-target{font-size:14px;font-weight:800;color:#2C2510;}
      .gd-prog-track{height:10px;background:#F5EFE0;border-radius:5px;overflow:hidden;margin-bottom:8px;}
      .gd-prog-fill{height:100%;border-radius:5px;transition:width .5s ease;}
      .gd-hint{font-size:12px;color:#A89660;text-align:center;}
      /* Monthly timeline */
      .gd-timeline{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
      .gd-mo-row{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:11px;border:1.5px solid #EDE8D8;background:#FFF;cursor:pointer;transition:all .15s;}
      .gd-mo-sel{border-color:#E8B84B;background:#FFF8DC;}
      .gd-mo-left{display:flex;align-items:center;gap:7px;width:58px;flex-shrink:0;}
      .gd-mo-badge{width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
      .gd-mo-ok{background:#6ABF6A;color:#FFF;}
      .gd-mo-partial{background:#E8B84B;color:#2C2510;}
      .gd-mo-empty{background:#F5EFE0;color:#C4B88A;}
      .gd-mo-name{font-size:12px;font-weight:700;color:#2C2510;}
      .gd-mo-mid{flex:1;}
      .gd-mo-bar-track{height:6px;background:#F5EFE0;border-radius:3px;overflow:hidden;}
      .gd-mo-bar-fill{height:100%;border-radius:3px;transition:width .4s ease;}
      .gd-mo-right{width:80px;text-align:right;flex-shrink:0;}
      .gd-mo-amt{font-size:12px;font-weight:800;color:#2C2510;}
      .gd-mo-amt-ok{color:#4A7C3F;}
      .gd-mo-add-hint{font-size:10px;color:#C4B88A;}
      /* Deposit list */
      .gd-dep-list{background:#FFFDF5;border-radius:12px;border:1.5px solid #EDE8D8;padding:11px;margin-bottom:12px;}
      .gd-dep-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
      .gd-dep-row:last-child{margin-bottom:0;}
      .gd-dep-dot{width:6px;height:6px;border-radius:50%;background:#E8B84B;flex-shrink:0;}
      .gd-dep-info{flex:1;}
      .gd-dep-note{font-size:12px;font-weight:600;color:#2C2510;}
      .gd-dep-date{font-size:10px;color:#A89660;}
      .gd-dep-amt{font-size:12px;font-weight:800;color:#4A7C3F;white-space:nowrap;}
      /* Add form */
      .gd-add-form{background:#FFF8DC;border:1.5px solid #E8B84B44;border-radius:12px;padding:12px;margin-bottom:10px;}
      .gd-add-title{font-size:12px;font-weight:700;color:#2C2510;margin-bottom:10px;}
      .gs-emoji-row{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;}
      .gs-emoji-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 5px;border-radius:12px;border:1.5px solid #EDE8D8;background:#FFFDF5;cursor:pointer;font-family:'Sarabun',sans-serif;min-width:56px;transition:all .15s;}
      .gs-emoji-on{border-color:#E8B84B;background:#FFF3C4;}
      .gs-emoji-label{font-size:9px;color:#A89660;font-weight:700;text-align:center;}
      .gs-calc-hint{display:flex;justify-content:space-between;align-items:center;background:#FFF8DC;border:1.5px solid #E8B84B44;border-radius:10px;padding:9px 12px;margin-bottom:10px;font-size:12px;color:#6B5E3C;}
      .gs-calc-amt{font-size:15px;font-weight:800;color:#B8860B;}
      /* Summary */
      .sum-hero{background:#2C2510;border-radius:18px;padding:20px;margin-bottom:12px;color:#FFF3C4;}
      .sh-eye{font-size:11px;color:#A89660;margin-bottom:6px;font-weight:600;}
      .sh-big{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:12px;}
      .sh-unit{font-size:17px;}
      .sh-divider{border-top:1px solid #4A3E22;margin-bottom:8px;}
      .sh-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#A89660;}
      .sh-bold{color:#FFF3C4;font-weight:700;}
      .shr-neg{color:#FF9090;font-weight:700;}
      .tax-res{border-radius:14px;padding:14px;margin-bottom:12px;text-align:center;}
      .tr-safe{background:#F0FFF4;border:1.5px solid #B8D89A;}
      .tr-warn{background:#FFF5F0;border:1.5px solid #F0AAAA;}
      .tr-label{font-size:11px;font-weight:800;color:#A89660;margin-bottom:4px;}
      .tr-val{font-size:22px;font-weight:800;color:#2C2510;margin-bottom:4px;}
      .tr-note{font-size:11px;color:#A89660;line-height:1.5;}
      .sec-hd2{font-size:10px;font-weight:800;color:#A89660;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px;}
      .mo-bars{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
      .mob-row{display:flex;align-items:center;gap:8px;}
      .mob-label{font-size:10px;font-weight:700;color:#A89660;width:30px;flex-shrink:0;}
      .mob-track{flex:1;height:7px;background:#F5EFE0;border-radius:4px;overflow:hidden;position:relative;}
      .mob-inc{position:absolute;top:0;left:0;height:100%;background:#E8B84B;border-radius:4px;}
      .mob-exp{position:absolute;top:0;left:0;height:100%;background:#FF909044;border-radius:4px;}
      .mob-val{font-size:10px;font-weight:700;color:#2C2510;width:56px;text-align:right;flex-shrink:0;}
      .cat-breakdown{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;}
      .cb-row{background:#FFF;border:1.5px solid #EDE8D8;border-radius:10px;padding:10px;display:flex;align-items:center;gap:9px;}
      .cb-icon{font-size:18px;flex-shrink:0;}
      .cb-info{flex:1;}
      .cb-name{font-size:12px;font-weight:700;color:#2C2510;margin-bottom:3px;}
      .cb-bar-wrap{height:4px;background:#F5EFE0;border-radius:2px;overflow:hidden;}
      .cb-bar{height:100%;background:#E8B84B;border-radius:2px;}
      .cb-amt{font-size:11px;font-weight:700;color:#2C2510;white-space:nowrap;}
      .sum-goal-row{display:flex;align-items:flex-start;gap:9px;background:#FFF;border:1.5px solid #EDE8D8;border-radius:11px;padding:11px;margin-bottom:7px;width:100%;box-sizing:border-box;}
      .efiling-cta{display:flex;align-items:center;justify-content:space-between;background:#E8B84B;border-radius:14px;padding:15px 18px;margin-bottom:14px;cursor:pointer;}
      /* RetirementPlanner */
      .rp-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
      .rp-title{font-size:17px;font-weight:800;color:#2C2510;}
      .rp-sub{font-size:12px;color:#A89660;margin-top:2px;}
      .rp-section-label{font-size:10px;font-weight:800;color:#A89660;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;}
      .rp-age-row{display:flex;gap:8px;margin-bottom:4px;}
      .rp-age-card{flex:1;background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:12px;padding:10px 8px;text-align:center;}
      .rp-age-emoji{font-size:20px;margin-bottom:4px;}
      .rp-age-label{font-size:9px;font-weight:700;color:#A89660;margin-bottom:6px;line-height:1.3;}
      .rp-age-inp{width:100%;border:1.5px solid #EDE8D8;border-radius:8px;padding:7px 4px;font-size:16px;font-weight:800;text-align:center;font-family:'Sarabun',sans-serif;color:#2C2510;background:#FFF;outline:none;}
      .rp-age-inp:focus{border-color:#E8B84B;}
      .rp-age-unit{font-size:10px;color:#A89660;margin-top:3px;}
      .rp-inputs{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
      .rp-inp-row{background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:12px;padding:11px 13px;}
      .rp-inp-label{font-size:12px;font-weight:700;color:#2C2510;margin-bottom:7px;}
      .rp-inp-field{display:flex;align-items:center;gap:8px;}
      .rp-inp-field .sinp{flex:1;margin-bottom:0;}
      .rp-inp-unit{font-size:12px;color:#A89660;white-space:nowrap;}
      .rp-rate-row{display:flex;gap:8px;}
      .rp-rate-card{flex:1;background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:12px;padding:10px 12px;}
      .rp-rate-label{font-size:11px;font-weight:700;color:#2C2510;margin-bottom:7px;}
      .rp-rate-inp-wrap{display:flex;align-items:center;gap:6px;}
      .rp-rate-inp{flex:1;border:1.5px solid #EDE8D8;border-radius:8px;padding:8px 8px;font-size:16px;font-weight:800;text-align:center;font-family:'Sarabun',sans-serif;color:#2C2510;background:#FFF;outline:none;width:60px;}
      .rp-rate-inp:focus{border-color:#E8B84B;}
      .rp-rate-unit{font-size:11px;color:#A89660;}
      .rp-calc-btn{width:100%;background:#2C2510;color:#FFF3C4;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:'Sarabun',sans-serif;margin-bottom:16px;}
      .rp-result-hero{display:flex;align-items:center;gap:12px;border-radius:14px;padding:16px;margin-bottom:14px;}
      .rp-safe{background:#E8F5E0;border:1.5px solid #6ABF6A;}
      .rp-warn{background:#FFF8DC;border:1.5px solid #E8B84B;}
      .rp-hero-icon{font-size:28px;flex-shrink:0;}
      .rp-hero-title{font-size:15px;font-weight:800;color:#2C2510;}
      .rp-hero-sub{font-size:13px;color:#6B5E3C;margin-top:3px;}
      .rp-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
      .rp-card{background:#FFF;border:1.5px solid #EDE8D8;border-radius:12px;padding:12px 11px;}
      .rp-card-hl{background:#FFF3C4;border-color:#E8B84B;}
      .rp-card-icon{font-size:18px;margin-bottom:5px;}
      .rp-card-label{font-size:10px;font-weight:700;color:#A89660;margin-bottom:5px;line-height:1.4;}
      .rp-card-val{font-size:15px;font-weight:800;color:#2C2510;margin-bottom:2px;}
      .rp-card-val-hl{color:#B8860B;font-size:17px;}
      .rp-card-sub{font-size:10px;color:#A89660;}
      /* Wealth Path Chart */
      .rp-chart{background:#FFF;border:1.5px solid #EDE8D8;border-radius:14px;padding:14px;margin-bottom:12px;position:relative;}
      .rp-chart-bars{display:flex;align-items:flex-end;gap:2px;height:110px;padding-bottom:24px;}
      .rp-bar-col{display:flex;flex-direction:column;align-items:center;flex:1;height:100%;}
      .rp-bar-wrap{flex:1;display:flex;align-items:flex-end;width:100%;}
      .rp-bar{width:100%;border-radius:3px 3px 0 0;min-height:2px;transition:height .4s ease;}
      .rp-bar-save{background:#E8B84B;}
      .rp-bar-retire{background:#FF9090;}
      .rp-bar-label{font-size:7px;color:#C4B88A;text-align:center;position:relative;height:16px;display:flex;align-items:flex-end;justify-content:center;}
      .rp-retire-marker{position:absolute;top:-20px;font-size:8px;color:#7A4FA0;font-weight:800;white-space:nowrap;}
      .rp-chart-legend{display:flex;gap:12px;margin-top:4px;font-size:10px;color:#A89660;}
      .rpc-dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px;vertical-align:middle;}
      .rpc-dot.save{background:#E8B84B;}
      .rpc-dot.retire{background:#FF9090;}
      .rp-chart-ymax{position:absolute;top:10px;right:14px;font-size:10px;color:#C4B88A;font-weight:700;}
      /* Scenarios */
      .rp-scenarios{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}
      .rp-scenario-row{display:flex;align-items:center;gap:10px;background:#FFF;border:1.5px solid #EDE8D8;border-radius:11px;padding:11px 13px;}
      .rps-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
      .rps-label{flex:1;font-size:12px;font-weight:600;color:#2C2510;}
      .rps-val{font-size:13px;font-weight:800;}
      .rp-note{font-size:10px;color:#C4B88A;text-align:center;line-height:1.6;margin-bottom:8px;}
      .ef-t{font-size:14px;font-weight:800;color:#2C2510;}
      .ef-s{font-size:11px;color:#7A6020;margin-top:2px;}
      .ef-arr{font-size:20px;color:#2C2510;font-weight:700;}
    `}</style>
    {/* ── Drawer ── */}
    {drawerOpen&&<div style={{position:"fixed",inset:0,zIndex:100,background:"#FFFDF5",overflowY:"auto",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",left:0,right:0}}>
      <div style={{flex:1,display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        {/* Drawer header */}
        <div style={{background:"linear-gradient(135deg,#2C2510,#4A3E22)",padding:"52px 20px 24px",position:"relative"}}>
          <button onClick={()=>setDrawerOpen(false)} style={{position:"absolute",top:16,left:16,background:"#ffffff22",border:"none",color:"#FFF3C4",width:36,height:36,borderRadius:"50%",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
          <div style={{width:56,height:56,background:"#E8B84B",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:12}}>👤</div>
          <div style={{fontSize:16,fontWeight:800,color:"#FFF3C4",marginBottom:3}}>{user||"ผู้ทดลองใช้"}</div>
          <div style={{fontSize:11,color:"#A89660",marginBottom:6}}>WealthWise Member</div>
          {userEmail===OWNER_EMAIL&&<div style={{fontSize:10,background:"#E8B84B",color:"#2C2510",padding:"2px 10px",borderRadius:20,fontWeight:800,display:"inline-block",marginBottom:8}}>👑 Owner</div>}
          {/* Plan badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:userPlan==="free"?"#4A3E22":userPlan==="pro"?"#E8B84B":"#7A4FA0",borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:11}}>{userPlan==="free"?"🎁":userPlan==="pro"?"⭐":"💎"}</span>
            <span style={{fontSize:11,fontWeight:800,color:userPlan==="free"?"#A89660":"#FFF"}}>{userPlan==="free"?"FREE":userPlan==="pro"?"PRO":"PRO+"}</span>
          </div>
        </div>
        {/* Menu items */}
        <div style={{flex:1,padding:"8px 0"}}>
          {[
            {icon:"👤",label:"โปรไฟล์",sub:"ข้อมูลบัญชีของคุณ"},
            {icon:"🔔",label:"การแจ้งเตือน",sub:"จัดการการแจ้งเตือน"},
            {icon:"🔒",label:"ความเป็นส่วนตัว",sub:"ข้อมูลของคุณปลอดภัย"},
            {icon:"❓",label:"ช่วยเหลือ",sub:"คำถามที่พบบ่อย"},
          ].map(item=><div key={item.label} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",borderBottom:"1px solid #F5EFE0",cursor:"pointer"}} onClick={()=>setDrawerOpen(false)}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{item.label}</div><div style={{fontSize:11,color:"#A89660",marginTop:1}}>{item.sub}</div></div>
            <span style={{color:"#C4B88A",fontSize:14}}>›</span>
          </div>)}
          {/* Plan section */}
          <div style={{padding:"16px 20px 8px"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#A89660",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>แพ็กเกจ</div>
            {[
              {id:"free",name:"Free",price:"ฟรี",color:"#A89660",desc:"ฟีเจอร์พื้นฐาน"},
              {id:"pro",name:"Pro",price:"99฿/เดือน",color:"#E8B84B",desc:"ครบสำหรับฟรีแลนซ์",popular:true},
              {id:"proplus",name:"Pro+",price:"199฿/เดือน",color:"#7A4FA0",desc:"AI + ครบทุกฟีเจอร์"},
            ].map(pl=><div key={pl.id} onClick={()=>{if(pl.id!=="free"){}}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:`1.5px solid ${userPlan===pl.id?pl.color:"#EDE8D8"}`,background:userPlan===pl.id?pl.color+"11":"#FFF",marginBottom:8,cursor:"pointer",transition:"all .15s"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13,fontWeight:800,color:pl.color}}>{pl.name}</span>
                  {pl.popular&&<span style={{fontSize:9,background:"#E8B84B",color:"#2C2510",padding:"1px 6px",borderRadius:10,fontWeight:800}}>ยอดนิยม</span>}
                </div>
                <div style={{fontSize:11,color:"#A89660",marginTop:1}}>{pl.desc}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#2C2510"}}>{pl.price}</div>
                {userPlan===pl.id&&<div style={{fontSize:9,color:pl.color,fontWeight:700}}>ปัจจุบัน</div>}
              </div>
            </div>)}
          </div>
        </div>
        {/* Logout */}
        <div style={{padding:"12px 20px 32px"}}>
          <button onClick={()=>{setDrawerOpen(false);handleLogout();}} style={{width:"100%",background:"#FFF0F0",border:"1.5px solid #F0AAAA",borderRadius:12,padding:13,fontSize:13,fontWeight:800,color:"#C04848",cursor:"pointer",fontFamily:"'Sarabun',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            ↩ ออกจากระบบ
          </button>
          <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"#C4B88A"}}>WealthWise v1.0 · ข้อมูลของคุณปลอดภัย 🔒</div>
        </div>
      </div>
    </div>}

    {/* ── Header ── */}
    <div className="hdr">
      <div className="hdr-top">
        <div className="hdr-brand">
          <div className="hdr-icon">🧾</div>
          <div>
            <div className="hdr-name">WealthWise</div>
            {user&&<div className="hdr-user">สวัสดี, {user} 👋</div>}
          </div>
        </div>
        <div className="hdr-right">
          <div className="hdr-year">ปี {YEAR_TH}</div>
          <button className="hdr-menu-btn" onClick={()=>setDrawerOpen(true)}>☰</button>
        </div>
      </div>
    </div>
    <div style={{paddingBottom:84,width:"100%"}}>
    {tab==="learn"  &&<LearnTab/>}
    {tab==="money"  &&<MoneyTab data={data} setData={setData} userId={userId} saveIncome={saveIncome} saveIncomeEntry={saveIncomeEntry} saveExpense={saveExpense} userPlan={userPlan} onPaywall={setPaywallFeature} docsState={docsState} setDocsState={setDocsState} saveDocToDB={saveDocToDB} deleteDocFromDB={deleteDocFromDB}/>}
    {tab==="plan"   &&<PlanTab data={data} setData={setData} savings={savings} setSavings={setSavings} goals={goals} onDepositGoal={depositToGoal} userId={userId} saveGoalToDB={saveGoalToDB} saveSavingToDB={saveSavingToDB} deleteSavingFromDB={deleteSavingFromDB}/>}
    {tab==="goals"  &&<GoalsTab data={data} goals={goals} setGoals={setGoals} savings={savings} userId={userId} saveGoalToDB={saveGoalToDB}/>}
    {tab==="summary"&&<SummaryTab data={data} goals={goals} savings={savings} userPlan={userPlan} onPaywall={setPaywallFeature}/>}

    </div>
    <div className="bnav">{TABS.map(b=><button key={b.key} className={`bnav-btn ${tab===b.key?"on":""}`} onClick={()=>setTab(b.key)}><span className="bnav-icon">{b.icon}</span><span className="bnav-lbl">{b.label}</span><div className="bnav-pip"/></button>)}</div>
  </div></LangContext.Provider>;
}

// ── Pricing Tab ──────────────────────────────────────────────────────
function PricingTab({lang}) {
  const [sel,setSel]=useState("pro");
  const plans=[
    {id:"free",name:"Free",price:0,color:"#A89660",bg:"#FFFDF5",features:[
      {ok:true,text:lang==="th"?"บันทึกรายรับ-จ่าย 3 เดือน":"Record income/expenses 3 months"},
      {ok:true,text:lang==="th"?"คำนวณภาษีพื้นฐาน":"Basic tax calculation"},
      {ok:true,text:lang==="th"?"วางแผนเกษียณเบื้องต้น":"Basic retirement planning"},
      {ok:false,text:lang==="th"?"อัปโหลดใบเสร็จ":"Upload receipts"},
      {ok:false,text:lang==="th"?"Export รายงาน PDF":"Export PDF report"},
      {ok:false,text:lang==="th"?"SSF/RMF Calculator":"SSF/RMF Calculator"},
      {ok:false,text:lang==="th"?"AI วิเคราะห์การเงิน":"AI financial analysis"},
    ]},
    {id:"pro",name:"Pro",price:99,color:"#E8B84B",bg:"#FFF8DC",badge:lang==="th"?"ยอดนิยม 🔥":"Most Popular 🔥",features:[
      {ok:true,text:lang==="th"?"บันทึกรายรับ-จ่ายไม่จำกัด":"Unlimited income/expense records"},
      {ok:true,text:lang==="th"?"คำนวณภาษีครบถ้วน":"Full tax calculation"},
      {ok:true,text:lang==="th"?"วางแผนเกษียณ + บันทึกผล":"Retirement planning + save results"},
      {ok:true,text:lang==="th"?"อัปโหลดใบเสร็จ 50 ไฟล์/ปี":"Upload 50 receipts/year"},
      {ok:true,text:lang==="th"?"Export รายงาน PDF":"Export PDF report"},
      {ok:true,text:lang==="th"?"SSF/RMF Calculator":"SSF/RMF Calculator"},
      {ok:false,text:lang==="th"?"AI วิเคราะห์การเงิน":"AI financial analysis"},
    ]},
    {id:"proplus",name:"Pro+",price:199,color:"#7A4FA0",bg:"#F5F0FF",badge:lang==="th"?"ครบสุด ✨":"Full Features ✨",features:[
      {ok:true,text:lang==="th"?"ทุกอย่างใน Pro":"Everything in Pro"},
      {ok:true,text:lang==="th"?"อัปโหลดใบเสร็จไม่จำกัด":"Unlimited receipt uploads"},
      {ok:true,text:lang==="th"?"AI วิเคราะห์การเงิน":"AI financial analysis"},
      {ok:true,text:lang==="th"?"เตือนภาษีอัตโนมัติ":"Automatic tax reminders"},
      {ok:true,text:lang==="th"?"วางแผน SSF/RMF ประหยัดภาษีสูงสุด":"SSF/RMF tax optimization"},
      {ok:true,text:lang==="th"?"รายงานสรุปปีสำหรับนักบัญชี":"Year-end accountant report"},
      {ok:true,text:lang==="th"?"Priority Support":"Priority Support"},
    ]},
  ];
  const p=plans.find(x=>x.id===sel);
  return <div className="tab-content">
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontSize:28,marginBottom:6}}>💎</div>
      <div style={{fontSize:20,fontWeight:800,color:"#2C2510",marginBottom:4}}>{lang==="th"?"เลือกแพ็กเกจที่ใช่":"Choose Your Plan"}</div>
      <div style={{fontSize:12,color:"#A89660"}}>{lang==="th"?"ยกเลิกได้ทุกเมื่อ ไม่ผูกมัด":"Cancel anytime, no commitment"}</div>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {plans.map(pl=><button key={pl.id} onClick={()=>setSel(pl.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${sel===pl.id?pl.color:"#EDE8D8"}`,background:sel===pl.id?pl.bg:"#FFF",cursor:"pointer",fontFamily:"'Sarabun',sans-serif",transition:"all .2s"}}>
        <div style={{fontSize:13,fontWeight:800,color:sel===pl.id?pl.color:"#A89660"}}>{pl.name}</div>
        <div style={{fontSize:12,fontWeight:700,color:"#2C2510"}}>{pl.price===0?"ฟรี":`${pl.price}฿`}</div>
        {pl.price>0&&<div style={{fontSize:9,color:"#A89660"}}>/เดือน</div>}
      </button>)}
    </div>
    <div style={{background:p.bg,border:`2px solid ${p.color}44`,borderRadius:18,padding:20,marginBottom:16}}>
      {p.badge&&<div style={{display:"inline-block",background:p.color,color:"#FFF",fontSize:11,fontWeight:800,padding:"3px 12px",borderRadius:20,marginBottom:12}}>{p.badge}</div>}
      <div style={{fontSize:22,fontWeight:800,color:p.color,marginBottom:4}}>{p.name}</div>
      <div style={{fontSize:32,fontWeight:800,color:"#2C2510",marginBottom:16}}>{p.price===0?"ฟรี":`฿${p.price}`}{p.price>0&&<span style={{fontSize:13,color:"#A89660",fontWeight:400}}>/เดือน</span>}</div>
      {p.features.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:16,flexShrink:0}}>{f.ok?"✅":"❌"}</span>
        <span style={{fontSize:13,color:f.ok?"#2C2510":"#C4B88A",fontWeight:f.ok?600:400}}>{f.text}</span>
      </div>)}
    </div>
    <button style={{width:"100%",background:p.price===0?"#F5EFE0":p.color,color:p.price===0?"#A89660":"#FFF",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>
      {p.price===0?(lang==="th"?"ใช้งานฟรี (ปัจจุบัน)":"Using Free (Current)"):(lang==="th"?"อัปเกรดเลย →":"Upgrade Now →")}
    </button>
    <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#C4B88A"}}>🔒 {lang==="th"?"ชำระเงินปลอดภัย · ยกเลิกได้ทุกเมื่อ":"Secure payment · Cancel anytime"}</div>
  </div>;
}

// ── Profile Tab ──────────────────────────────────────────────────────
function ProfileTab({user, onLogout, lang}) {
  return <div className="tab-content">
    <div style={{background:"linear-gradient(135deg,#2C2510,#4A3E22)",borderRadius:18,padding:24,marginBottom:14,color:"#FFF3C4",textAlign:"center"}}>
      <div style={{width:64,height:64,background:"#E8B84B",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>👤</div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>{user}</div>
      <div style={{fontSize:12,color:"#A89660"}}>{lang==="th"?"สมาชิก WealthWise":"WealthWise Member"}</div>
    </div>
    <div style={{background:"#FFF",border:"1.5px solid #EDE8D8",borderRadius:16,overflow:"hidden",marginBottom:14}}>
      <div style={{padding:"13px 16px",borderBottom:"1px solid #F5EFE0",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:20}}>🔔</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{lang==="th"?"การแจ้งเตือน":"Notifications"}</div>
          <div style={{fontSize:11,color:"#A89660"}}>{lang==="th"?"จัดการการแจ้งเตือน":"Manage notifications"}</div>
        </div>
        <span style={{color:"#C4B88A"}}>›</span>
      </div>
      <div style={{padding:"13px 16px",borderBottom:"1px solid #F5EFE0",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:20}}>🔒</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{lang==="th"?"ความเป็นส่วนตัว":"Privacy"}</div>
          <div style={{fontSize:11,color:"#A89660"}}>{lang==="th"?"ข้อมูลของคุณปลอดภัย":"Your data is safe"}</div>
        </div>
        <span style={{color:"#C4B88A"}}>›</span>
      </div>
      <div style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:20}}>❓</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"#2C2510"}}>{lang==="th"?"ช่วยเหลือ":"Help"}</div>
          <div style={{fontSize:11,color:"#A89660"}}>{lang==="th"?"คำถามที่พบบ่อย":"FAQ"}</div>
        </div>
        <span style={{color:"#C4B88A"}}>›</span>
      </div>
    </div>
    <button onClick={onLogout} style={{width:"100%",background:"#FFF0F0",border:"1.5px solid #F0AAAA",borderRadius:14,padding:14,fontSize:14,fontWeight:800,color:"#C04848",cursor:"pointer",fontFamily:"'Sarabun',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      <span>↩</span> {lang==="th"?"ออกจากระบบ":"Sign Out"}
    </button>
    <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#C4B88A"}}>WealthWise v1.0 · {lang==="th"?"ข้อมูลของคุณปลอดภัย":"Your data is safe"} 🔒</div>
  </div>;
}

// ── Shell (pre-login wrapper) ────────────────────────────────────────
function Shell({children, lang}) {
  return <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:"#FFFDF5",fontFamily:"'Sarabun',sans-serif",overflow:"hidden",position:"relative",width:"100%"}}>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Sarabun',sans-serif;background:#FFFDF5;}
      .ob{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 24px;}
      .ob-body{display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;transition:opacity .18s,transform .18s;}
      .ob-fade{opacity:0;transform:translateX(-14px);}
      .ob-ring{width:106px;height:106px;border-radius:50%;background:linear-gradient(135deg,#FFF3C4,#E8B84B44);display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 28px rgba(232,184,75,.2);}
      .ob-em{font-size:50px;}
      .ob-dots{display:flex;gap:6px;margin-bottom:18px;}
      .od{width:7px;height:7px;border-radius:50%;background:#EDE8D8;transition:all .3s;}
      .od-on{background:#E8B84B;width:20px;border-radius:4px;}
      .ob-t1{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#2C2510;margin-bottom:5px;}
      .ob-t2{font-size:13px;font-weight:700;color:#E8B84B;margin-bottom:10px;}
      .ob-t3{font-size:13px;color:#A89660;line-height:1.75;max-width:290px;margin-bottom:32px;}
      .ob-btn{width:100%;max-width:300px;background:#2C2510;color:#FFF3C4;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:'Sarabun',sans-serif;margin-bottom:10px;}
      .ob-skip{background:none;border:none;color:#C4B88A;font-size:12px;font-weight:600;cursor:pointer;font-family:'Sarabun',sans-serif;padding:6px;}
      .lw{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:0 16px 30px;position:relative;width:100%;box-sizing:border-box;}
      .ldeco{position:absolute;top:0;left:0;right:0;height:230px;overflow:hidden;pointer-events:none;}
      .ldc{position:absolute;border-radius:50%;}
      .c1{width:200px;height:200px;top:-80px;right:-50px;background:linear-gradient(135deg,#FFF3C4,#FFE08A44);}
      .c2{width:130px;height:130px;top:50px;left:-45px;background:linear-gradient(135deg,#FFF8DC,#EDE8D8);}
      .c3{width:70px;height:70px;top:130px;right:28px;background:#FFF3C444;}
      .lbrand{display:flex;flex-direction:column;align-items:center;padding-top:52px;margin-bottom:20px;position:relative;z-index:1;width:100%;}
      .licon{width:62px;height:62px;background:#E8B84B;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:31px;margin-bottom:10px;box-shadow:0 6px 18px rgba(232,184,75,.3);}
      .ltitle{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#2C2510;margin-bottom:3px;}
      .lsub{font-size:11px;color:#A89660;}
      .lcard{background:#FFF;border-radius:20px;border:1.5px solid #EDE8D8;padding:18px;width:100%;box-shadow:0 4px 22px rgba(44,37,16,.06);position:relative;z-index:1;box-sizing:border-box;}
      .gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#FFF;border:1.5px solid #EDE8D8;border-radius:11px;padding:12px;font-size:13px;font-weight:700;color:#2C2510;cursor:pointer;font-family:'Sarabun',sans-serif;margin-bottom:13px;transition:all .2s;}
      .gbtn:hover{border-color:#D4C99A;}
      .gbtn-load{opacity:.7;cursor:not-allowed;}
      .gspin{width:16px;height:16px;border:2.5px solid #EDE8D8;border-top-color:#4285F4;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
      @keyframes spin{to{transform:rotate(360deg);}}
      .lor{display:flex;align-items:center;gap:9px;margin-bottom:13px;}
      .lorline{flex:1;height:1px;background:#EDE8D8;}
      .lortext{font-size:11px;color:#C4B88A;font-weight:600;}
      .ltabs{display:flex;background:#F5EFE0;border-radius:10px;padding:3px;margin-bottom:14px;gap:3px;}
      .ltb{flex:1;padding:8px;border-radius:8px;border:none;background:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;color:#A89660;transition:all .2s;}
      .ltb-on{background:#FFF;color:#2C2510;box-shadow:0 1px 4px rgba(44,37,16,.08);}
      .ll{display:block;font-size:10px;font-weight:800;color:#A89660;margin-bottom:5px;text-transform:uppercase;letter-spacing:.6px;}
      .li{width:100%;padding:10px 12px;border:1.5px solid #EDE8D8;border-radius:10px;font-size:14px;font-family:'Sarabun',sans-serif;outline:none;background:#FFFDF5;color:#2C2510;margin-bottom:11px;display:block;}
      .li:focus{border-color:#E8B84B;}
      .lerr{background:#FFF0F0;border:1.5px solid #F0AAAA;border-radius:9px;padding:8px 11px;font-size:12px;color:#C04848;margin-bottom:9px;font-weight:600;}
      .lbtn{width:100%;background:#2C2510;color:#FFF3C4;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:800;cursor:pointer;font-family:'Sarabun',sans-serif;display:flex;align-items:center;justify-content:center;transition:opacity .2s;}
      .lbtn-load{opacity:.65;}
      .lforgot{text-align:center;margin-top:11px;font-size:12px;color:#C4B88A;cursor:pointer;font-weight:600;}
      .guest-btn{width:100%;display:flex;align-items:center;gap:11px;background:#FFFDF5;border:1.5px solid #EDE8D8;border-radius:15px;padding:13px 15px;cursor:pointer;font-family:'Sarabun',sans-serif;margin-top:10px;position:relative;z-index:1;transition:all .2s;text-align:left;box-sizing:border-box;}
      .guest-btn:hover{border-color:#D4C99A;}
      .guest-icon{font-size:21px;flex-shrink:0;}
      .guest-txt{flex:1;}
      .guest-lbl{font-size:13px;font-weight:800;color:#2C2510;}
      .guest-sub{font-size:11px;color:#A89660;margin-top:2px;}
      .guest-arr{font-size:15px;color:#E8B84B;font-weight:700;flex-shrink:0;}
      .lfooter{margin-top:16px;font-size:11px;color:#C4B88A;text-align:center;position:relative;z-index:1;}
      /* Retirement Banner */
      .retirement-banner{position:relative;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#2C2510 0%,#5A3E10 60%,#3A2808 100%);border-radius:20px;padding:18px 18px 18px 18px;margin-bottom:16px;cursor:pointer;overflow:hidden;border:1.5px solid #E8B84B44;box-shadow:0 6px 24px rgba(44,37,16,.22);transition:transform .18s,box-shadow .18s;}
      .retirement-banner:active{transform:scale(.97);box-shadow:0 2px 10px rgba(44,37,16,.15);}
      .rb-glow{position:absolute;top:-30px;right:-20px;width:120px;height:120px;background:radial-gradient(circle,#E8B84B33,transparent 70%);pointer-events:none;}
      .rb-left{display:flex;align-items:center;gap:13px;flex:1;}
      .rb-icon-wrap{width:52px;height:52px;background:#E8B84B22;border:1.5px solid #E8B84B55;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .rb-icon{font-size:26px;}
      .rb-eyebrow{font-size:9px;font-weight:800;color:#E8B84B;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
      .rb-title{font-size:15px;font-weight:800;color:#FFF3C4;margin-bottom:3px;}
      .rb-sub{font-size:11px;color:#A89660;line-height:1.45;}
      .rb-cta{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;margin-left:10px;}
      .rb-cta-text{font-size:9px;font-weight:800;color:#E8B84B;text-align:center;white-space:nowrap;}
      .rb-arr{font-size:22px;color:#E8B84B;font-weight:700;line-height:1;}
    `}</style>
    {children}
  </div>;
}
