import { useState, useEffect, useMemo } from 'react';
import './PotsPage.css';
import PotCard from '../../components/pots/PotCard.jsx';
import Modal from '../../components/modal/Modal.jsx';
import AddPotForm from '../../components/pots/AddPotForm.jsx';
import EditPotForm from '../../components/pots/EditPotForm.jsx';
import AddMoneyForm from '../../components/pots/AddMoneyForm.jsx';
import WithdrawMoneyForm from '../../components/pots/WithdrawMoneyForm.jsx';
import EmptyState from '../../components/emptystate/EmptyState.jsx';
import emptyPotsImage from '../../assets/empty-pots.png';
import DeleteConfirmationModal from '../../components/modal/DeleteConfirmationModal.jsx';
import { useTransactions } from '../../context/TransactionContext.jsx';
import { useCurrency } from '../../hooks/useCurrency.js';

const PotsPage = () => {
  const { pots, addPot, deletePot, updatePotBalance, updatePot } = useTransactions();
  const { fmt } = useCurrency();

  const [potActionError, setPotActionError]           = useState({ potId: null, message: '' });
  const [openOptionsMenuId, setOpenOptionsMenuId]     = useState(null);
  const [isAddPotModalOpen, setIsAddPotModalOpen]     = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen]     = useState(false);
  const [isEditPotModalOpen, setIsEditPotModalOpen]   = useState(false);
  const [selectedPot, setSelectedPot]                 = useState(null);
  const [ready, setReady]                             = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const stats = useMemo(() => {
    const totalSaved  = pots.reduce((s, p) => s + (p.saved  || 0), 0);
    const totalTarget = pots.reduce((s, p) => s + (p.target || 0), 0);
    const overallPct  = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;
    const completed   = pots.filter(p => p.target > 0 && p.saved >= p.target).length;
    return { totalSaved, totalTarget, overallPct, completed };
  }, [pots]);

  const handleCreatePot = async (data) => {
    await addPot({ name: data.name, saved: 0, target: data.target, theme: data.theme });
    setIsAddPotModalOpen(false);
  };

  const handleOptionsToggle = (potId) =>
    setOpenOptionsMenuId(prev => prev === potId ? null : potId);

  const openAddMoneyModal = (potId) => {
    const pot = pots.find(p => p.id === potId);
    if (pot) { setSelectedPot(pot); setIsAddMoneyModalOpen(true); }
  };

  const handleConfirmAddition = async (potId, amount) => {
    const pot = pots.find(p => p.id === potId);
    if (pot) await updatePotBalance(potId, pot.saved + amount);
    setIsAddMoneyModalOpen(false); setSelectedPot(null);
  };

  const openWithdrawModal = (potId) => {
    const pot = pots.find(p => p.id === potId);
    if (!pot) return;
    if (pot.saved <= 0) {
      setPotActionError({ potId, message: 'Please add money first.' });
      setTimeout(() => setPotActionError({ potId: null, message: '' }), 2000);
    } else { setSelectedPot(pot); setIsWithdrawModalOpen(true); }
  };

  const handleConfirmWithdrawal = async (potId, amount) => {
    const pot = pots.find(p => p.id === potId);
    if (pot) await updatePotBalance(potId, Math.max(0, pot.saved - amount));
    setIsWithdrawModalOpen(false); setSelectedPot(null);
  };

  const handleUpdatePot = async (potId, data) => {
    await updatePot(potId, data);
    setIsEditPotModalOpen(false); setSelectedPot(null);
  };

  const openEditModal = (potId) => {
    const pot = pots.find(p => p.id === potId);
    if (pot) { setSelectedPot(pot); setIsEditPotModalOpen(true); setOpenOptionsMenuId(null); }
  };

  const openDeleteModal = (potId) => {
    const pot = pots.find(p => p.id === potId);
    if (pot) { setSelectedPot(pot); setIsDeleteModalOpen(true); setOpenOptionsMenuId(null); }
  };

  const handleDeletePot = async (potId) => {
    await deletePot(potId);
    setIsDeleteModalOpen(false); setSelectedPot(null);
  };

  useEffect(() => {
    if (openOptionsMenuId === null && potActionError.potId === null) return;
    const handler = (e) => {
      if (openOptionsMenuId !== null &&
          !e.target.closest('.pot-options-btn') &&
          !e.target.closest('.pot-options-menu'))
        setOpenOptionsMenuId(null);
      if (potActionError.potId !== null &&
          !e.target.closest(`.pot-card[data-pot-id="${potActionError.potId}"]`))
        setPotActionError({ potId: null, message: '' });
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openOptionsMenuId, potActionError]);

  return (
    <div className={`pp-page${ready ? ' pp-page--ready' : ''}`}>
      <header className="pp-header">
        <div>
          <p className="pp-breadcrumb">Pots <span className="pp-breadcrumb__sep">/</span> Overview</p>
          <p className="pp-header__sub">
            {pots.length} pot{pots.length !== 1 ? 's' : ''}
            {stats.completed > 0
              ? ` · ${stats.completed} goal${stats.completed !== 1 ? 's' : ''} reached`
              : ' · Keep saving!'}
          </p>
        </div>
        <button className="pp-add-btn" onClick={() => setIsAddPotModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Pot
        </button>
      </header>

      {pots.length === 0 ? (
        <EmptyState
          title="Create Your First Pot"
          message="Pots help you save for specific goals. Create your first pot and start tracking your progress!"
          buttonText="+ Create First Pot"
          onAction={() => setIsAddPotModalOpen(true)}
          backgroundImage={emptyPotsImage}
        />
      ) : (
        <>
          <div className="pp-kpis">
            <div className="pp-kpi" style={{ animationDelay: '0ms' }}>
              <div className="pp-kpi__top"><span className="pp-kpi__icon">◎</span><p className="pp-kpi__label">Total Saved</p></div>
              <p className="pp-kpi__value">{fmt(stats.totalSaved)}</p>
              <p className="pp-kpi__sub">{pots.length} active pots</p>
            </div>
            <div className="pp-kpi" style={{ animationDelay: '80ms' }}>
              <div className="pp-kpi__top"><span className="pp-kpi__icon">◈</span><p className="pp-kpi__label">Total Target</p></div>
              <p className="pp-kpi__value">{fmt(stats.totalTarget)}</p>
              <p className="pp-kpi__sub">Across all pots</p>
            </div>
            <div className="pp-kpi" style={{ animationDelay: '160ms' }}>
              <div className="pp-kpi__top"><span className="pp-kpi__icon">↑</span><p className="pp-kpi__label">Overall Progress</p></div>
              <p className="pp-kpi__value">{stats.overallPct.toFixed(1)}%</p>
              <p className="pp-kpi__sub" style={{ color: stats.completed > 0 ? '#10B981' : '#9CA3AF' }}>
                {stats.completed} of {pots.length} goals reached
              </p>
            </div>
          </div>

          <div className="pp-overall">
            <div className="pp-overall__bar">
              <div className="pp-overall__fill" style={{ width: `${stats.overallPct}%` }} />
            </div>
            <div className="pp-overall__labels">
              <span style={{ color: '#10B981' }}>{stats.overallPct.toFixed(1)}% saved</span>
              <span>{(100 - stats.overallPct).toFixed(1)}% remaining</span>
            </div>
          </div>

          <div className="pp-grid">
            {pots.map(pot => (
              <PotCard
                key={pot.id} pot={pot} fmt={fmt}
                onAddMoneyClick={openAddMoneyModal}
                onWithdrawClick={openWithdrawModal}
                potActionError={potActionError}
                onOptionsToggle={handleOptionsToggle}
                isOptionsMenuOpen={openOptionsMenuId === pot.id}
                onDeleteClick={openDeleteModal}
                onEditClick={openEditModal}
              />
            ))}
          </div>
        </>
      )}

      <Modal isOpen={isAddPotModalOpen} onClose={() => setIsAddPotModalOpen(false)}>
        <AddPotForm onAddPot={handleCreatePot} onClose={() => setIsAddPotModalOpen(false)} />
      </Modal>

      {selectedPot && isEditPotModalOpen && (
        <Modal isOpen onClose={() => { setIsEditPotModalOpen(false); setSelectedPot(null); }}>
          <EditPotForm pot={selectedPot} onUpdatePot={handleUpdatePot} onClose={() => { setIsEditPotModalOpen(false); setSelectedPot(null); }} />
        </Modal>
      )}

      {selectedPot && isAddMoneyModalOpen && (
        <Modal isOpen onClose={() => { setIsAddMoneyModalOpen(false); setSelectedPot(null); }}>
          <AddMoneyForm pot={selectedPot} onConfirm={handleConfirmAddition} onClose={() => { setIsAddMoneyModalOpen(false); setSelectedPot(null); }} />
        </Modal>
      )}

      {selectedPot && isWithdrawModalOpen && (
        <Modal isOpen onClose={() => { setIsWithdrawModalOpen(false); setSelectedPot(null); }}>
          <WithdrawMoneyForm pot={selectedPot} onConfirm={handleConfirmWithdrawal} onClose={() => { setIsWithdrawModalOpen(false); setSelectedPot(null); }} />
        </Modal>
      )}

      {selectedPot && isDeleteModalOpen && (
        <Modal isOpen onClose={() => { setIsDeleteModalOpen(false); setSelectedPot(null); }}>
          <DeleteConfirmationModal potName={selectedPot.name} onConfirm={() => handleDeletePot(selectedPot.id)} onCancel={() => { setIsDeleteModalOpen(false); setSelectedPot(null); }} />
        </Modal>
      )}
    </div>
  );
};

export default PotsPage;