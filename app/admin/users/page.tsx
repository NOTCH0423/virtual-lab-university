'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Edit2, Plus, Search, Trash2, UserCheck, UserX, ShieldAlert } from 'lucide-react';
import {
  api, Badge, Button, ConfirmDialog, Field, Input, Modal, PageHeader, Select, Spinner, useToast,
} from '@/components/admin/ui';

interface U {
  id: string; name: string; email: string; role: string; status: string;
  university?: string | null; createdAt: string; lastActiveAt?: string | null;
  progressCount?: number; certificatesCount?: number;
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrador', TEACHER: 'Profesor', STUDENT: 'Estudiante',
};
const ROLE_COLOR: Record<string, any> = { SUPER_ADMIN: 'purple', ADMIN: 'blue', TEACHER: 'yellow', STUDENT: 'gray' };
const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Activo', SUSPENDED: 'Suspendido', BANNED: 'Bloqueado' };
const STATUS_COLOR: Record<string, any> = { ACTIVE: 'green', SUSPENDED: 'yellow', BANNED: 'red' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminUsersPage() {
  const toast = useToast();
  const { data: session } = useSession();
  const me = { id: (session?.user as any)?.id as string, role: String((session?.user as any)?.role || '') };
  const isSuper = me.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const [editing, setEditing] = useState<U | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'STUDENT', status: 'ACTIVE', password: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<U | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search.trim()) p.set('search', search.trim());
      if (role !== 'all') p.set('role', role);
      if (status !== 'all') p.set('status', status);
      setUsers(await api<U[]>(`/api/admin/users?${p}`));
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const canManage = (u: U) => {
    if (u.id === me.id) return true;
    if (u.role === 'SUPER_ADMIN') return false;
    if (u.role === 'ADMIN' && !isSuper) return false;
    return true;
  };

  const roleOptions = useMemo(() => {
    const base = [
      { value: 'STUDENT', label: 'Estudiante' },
      { value: 'TEACHER', label: 'Profesor' },
    ];
    if (isSuper) base.push({ value: 'ADMIN', label: 'Administrador' }, { value: 'SUPER_ADMIN', label: 'Super Admin' });
    return base;
  }, [isSuper]);

  const openCreate = () => {
    setForm({ name: '', email: '', role: 'STUDENT', status: 'ACTIVE', password: '' });
    setCreating(true);
  };
  const openEdit = (u: U) => {
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status, password: '' });
    setEditing(u);
  };

  const validate = (isCreate: boolean) => {
    if (form.name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!EMAIL_RE.test(form.email.trim())) return 'Email inválido';
    if (isCreate && form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!isCreate && form.password && form.password.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres';
    return null;
  };

  const save = async () => {
    const isCreate = creating;
    const err = validate(isCreate);
    if (err) return toast('error', err);
    setSaving(true);
    try {
      if (isCreate) {
        await api('/api/admin/users', { method: 'POST', json: form });
        toast('success', 'Usuario creado');
      } else if (editing) {
        const payload: any = {};
        if (form.name !== editing.name) payload.name = form.name;
        if (form.email !== editing.email) payload.email = form.email;
        if (form.role !== editing.role) payload.role = form.role;
        if (form.status !== editing.status) payload.status = form.status;
        if (form.password) payload.password = form.password;
        if (!Object.keys(payload).length) {
          toast('error', 'No hay cambios');
          setSaving(false);
          return;
        }
        await api(`/api/admin/users/${editing.id}`, { method: 'PATCH', json: payload });
        toast('success', 'Usuario actualizado');
      }
      setCreating(false);
      setEditing(null);
      load();
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: U) => {
    const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', json: { status: next } });
      toast('success', next === 'ACTIVE' ? `${u.name} activado` : `${u.name} desactivado`);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
    } catch (e: any) {
      toast('error', e.message);
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/api/admin/users/${toDelete.id}`, { method: 'DELETE' });
      toast('success', 'Usuario eliminado');
      setUsers((l) => l.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setDeleting(false);
    }
  };

  const isSelfEdit = editing?.id === me.id;
  const formOpen = creating || !!editing;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} usuario(s)`}
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Nuevo usuario</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input placeholder="Buscar por nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-44"
          options={[{ value: 'all', label: 'Todos los roles' }, ...Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))]}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-44"
          options={[{ value: 'all', label: 'Todos los estados' }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
        />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No hay usuarios que coincidan.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3 hidden md:table-cell">Progreso</th>
                <th className="p-3 hidden lg:table-cell">Registro</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const manageable = canManage(u);
                const self = u.id === me.id;
                return (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <div className="font-medium">{u.name} {self && <span className="text-xs text-gray-500">(tú)</span>}</div>
                      <div className="text-gray-400 text-xs">{u.email}</div>
                    </td>
                    <td className="p-3"><Badge color={ROLE_COLOR[u.role] || 'gray'}>{ROLE_LABEL[u.role] || u.role}</Badge></td>
                    <td className="p-3"><Badge color={STATUS_COLOR[u.status] || 'gray'}>{STATUS_LABEL[u.status] || u.status}</Badge></td>
                    <td className="p-3 hidden md:table-cell text-gray-400">{u.progressCount ?? 0} labs · {u.certificatesCount ?? 0} cert.</td>
                    <td className="p-3 hidden lg:table-cell text-gray-400">{new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {manageable ? (
                          <>
                            <button title="Editar" onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                            {!self && (
                              <>
                                <button
                                  title={u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                                  onClick={() => toggleStatus(u)}
                                  className="p-2 rounded-lg hover:bg-white/10"
                                >
                                  {u.status === 'ACTIVE' ? <UserX className="w-4 h-4 text-yellow-400" /> : <UserCheck className="w-4 h-4 text-green-400" />}
                                </button>
                                <button title="Eliminar" onClick={() => setToDelete(u)} className="p-2 rounded-lg hover:bg-white/10">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <span title="Protegido" className="p-2 text-gray-500"><ShieldAlert className="w-4 h-4" /></span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={formOpen} title={creating ? 'Nuevo usuario' : 'Editar usuario'} onClose={() => { setCreating(false); setEditing(null); }}>
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); save(); }}
        >
          <Field label="Nombre"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol" hint={isSelfEdit ? 'No puedes cambiar tu propio rol' : !isSuper ? 'Solo un Super Admin asigna roles de administrador' : undefined}>
              <Select
                value={form.role}
                disabled={isSelfEdit}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={roleOptions.some((o) => o.value === form.role) ? roleOptions : [...roleOptions, { value: form.role, label: ROLE_LABEL[form.role] || form.role }]}
              />
            </Field>
            <Field label="Estado">
              <Select
                value={form.status}
                disabled={isSelfEdit}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
              />
            </Field>
          </div>
          <Field label={creating ? 'Contraseña' : 'Nueva contraseña (opcional)'} hint="Mínimo 8 caracteres">
            <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</Button>
            <Button type="submit" loading={saving}>{creating ? 'Crear' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar usuario"
        message={<>¿Seguro que quieres eliminar a <b>{toDelete?.name}</b> ({toDelete?.email})? Se borrarán también su progreso, logros y certificados. Esta acción no se puede deshacer.</>}
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
