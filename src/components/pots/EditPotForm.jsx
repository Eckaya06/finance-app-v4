// src/components/pots/EditPotForm.jsx
import { useState } from 'react';
import './EditPotForm.css';

const themeOptions = [
  { value: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { value: 'cyan',   label: 'Cyan',   color: '#06b6d4' },
  { value: 'green',  label: 'Green',  color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'red',    label: 'Red',    color: '#ef4444' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
];

const sd = {
  wrap: { position: 'relative' },
  swatch: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
};

const EditPotForm = ({ pot, onUpdatePot, onClose }) => {
  const [name, setName] = useState(pot?.name || '');
  const [target, setTarget] = useState(pot?.target || '');
  const [theme, setTheme] = useState(pot?.theme || null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target || parseFloat(target) <= 0 || !theme) {
      alert("Please fill in all fields with valid values.");
      return;
    }
    onUpdatePot(pot.id, { name, target: parseFloat(target), theme });
  };

  const selectedTheme = themeOptions.find(o => o.value === theme);

  return (
    <form onSubmit={handleSubmit} className="edit-pot-form">
      <h2>Edit Pot</h2>
      <p>Update the name, target amount, or theme for this pot.</p>

      <div className="form-group">
        <label htmlFor="pot-name">Pot Name</label>
        <input
          id="pot-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Rainy Day"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="pot-target">Target</label>
        <input
          id="pot-target"
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="e.g., 2000"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Theme</label>
        <div style={sd.wrap}>
          <button
            type="button"
            className="pot-theme-select-btn"
            onClick={() => setIsThemeOpen(!isThemeOpen)}
          >
            {selectedTheme ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ ...sd.swatch, backgroundColor: selectedTheme.color }} />
                <span>{selectedTheme.label}</span>
              </div>
            ) : (
              <span className="pot-theme-placeholder">Choose a theme</span>
            )}
            <span className="pot-theme-arrow" style={{ transform: isThemeOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {isThemeOpen && (
            <ul className="pot-theme-list">
              {themeOptions.map(opt => (
                <li
                  key={opt.value}
                  className="pot-theme-option"
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

export default EditPotForm;