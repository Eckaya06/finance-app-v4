import './EmptyState.css';

const EmptyState = ({ title, message, buttonText, onAction, icon, backgroundImage }) => {
  return (
    <div className="empty-state-container">
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt="background"
          className="empty-state-bg-img"
          fetchPriority="high"
        />
      )}

      {backgroundImage && <div className="empty-state-overlay" />}

      <div className="empty-state-content">
        {icon && <div className="empty-state-icon">{icon}</div>}

        <h2 className="empty-state-title">{title}</h2>
        <p className="empty-state-message-text">{message}</p>

        {buttonText && (
          <button
            onClick={onAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              background: '#111827',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'background 150ms, transform 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1f2937';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;