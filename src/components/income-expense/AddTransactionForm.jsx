// src/components/income-expense/AddTransactionForm.jsx
import { useState, useRef, useEffect } from 'react';

const expenseCategories = [
  'Entertainment', 'Bills', 'Groceries', 'Dining Out', 'Transportation',
  'Personal Care', 'Education', 'Lifestyle', 'Shopping', 'General'
];

const AddTransactionForm = ({ onAdd, onClose }) => {
  const [type, setType] = useState('expense');
  const [formData, setFormData] = useState({
    name: '', category: '', amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (cat) => {
    setFormData({ ...formData, category: cat === 'Select Category' ? '' : cat });
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category && type === 'expense') {
      alert("Please select a category");
      return;
    }
    onAdd({
      ...formData,
      category: type === 'income' ? 'Income' : formData.category,
      type,
      id: Date.now(),
    });
    onClose();
  };

  const isExpense = type === 'expense';

  return (
    <div className="ie-add-form-wrapper">
      <h2 className="ie-add-form-title">Add New Transaction</h2>
      <p className="ie-add-form-desc">Fill in the details to log your {isExpense ? 'spending' : 'earnings'}.</p>

      <div className="ie-add-form-type-selector">
        <button
          type="button"
          className={`ie-add-form-type-btn${isExpense ? ' active expense' : ''}`}
          onClick={() => { setType('expense'); setFormData({ ...formData, category: '' }); }}
        >
          Expense
        </button>
        <button
          type="button"
          className={`ie-add-form-type-btn${!isExpense ? ' active income' : ''}`}
          onClick={() => { setType('income'); setFormData({ ...formData, category: 'Income' }); }}
        >
          Income
        </button>
      </div>

      <form onSubmit={handleSubmit} className="ie-add-form-fields">

        <div className="ie-add-form-group">
          <label className="ie-add-form-label">Category</label>
          {!isExpense ? (
            <div className="ie-add-form-readonly">Salary / Income</div>
          ) : (
            <div className="ie-add-form-select-wrap" ref={dropdownRef}>
              <button
                type="button"
                className="ie-add-form-select-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={!formData.category ? 'placeholder' : ''}>
                  {formData.category || 'Select Category'}
                </span>
                <span className="ie-add-form-arrow" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {isDropdownOpen && (
                <ul className="ie-add-form-dropdown">
                  {expenseCategories.map(cat => (
                    <li
                      key={cat}
                      className={formData.category === cat ? 'selected' : ''}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="ie-add-form-group">
          <label className="ie-add-form-label">{isExpense ? 'Paid to' : 'Received from'}</label>
          <input
            type="text"
            className="ie-add-form-input"
            placeholder={isExpense ? 'e.g. Burger King' : 'e.g. Company Name'}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="ie-add-form-group">
          <label className="ie-add-form-label">Amount</label>
          <input
            type="number"
            step="0.01"
            className="ie-add-form-input"
            placeholder="0.00"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <div className="ie-add-form-group">
          <label className="ie-add-form-label">Date</label>
          <input
            type="date"
            className="ie-add-form-input"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className={`ie-add-form-submit${!isExpense ? ' income' : ''}`}
        >
          Add {isExpense ? 'Expense' : 'Income'}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;