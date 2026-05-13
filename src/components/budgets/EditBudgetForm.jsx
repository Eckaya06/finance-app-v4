// src/components/budgets/EditBudgetForm.jsx
import { useState } from 'react';
import './EditBudgetForm.css';

const themeOptions = [
  { value: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { value: 'cyan',   label: 'Cyan',   color: '#06b6d4' },
  { value: 'green',  label: 'Green',  color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'red',    label: 'Red',    color: '#ef4444' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
];

const categoryOptions = [
  "Entertainment", "Bills", "Groceries", "Dining Out", "Transportation",
  "Personal Care", "Education", "Lifestyle", "Shopping", "General"
];

const sd = {
  wrap: { position: 'relative' },
  btn: {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '10px 14px',
    fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px',
    background: '#fff', cursor: 'pointer', color: '#201F24', textAlign: 'left',
  },
  placeholder: { color: '#9ca3af' },
  arrow: { fontSize: '11px', color: '#6b7280', flexShrink: 0, transition: 'transform 0.2s' },
  list: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100,
    listStyle: 'none', margin: 0, padding: '4px 0',
    maxHeight: '200px', overflowY: 'auto',
  },
  option: {
    padding: '9px 14px', fontSize: '14px', cursor: 'pointer',
    color: '#201F24', display: 'flex', alignItems: 'center', gap: '10px',
  },
  swatch: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
};

const EditBudgetForm = ({ budget, onUpdateBudget, onClose }) => {
  const [category, setCategory] = useState(budget?.category || '');
  const [limit, setLimit] = useState(budget?.limit || budget?.maxSpend || '');
  const [theme, setTheme] = useState(budget?.theme || null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !limit || parseFloat(limit) <= 0 || !theme) {
      alert("Please fill in all fields with valid values.");
      return;
    }
    onUpdateBudget(budget.id, { category, limit: parseFloat(limit), theme });
  };

  const selectedTheme = themeOptions.find(o => o.value === theme);

  return (
    <form onSubmit={handleSubmit} className="edit-budget-form">
      <h2>Edit Budget</h2>
      <p>Update the category, maximum spend, or theme for this budget.</p>

      {/* Budget Category */}
      <div className="form-group">
        <label>Budget Category</label>
        <div style={sd.wrap}>
          <button
            type="button"
            style={sd.btn}
            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsThemeOpen(false); }}
          >
            <span style={!category ? sd.placeholder : {}}>{category || 'Choose a category'}</span>
            <span style={{ ...sd.arrow, transform: isCategoryOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {isCategoryOpen && (
            <ul style={sd.list}>
              {categoryOptions.map(opt => (
                <li
                  key={opt}
                  style={sd.option}
                  onClick={() => { setCategory(opt); setIsCategoryOpen(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Maximum Spend */}
      <div className="form-group">
        <label>Maximum Spend</label>
        <input
          type="number"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          placeholder="e.g., 2000"
          className="form-input"
        />
      </div>

      {/* Theme */}
      <div className="form-group">
        <label>Theme</label>
        <div style={sd.wrap}>
          <button
            type="button"
            style={sd.btn}
            onClick={() => { setIsThemeOpen(!isThemeOpen); setIsCategoryOpen(false); }}
          >
            {selectedTheme ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ ...sd.swatch, backgroundColor: selectedTheme.color }} />
                <span>{selectedTheme.label}</span>
              </div>
            ) : (
              <span style={sd.placeholder}>Choose a theme</span>
            )}
            <span style={{ ...sd.arrow, transform: isThemeOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {isThemeOpen && (
            <ul style={sd.list}>
              {themeOptions.map(opt => (
                <li
                  key={opt.value}
                  style={sd.option}
                  onClick={() => { setTheme(opt.value); setIsThemeOpen(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ ...sd.swatch, backgroundColor: opt.color }} />
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button type="submit" className="form-submit-btn">Save Changes</button>
    </form>
  );
};

export default EditBudgetForm;