// src/components/budgets/AddBudgetForm.jsx
import { useState } from 'react';
import './AddBudgetForm.css';

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

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { fontSize: '20px', fontWeight: '600', margin: '0', color: '#111' },
  description: { fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  selectContainer: { position: 'relative' },
  selectButton: {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '10px 14px', fontSize: '14px',
    border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff',
    cursor: 'pointer', color: '#111', textAlign: 'left',
  },
  placeholder: { color: '#9ca3af' },
  arrow: { fontSize: '11px', color: '#6b7280', transition: 'transform 0.2s', flexShrink: 0 },
  arrowOpen: { transform: 'rotate(180deg)' },
  optionsList: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100,
    listStyle: 'none', margin: 0, padding: '4px 0', maxHeight: '200px', overflowY: 'auto',
  },
  option: {
    padding: '9px 14px', fontSize: '14px', cursor: 'pointer',
    color: '#111', display: 'flex', alignItems: 'center', gap: '10px',
  },
  inputWrapper: {
    display: 'flex', alignItems: 'center', border: '1px solid #d1d5db',
    borderRadius: '8px', overflow: 'hidden', background: '#fff',
  },
  prefix: {
    padding: '10px 12px', fontSize: '14px', color: '#6b7280',
    borderRight: '1px solid #d1d5db', background: '#f9fafb', userSelect: 'none',
  },
  input: { flex: 1, padding: '10px 14px', fontSize: '14px', border: 'none', outline: 'none', color: '#111', background: 'transparent' },
  swatch: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
  submitBtn: {
    width: '100%', padding: '13px', background: '#111', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500',
    cursor: 'pointer', marginTop: '4px',
  },
};

const AddBudgetForm = ({ onAddBudget, onClose }) => {
  const [category, setCategory] = useState(null);
  const [maxSpend, setMaxSpend] = useState('');
  const [theme, setTheme] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!category || !maxSpend || parseFloat(maxSpend) <= 0 || !theme) {
      alert("Please fill in all fields correctly.");
      return;
    }
    onAddBudget({ category, maxSpend: parseFloat(maxSpend), theme });
    onClose();
  };

  const handleThemeSelect = (selectedTheme) => { setTheme(selectedTheme); setIsThemeOpen(false); };
  const handleCategorySelect = (selectedCategory) => { setCategory(selectedCategory); setIsCategoryOpen(false); };
  const selectedThemeObject = themeOptions.find(opt => opt.value === theme);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title} className="add-budget-form-title">Add New Budget</h2>
      <p style={styles.description} className="add-budget-form-desc">
        Choose a category to set a spending budget. These categories can help you monitor spending.
      </p>

      {/* Budget Category */}
      <div style={styles.formGroup}>
        <label style={styles.label} className="add-budget-form-label">Budget Category</label>
        <div style={styles.selectContainer}>
          <button
            type="button"
            style={styles.selectButton}
            className="add-budget-select-btn"
            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsThemeOpen(false); }}
          >
            <span className={!category ? 'add-budget-placeholder' : ''} style={!category ? styles.placeholder : {}}>
              {category || 'Choose a category'}
            </span>
            <span className="add-budget-arrow" style={{ ...styles.arrow, ...(isCategoryOpen ? styles.arrowOpen : {}) }}>▼</span>
          </button>
          {isCategoryOpen && (
            <ul style={styles.optionsList} className="add-budget-options-list">
              {categoryOptions.map(option => (
                <li
                  key={option}
                  style={styles.option}
                  className="add-budget-option-item"
                  onClick={() => handleCategorySelect(option)}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Maximum Spend */}
      <div style={styles.formGroup}>
        <label style={styles.label} className="add-budget-form-label">Maximum Spend</label>
        <div style={styles.inputWrapper} className="add-budget-input-wrapper">
          <span style={styles.prefix} className="add-budget-prefix">$</span>
          <input
            type="number"
            value={maxSpend}
            onChange={(e) => setMaxSpend(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={styles.input}
            className="add-budget-input"
          />
        </div>
      </div>

      {/* Theme */}
      <div style={styles.formGroup}>
        <label style={styles.label} className="add-budget-form-label">Theme</label>
        <div style={styles.selectContainer}>
          <button
            type="button"
            style={styles.selectButton}
            className="add-budget-select-btn"
            onClick={() => { setIsThemeOpen(!isThemeOpen); setIsCategoryOpen(false); }}
          >
            {selectedThemeObject ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ ...styles.swatch, backgroundColor: selectedThemeObject.color }}></span>
                <span>{selectedThemeObject.label}</span>
              </div>
            ) : (
              <span className="add-budget-placeholder" style={styles.placeholder}>Choose a theme</span>
            )}
            <span className="add-budget-arrow" style={{ ...styles.arrow, ...(isThemeOpen ? styles.arrowOpen : {}) }}>▼</span>
          </button>
          {isThemeOpen && (
            <ul style={styles.optionsList} className="add-budget-options-list">
              {themeOptions.map(option => (
                <li
                  key={option.value}
                  style={styles.option}
                  className="add-budget-option-item"
                  onClick={() => handleThemeSelect(option.value)}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ ...styles.swatch, backgroundColor: option.color }}></span>
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button type="submit" style={styles.submitBtn} className="add-budget-submit-btn">Add Budget</button>
    </form>
  );
};

export default AddBudgetForm;