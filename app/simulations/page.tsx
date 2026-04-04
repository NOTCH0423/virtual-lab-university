'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Search,
  Filter,
  Play,
  Clock,
  Users,
  Star,
  Gauge,
  FlaskConical,
  Atom,
  Zap,
  Dna,
  Beaker,
  ChevronRight,
} from 'lucide-react';

interface Simulation {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  bgColor: string;
  difficulty: string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  tags: string[];
  path: string;
}

interface SimulationsData {
  simulations: Simulation[];
  categories: string[];
  featuredSimulation: Simulation | null;
}

const iconComponents: Record<string, any> = {
  Gauge,
  FlaskConical,
  Atom,
  Zap,
  Dna,
  Beaker,
};

export default function SimulationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [data, setData] = useState<SimulationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      const res = await fetch('/api/public/simulations');
      if (res.ok) {
        const simulationsData = await res.json();
        setData(simulationsData);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
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

  const simulations = data?.simulations || [];
  const categories = data?.categories || ['Todos', 'Física', 'Química', 'Biología', 'Ingeniería'];
  const featuredSimulation = data?.featuredSimulation || simulations[0];

  const filteredSimulations = simulations.filter((sim) => {
    if (searchQuery && !sim.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sim.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'Todos' && sim.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'Todos' && sim.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const getIconComponent = (iconName: string) => {
    return iconComponents[iconName] || Beaker;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Simulaciones Interactivas</h1>
          <p className="text-gray-400">Experimenta con fenómenos científicos en tiempo real</p>
        </div>

        {featuredSimulation && (
          <div className="gradient-border p-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-1/3 h-48 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={featuredSimulation.image}
                  alt={featuredSimulation.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium">
                    Destacado
                  </span>
                  <span className={`px-3 py-1 ${featuredSimulation.bgColor} ${featuredSimulation.color} rounded-full text-xs font-medium`}>
                    {featuredSimulation.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{featuredSimulation.title}</h2>
                <p className="text-gray-400 mb-4">{featuredSimulation.description}</p>
                <div className="flex items-center gap-6 mb-4">
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" /> {featuredSimulation.duration}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Users className="w-4 h-4" /> {featuredSimulation.students.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-yellow-400">
                    <Star className="w-4 h-4 fill-current" /> {featuredSimulation.rating.toFixed(1)}
                  </span>
                </div>
                <Link
                  href={featuredSimulation.path}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Simulación
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar simulaciones..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
          >
            <option value="Todos">Todas las dificultades</option>
            <option value="Básico">Básico</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSimulations.map((simulation, index) => {
            const IconComponent = getIconComponent(simulation.icon);
            return (
              <Link
                key={simulation.id}
                href={simulation.path}
                className="gradient-border overflow-hidden group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={simulation.image}
                    alt={simulation.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                      {simulation.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${simulation.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${simulation.color}`} />
                    </div>
                    <span className={`text-xs font-medium ${simulation.color}`}>{simulation.category}</span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                    {simulation.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{simulation.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" /> {simulation.duration}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" /> {simulation.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredSimulations.length === 0 && (
          <div className="text-center py-20 gradient-border">
            <Beaker className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron simulaciones</h3>
            <p className="text-gray-400">Intenta con otros filtros</p>
          </div>
        )}
      </main>
    </div>
  );
}
