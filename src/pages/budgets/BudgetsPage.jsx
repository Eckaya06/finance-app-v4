import { useState, useEffect, useMemo } from 'react';
import Modal from '../../components/modal/Modal.jsx';
import AddBudgetForm from '../../components/budgets/AddBudgetForm.jsx';
import EditBudgetForm from '../../components/budgets/EditBudgetForm.jsx';
import EmptyState from '../../components/emptystate/EmptyState.jsx';
import { FiPieChart } from 'react-icons/fi';
import BudgetDetailCard from '../../components/budgets/BudgetDetailCard.jsx';
import DeleteBudgetModal from '../../components/budgets/DeleteBudgetModal.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../../hooks/useCurrency.js';
import emptyBudgetImg from '../../assets/empty-budget.png';
import './BudgetsPage.css';

// ✅ Artık localStorage değil, TransactionContext kullanıyoruz
import { useTransactions } from '../../context/TransactionContext.jsx';

const THEME_COLORS = {
  blue: '#3b82f6', cyan: '#06b6d4', green: '#22c55e',
  orange: '#f97316', indigo: '#6366f1', red: '#ef4444', purple: '#8b5cf6',
};

const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

function PieTip({ active, payload }) {
  const { fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div className="bp-tooltip">
      <span className="bp-tooltip__dot" style={{ background: payload[0].payload.color }} />
      <span className="bp-tooltip__name">{payload[0].name}</span>
      <span className="bp-tooltip__val">{fmt(payload[0].value, 0)}</span>
    </div>
  );
}

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

const BudgetsPage = () => {
  const { fmt } = useCurrency();

  // ✅ Context'ten budgets ve transactions'ı alıyoruz
  // computedBudgets: context içinde zaten spent hesaplanmış olarak geliyor
  const {
    budgets: computedBudgets,
    addBudget,
    deleteBudget,
    updateBudget,
  } = useTransactions();

  const [isAddOpen, setIsAddOpen]   = useState(false);
  const [toDelete, setToDelete]     = useState(null);
  const [toEdit, setToEdit]         = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [ready, setReady]           = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    const handler = (e) => {
      if (!e.target.closest('.pot-options-btn') && !e.target.closest('.budget-options-menu'))
        setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  // computed: context'ten gelen budgets'a pct ekle
  const computed = useMemo(() => computedBudgets.map(b => {
    const max  = toNumber(b.maxSpend ?? b.limit ?? b.maximum ?? 0);
    const spent = toNumber(b.spent ?? 0);
    const pct  = max > 0 ? Math.min(100, (spent / max) * 100) : 0;
    return { ...b, maxSpend: max, spent, pct };
  }), [computedBudgets]);

  const totalLimit   = computed.reduce((s, b) => s + b.maxSpend, 0);
  const totalSpent   = computed.reduce((s, b) => s + b.spent, 0);
  const totalRemain  = totalLimit - totalSpent;
  const healthyCount = computed.filter(b => b.spent <= b.maxSpend).length;
  const overCount    = computed.length - healthyCount;
  const usagePct     = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0.0';
  const donutData    = computed.map(b => ({ name: b.category, value: b.maxSpend, color: THEME_COLORS[b.theme] || '#6366f1' }));

  // ✅ Context'in addBudget/deleteBudget/updateBudget fonksiyonlarını kullanıyoruz
  const handleCreate = async (data) => {
    await addBudget({
      category: data.category,
      limit: data.maxSpend ?? data.limit,
      maxSpend: data.maxSpend ?? data.limit,
      theme: data.theme,
    });
    setIsAddOpen(false);
  };

  const handleEdit = async (id, data) => {
    await updateBudget(id, {
      category: data.category,
      limit: data.limit ?? data.maxSpend,
      maxSpend: data.limit ?? data.maxSpend,
      theme: data.theme,
    });
    setToEdit(null);
    setOpenMenuId(null);
  };

  const handleDelConf = async () => {
    if (toDelete) {
      await deleteBudget(toDelete.id);
      setToDelete(null);
    }
  };

  return (
    <div className={`bp-page${ready ? ' bp-page--ready' : ''}`}>
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
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Budget
        </button>
      </header>

      {computed.length === 0 ? (
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
          <div className="bp-kpis">
            <KpiCard delay={0}   icon="◎" label="Total Budget Limit" value={fmt(totalLimit)}          sub={`${computed.length} categories`}                           subColor="#9CA3AF" />
            <KpiCard delay={80}  icon="↓" label="Total Spent"        value={fmt(totalSpent)}          sub={`${usagePct}% of limit used`}                              subColor={totalSpent > totalLimit ? '#EF4444' : '#10B981'} />
            <KpiCard delay={160} icon="◈" label="Remaining"          value={fmt(Math.abs(totalRemain))} sub={`${healthyCount} of ${computed.length} budgets healthy`} subColor={totalRemain >= 0 ? '#10B981' : '#EF4444'} />
          </div>

          <div className="bp-body">
            <div className="bp-summary">
              <div className="bp-card bp-card--donut">
                <h2 className="bp-card__title">Budget Allocation</h2>
                <p className="bp-card__sub">Limit distribution by category</p>
                <div className="bp-donut-wrap">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                        {donutData.map((item, i) => <Cell key={i} fill={item.color} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bp-donut-center">
                    <span className="bp-donut-lbl">Total Limit</span>
                    <span className="bp-donut-val">{fmt(totalLimit, 0)}</span>
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
                    <span style={{ color: totalSpent > totalLimit ? '#EF4444' : '#10B981' }}>{usagePct}% used</span>
                    <span>{(100 - Math.min(100, Number(usagePct))).toFixed(1)}% left</span>
                  </div>
                </div>
                <div className="bp-status-list">
                  {computed.map((b, i) => {
                    const over = b.spent > b.maxSpend;
                    const col  = THEME_COLORS[b.theme] || '#6366f1';
                    return (
                      <div key={b.id} className="bp-status-row" style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="bp-status-meta">
                          <span className="bp-status-dot" style={{ background: col }} />
                          <span className="bp-status-name">{b.category}</span>
                          <span className={`bp-status-pct${over ? ' bp-status-pct--over' : ''}`}>{b.pct.toFixed(0)}%</span>
                        </div>
                        <div className="bp-status-track">
                          <div className="bp-status-fill" style={{
                            width: `${b.pct}%`,
                            background: over ? '#EF4444' : b.pct > 80 ? '#F59E0B' : col
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bp-cards-col">
              {computed.map((budget) => (
                <div key={budget.id} className="bp-card-wrapper">
                  <span className={`bp-pct-badge${budget.pct > 100 ? ' bp-pct-badge--over' : budget.pct > 80 ? ' bp-pct-badge--warn' : ' bp-pct-badge--ok'}`}>
                    {budget.pct.toFixed(0)}%
                  </span>
                  <BudgetDetailCard
                    budget={budget}
                    onDeleteRequest={() => { setToDelete(budget); setOpenMenuId(null); }}
                    onEditRequest={() => { setToEdit(budget); setOpenMenuId(null); }}
                    isMenuOpen={openMenuId === budget.id}
                    onOptionsToggle={() => setOpenMenuId(p => p === budget.id ? null : budget.id)}
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

      <Modal isOpen={!!toEdit} onClose={() => { setToEdit(null); setOpenMenuId(null); }}>
        {toEdit && (
          <EditBudgetForm
            budget={toEdit}
            onUpdateBudget={handleEdit}
            onClose={() => { setToEdit(null); setOpenMenuId(null); }}
          />
        )}
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)}>
        <DeleteBudgetModal budget={toDelete} onConfirm={handleDelConf} onClose={() => setToDelete(null)} />
      </Modal>
    </div>
  );
};

export default BudgetsPage;