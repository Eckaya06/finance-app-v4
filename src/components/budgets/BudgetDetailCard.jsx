import { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import './BudgetDetailCard.css';
import { Link } from 'react-router-dom';

const BudgetDetailCard = ({ budget, onEditRequest, onDeleteRequest }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const spent = Number(budget?.spent ?? 0);
  const max = Number(budget?.maxSpend ?? 0);
  const remaining = max - spent;
  const progressPercentage = max > 0 ? (spent / max) * 100 : 0;

  const theme = themeOptions.find((t) => t.value === budget.theme) || themeOptions[0];

  const latest = Array.isArray(budget?.latestSpending) ? budget.latestSpending : [];

  const handleEdit = () => {
    onEditRequest?.();
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDeleteRequest?.();
    setIsMenuOpen(false);
  };

  return (
    <div className="budget-detail-card" style={{ position: 'relative' }}>
      <div className="card-header">
        <div className="theme-option-display">
          <span className="theme-color-swatch" style={{ backgroundColor: theme.color }}></span>
          <h3>{budget.category}</h3>
        </div>

        <button className="pot-options-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FiMoreHorizontal />
        </button>
      </div>

      {isMenuOpen && (
        <div className="budget-options-menu" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleEdit}>Edit Budget</button>
          <button onClick={handleDelete} className="delete">Delete Budget</button>
        </div>
      )}

      <p className="budget-limit-text">Maximum of ${max.toFixed(2)}</p>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progressPercentage > 100 ? 100 : progressPercentage}%`,
            backgroundColor: theme.color,
          }}
        ></div>
      </div>

      <div className="budget-spend-summary">
        <div className="summary-item">
          <span className="summary-label">Spent</span>
          <span className="summary-value">${spent.toFixed(2)}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Remaining</span>
          <span className={`summary-value ${remaining < 0 ? 'negative' : ''}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="latest-spending">
        <div className="latest-spending-header">
          <h4>Latest Spending</h4>
          <Link to="/transactions" className="see-all-link">
            See All ▸
          </Link>
        </div>

        {latest.length === 0 ? (
          <div className="latest-empty">No spending yet.</div>
        ) : (
          latest.map((tx) => (
            <div className="latest-row" key={tx.id}>
              <div className="latest-left">
                <div className="latest-name">{tx.name}</div>
                <div className="latest-date">{tx.date}</div>
              </div>
              <div className="latest-amount">-${Number(tx.amount).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const themeOptions = [
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'red', label: 'Red', color: '#ef4444' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
];

export default BudgetDetailCard;
