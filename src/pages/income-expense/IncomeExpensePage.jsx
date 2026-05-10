import { useState } from 'react';
import './IncomeExpensePage.css';
import Modal from '../../components/modal/Modal.jsx';
import AddTransactionForm from '../../components/income-expense/AddTransactionForm.jsx';
import EmptyState from '../../components/emptystate/EmptyState.jsx';
import Pagination from '../../components/pagination/Pagination.jsx';
import { FiPlus, FiArrowUpRight, FiArrowDownLeft, FiActivity, FiTrash2 } from 'react-icons/fi';
import emptyTransactionsImage from '../../assets/empty-transactions.webp';
import { useTransactions } from '../../context/TransactionContext.jsx';

/* ── Kategori ikonları ── */
const CategoryIcon = ({ category }) => {
  const icons = {
    Entertainment:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 4-7-4V5l7 4 7-4v4z"/><path d="M19 15l-7 4-7-4"/></svg>,
    Lifestyle:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    General:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    Education:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    Shopping:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    'Personal Care':<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Transportation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    'Dining Out':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
    Groceries:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    Bills:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    Income:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };
  return icons[category] || icons['General'];
};

const CATEGORY_COLORS = {
  Entertainment:   { bg: '#FEE2E2', color: '#DC2626' },
  Lifestyle:       { bg: '#EDE9FE', color: '#7C3AED' },
  General:         { bg: '#F3F4F6', color: '#6B7280' },
  Education:       { bg: '#DBEAFE', color: '#2563EB' },
  Shopping:        { bg: '#FED7AA', color: '#EA580C' },
  'Personal Care': { bg: '#FCE7F3', color: '#EC4899' },
  Transportation:  { bg: '#CFFAFE', color: '#0891B2' },
  'Dining Out':    { bg: '#FEF3C7', color: '#D97706' },
  Groceries:       { bg: '#D1FAE5', color: '#059669' },
  Bills:           { bg: '#FECDD3', color: '#E11D48' },
  Income:          { bg: '#D1FAE5', color: '#059669' },
};

const ITEMS_PER_PAGE = 5;

/* ── Tarih karşılaştırması — timezone-safe ── */
const isSameDay = (dateStr) => {
  if (!dateStr) return false;
  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    // YYYY-MM-DD (ISO format — AddTransactionForm'un kaydettiği format)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 10) === todayStr;
    }

    // DD.MM.YYYY (display format)
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('.');
      return `${y}-${m}-${d}` === todayStr;
    }

    // DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}` === todayStr;
    }

    return false;
  } catch {
    return false;
  }
};

const IncomeExpensePage = () => {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const [isModalOpen,         setIsModalOpen]         = useState(false);
  const [isDeleteModalOpen,   setIsDeleteModalOpen]   = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [currentPage,         setCurrentPage]         = useState(1);

  const openDeleteModal = (id) => { setTransactionToDelete(id); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      setCurrentPage(prev => {
        const newTotal = Math.ceil((transactions.length - 1) / ITEMS_PER_PAGE);
        return prev > newTotal ? Math.max(1, newTotal) : prev;
      });
    }
  };

  const handleAddTransaction = (newEntry) => {
    addTransaction(newEntry);
    setIsModalOpen(false);
  };

  /* ── Daily stats — isSameDay ile timezone-safe ── */
  const dailyIncome = transactions
    .filter(t => t.type === 'income' && isSameDay(t.date))
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const dailyExpense = transactions
    .filter(t => t.type === 'expense' && isSameDay(t.date))
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const itemToBeDeleted = transactions.find(t => t.id === transactionToDelete);
  const totalPages   = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const currentItems = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="ie-page">
      <div className="ie-header">
        <div>
          <div className="ie-header__eyebrow">Finance &amp; Tracking</div>
          <h1 className="ie-header__title">Income &amp; Expense</h1>
        </div>
        <button className="ie-add-btn" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<FiActivity />}
          title="Track Your Income & Expenses"
          message="Keep track of your financial activities. Add your income sources and daily expenses to see a clear summary of your budget."
          buttonText="+ Add First Transaction"
          onAction={() => setIsModalOpen(true)}
          backgroundImage={emptyTransactionsImage}
        />
      ) : (
        <>
          <div className="ie-summary-grid">
            <div className="ie-summary-card income">
              <div className="ie-card-icon"><FiArrowDownLeft /></div>
              <div className="ie-card-info">
                <span>Daily Income</span>
                <h3>{dailyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} $</h3>
              </div>
            </div>
            <div className="ie-summary-card expense">
              <div className="ie-card-icon"><FiArrowUpRight /></div>
              <div className="ie-card-info">
                <span>Daily Expense</span>
                <h3>{dailyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })} $</h3>
              </div>
            </div>
          </div>

          <div className="ie-transactions-container">
            <div className="ie-list-header">
              <h2>Recent Transactions</h2>
            </div>

            <div className="ie-list">
              {currentItems.map((item) => {
                const palette  = CATEGORY_COLORS[item.category] || { bg: '#F3F4F6', color: '#6B7280' };
                const isIncome = item.type === 'income';
                return (
                  <div key={item.id} className="ie-list-item">
                    <div className="ie-item-left">
                      <div className="ie-item-avatar" style={{ backgroundColor: palette.bg }}>
                        <span style={{ color: palette.color, display: 'flex', alignItems: 'center', width: '20px', height: '20px' }}>
                          <CategoryIcon category={item.category} />
                        </span>
                      </div>
                      <div className="ie-item-meta">
                        <span className="ie-item-name">{item.name}</span>
                        <span className="ie-item-sub">{item.date} • {item.category}</span>
                      </div>
                    </div>

                    <div className="ie-item-right">
                      <div className={`ie-item-amount ${item.type}`}>
                        {isIncome ? '+' : '-'}
                        {parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                      </div>
                      <button
                        className="btn-delete-transaction"
                        onClick={() => openDeleteModal(item.id)}
                        title="Delete Transaction"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="ie-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => p > 0 && p <= totalPages && setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddTransactionForm onAdd={handleAddTransaction} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="delete-modal-content">
          <div className="delete-header">
            <h2>Delete '{itemToBeDeleted?.name}'?</h2>
          </div>
          <p className="delete-message">
            Are you sure you want to delete this transaction? This action cannot be reversed.
          </p>
          <div className="delete-actions">
            <button className="btn-delete-confirm" onClick={confirmDelete}>Yes, Confirm Deletion</button>
            <button className="btn-delete-cancel" onClick={() => setIsDeleteModalOpen(false)}>No, Go Back</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncomeExpensePage;