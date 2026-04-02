// Página de Caja Registradora (RF30)
import { useState, useEffect } from 'react';
import { cashRegisterService } from '../services/dataService';
import Modal from '../components/common/Modal';
import { FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CashRegisterPage() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAmount, setOpenAmount] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [currency, setCurrency] = useState('NIO');
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [curRes, histRes] = await Promise.all([
        cashRegisterService.getCurrent(),
        cashRegisterService.getHistory(),
      ]);
      setCurrent(curRes.data.data);
      setHistory(histRes.data.data);
    } catch { /* ignorar */ }
    finally { setLoading(false); }
  };

  const handleOpen = async () => {
    try {
      await cashRegisterService.open({ opening_amount: parseFloat(openAmount), currency });
      toast.success('Caja abierta');
      setShowOpen(false);
      setOpenAmount('');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleClose = async () => {
    try {
      const res = await cashRegisterService.close({ closing_amount: parseFloat(closeAmount) });
      const data = res.data.data;
      const diff = data.difference;
      toast.success(`Caja cerrada. Diferencia: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`);
      setShowClose(false);
      setCloseAmount('');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">💰 Caja Registradora</h1>
        {!current ? (
          <button className="btn btn-success" onClick={() => setShowOpen(true)}>Abrir Caja</button>
        ) : (
          <button className="btn btn-danger" onClick={() => setShowClose(true)}>Cerrar Caja</button>
        )}
      </div>

      {current && (
        <div className="card mb-3" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: 12 }}>✅ Caja Abierta</h3>
          <div className="grid-3">
            <div><strong>Moneda:</strong> {current.currency}</div>
            <div><strong>Monto Apertura:</strong> {current.currency === 'USD' ? '$' : 'C$'}{parseFloat(current.opening_amount).toFixed(2)}</div>
            <div><strong>Abierta:</strong> {new Date(current.opened_at).toLocaleString('es-NI')}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3 className="card-title">Historial de Cajas</h3></div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Usuario</th><th>Moneda</th><th>Apertura</th><th>Cierre</th><th>Esperado</th><th>Diferencia</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {history.map(h => {
                const diff = h.status === 'closed' && h.expected_amount ? parseFloat(h.closing_amount) - parseFloat(h.expected_amount) : null;
                return (
                  <tr key={h.id}>
                    <td>{h.first_name} {h.last_name}</td>
                    <td>{h.currency}</td>
                    <td>{h.currency === 'USD' ? '$' : 'C$'}{parseFloat(h.opening_amount).toFixed(2)}</td>
                    <td>{h.closing_amount ? `${h.currency === 'USD' ? '$' : 'C$'}${parseFloat(h.closing_amount).toFixed(2)}` : '-'}</td>
                    <td>{h.expected_amount ? `${h.currency === 'USD' ? '$' : 'C$'}${parseFloat(h.expected_amount).toFixed(2)}` : '-'}</td>
                    <td className={diff !== null ? (diff >= 0 ? 'text-success' : 'text-danger') + ' font-bold' : ''}>
                      {diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}` : '-'}
                    </td>
                    <td><span className={`badge ${h.status === 'open' ? 'badge-success' : 'badge-info'}`}>{h.status === 'open' ? 'Abierta' : 'Cerrada'}</span></td>
                    <td>{new Date(h.opened_at).toLocaleString('es-NI')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showOpen} onClose={() => setShowOpen(false)} title="Abrir Caja">
        <div className="form-group">
          <label className="form-label">Monto de Apertura</label>
          <input type="number" className="form-input" value={openAmount} onChange={e => setOpenAmount(e.target.value)} min="0" step="0.01" placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">Moneda</label>
          <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="NIO">Córdobas (C$)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowOpen(false)}>Cancelar</button>
          <button className="btn btn-success" onClick={handleOpen}>Abrir Caja</button>
        </div>
      </Modal>

      <Modal isOpen={showClose} onClose={() => setShowClose(false)} title="Cerrar Caja">
        <div className="form-group">
          <label className="form-label">Monto de Cierre (dinero en caja)</label>
          <input type="number" className="form-input" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} min="0" step="0.01" placeholder="0.00" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowClose(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleClose}>Cerrar Caja</button>
        </div>
      </Modal>
    </div>
  );
}
