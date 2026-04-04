'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Users,
  RefreshCw,
  X,
  Save,
  Wifi,
  Activity,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  duration: number | null;
  modules: number;
  status: string;
  image: string | null;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('updating');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Física',
    level: 'BASIC',
    duration: '',
    modules: '',
    image: '',
  });

  const categories = ['Todos', 'Física', 'Química', 'Biología', 'Ingeniería'];
  const categoryMap: Record<string, string> = {
    'Física': 'FISICA',
    'Química': 'QUIMICA',
    'Biología': 'BIOLOGIA',
    'Ingeniería': 'INGENIERIA',
  };

  const fetchCourses = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    
    const interval = setInterval(fetchCourses, 30000);
    return () => clearInterval(interval);
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'Todos' && course.category !== categoryMap[selectedCategory]) return false;
    if (selectedStatus !== 'all' && course.status !== selectedStatus) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!newCourse.title || !newCourse.description) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          category: categoryMap[newCourse.category] || newCourse.category,
        }),
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewCourse({
          title: '',
          description: '',
          category: 'Física',
          level: 'BASIC',
          duration: '',
          modules: '',
          image: '',
        });
        await fetchCourses();
      } else {
        alert('Error al crear el curso');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error al crear el curso');
    } finally {
      setCreating(false);
    }
  };

  if (loading && courses.length === 0) {
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
          <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
          <div className="flex items-center gap-3 text-sm">
            <p className="text-gray-400">
              Administra cursos y contenido educativo
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
            onClick={fetchCourses}
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
            Nuevo Curso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{courses.length}</p>
          <p className="text-sm text-gray-400">Total Cursos</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{courses.filter(c => c.status === 'PUBLISHED').length}</p>
          <p className="text-sm text-gray-400">Publicados</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{courses.filter(c => c.status === 'DRAFT').length}</p>
          <p className="text-sm text-gray-400">Borradores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{courses.reduce((acc, c) => acc + c.modules, 0)}</p>
          <p className="text-sm text-gray-400">Módulos</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos..."
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
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-primary-500/50 transition-colors"
          >
            <div className="relative h-40 overflow-hidden">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  course.status === 'PUBLISHED' 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-yellow-500/80 text-white'
                }`}>
                  {course.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                  {course.level === 'BASIC' ? 'Básico' : course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {course.modules} módulos
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {course.duration}h
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className="text-xs text-gray-500">
                  Creado: {course.createdAt}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
          <p className="text-gray-400">Intenta con otros filtros o crea uno nuevo</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Crear Nuevo Curso</h2>
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
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Ej: Física Cuántica"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Descripción del curso..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  >
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biología">Biología</option>
                    <option value="Ingeniería">Ingeniería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nivel</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  >
                    <option value="BASIC">Básico</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duración (horas)</label>
                  <input
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Módulos</label>
                  <input
                    type="number"
                    value={newCourse.modules}
                    onChange={(e) => setNewCourse({ ...newCourse, modules: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                <input
                  type="url"
                  value={newCourse.image}
                  onChange={(e) => setNewCourse({ ...newCourse, image: e.target.value })}
                  placeholder="https://..."
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
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {creating ? 'Creando...' : 'Crear Curso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
