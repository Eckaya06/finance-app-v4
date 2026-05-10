// src/components/pots/DeletePotModal.jsx
import React from 'react';

const s = {
  container: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { margin: '0', fontSize: '1.75rem', fontWeight: '700', color: '#201F24' },
  desc: { margin: '0 0 0.5rem', color: '#696868', fontSize: '14px', lineHeight: '1.5' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  confirmBtn: {
    width: '100%', padding: '16px', border: 'none', borderRadius: '8px',
    background: '#C94736', color: '#fff', fontSize: '14px',
    fontWeight: '700', cursor: 'pointer',
  },
  cancelBtn: {
    width: '100%', padding: '14px', border: '1px solid #d1d5db',
    borderRadius: '8px', background: '#fff', color: '#374151',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  },
};

const DeletePotModal = ({ pot, onConfirm, onClose }) => {
  return (
    <div style={s.container}>
      <h2 style={s.title}>Delete '{pot?.name}'?</h2>
      <p style={s.desc}>
        Are you sure you want to delete this pot? This action cannot be reversed,
        and all the data inside it will be removed forever.
      </p>
      <div style={s.actions}>
        <button style={s.confirmBtn} onClick={onConfirm}>
          Yes, Confirm Deletion
        </button>
        <button style={s.cancelBtn} onClick={onClose}>
          No, Go Back
        </button>
      </div>
    </div>
  );
};

export default DeletePotModal;