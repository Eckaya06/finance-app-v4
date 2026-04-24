import { useState, useEffect, useMemo } from 'react';
import Modal from '../../components/modal/Modal.jsx';
import AddBudgetForm from '../../components/budgets/AddBudgetForm.jsx';
import EmptyState from '../../components/emptystate/EmptyState.jsx';
import { FiPieChart } from 'react-icons/fi';
import BudgetDetailCard from '../../components/budgets/BudgetDetailCard.jsx';
import DeleteBudgetModal from '../../components/budgets/DeleteBudgetModal.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../../hooks/useCurrency.js';
import emptyBudgetImg from '../../assets/empty-budget.png';
import './BudgetsPage.css';

const LS_BUDGETS      = 'financeapp_budgets';
const LS_TRANSACTIONS = 'financeapp_transactions';

const THEME_COLORS = {
  blue:'#3b82f6', cyan:'#06b6d4', green:'#22c55e',
  orange:'#f97316', indigo:'#6366f1', red:'#ef4444', purple:'#8b5cf6',
};

const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const normalize = (s) => String(s ?? '').trim().toLowerCase();
const getLS = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };

/* ── Pie Tooltip ── */
function PieTip({ active, payload }) {
  const { fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bp-tooltip">
      <span className="bp-tooltip__dot" style={{ background: payload[0].payload.color }} />
      <span className="bp-tooltip__name">{name}</span>
      <span className="bp-tooltip__val">{fmt(value, 0)}</span>
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, subColor, icon, delay }) {
  return (
    <div className="bp-kpi" style={{ animationDelay: `${delay}ms` }}>
      <div className="bp-kpi__top">
        <span className="bp-kpi__icon">{icon}</span>
        <p className="bp-kpi__label">{label}</p>
      </div>
      <p className="bp-kpi__value">{value}</p>
      {sub && <p className="bp-kpi__sub" style={{ color: subColor }}>{sub}</p>}
    </div>
  );
}

/* ════════════════════════════════
   PAGE
════════════════════════════════ */
const BudgetsPage = () => {
  const { fmt }           = useCurrency();
  const [budgets,      setBudgets]      = useState(() => getLS(LS_BUDGETS));
  const [transactions, setTransactions] = useState(() => getLS(LS_TRANSACTIONS));
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [toDelete,     setToDelete]     = useState(null);
  const [ready,        setReady]        = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_TRANSACTIONS)
        setTransactions(e.newValue ? JSON.parse(e.newValue) : []);
    };
    const onCustom = () => setTransactions(getLS(LS_TRANSACTIONS));
    window.addEventListener('storage', onStorage);
    window.addEventListener('financeapp:transactions_updated', onCustom);
    setTimeout(() => setReady(true), 60);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('financeapp:transactions_updated', onCustom);
    };
  }, []);

  const handleCreate  = (data) => setBudgets(prev => [{ id: Date.now(), ...data }, ...prev]);
  const handleDelConf = () => {
    if (toDelete) { setBudgets(prev => prev.filter(b => b.id !== toDelete.id)); setToDelete(null); }
  };

  /* computed budgets */
  const computed = useMemo(() => budgets.map(b => {
    const cat     = normalize(b.category);
    const related = (transactions || []).filter(tx => normalize(tx.category) === cat && normalize(tx.type) === 'expense');
    const spent   = related.reduce((s, tx) => s + Math.abs(toNumber(tx.amount)), 0);
    const latest  = related.slice().sort((a, z) => new Date(z.date) - new Date(a.date)).slice(0, 3);
    const max     = toNumber(b.maxSpend);
    const pct     = max > 0 ? Math.min(100, (spent / max) * 100) : 0;
    return { ...b, spent, latestSpending: latest, pct };
  }), [budgets, transactions]);

  /* KPI stats */
  const totalLimit  = computed.reduce((s, b) => s + toNumber(b.maxSpend), 0);
  const totalSpent  = computed.reduce((s, b) => s + b.spent, 0);
  const totalRemain = totalLimit - totalSpent;
  const healthyCount = computed.filter(b => b.spent <= toNumber(b.maxSpend)).length;
  const overCount    = computed.length - healthyCount;
  const usagePct     = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0.0';

  /* donut data */
  const donutData = computed.map(b => ({
    name: b.category,
    value: toNumber(b.maxSpend),
    color: THEME_COLORS[b.theme] || '#6366f1',
  }));

  return (
    <div className={`bp-page${ready ? ' bp-page--ready' : ''}`}>

      {/* ═══ HEADER ═══ */}
      <header className="bp-header">
        <div>
          <p className="bp-breadcrumb">Budgets <span className="bp-breadcrumb__sep">/</span> Overview</p>
          <p className="bp-header__sub">
            {computed.length} budget{computed.length !== 1 ? 's' : ''}
            {overCount > 0 ? ` · ${overCount} over limit` : ' · All on track'}
          </p>
        </div>
        <button className="bp-add-btn" onClick={() => setIsAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Budget
        </button>
      </header>

      {budgets.length === 0 ? (
        <EmptyState
          icon={<FiPieChart />}
          title="Create Your First Budget"
          message="Set spending limits for different categories to monitor and control your spending."
          buttonText="+ Create First Budget"
          onAction={() => setIsAddOpen(true)}
          backgroundImage={emptyBudgetImg}
        />
      ) : (
        <>
          {/* ═══ KPI ROW ═══ */}
          <div className="bp-kpis">
            <KpiCard delay={0}
              icon="◎" label="Total Budget Limit"
              value={fmt(totalLimit)}
              sub={`${computed.length} categories`}
              subColor="#9CA3AF"
            />
            <KpiCard delay={80}
              icon="↓" label="Total Spent"
              value={fmt(totalSpent)}
              sub={`${usagePct}% of limit used`}
              subColor={totalSpent > totalLimit ? '#EF4444' : '#10B981'}
            />
            <KpiCard delay={160}
              icon="◈" label="Remaining"
              value={fmt(Math.abs(totalRemain))}
              sub={`${healthyCount} of ${computed.length} budgets healthy`}
              subColor={totalRemain >= 0 ? '#10B981' : '#EF4444'}
            />
          </div>

          {/* ═══ BODY ═══ */}
          <div className="bp-body">

            {/* LEFT — Summary Panel */}
            <div className="bp-summary">

              {/* Donut */}
              <div className="bp-card bp-card--donut">
                <h2 className="bp-card__title">Budget Allocation</h2>
                <p className="bp-card__sub">Limit distribution by category</p>
                <div className="bp-donut-wrap">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" innerRadius={62} outerRadius={88}
                        paddingAngle={3} strokeWidth={0}>
                        {donutData.map((item, i) => <Cell key={i} fill={item.color} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bp-donut-center">
                    <span className="bp-donut-lbl">Total Limit</span>
                    <span className="bp-donut-val">
                      {totalLimit >= 1000
                        ? `${fmt(totalLimit / 1000, 1).replace(/(\d)/, '$1')}`.replace('.', '.') + ''
                        : fmt(totalLimit, 0)}
                    </span>
                  </div>
                </div>
                <div className="bp-donut-legend">
                  {donutData.map((item, i) => (
                    <div key={i} className="bp-donut-legend__row">
                      <span className="bp-donut-legend__dot" style={{ background: item.color }} />
                      <span className="bp-donut-legend__name">{item.name}</span>
                      <span className="bp-donut-legend__val">{fmt(item.value, 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall progress */}
              <div className="bp-card bp-card--overall">
                <h2 className="bp-card__title">Overall Usage</h2>
                <p className="bp-card__sub">Across all categories</p>
                <div className="bp-overall-bar-wrap">
                  <div className="bp-overall-bar">
                    <div
                      className={`bp-overall-fill${totalSpent > totalLimit ? ' bp-overall-fill--over' : ''}`}
                      style={{ width: `${Math.min(100, Number(usagePct))}%` }}
                    />
                  </div>
                  <div className="bp-overall-labels">
                    <span style={{ color: totalSpent > totalLimit ? '#EF4444' : '#10B981' }}>
                      {usagePct}% used
                    </span>
                    <span>{(100 - Math.min(100, Number(usagePct))).toFixed(1)}% left</span>
                  </div>
                </div>

                <div className="bp-status-list">
                  {computed.map((b, i) => {
                    const over = b.spent > toNumber(b.maxSpend);
                    const col  = THEME_COLORS[b.theme] || '#6366f1';
                    return (
                      <div key={b.id} className="bp-status-row" style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="bp-status-meta">
                          <span className="bp-status-dot" style={{ background: col }} />
                          <span className="bp-status-name">{b.category}</span>
                          <span className={`bp-status-pct${over ? ' bp-status-pct--over' : ''}`}>
                            {b.pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="bp-status-track">
                          <div
                            className={`bp-status-fill${over ? ' bp-status-fill--over' : b.pct > 80 ? ' bp-status-fill--warn' : ''}`}
                            style={{ width: `${b.pct}%`, background: over ? '#EF4444' : b.pct > 80 ? '#F59E0B' : col }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — Budget Detail Cards with % badge */}
            <div className="bp-cards-col">
              {computed.map((budget) => (
                <div key={budget.id} className="bp-card-wrapper">
                  {/* Yüzde badge — kartın sağ üst köşesinde */}
                  <span className={`bp-pct-badge${budget.pct > 100 ? ' bp-pct-badge--over' : budget.pct > 80 ? ' bp-pct-badge--warn' : ' bp-pct-badge--ok'}`}>
                    {budget.pct.toFixed(0)}%
                  </span>
                  <BudgetDetailCard
                    budget={budget}
                    onDeleteRequest={() => setToDelete(budget)}
                    onEditRequest={() => alert(`Editing ${budget.category}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <AddBudgetForm onAddBudget={handleCreate} onClose={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)}>
        <DeleteBudgetModal budget={toDelete} onConfirm={handleDelConf} onClose={() => setToDelete(null)} />
      </Modal>
    </div>
  );
};

export default BudgetsPage;
