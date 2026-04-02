// Página de Configuración (RF27 - Precios e impuestos)
import { useState, useEffect } from 'react';
import { configService } from '../services/dataService';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    try {
      const res = await configService.getPriceConfigs();
      setConfigs(res.data.data);
    } catch { toast.error('Error al cargar configuración'); }
    finally { setLoading(false); }
  };

  const handleSave = async (config) => {
    try {
      await configService.updatePriceConfig(config.id, config);
      toast.success('Configuración guardada');
    } catch { toast.error('Error al guardar'); }
  };

  const updateConfig = (index, field, value) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">⚙️ Configuración</h1>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">💰 Configuración de Precios e Impuestos</h3>
        </div>
        <p className="text-muted mb-3" style={{fontSize:'0.9rem'}}>
          Configure la tasa de impuestos y tipo de cambio para cada moneda. Estos valores se aplican automáticamente en las ventas.
        </p>

        {configs.map((config, i) => (
          <div key={config.id} className="card mb-2" style={{ border: config.is_default ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
            {config.is_default && <span className="badge badge-primary mb-2">Moneda Predeterminada</span>}
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={config.name} onChange={e => updateConfig(i, 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select className="form-select" value={config.currency} onChange={e => updateConfig(i, 'currency', e.target.value)}>
                  <option value="NIO">Córdobas (NIO)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tasa de Impuesto (%)</label>
                <input type="number" className="form-input" value={config.tax_rate} onChange={e => updateConfig(i, 'tax_rate', e.target.value)} min="0" max="100" step="0.01" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Cambio (1 USD = X NIO)</label>
                <input type="number" className="form-input" value={config.exchange_rate} onChange={e => updateConfig(i, 'exchange_rate', e.target.value)} min="0" step="0.0001" />
              </div>
              <div className="form-group" style={{display:'flex', alignItems:'flex-end'}}>
                <button className="btn btn-primary" onClick={() => handleSave(config)}>
                  <FiSave /> Guardar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏪 Información de la Tienda</h3>
        </div>
        <div className="grid-2">
          <div><strong>Nombre:</strong> Zuleyka's Closet</div>
          <div><strong>Tipo:</strong> Tienda de Ropa</div>
          <div><strong>Sistema:</strong> POS v1.0</div>
          <div><strong>Base de Datos:</strong> PostgreSQL</div>
        </div>
      </div>
    </div>
  );
}
