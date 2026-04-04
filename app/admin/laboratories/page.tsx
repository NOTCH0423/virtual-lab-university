'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users,
  Star,
  FlaskConical,
  RefreshCw,
  Check,
  X,
  BookOpen,
  Clock,
  BarChart3,
  Wifi,
  Activity,
  Save,
} from 'lucide-react';

interface Laboratory {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  instructor: string | null;
  requirements: string | null;
  duration: number | null;
  image: string | null;
  experimentsCount: number;
  createdAt: string;
}

export default function AdminLaboratoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('updating');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLab, setNewLab] = useState({
    title: '',
    description: '',
    category: 'FISICA',
    difficulty: 'BASIC',
    instructor: '',
    requirements: '',
    duration: '',
    image: '',
  });

  const categories = ['Todos', 'FISICA', 'QUIMICA', 'BIOLOGIA', 'INGENIERIA'];
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    PUBLISHED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Publicado' },
    DRAFT: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Borrador' },
    ARCHIVED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Archivado' },
  };

  const categoryColors: Record<string, string> = {
    FISICA: 'text-blue-400',
    QUIMICA: 'text-green-400',
    BIOLOGIA: 'text-purple-400',
    INGENIERIA: 'text-yellow-400',
  };

  const fetchLaboratories = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      const response = await fetch('/api/admin/laboratories');
      if (response.ok) {
        const data = await response.json();
        setLaboratories(data);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async () => {
    if (!newLab.title || !newLab.description) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('/api/admin/laboratories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLab),
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewLab({
          title: '',
          description: '',
          category: 'FISICA',
          difficulty: 'BASIC',
          instructor: '',
          requirements: '',
          duration: '',
          image: '',
        });
        await fetchLaboratories();
      } else {
        alert('Error al crear el laboratorio');
      }
    } catch (error) {
      console.error('Error creating laboratory:', error);
      alert('Error al crear el laboratorio');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchLaboratories();
    
    const interval = setInterval(fetchLaboratories, 30000);
    return () => clearInterval(interval);
  }, [fetchLaboratories]);

  const filteredLabs = laboratories.filter((lab) => {
    if (searchQuery && !lab.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'Todos' && lab.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && lab.status !== selectedStatus) return false;
    return true;
  });

  const handleDelete = async (labId: string, labTitle: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el laboratorio "${labTitle}"?`)) {
      try {
        const response = await fetch(`/api/admin/laboratories/${labId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchLaboratories();
        } else {
          alert('Error al eliminar el laboratorio');
        }
      } catch (error) {
        console.error('Error deleting laboratory:', error);
        alert('Error al eliminar el laboratorio');
      }
    }
  };

  const handleStatusChange = async (labId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/laboratories/${labId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchLaboratories();
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating laboratory:', error);
      alert('Error al actualizar el estado');
    }
  };

  if (loading && laboratories.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="flex items-center justify-center pt-48">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Laboratorios</h1>
          <div className="flex items-center gap-3 text-sm">
            <p className="text-gray-400">
              Administra laboratorios y experimentos virtuales
            </p>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/50 rounded-full">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'updating' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              {connectionStatus === 'connected' ? <Wifi className="w-3 h-3 text-green-400" /> : 
               connectionStatus === 'updating' ? <Activity className={`w-3 h-3 text-yellow-400 animate-pulse`} /> :
               <Activity className="w-3 h-3 text-red-400" />}
              <span className="text-gray-400 text-xs">
                {connectionStatus === 'connected' ? 'En vivo' : 
                 connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLaboratories}
            disabled={connectionStatus === 'updating'}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Laboratorio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{laboratories.length}</p>
          <p className="text-sm text-gray-400">Total Laboratorios</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{laboratories.filter(l => l.status === 'PUBLISHED').length}</p>
          <p className="text-sm text-gray-400">Publicados</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{laboratories.filter(l => l.status === 'DRAFT').length}</p>
          <p className="text-sm text-gray-400">Borradores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{laboratories.reduce((acc, l) => acc + l.experimentsCount, 0)}</p>
          <p className="text-sm text-gray-400">Experimentos</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar laboratorios..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-primary-500"
        >
          <option value="all">Todos los estados</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="DRAFT">Borradores</option>
        </select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
            }`}
          >
            {category === 'Todos' ? category : category.charAt(0) + category.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-primary-500/50 transition-colors"
          >
            <div className="relative h-40 overflow-hidden">
              {lab.image ? (
                <img
                  src={lab.image}
                  alt={lab.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <FlaskConical className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${statusColors[lab.status]?.bg || 'bg-gray-500/20'} ${statusColors[lab.status]?.text || 'text-gray-400'}`}>
                  {statusColors[lab.status]?.label || lab.status}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium ${categoryColors[lab.category] || 'text-gray-400'}`}>
                  {lab.category.charAt(0) + lab.category.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2">{lab.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {lab.experimentsCount} exp.
                </span>
                {lab.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {lab.duration} min
                  </span>
                )}
              </div>
              {lab.instructor && (
                <p className="text-sm text-gray-500 mb-4">Instructor: {lab.instructor}</p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className="text-xs text-gray-500">
                  Creado: {lab.createdAt}
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/laboratories/${lab.slug}`}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Ver"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </Link>
                  <button 
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDelete(lab.id, lab.title)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLabs.length === 0 && (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700">
          <FlaskConical className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No se encontraron laboratorios</h3>
          <p className="text-gray-400">Intenta con otros filtros o crea uno nuevo</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Crear Nuevo Laboratorio</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={newLab.title}
                  onChange={(e) => setNewLab({ ...newLab, title: e.target.value })}
                  placeholder="Ej: Mecánica Cuántica"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  value={newLab.description}
                  onChange={(e) => setNewLab({ ...newLab, description: e.target.value })}
                  placeholder="Descripción del laboratorio..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={newLab.category}
                    onChange={(e) => setNewLab({ ...newLab, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  >
                    <option value="FISICA">Física</option>
                    <option value="QUIMICA">Química</option>
                    <option value="BIOLOGIA">Biología</option>
                    <option value="INGENIERIA">Ingeniería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dificultad</label>
                  <select
                    value={newLab.difficulty}
                    onChange={(e) => setNewLab({ ...newLab, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  >
                    <option value="BASIC">Básica</option>
                    <option value="INTERMEDIATE">Intermedia</option>
                    <option value="ADVANCED">Avanzada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instructor</label>
                <input
                  type="text"
                  value={newLab.instructor}
                  onChange={(e) => setNewLab({ ...newLab, instructor: e.target.value })}
                  placeholder="Nombre del instructor"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Requisitos</label>
                <input
                  type="text"
                  value={newLab.requirements}
                  onChange={(e) => setNewLab({ ...newLab, requirements: e.target.value })}
                  placeholder="Conocimientos previos requeridos"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duración (minutos)</label>
                  <input
                    type="number"
                    value={newLab.duration}
                    onChange={(e) => setNewLab({ ...newLab, duration: e.target.value })}
                    placeholder="45"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                  <input
                    type="url"
                    value={newLab.image}
                    onChange={(e) => setNewLab({ ...newLab, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
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
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {creating ? 'Creando...' : 'Crear Laboratorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
