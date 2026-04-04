'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Search,
  Filter,
  ChevronRight,
  Clock,
  Users,
  Star,
  Gauge,
  FlaskConical,
  Atom,
  Dna,
  Zap,
  Grid3X3,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Laboratory {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  experiments: number;
  students: number;
  rating: number;
  duration: string;
  difficulty: string;
  level: number;
  instructor?: string;
}

const categories = [
  { id: 'all', name: 'Todos', icon: Grid3X3 },
  { id: 'physics', name: 'Física', icon: Gauge, color: 'text-blue-400' },
  { id: 'chemistry', name: 'Química', icon: FlaskConical, color: 'text-green-400' },
  { id: 'biology', name: 'Biología', icon: Dna, color: 'text-purple-400' },
  { id: 'engineering', name: 'Ingeniería', icon: Zap, color: 'text-yellow-400' },
];

export default function LaboratoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      const res = await fetch('/api/public/laboratories');
      if (res.ok) {
        const labsData = await res.json();
        setLaboratories(labsData);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredLabs = laboratories
    .filter((lab) => {
      if (selectedCategory !== 'all' && lab.category !== selectedCategory) return false;
      if (searchQuery && !lab.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.students - a.students;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.level - a.level;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Laboratorios</h1>
          <p className="text-gray-400">Explora todos los laboratorios virtuales disponibles</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar laboratorios..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden px-4 py-3 rounded-xl border transition-colors ${
                showFilters ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
            >
              <option value="popular">Más populares</option>
              <option value="rating">Mejor valorados</option>
              <option value="newest">Nivel más alto</option>
            </select>

            <div className="hidden lg:flex border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/5'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/5'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <category.icon className={`w-5 h-5 ${selectedCategory === category.id ? '' : category.color}`} />
              {category.name}
            </button>
          ))}
        </div>

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <AnimatePresence mode="wait">
            {filteredLabs.map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <Link href={`/laboratories/${lab.id}`} className="block group">
                    <div className="gradient-border overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={lab.image}
                          alt={lab.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            lab.category === 'physics' ? 'bg-blue-500/80 text-white' :
                            lab.category === 'chemistry' ? 'bg-green-500/80 text-white' :
                            lab.category === 'biology' ? 'bg-purple-500/80 text-white' :
                            'bg-yellow-500/80 text-white'
                          }`}>
                            {lab.category.charAt(0).toUpperCase() + lab.category.slice(1)}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                            {lab.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                          {lab.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lab.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1">
                              <FlaskConical className="w-4 h-4" /> {lab.experiments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {lab.students.toLocaleString()}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" /> {lab.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lab.duration}
                          </span>
                          <span className="text-primary-400 text-sm font-medium flex items-center gap-1">
                            Explorar <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/laboratories/${lab.id}`} className="block group">
                    <div className="gradient-border p-4 flex gap-6">
                      <div className="w-48 h-32 relative flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={lab.image}
                          alt={lab.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              lab.category === 'physics' ? 'bg-blue-500/20 text-blue-400' :
                              lab.category === 'chemistry' ? 'bg-green-500/20 text-green-400' :
                              lab.category === 'biology' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {lab.category.charAt(0).toUpperCase() + lab.category.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">{lab.difficulty}</span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                            {lab.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-1">{lab.description}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1 text-gray-400">
                            <FlaskConical className="w-4 h-4" /> {lab.experiments} experimentos
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Users className="w-4 h-4" /> {lab.students.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" /> {lab.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" /> {lab.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredLabs.length === 0 && (
          <div className="text-center py-20">
            <Atom className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron laboratorios</h3>
            <p className="text-gray-400">Intenta con otros filtros o búsqueda</p>
          </div>
        )}
      </main>
    </div>
  );
}
