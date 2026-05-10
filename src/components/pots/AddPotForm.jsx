// src/components/pots/AddPotForm.jsx
import { useState } from 'react';
import './EditPotForm.css'; // Aynı stilleri paylaşıyoruz

const themeOptions = [
  { value: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { value: 'cyan',   label: 'Cyan',   color: '#06b6d4' },
  { value: 'green',  label: 'Green',  color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'red',    label: 'Red',    color: '#ef4444' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
];

const swatch = { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 };

const s = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { fontSize: '20px', fontWeight: '600', margin: '0' },
  desc: { fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  selectWrap: { position: 'relative' },
  submitBtn: {
    width: '100%', padding: '13px', background: '#111', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer', marginTop: '4px',
  },
};

const AddPotForm = ({ onAddPot, onClose }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [theme, setTheme] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target || parseFloat(target) <= 0) {
      alert("Please fill in all fields with valid values.");
      return;
    }
    if (!theme) {
      alert("Please choose a theme.");
      return;
    }
    onAddPot({ name, target: parseFloat(target), theme });
    onClose();
  };

  const selectedTheme = themeOptions.find(o => o.value === theme);

  return (
    <form onSubmit={handleSubmit} style={s.form} className="add-pot-form-wrap">
      <h2 style={s.title} className="add-pot-form-title">Add New Pot</h2>
      <p style={s.desc} className="add-pot-form-desc">Create a pot to help you track savings for special purchases.</p>

      <div style={s.group}>
        <label className="add-pot-form-label">Pot Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Rainy Day"
          className="form-input"
        />
      </div>

      <div style={s.group}>
        <label className="add-pot-form-label">Target</label>
        <input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="e.g., 2000"
          className="form-input"
        />
      </div>

      <div style={s.group}>
        <label className="add-pot-form-label">Theme</label>
        <div style={s.selectWrap}>
          <button
            type="button"
            className="pot-theme-select-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedTheme ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ ...swatch, backgroundColor: selectedTheme.color }} />
                <span>{selectedTheme.label}</span>
              </div>
            ) : (
              <span className="pot-theme-placeholder">Choose a theme</span>
            )}
            <span className="pot-theme-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {isOpen && (
            <ul className="pot-theme-list">
              {themeOptions.map(opt => (
                <li
                  key={opt.value}
                  className="pot-theme-option"
                  onClick={() => { setTheme(opt.value); setIsOpen(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ ...swatch, backgroundColor: opt.color }} />
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button type="submit" style={s.submitBtn} className="add-pot-submit-btn">Add Pot</button>
    </form>
  );
};

export default AddPotForm;