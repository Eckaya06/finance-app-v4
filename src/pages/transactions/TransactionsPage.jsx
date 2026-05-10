import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext.jsx';
import CustomDropdown from '../../components/dropdown/CustomDropdown.jsx';
import Pagination from '../../components/pagination/Pagination.jsx';
import './TransactionsPage.css';

/* ── Inline SVG ikonlar ── */
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CategoryIcon = ({ category }) => {
  const icons = {
    Entertainment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 4-7-4V5l7 4 7-4v4z"/><path d="M19 15l-7 4-7-4"/></svg>,
    Lifestyle:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    General:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    Education:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    Shopping:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
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

const categoryOptions = [
  "All","Entertainment","Bills","Groceries","Dining Out","Transportation",
  "Personal Care","Education","Lifestyle","Shopping","General","Income"
];

const sortOptions = [
  { value:'latest',  label:'Latest'   },
  { value:'oldest',  label:'Oldest'   },
  { value:'highest', label:'Highest'  },
  { value:'lowest',  label:'Lowest'   },
  { value:'a-z',     label:'A to Z'   },
  { value:'z-a',     label:'Z to A'   },
];

const TransactionsPage = () => {
  const { transactions, budgets } = useTransactions();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSince    = searchParams.get('since');

  const [sortType,       setSortType]       = useState('latest');
  const [filterCategory, setFilterCategory] = useState(urlCategory || 'All');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage]                      = useState(5);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [openDropdown,   setOpenDropdown]   = useState(null);

  useEffect(() => {
    if (urlCategory && categoryOptions.includes(urlCategory)) setFilterCategory(urlCategory);
  }, [urlCategory]);

  const handleDropdownToggle = (name) =>
    setOpenDropdown(prev => prev === name ? null : name);

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    if (searchTerm)
      result = result.filter(tx => tx.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterCategory !== 'All') {
      result = result.filter(tx => {
        if (tx.category !== filterCategory) return false;
        if (urlSince) return (tx.createdAt||0) >= Number(urlSince);
        const budget = budgets.find(b => b.category === filterCategory);
        return budget ? (tx.createdAt||0) >= (budget.createdAt||0) : true;
      });
    }

    switch (sortType) {
      case 'latest':  result.sort((a,b)=>(new Date(b.date)-new Date(a.date))||b.id-a.id); break;
      case 'oldest':  result.sort((a,b)=>(new Date(a.date)-new Date(b.date))||a.id-b.id); break;
      case 'highest': result.sort((a,b)=>parseFloat(b.amount)-parseFloat(a.amount)); break;
      case 'lowest':  result.sort((a,b)=>parseFloat(a.amount)-parseFloat(b.amount)); break;
      case 'a-z':     result.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'z-a':     result.sort((a,b)=>b.name.localeCompare(a.name)); break;
      default: break;
    }
    return result;
  }, [transactions, budgets, sortType, filterCategory, searchTerm, urlSince]);

  useEffect(() => { setCurrentPage(1); }, [filterCategory, sortType, searchTerm]);

  const totalPages   = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const currentItems = filteredAndSorted.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);
  const handlePageChange = (p) => p > 0 && p <= totalPages && setCurrentPage(p);

  return (
    <div className="tx-page">

      {/* Header */}
      <div className="tx-header">
        <div>
          <div className="tx-header__eyebrow">Spending & Tracking</div>
          <h1>Transactions</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="tx-filters">
        <div className="tx-search-wrap">
          <span className="tx-search-icon"><IcoSearch /></span>
          <input
            type="text"
            placeholder="Search by Recipient / Sender..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tx-dropdowns">
          <CustomDropdown
            options={sortOptions.map(o=>o.value)} selectedValue={sortType} onChange={setSortType}
            labelPrefix="Sort by" displayTransformer={v=>sortOptions.find(o=>o.value===v)?.label||v}
            isOpen={openDropdown==='sort'} onToggle={()=>handleDropdownToggle('sort')}
          />
          <CustomDropdown
            options={categoryOptions} selectedValue={filterCategory} onChange={setFilterCategory}
            labelPrefix="Category"
            isOpen={openDropdown==='category'} onToggle={()=>handleDropdownToggle('category')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="tx-card">
        <div className="tx-table-head">
          <span>Recipient / Sender</span>
          <span>Category</span>
          <span>Transaction Date</span>
          <span style={{textAlign:'right'}}>Amount</span>
        </div>

        <div className="tx-body">
          {currentItems.length === 0 ? (
            <div className="tx-empty">No transactions found.</div>
          ) : currentItems.map(tx => {
            const palette  = CATEGORY_COLORS[tx.category] || { bg:'#F3F4F6', color:'#6B7280' };
            const isIncome = tx.type === 'income';
            const amt      = parseFloat(tx.amount);
            return (
              <div key={tx.id} className="tx-row">
                <div className="tx-recipient">
                  <div className="tx-avatar" style={{ backgroundColor: palette.bg }}>
                    <span style={{ color: palette.color, display:'flex', alignItems:'center' }}>
                      <CategoryIcon category={tx.category} />
                    </span>
                  </div>
                  <p className="tx-name">{tx.name}</p>
                </div>
                <p className="tx-category">{tx.category}</p>
                <p className="tx-date">{tx.date}</p>
                <p className={`tx-amount tx-amount--${isIncome?'income':'expense'}`}>
                  {isIncome ? '+' : '-'}${Math.abs(amt).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        {currentItems.length > 0 && (
          <div className="tx-pagination">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;