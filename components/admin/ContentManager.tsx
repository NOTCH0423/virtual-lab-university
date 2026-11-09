'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import {
  api, Badge, Button, ConfirmDialog, Field, Input, Modal, PageHeader, Select, Spinner, TextArea,
  STATUS_OPTIONS, labelOf, useToast,
} from '@/components/admin/ui';

export type Opt = { value: string; label: string };
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  required?: boolean;
  options?: Opt[];
  hint?: string;
  full?: boolean;
}
export interface Column<T> { label: string; render: (item: T) => ReactNode; className?: string }

export function ContentManager<T extends { id: string; title: string; status?: string }>({
  title, subtitle, endpoint, fields, columns, defaults, query = '', filters, deleteWarning, newLabel = 'Nuevo',
}: {
  title: string;
  subtitle?: string;
  endpoint: string;
  fields: FieldDef[];
  columns: Column<T>[];
  defaults: Record<string, any>;
  query?: string;
  filters?: ReactNode;
  deleteWarning?: (item: T) => ReactNode;
  newLabel?: string;
}) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(defaults);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hasStatus = fields.some((f) => f.key === 'status');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams(query);
      if (search.trim()) p.set('search', search.trim());
      if (status !== 'all') p.set('status', status);
      setItems(await api<T[]>(`${endpoint}?${p}`));
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, query, search, status, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => { setForm({ ...defaults }); setCreating(true); };
  const openEdit = (item: T) => {
    const f: Record<string, any> = {};
    for (const fd of fields) f[fd.key] = (item as any)[fd.key] ?? '';
    f.slug = (item as any).slug ?? '';
    setForm(f);
    setEditing(item);
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    for (const f of fields) {
      const v = form[f.key];
      if (f.required && (v === undefined || v === null || String(v).trim() === '')) {
        return toast('error', `"${f.label}" es obligatorio`);
      }
      if (f.type === 'number' && v !== '' && v !== null && v !== undefined && (!Number.isInteger(Number(v)) || Number(v) < 0)) {
        return toast('error', `"${f.label}" debe ser un número entero ≥ 0`);
      }
    }
    const payload: Record<string, any> = {};
    for (const f of fields) {
      const v = form[f.key];
      payload[f.key] = f.type === 'number' ? (v === '' || v === null ? null : Number(v)) : v;
    }
    if (editing && form.slug && form.slug !== (editing as any).slug) payload.slug = form.slug;
    setSaving(true);
    try {
      if (creating) {
        await api(endpoint, { method: 'POST', json: payload });
        toast('success', `${title.replace(/s$/, '')} creado`);
      } else if (editing) {
        await api(`${endpoint}/${editing.id}`, { method: 'PATCH', json: payload });
        toast('success', 'Cambios guardados');
      }
      close();
      load();
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = async (item: T, next: string) => {
    try {
      await api(`${endpoint}/${item.id}`, { method: 'PATCH', json: { status: next } });
      setItems((l) => l.map((x) => (x.id === item.id ? { ...x, status: next } : x)));
      toast('success', `Estado: ${labelOf(STATUS_OPTIONS, next)}`);
    } catch (e: any) {
      toast('error', e.message);
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`${endpoint}/${toDelete.id}`, { method: 'DELETE' });
      setItems((l) => l.filter((x) => x.id !== toDelete.id));
      toast('success', 'Eliminado');
      setToDelete(null);
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setDeleting(false);
    }
  };

  const optsWith = (opts: Opt[], v: any) =>
    v && !opts.some((o) => o.value === v) ? [...opts, { value: String(v), label: String(v) }] : opts;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title={title}
        subtitle={subtitle ?? `${items.length} registro(s)`}
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4" /> {newLabel}</Button>}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {hasStatus && (
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44"
            options={[{ value: 'all', label: 'Todos los estados' }, ...STATUS_OPTIONS]} />
        )}
        {filters}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No hay registros. Crea el primero con “{newLabel}”.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3">Título</th>
                {columns.map((c) => <th key={c.label} className={`p-3 ${c.className || ''}`}>{c.label}</th>)}
                {hasStatus && <th className="p-3">Estado</th>}
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-xs text-gray-500">{(it as any).slug}</div>
                  </td>
                  {columns.map((c) => <td key={c.label} className={`p-3 text-gray-300 ${c.className || ''}`}>{c.render(it)}</td>)}
                  {hasStatus && (
                    <td className="p-3">
                      <select
                        value={it.status}
                        onChange={(e) => quickStatus(it, e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs [&>option]:bg-slate-900"
                      >
                        {optsWith(STATUS_OPTIONS, it.status).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                  )}
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button title="Editar" onClick={() => openEdit(it)} className="p-2 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                      <button title="Eliminar" onClick={() => setToDelete(it)} className="p-2 rounded-lg hover:bg-white/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={creating || !!editing} title={creating ? newLabel : `Editar: ${editing?.title}`} onClose={close} wide>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
          {fields.map((f) => (
            <div key={f.key} className={f.full || f.type === 'textarea' ? 'md:col-span-2' : ''}>
              <Field label={`${f.label}${f.required ? ' *' : ''}`} hint={f.hint}>
                {f.type === 'textarea' ? (
                  <TextArea value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <Select value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    options={optsWith(f.options || [], form[f.key])} />
                ) : (
                  <Input type={f.type === 'number' ? 'number' : 'text'} min={f.type === 'number' ? 0 : undefined}
                    value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </Field>
            </div>
          ))}
          {editing && (
            <div className="md:col-span-2">
              <Field label="Slug (URL)" hint="Cambiarlo puede romper enlaces existentes">
                <Input value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancelar</Button>
            <Button type="submit" loading={saving}>{creating ? 'Crear' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Confirmar eliminación"
        message={<>¿Eliminar <b>{toDelete?.title}</b>? {toDelete && deleteWarning?.(toDelete)} Esta acción no se puede deshacer.</>}
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}

export { Badge };
