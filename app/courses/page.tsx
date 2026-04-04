'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  Star,
  ChevronRight,
  FlaskConical,
  Gauge,
  Dna,
  Zap,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  modules: number;
  image: string;
}

const iconComponents: Record<string, any> = {
  Gauge,
  FlaskConical,
  Dna,
  Zap,
  BookOpen,
};

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [sortBy, setSortBy] = useState('popular');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/public/courses');
      if (res.ok) {
        const coursesData = await res.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const categories = ['Todos', 'Física', 'Química', 'Biología', 'Ingeniería'];
  const levels = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

  const filteredCourses = courses.filter((course) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'Todos' && course.category !== selectedCategory) return false;
    if (selectedLevel !== 'Todos' && course.level !== selectedLevel) return false;
    return true;
  });

  const getIconComponent = (iconName: string) => {
    return iconComponents[iconName] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cursos</h1>
          <p className="text-gray-400">Explora cursos completos organizados por tema y nivel de dificultad</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cursos..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
            >
              <option value="popular">Más populares</option>
              <option value="rating">Mejor valorados</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
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

        <div className="flex gap-2 mb-8">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedLevel === level
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const IconComponent = getIconComponent(course.categoryIcon);
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="gradient-border overflow-hidden group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-${course.categoryColor.replace('text-', '')}-500/20 ${course.categoryColor}`}>
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  {course.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progreso</span>
                        <span className="text-primary-400">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {course.modules} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {course.students.toLocaleString()}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /> {course.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 gradient-border">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
            <p className="text-gray-400">Intenta con otros filtros</p>
          </div>
        )}
      </main>
    </div>
  );
}
