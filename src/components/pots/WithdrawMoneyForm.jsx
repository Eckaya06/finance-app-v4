// src/components/pots/WithdrawMoneyForm.jsx
import { useState, useEffect } from 'react';
import './AddMoneyForm.css'; // Aynı dark mode stilleri paylaşıyoruz

const WithdrawMoneyForm = ({ pot, onConfirm, onClose }) => {
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(pot.saved);
  const [newProgress, setNewProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const withdrawnValue = parseFloat(amountToWithdraw) || 0;
    if (withdrawnValue > pot.saved) {
      setError("Withdrawal amount cannot exceed the saved amount.");
    } else {
      setError('');
    }
    const potentialRemainingAmount = Math.max(0, pot.saved - withdrawnValue);
    setRemainingAmount(potentialRemainingAmount);
    setNewProgress(pot.target > 0 ? (potentialRemainingAmount / pot.target) * 100 : 0);
  }, [amountToWithdraw, pot.saved, pot.target]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const withdrawnValue = parseFloat(amountToWithdraw);
    if (error) return;
    if (isNaN(withdrawnValue) || withdrawnValue <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (withdrawnValue > pot.saved) {
      setError("Withdrawal amount cannot exceed the saved amount.");
      return;
    }
    onConfirm(pot.id, withdrawnValue);
    onClose();
  };

  const isInvalid = error || isNaN(parseFloat(amountToWithdraw)) || parseFloat(amountToWithdraw) <= 0;

  return (
    <form onSubmit={handleSubmit} className="withdraw-money-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="withdraw-title" style={{ fontSize: '20px', fontWeight: '600', margin: '0', color: '#111' }}>
        Withdraw from '{pot.name}'
      </h2>
      <p className="withdraw-desc" style={{ fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' }}>
        Withdraw money from your pot. This will be added back to your main balance.
      </p>

      <div className="preview-section" style={{
        background: '#f9fafb', borderRadius: '8px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        <p className="preview-label" style={{
          fontSize: '12px', color: '#9ca3af', margin: '0',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>Remaining Amount</p>
        <p className="preview-amount" style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0' }}>
          ${remainingAmount.toFixed(2)}
        </p>
        <div className="progress-bar preview-progress" style={{
          height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden',
        }}>
          <div
            className={`progress-bar-fill theme-${pot.theme}`}
            style={{ height: '100%', borderRadius: '99px', width: `${Math.min(newProgress, 100)}%`, transition: 'width 0.3s ease' }}
          />
        </div>
        <div className="preview-target" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '13px', color: '#6b7280',
        }}>
          <span>{Math.min(newProgress, 100).toFixed(0)}%</span>
          <span>Target of ${pot.target.toFixed(0)}</span>
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="amount-to-withdraw" style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
          Amount to Withdraw
        </label>
        <input
          id="amount-to-withdraw"
          type="number"
          value={amountToWithdraw}
          onChange={(e) => setAmountToWithdraw(e.target.value)}
          placeholder="$ 20"
          step="0.01"
          className={error ? 'input-error' : ''}
          style={{
            padding: '10px 14px', fontSize: '14px',
            border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '8px', outline: 'none',
            color: '#111', background: '#fff', width: '100%', boxSizing: 'border-box',
          }}
        />
        {error && <p className="form-error" style={{ color: '#ef4444', fontSize: '12px', margin: '0' }}>{error}</p>}
      </div>

      <button
        type="submit"
        className="btn-primary form-submit-btn"
        disabled={isInvalid}
        style={{
          width: '100%', padding: '13px', background: isInvalid ? '#9ca3af' : '#111',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '15px', fontWeight: '500',
          cursor: isInvalid ? 'not-allowed' : 'pointer',
        }}
      >
        Confirm Withdrawal
      </button>
    </form>
  );
};

export default WithdrawMoneyForm;