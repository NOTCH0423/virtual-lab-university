'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, Search, Eye, Trash2, 
  Ban, CheckCircle, AlertTriangle,
  RefreshCw, Unlock, Trash,
  X, Crown, GraduationCap, User, Wifi, WifiOff, Activity, Plus, Save
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  university?: string;
  career?: string;
  progress: number;
  lastActive: string;
  createdAt: string;
  achievementsCount: number;
  certificatesCount: number;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<'student' | 'admin'>('student');
  const [creating, setCreating] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    university: '',
    career: '',
  });
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TEACHER',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error fetching users');
      }

      const data = await response.json();
      setUsers(data);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
    } catch (err) {
      setError('Error al cargar usuarios');
      setConnectionStatus('disconnected');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
    
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setActionLoading(userId);
      setShowActions(null);
      
      if (action === 'delete') {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
          return;
        }
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          alert(data.error || 'Error al eliminar usuario');
          return;
        }
      } else {
        let status: string | undefined;
        let role: string | undefined;

        switch (action) {
          case 'suspend':
            status = 'SUSPENDED';
            break;
          case 'activate':
            status = 'ACTIVE';
            break;
          case 'ban':
            status = 'BANNED';
            break;
          case 'make_admin':
            role = 'ADMIN';
            break;
          case 'make_teacher':
            role = 'TEACHER';
            break;
          case 'make_student':
            role = 'STUDENT';
            break;
          default:
            return;
        }

        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, role }),
        });

        if (!response.ok) {
          throw new Error('Error updating user');
        }
      }

      await fetchUsers();
    } catch (err) {
      alert('Error al realizar la acción');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers }),
      });

      if (!response.ok) {
        throw new Error('Error performing bulk action');
      }

      setSelectedUsers([]);
      await fetchUsers();
    } catch (err) {
      alert('Error al realizar la acción');
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const toggleSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.email || !newStudent.password) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          university: '',
          career: '',
        });
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || 'Error al crear el estudiante');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error al crear el estudiante');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email || !newAdmin.password) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
      if (response.ok) {
        setShowCreateAdminModal(false);
        setNewAdmin({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'TEACHER',
        });
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error al crear el usuario');
    } finally {
      setCreating(false);
    }
  };

  const openCreateModal = (type: 'student' | 'admin') => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions && !(event.target as Element).closest('.actions-dropdown')) {
        setShowActions(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { class: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: Crown, color: 'text-red-400' };
      case 'TEACHER':
        return { class: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', icon: GraduationCap, color: 'text-purple-400' };
      default:
        return { class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', icon: User, color: 'text-blue-400' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { class: 'bg-green-500/20 text-green-400', label: 'Activo' };
      case 'SUSPENDED':
        return { class: 'bg-amber-500/20 text-amber-400', label: 'Suspendido' };
      case 'BANNED':
        return { class: 'bg-red-500/20 text-red-400', label: 'Baneado' };
      default:
        return { class: 'bg-gray-500/20 text-gray-400', label: status };
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            Control total sobre los usuarios del sistema
            <span className="ml-2 text-xs text-gray-500">
              • Actualizado {lastUpdate.toLocaleTimeString()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              connectionStatus === 'updating' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {connectionStatus === 'connected' ? <Wifi className="w-3 h-3" /> : 
               connectionStatus === 'updating' ? <Activity className={`w-3 h-3 animate-pulse`} /> :
               <WifiOff className="w-3 h-3" />}
              {connectionStatus === 'connected' ? 'En vivo' : 
               connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchUsers()}
            disabled={connectionStatus === 'updating'}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button 
            onClick={() => openCreateModal('student')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Estudiante
          </button>
          <button 
            onClick={() => setShowCreateAdminModal(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Crear Admin/Profesor
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
          <span className="text-blue-400 font-medium">
            {selectedUsers.length} usuario(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" /> Activar
            </button>
            <button 
              onClick={() => handleBulkAction('suspend')}
              className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 flex items-center gap-1"
            >
              <AlertTriangle className="w-4 h-4" /> Suspender
            </button>
            <button 
              onClick={() => handleBulkAction('ban')}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1"
            >
              <Ban className="w-4 h-4" /> Banear
            </button>
            <button 
              onClick={() => setSelectedUsers([])}
              className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="TEACHER">Profesores</option>
            <option value="STUDENT">Estudiantes</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="BANNED">Baneados</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{filteredUsers.length} usuarios</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actividades</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Última Actividad</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.status);
                const RoleIcon = roleBadge.icon;
                
                return (
                  <tr key={user.id} className={`hover:bg-slate-700/30 ${user.status === 'BANNED' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.role === 'ADMIN' ? 'from-red-500 to-orange-500' : user.role === 'TEACHER' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white font-medium`}>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.name}
                            {user.status !== 'ACTIVE' && (
                              <span className={`w-2 h-2 rounded-full ${user.status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon className={`w-4 h-4 ${roleBadge.color}`} />
                        <select
                          value={user.role}
                          onChange={(e) => handleUserAction(user.id, `make_${e.target.value.toLowerCase()}`)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.class} cursor-pointer disabled:opacity-50`}
                        >
                          <option value="STUDENT">Estudiante</option>
                          <option value="TEACHER">Profesor</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400" title="Logros">
                          {user.achievementsCount} 🏆
                        </span>
                        <span className="text-gray-400" title="Certificados">
                          {user.certificatesCount} 📜
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">{user.lastActive}</td>
                    <td className="px-4 py-4">
                      <div className="relative actions-dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(showActions === user.id ? null : user.id);
                          }}
                          disabled={actionLoading === user.id}
                          className="p-2 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          {actionLoading === user.id ? (
                            <div className="w-5 h-5 animate-spin border-2 border-gray-500 border-t-transparent rounded-full" />
                          ) : (
                            <span className="text-lg">⋮</span>
                          )}
                        </button>
                        
                        {showActions === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                            <div className="p-2">
                              <Link 
                                href={`/profile?user=${user.id}`}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded-lg"
                              >
                                <Eye className="w-4 h-4" /> Ver perfil
                              </Link>
                              <div className="border-t border-slate-700 my-1" />
                              {user.status === 'ACTIVE' ? (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-slate-700 rounded-lg"
                                >
                                  <AlertTriangle className="w-4 h-4" /> Suspender
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-slate-700 rounded-lg"
                                >
                                  <CheckCircle className="w-4 h-4" /> Activar
                                </button>
                              )}
                              {user.status !== 'BANNED' ? (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'ban')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg"
                                >
                                  <Ban className="w-4 h-4" /> Banear
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-slate-700 rounded-lg"
                                >
                                  <Unlock className="w-4 h-4" /> Desbanear
                                </button>
                              )}
                              <div className="border-t border-slate-700 my-1" />
                              <button 
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg"
                              >
                                <Trash className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'ACTIVE').length}</div>
              <div className="text-sm text-gray-400">Usuarios Activos</div>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${users.length > 0 ? (users.filter(u => u.status === 'ACTIVE').length / users.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'SUSPENDED').length}</div>
              <div className="text-sm text-gray-400">Suspendidos</div>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${users.length > 0 ? (users.filter(u => u.status === 'SUSPENDED').length / users.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'BANNED').length}</div>
              <div className="text-sm text-gray-400">Baneados</div>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${users.length > 0 ? (users.filter(u => u.status === 'BANNED').length / users.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {showCreateModal && createModalType === 'student' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                Crear Nuevo Estudiante
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    placeholder="Pérez"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="estudiante@universidad.edu"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña *</label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Universidad</label>
                <input
                  type="text"
                  value={newStudent.university}
                  onChange={(e) => setNewStudent({ ...newStudent, university: e.target.value })}
                  placeholder="Universidad Nacional..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Carrera</label>
                <input
                  type="text"
                  value={newStudent.career}
                  onChange={(e) => setNewStudent({ ...newStudent, career: e.target.value })}
                  placeholder="Ingeniería, Física..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-slate-700 text-gray-300 rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateStudent}
                disabled={creating}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {creating ? 'Creando...' : 'Crear Estudiante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5 text-red-400" />
                Crear Administrador o Profesor
              </h2>
              <button 
                onClick={() => setShowCreateAdminModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Nota:</strong> Solo los administradores pueden crear otras cuentas de administrador. Esta acción queda registrada.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4 -mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rol *</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                >
                  <option value="TEACHER">Profesor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                    placeholder="Pérez"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@universidad.edu"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña *</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="px-6 py-2 bg-slate-700 text-gray-300 rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={creating}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {creating ? 'Creando...' : `Crear ${newAdmin.role === 'ADMIN' ? 'Administrador' : 'Profesor'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
