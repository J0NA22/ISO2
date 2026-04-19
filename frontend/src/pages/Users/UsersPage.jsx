// src/pages/Users/UsersPage.jsx
// Gestión de usuarios y roles

import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', username: '', password: '', roleId: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([usersAPI.list(), usersAPI.roles()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.password || !form.roleId) {
      toast.error('Completa todos los campos'); return;
    }
    setSubmitting(true);
    try {
      await usersAPI.create({ ...form, roleId: parseInt(form.roleId) });
      toast.success('Usuario creado');
      setShowForm(false);
      setForm({ fullName: '', username: '', password: '', roleId: '' });
      load();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      await usersAPI.update(id, { status: 'INACTIVE' });
      toast.success('Usuario desactivado');
      load();
    } catch {}
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Usuarios</h1>
          <p className="text-muted text-sm">Gestión de accesos y roles del sistema</p>
        </div>
        <button id="new-user-btn" className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Último login</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {u.fullName.charAt(0)}
                        </div>
                        {u.fullName}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>@{u.username}</td>
                    <td><span className="badge badge-purple">{u.role?.name}</span></td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status === 'ACTIVE' ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td className="text-muted text-sm">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-NI') : 'Nunca'}
                    </td>
                    <td>
                      {u.status === 'ACTIVE' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDeactivate(u.id)}>
                          Desactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear usuario */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuevo Usuario</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input id="user-fullname" className="form-input" required maxLength={200}
                    value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre de Usuario *</label>
                    <input id="user-username" className="form-input" required maxLength={50}
                      pattern="[a-zA-Z0-9._-]+"
                      value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.trim() })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contraseña * (mín. 8 car.)</label>
                    <input id="user-password" className="form-input" type="password" required minLength={8}
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Rol *</label>
                  <select id="user-role" className="form-select" required
                    value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                    <option value="">Selecciona un rol...</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.description}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button id="submit-user" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
