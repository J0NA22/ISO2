// Dashboard — Vista principal con métricas y reportes
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService, saleService } from '../services/dataService';
import { FiShoppingCart, FiDollarSign, FiPackage, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, salesRes] = await Promise.all([
        reportService.dashboard(),
        saleService.getAll({ limit: 5 }),
      ]);
      setStats(dashRes.data.data);
      setRecentSales(salesRes.data.data);
    } catch (err) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;
  }

  const statCards = stats ? [
    { icon: <FiShoppingCart />, label: 'Ventas Hoy', value: stats.salesToday?.count || 0, type: 'primary' },
    { icon: <FiDollarSign />, label: 'Ingresos Hoy', value: `C$${parseFloat(stats.salesToday?.total || 0).toFixed(2)}`, type: 'success' },
    { icon: <FiPackage />, label: 'Productos', value: stats.totalProducts, type: 'info' },
    { icon: <FiUsers />, label: 'Clientes', value: stats.totalCustomers, type: 'primary' },
    { icon: <FiAlertTriangle />, label: 'Stock Bajo', value: stats.lowStockCount, type: stats.lowStockCount > 0 ? 'danger' : 'success' },
  ] : [];

  // Datos de ejemplo para gráfica (se llenarán con datos reales de la API)
  const chartData = [
    { name: 'Lun', ventas: 12 }, { name: 'Mar', ventas: 19 },
    { name: 'Mié', ventas: 15 }, { name: 'Jue', ventas: 22 },
    { name: 'Vie', ventas: 28 }, { name: 'Sáb', ventas: 35 },
    { name: 'Dom', ventas: 18 },
  ];

  const pieData = [
    { name: 'Efectivo', value: 45, color: '#B8945F' },
    { name: 'Tarjeta', value: 30, color: '#4CAF50' },
    { name: 'Transferencia', value: 25, color: '#2196F3' },
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted">Bienvenido, {user?.firstName} 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${stat.type}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">📊 Ventas de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DE" />
              <XAxis dataKey="name" tick={{ fill: '#9A9A9A', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E8E4DE' }}
              />
              <Bar dataKey="ventas" fill="#B8945F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">💳 Métodos de Pago</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="dashboard-recent mt-3">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🧾 Ventas Recientes</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº Venta</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted" style={{padding:'24px'}}>No hay ventas recientes</td></tr>
                ) : recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td><strong>{sale.sale_number}</strong></td>
                    <td>{sale.customer_name ? `${sale.customer_name} ${sale.customer_last_name}` : 'Consumidor Final'}</td>
                    <td className="font-bold">{sale.currency === 'USD' ? '$' : 'C$'}{parseFloat(sale.total).toFixed(2)}</td>
                    <td>{sale.payment_method}</td>
                    <td>
                      <span className={`badge ${sale.status === 'completada' ? 'badge-success' : 'badge-danger'}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td>{new Date(sale.created_at).toLocaleDateString('es-NI')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
