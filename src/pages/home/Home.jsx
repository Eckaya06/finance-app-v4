// src/pages/home/Home.jsx
import StatCard from '../../components/statcard/StatCard.jsx';
import TransactionsList from '../../components/transactions/TransactionsList.jsx';
import PotsCard from '../../components/pots/PotsCard.jsx';
import BudgetsCard from '../../components/budgets/BudgetsCard.jsx';
import RecurringBillsCard from '../../components/bills/RecurringBillsCard.jsx';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">

      {/* ── Header ── */}
      <div className="home-header">
        <div>
          <div className="home-header__eyebrow">Dashboard</div>
          <h1 className="home-header__title">Overview</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button className="home-refresh-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '8px 18px', fontSize: '12px', fontWeight: 500,
            fontFamily: 'inherit', border: '1px solid #E5E7EB',
            background: '#fff', borderRadius: '999px', cursor: 'pointer',
            color: '#374151', transition: 'all 150ms'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="home-stat-grid">
        <StatCard title="Current Balance" amount="$4,836.00" variant="primary" />
        <StatCard title="Income" amount="$3,814.25" />
        <StatCard title="Expenses" amount="$1,700.50" />
      </div>

      {/* ── Row 1: Pots + Transactions ── */}
      <div className="home-two-col">
        <PotsCard />
        <TransactionsList limit={5} showViewAll={true} />
      </div>

      {/* ── Row 2: Budgets + Recurring Bills ── */}
      <div className="home-two-col">
        <BudgetsCard />
        <RecurringBillsCard />
      </div>

    </div>
  );
};

export default Home;