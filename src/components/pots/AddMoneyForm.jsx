// src/components/pots/AddMoneyForm.jsx
import { useState, useEffect } from 'react';
import './AddMoneyForm.css';

const themeColors = {
  blue: '#3b82f6', cyan: '#06b6d4', green: '#22c55e',
  orange: '#f97316', indigo: '#6366f1', red: '#ef4444', purple: '#8b5cf6',
};

const AddMoneyForm = ({ pot, onConfirm, onClose }) => {
  const [amountToAdd, setAmountToAdd] = useState('');
  const [newAmount, setNewAmount] = useState(pot.saved);
  const [newProgress, setNewProgress] = useState(0);

  useEffect(() => {
    const added = parseFloat(amountToAdd) || 0;
    const total = pot.saved + added;
    setNewAmount(total);
    setNewProgress(pot.target > 0 ? Math.min((total / pot.target) * 100, 100) : 0);
  }, [amountToAdd, pot.saved, pot.target]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const added = parseFloat(amountToAdd);
    if (isNaN(added) || added <= 0) {
      alert("Please enter a valid amount to add.");
      return;
    }
    onConfirm(pot.id, added);
    onClose();
  };

  const fillColor = themeColors[pot.theme] || '#6366f1';

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="add-money-title" style={{ fontSize: '20px', fontWeight: '600', margin: '0', color: '#111' }}>
        Add to '{pot.name}'
      </h2>
      <p className="add-money-desc" style={{ fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' }}>
        Add money to your pot to keep it separate from your main balance.
      </p>

      <div className="add-money-preview" style={{
        background: '#f9fafb', borderRadius: '8px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        <p className="add-money-preview-label" style={{
          fontSize: '12px', color: '#9ca3af', margin: '0',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>New Amount</p>
        <p className="add-money-preview-amount" style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0' }}>
          ${newAmount.toFixed(2)}
        </p>
        <div className="add-money-preview-track" style={{
          height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            transition: 'width 0.3s ease',
            width: `${newProgress}%`,
            backgroundColor: fillColor,
          }} />
        </div>
        <div className="add-money-preview-meta" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '13px', color: '#6b7280',
        }}>
          <span>{newProgress.toFixed(0)}%</span>
          <span>Target of ${pot.target.toFixed(0)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="add-money-label" style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
          Amount to Add
        </label>
        <div className="add-money-input-wrap" style={{
          display: 'flex', alignItems: 'center',
          border: '1px solid #d1d5db', borderRadius: '8px',
          overflow: 'hidden', background: '#fff',
        }}>
          <span className="add-money-prefix" style={{
            padding: '10px 12px', fontSize: '14px', color: '#6b7280',
            borderRight: '1px solid #d1d5db', background: '#f9fafb', userSelect: 'none',
          }}>$</span>
          <input
            type="number"
            value={amountToAdd}
            onChange={e => setAmountToAdd(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="add-money-input"
            style={{
              flex: 1, padding: '10px 14px', fontSize: '14px',
              border: 'none', outline: 'none', color: '#111', background: 'transparent',
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        className="add-money-submit"
        style={{
          width: '100%', padding: '13px', background: '#111', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '15px',
          fontWeight: '500', cursor: 'pointer',
        }}
      >
        Confirm Addition
      </button>
    </form>
  );
};

export default AddMoneyForm;