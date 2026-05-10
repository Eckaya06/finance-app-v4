import './PotCard.css';
import { FiMoreHorizontal } from 'react-icons/fi';

const PotCard = ({
  pot, fmt,
  onAddMoneyClick, onWithdrawClick,
  potActionError, onOptionsToggle,
  isOptionsMenuOpen, onDeleteClick, onEditClick,
}) => {
  if (!pot) return null;

  // fmt prop gelmezse basit fallback
  const format = fmt || ((n) => `$${Number(n || 0).toFixed(2)}`);

  const progressPercentage = pot.target > 0 ? Math.min(100, (pot.saved / pot.target) * 100) : 0;
  const showError = potActionError && potActionError.potId === pot.id;

  return (
    <div className={`pot-card theme-${pot.theme}`} data-pot-id={pot.id}>
      <div className="pot-card-header">
        <div className="pot-icon" />
        <h3>{pot.name}</h3>

        <button
          className="pot-options-btn"
          onClick={(e) => { e.stopPropagation(); onOptionsToggle(pot.id); }}
        >
          <FiMoreHorizontal size={18} />
        </button>

        {isOptionsMenuOpen && (
          <div className="pot-options-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEditClick(pot.id)}>Edit Pot</button>
            <button onClick={() => onDeleteClick(pot.id)} className="delete">Delete Pot</button>
          </div>
        )}
      </div>

      <div className="pot-amounts">
        <p className="amount-label">Total Saved</p>
        <p className="amount-saved">{format(pot.saved)}</p>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="pot-target">
        <span>{progressPercentage.toFixed(0)}%</span>
        <span>Target of {format(pot.target)}</span>
      </div>

      <div className="pot-actions">
        <button className="btn-secondary" onClick={() => onAddMoneyClick(pot.id)}>
          + Add Money
        </button>
        <button className="btn-secondary" onClick={() => onWithdrawClick(pot.id)}>
          Withdraw
        </button>
      </div>

      {showError && <p className="pot-action-error">{potActionError.message}</p>}
    </div>
  );
};

export default PotCard;