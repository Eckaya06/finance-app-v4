import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  ReferenceLine,
} from "recharts";
import {
  readTransactionStats,
  readExchangePortfolio,
  calcNetWorth,
  fmtMoney,
} from "./analyticsUtils.js";
import "./AnalyticsPage.css";

const API_BASE = "https://api.frankfurter.dev/v1";
const BASE     = "TRY";
const ALL_CURR = ["USD","EUR","GBP","JPY","AUD","CAD","CHF"];
const PALETTE  = ["#4F46E5","#10B981","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#EC4899","#14B8A6"];
const PERIOD_DAYS = { weekly:7, monthly:30, yearly:365 };
const CURR_META  = {
  USD:{ name:"US Dollar",        flag:"🇺🇸" },
  EUR:{ name:"Euro",             flag:"🇪🇺" },
  GBP:{ name:"British Pound",    flag:"🇬🇧" },
  JPY:{ name:"Japanese Yen",     flag:"🇯🇵" },
  AUD:{ name:"Australian Dollar",flag:"🇦🇺" },
  CAD:{ name:"Canadian Dollar",  flag:"🇨🇦" },
  CHF:{ name:"Swiss Franc",      flag:"🇨🇭" },
};
const SPARKS = {
  USD:[31.8,32.0,32.3,32.2,32.4,32.5,32.49],
  EUR:[35.4,35.3,35.2,35.3,35.1,35.0,35.12],
  GBP:[40.1,40.3,40.6,40.5,40.8,41.0,41.06],
  JPY:[0.217,0.216,0.215,0.215,0.214,0.214,0.214],
  AUD:[21.1,21.2,21.3,21.2,21.3,21.35,21.34],
  CAD:[23.8,23.87,23.87,23.87,23.87,23.87,23.87],
  CHF:[36.5,36.52,36.54,36.56,36.58,36.59,36.59],
};

/* ── Sparkline SVG ── */
function MiniSparkline({ data=[], color="#4F46E5", width=72, height=28 }) {
  if (!data || data.length < 2) return <span style={{display:"inline-block",width,height}} />;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pad=2, w=width-pad*2, h=height-pad*2;
  const pts=data.map((v,i)=>[pad+(i/(data.length-1))*w, pad+h-((v-min)/range)*h]);
  const line=pts.map(([x,y],i)=>`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area=`${line} L${pts[pts.length-1][0]},${pad+h} L${pts[0][0]},${pad+h} Z`;
  const gid=`sg${color.replace(/[^a-z0-9]/gi,"")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Tooltips ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip__date">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="an-tooltip__row">
          <span className="an-tooltip__dot" style={{background:p.color}}/>
          <span className="an-tooltip__name">{p.name}</span>
          <span className="an-tooltip__val">₺{p.value.toLocaleString("tr-TR",{maximumFractionDigits:2})}</span>
        </div>
      ))}
    </div>
  );
}
function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const {name,value} = payload[0];
  return (
    <div className="an-tooltip">
      <p className="an-tooltip__date">{name}</p>
      <div className="an-tooltip__row">
        <span className="an-tooltip__dot" style={{background:payload[0].payload.fill||payload[0].payload.color}}/>
        <span className="an-tooltip__val">₺{value.toLocaleString("tr-TR",{maximumFractionDigits:0})}</span>
      </div>
    </div>
  );
}

/* ── Hero KPI Card ── */
function HeroCard({ label, value, sub, subUp, badge, delay=0 }) {
  return (
    <div className="an-hero" style={{animationDelay:`${delay}ms`}}>
      <span className="an-hero__badge">{badge}</span>
      <p  className="an-hero__label">{label}</p>
      <p  className="an-hero__value">{value}</p>
      {sub && (
        <p className={`an-hero__sub${subUp===true?" an-hero__sub--up":subUp===false?" an-hero__sub--down":""}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════
   PAGE
════════════════════════════════ */
export default function AnalyticsPage() {
  const [rates,       setRates]   = useState({});
  const [ratesLoading,setRL]      = useState(true);
  const [txStats,     setTx]      = useState(null);
  const [period,      setPeriod]  = useState("monthly");
  const [lastUpd,     setLastUpd] = useState(new Date());
  const [ready,       setReady]   = useState(false);
  const [isDark,      setIsDark]  = useState(document.body.classList.contains("theme-dark"));

  /* dark mod değişimini takip et */
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.body.classList.contains("theme-dark"))
    );
    obs.observe(document.body, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const fetchRates = useCallback(async (signal) => {
    setRL(true);
    try {
      const results = await Promise.all(
        ALL_CURR.map(cur =>
          fetch(`${API_BASE}/latest?from=${cur}&to=${BASE}`,{signal})
            .then(r=>r.ok?r.json():null)
            .then(d=>({cur, rate:d?.rates?.[BASE]??null}))
            .catch(()=>({cur,rate:null}))
        )
      );
      const map={};
      results.forEach(({cur,rate})=>{ if(rate) map[cur]=rate; });
      setRates(map);
    } catch(e){ if(e?.name==="AbortError") return; }
    finally { setRL(false); }
  },[]);

  const reload = useCallback(() => {
    setTx(readTransactionStats());
    setLastUpd(new Date());
  },[]);

  useEffect(() => {
    reload();
    const ctrl = new AbortController();
    fetchRates(ctrl.signal);
    window.addEventListener("storage", reload);
    setTimeout(()=>setReady(true), 60);
    return () => { ctrl.abort(); window.removeEventListener("storage",reload); };
  },[fetchRates, reload]);

  const portfolio = useMemo(()=>readExchangePortfolio(rates),[rates]);
  const netWorth  = useMemo(()=>txStats?calcNetWorth(txStats,portfolio):0,[txStats,portfolio]);

  const cashflow = useMemo(()=>{
    if(!txStats) return [];
    const days = PERIOD_DAYS[period] ?? 30;
    return txStats.cashflowSeries.slice(-days);
  },[txStats, period]);

  const allocation = useMemo(()=>{
    const items=[];
    if(txStats?.netCash>0)        items.push({name:"Cash Balance",   value:txStats.netCash,            color:"#4F46E5"});
    if(portfolio.hasPnl&&portfolio.currentValue>0)
                                   items.push({name:`${portfolio.currency} Position`, value:portfolio.currentValue, color:"#10B981"});
    if(txStats?.totalExpenses>0)  items.push({name:"Expenses",       value:txStats.totalExpenses,      color:"#F59E0B"});
    return items.length?items:[{name:"No data",value:1,color:"#E5E7EB"}];
  },[txStats,portfolio]);

  const totalAlloc = allocation.reduce((s,x)=>s+x.value,0);

  const fmtUpd = (d) => {
    try { return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d); }
    catch { return ""; }
  };

  return (
    <div className={`an-page${ready?" an-page--ready":""}`}>

      {/* ═══ HEADER ═══ */}
      <header className="an-header">
        <div className="an-header__left">
          <p className="an-breadcrumb">Analytics <span className="an-breadcrumb__sep">/</span> Overview</p>
          <p className="an-header__ts">
            <span className="an-live-dot"/>
            Last updated {fmtUpd(lastUpd)}
          </p>
        </div>
        <button type="button" className="an-refresh" onClick={()=>{reload();fetchRates(new AbortController().signal);}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
          </svg>
          Refresh Data
        </button>
        <div className="an-range-tabs">
          {["weekly","monthly","yearly"].map(p=>(
            <button key={p} type="button"
              className={`an-range-tab${period===p?" an-range-tab--active":""}`}
              onClick={()=>setPeriod(p)}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ HERO CARDS ═══ */}
      <div className="an-heroes">
        <HeroCard delay={0}
          badge="NET WORTH"
          label="Total Net Worth"
          value={`₺${netWorth.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})}`}
          sub={txStats
            ? `Cash ₺${txStats.netCash.toLocaleString("tr-TR",{maximumFractionDigits:0})} · ${portfolio.hasPnl?`Pos. ₺${portfolio.currentValue.toLocaleString("tr-TR",{maximumFractionDigits:0})}`:"No open position"}`
            : "Loading…"}
        />
        <HeroCard delay={80}
          badge="P&L"
          label="Open Position Return"
          value={portfolio.hasPnl
            ? `${portfolio.pnlAbsolute>=0?"+":""}₺${Math.abs(portfolio.pnlAbsolute).toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})}`
            : "—"}
          sub={portfolio.hasPnl
            ? `${portfolio.pnlPercent>=0?"+":""}${portfolio.pnlPercent.toFixed(2)}% · ${portfolio.currency} position`
            : "Open Exchange to set a position"}
          subUp={portfolio.hasPnl ? portfolio.pnlAbsolute>=0 : undefined}
        />
        <HeroCard delay={160}
          badge="HEALTH"
          label="Savings Rate"
          value={txStats?`${txStats.savingsRate.toFixed(1)}%`:"—"}
          sub={txStats
            ? `↑ ₺${txStats.totalIncome.toLocaleString("tr-TR",{maximumFractionDigits:0})} in · ↓ ₺${txStats.totalExpenses.toLocaleString("tr-TR",{maximumFractionDigits:0})} out`
            : "No transaction data"}
          subUp={txStats?txStats.savingsRate>0:undefined}
        />
      </div>

      {/* ═══ BODY GRID ═══ */}
      <div className="an-body">

        {/* LEFT — Cashflow Chart */}
        <div className="an-card an-card--chart">
          <div className="an-card-head">
            <div>
              <h2 className="an-card-title">Cashflow Performance</h2>
              <p className="an-card-sub">Income vs expenses · {period.charAt(0).toUpperCase()+period.slice(1)}</p>
            </div>
          </div>

          {cashflow.length===0 ? (
            <div className="an-empty">
              <div className="an-empty__icon">📈</div>
              <p className="an-empty__title">No cashflow data yet</p>
              <p className="an-empty__sub">Add transactions to see your financial performance over time.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={cashflow} margin={{top:10,right:4,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4F46E5" stopOpacity={0.16}/>
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#EF4444" stopOpacity={0.12}/>
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={isDark?"#1E2438":"#F0F1F3"} vertical={false}/>
                <XAxis dataKey="label" tick={{fill:isDark?"#4B5563":"#9CA3AF",fontSize:10,fontFamily:"inherit"}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={{fill:isDark?"#4B5563":"#9CA3AF",fontSize:10,fontFamily:"inherit"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₺${(v/1000).toFixed(0)}k`:`₺${v}`} width={58}/>
                <Tooltip content={<ChartTooltip/>} cursor={{stroke:isDark?"#2A2F45":"#E5E7EB",strokeWidth:1,strokeDasharray:"4 4"}}/>
                <ReferenceLine y={0} stroke={isDark?"#2A2F45":"#E5E7EB"} strokeWidth={1}/>
                <Area type="monotone" dataKey="income"  name="Income"   stroke="#4F46E5" strokeWidth={2.5} fill="url(#gI)" dot={false} activeDot={{r:5,fill:"#4F46E5",strokeWidth:2,stroke:"#fff"}}/>
                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#gE)" dot={false} activeDot={{r:5,fill:"#EF4444",strokeWidth:2,stroke:"#fff"}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="an-chart-foot">
            <span className="an-chart-leg"><span className="an-chart-leg__dot" style={{background:"#4F46E5"}}/> Income</span>
            <span className="an-chart-leg"><span className="an-chart-leg__dot" style={{background:"#EF4444"}}/> Expenses</span>
            {txStats&&<span className="an-chart-count">{txStats.txCount} total transactions</span>}
          </div>
        </div>

        {/* RIGHT — Allocation + Budget */}
        <div className="an-right-col">

          {/* Donut */}
          <div className="an-card an-card--donut">
            <h2 className="an-card-title">Portfolio Allocation</h2>
            <p className="an-card-sub" style={{marginBottom:8}}>Your financial distribution</p>

            <div className="an-donut-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                    {allocation.map((item,i)=>(
                      <Cell key={i} fill={item.color||PALETTE[i%PALETTE.length]}/>
                    ))}
                  </Pie>
                  <Tooltip content={<PieTip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="an-donut-center">
                <span className="an-donut-lbl">Total</span>
                <span className="an-donut-val">
                  {totalAlloc>=1000?`₺${(totalAlloc/1000).toFixed(1)}k`:`₺${totalAlloc.toFixed(0)}`}
                </span>
              </div>
            </div>

            <div className="an-alloc-list">
              {allocation.map((item,i)=>(
                <div key={i} className="an-alloc-row">
                  <span className="an-alloc-dot" style={{background:item.color||PALETTE[i%PALETTE.length]}}/>
                  <span className="an-alloc-name">{item.name}</span>
                  <span className="an-alloc-pct">{totalAlloc>0?((item.value/totalAlloc)*100).toFixed(1):0}%</span>
                  <span className="an-alloc-val">₺{item.value.toLocaleString("tr-TR",{maximumFractionDigits:0})}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget mini */}
          {txStats?.budgetUsage?.length>0 && (
            <div className="an-card an-card--budget">
              <h2 className="an-card-title">Budget Status</h2>
              <p className="an-card-sub" style={{marginBottom:14}}>Spending limits</p>
              <div className="an-bud-list">
                {txStats.budgetUsage.slice(0,5).map((b,i)=>(
                  <div key={i} className="an-bud-row">
                    <div className="an-bud-meta">
                      <span className="an-bud-cat">{b.category}</span>
                      <span className={`an-bud-pct${b.isOver?" an-bud-pct--over":""}`}>{b.pct.toFixed(0)}%</span>
                    </div>
                    <div className="an-bud-track">
                      <div className={`an-bud-fill${b.isOver?" an-bud-fill--over":b.pct>80?" an-bud-fill--warn":" an-bud-fill--ok"}`}
                        style={{width:`${b.pct}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
