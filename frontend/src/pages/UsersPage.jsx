// Página de Usuarios (RF21, RF22, RF23)
import { useState, useEffect } from 'react';
import { userService, authService } from '../services/dataService';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({ username:'', email:'', password:'', first_name:'', last_name:'', role_id:'', is_active: true });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([userService.getAll(), userService.getRoles()]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await authService.register(formData);
        toast.success('Usuario registrado');
      } else {
        await userService.update(selectedUser.id, formData);
        toast.success('Usuario actualizado');
      }
      setShowForm(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    try {
      await userService.changePassword(selectedUser.id, newPassword);
      toast.success('Contraseña actualizada');
      setShowPassword(false);
      setNewPassword('');
    } catch { toast.error('Error al cambiar contraseña'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try { await userService.delete(id); toast.success('Usuario desactivado'); loadData(); }
    catch { toast.error('Error'); }
  };

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">👤 Usuarios</h1>
        <button className="btn btn-primary" onClick={() => {
          setIsNew(true);
          setFormData({ username:'', email:'', password:'', first_name:'', last_name:'', role_id: roles[0]?.id || '', is_active: true });
          setShowForm(true);
        }}><FiPlus /> Nuevo Usuario</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Usuario</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registrado</th><th>Acciones</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role_name==='admin'?'badge-danger':u.role_name==='gerente'?'badge-warning':'badge-info'}`}>{u.role_name}</span></td>
                  <td><span className={`badge ${u.is_active?'badge-success':'badge-danger'}`}>{u.is_active?'Activo':'Inactivo'}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('es-NI')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon btn-ghost" onClick={() => {
                        setSelectedUser(u); setIsNew(false);
                        setFormData({ email:u.email, first_name:u.first_name, last_name:u.last_name, role_id:u.role_id, is_active:u.is_active });
                        setShowForm(true);
                      }}><FiEdit /></button>
                      <button className="btn-icon btn-ghost" onClick={() => { setSelectedUser(u); setShowPassword(true); }}><FiLock /></button>
                      <button className="btn-icon btn-ghost text-danger" onClick={() => handleDelete(u.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={isNew ? 'Nuevo Usuario' : 'Editar Usuario'}>
        <form onSubmit={handleSubmit}>
          {isNew && (
            <div className="form-group"><label className="form-label">Usuario *</label><input className="form-input" value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} required /></div>
          )}
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={formData.first_name} onChange={e=>setFormData({...formData, first_name:e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Apellido *</label><input className="form-input" value={formData.last_name} onChange={e=>setFormData({...formData, last_name:e.target.value})} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required /></div>
          {isNew && (
            <div className="form-group"><label className="form-label">Contraseña *</label><input type="password" className="form-input" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} minLength="6" required /></div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select className="form-select" value={formData.role_id} onChange={e=>setFormData({...formData, role_id:parseInt(e.target.value)})} required>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {!isNew && (
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" value={formData.is_active} onChange={e=>setFormData({...formData, is_active:e.target.value==='true'})}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{isNew ? 'Registrar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={showPassword} onClose={() => { setShowPassword(false); setNewPassword(''); }} title={`Cambiar contraseña — ${selectedUser?.username}`}>
        <div className="form-group">
          <label className="form-label">Nueva Contraseña</label>
          <input type="password" className="form-input" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength="6" placeholder="Mínimo 6 caracteres" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowPassword(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleChangePassword}>Cambiar Contraseña</button>
        </div>
      </Modal>
    </div>
  );
}
