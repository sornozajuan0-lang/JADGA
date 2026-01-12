import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/feature/Navigation';
import TutorAssistant from '../../components/feature/TutorAssistant';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: number;
}

interface Activity {
  id: string;
  activity_type: string;
  activity_name: string;
  points_earned: number;
  created_at: string;
}

interface UserProgress {
  total_score: number;
  level: number;
  games_completed: number;
  questions_answered: number;
}

export default function Progreso() {
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState('');
  const [progress, setProgress] = useState<UserProgress>({
    total_score: 0,
    level: 1,
    games_completed: 0,
    questions_answered: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first-game', name: 'Primer Juego', description: 'Completa tu primer juego', icon: '🎮', unlocked: false, requirement: 1 },
    { id: 'explorer', name: 'Explorador', description: 'Gana 50 puntos', icon: '🔍', unlocked: false, requirement: 50 },
    { id: 'curious', name: 'Curioso', description: 'Responde 10 preguntas', icon: '❓', unlocked: false, requirement: 10 },
    { id: 'student', name: 'Estudiante Dedicado', description: 'Gana 100 puntos', icon: '📚', unlocked: false, requirement: 100 },
    { id: 'gamer', name: 'Jugador Experto', description: 'Completa 20 juegos', icon: '🎯', unlocked: false, requirement: 20 },
    { id: 'champion', name: 'Campeón', description: 'Gana 200 puntos', icon: '🏆', unlocked: false, requirement: 200 },
    { id: 'genius', name: 'Genio', description: 'Gana 500 puntos', icon: '🧠', unlocked: false, requirement: 500 },
    { id: 'master', name: 'Maestro', description: 'Gana 1000 puntos', icon: '⭐', unlocked: false, requirement: 1000 },
  ]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const name = localStorage.getItem('childName') || 'Estudiante';
      const userId = localStorage.getItem('userId');
      setChildName(name);

      // Si hay usuario autenticado, usar su ID, sino usar el nombre
      const identifier = userId || name;
      const queryField = userId ? 'user_id' : 'child_name';

      // Cargar progreso del usuario
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq(queryField, identifier)
        .single();

      if (progressData) {
        setProgress({
          total_score: progressData.total_score || 0,
          level: progressData.level || 1,
          games_completed: progressData.games_completed || 0,
          questions_answered: progressData.questions_answered || 0
        });

        // Actualizar logros desbloqueados
        const updatedAchievements = achievements.map(achievement => {
          let unlocked = false;
          if (achievement.id === 'first-game' || achievement.id === 'gamer') {
            unlocked = progressData.games_completed >= achievement.requirement;
          } else if (achievement.id === 'curious') {
            unlocked = progressData.questions_answered >= achievement.requirement;
          } else {
            unlocked = progressData.total_score >= achievement.requirement;
          }
          return { ...achievement, unlocked };
        });
        setAchievements(updatedAchievements);
      }

      // Cargar actividades recientes
      const { data: activitiesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq(queryField, identifier)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesData) {
        setRecentActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressToNextLevel = (progress.total_score % 100);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'chat': return '💬';
      case 'question': return '❓';
      default: return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Cargando tu progreso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 text-center">
              Tu Progreso
            </h1>
            <p className="text-xl text-gray-600 text-center">
              ¡Sigue así, {childName}! Cada logro te hace más fuerte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {progress.total_score}
              </div>
              <p className="text-gray-600 font-semibold">Puntos Totales</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                Nivel {progress.level}
              </div>
              <p className="text-gray-600 font-semibold">Tu Nivel Actual</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-3">🎮</div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {progress.games_completed}
              </div>
              <p className="text-gray-600 font-semibold">Juegos Completados</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl mb-3">💬</div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {progress.questions_answered}
              </div>
              <p className="text-gray-600 font-semibold">Preguntas Respondidas</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Progreso al Siguiente Nivel</h2>
            <div className="relative">
              <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 flex items-center justify-end pr-4"
                  style={{ width: `${progressToNextLevel}%` }}
                >
                  {progressToNextLevel > 10 && (
                    <span className="text-white font-bold text-sm">{progressToNextLevel}%</span>
                  )}
                </div>
              </div>
              <p className="text-center text-gray-600 mt-3">
                {100 - progressToNextLevel} puntos más para alcanzar el Nivel {progress.level + 1}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Actividad Reciente
              </h2>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center flex-1">
                        <div className="text-3xl mr-4">{getActivityIcon(activity.activity_type)}</div>
                        <div>
                          <p className="font-semibold text-gray-800">{activity.activity_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(activity.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          +{activity.points_earned} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-600">¡Comienza a jugar y aprender para ver tu actividad aquí!</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">🏆</span>
                Logros ({unlockedCount}/{achievements.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`text-4xl mr-4 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{achievement.name}</h3>
                      <p className={`text-sm ${achievement.unlocked ? 'text-white/90' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked ? (
                      <i className="ri-check-line text-2xl"></i>
                    ) : (
                      <i className="ri-lock-line text-2xl"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-start">
              <div className="text-5xl mr-4">🌟</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">¡Sigue Aprendiendo!</h3>
                <p className="text-gray-700 mb-4">
                  Cada vez que completas un juego correctamente o usas el chat educativo, 
                  ganas puntos que te ayudan a subir de nivel y desbloquear nuevos logros.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">💬</span>
                      <span className="font-semibold text-gray-800">Chat Educativo</span>
                    </div>
                    <p className="text-sm text-gray-600">+5 puntos por cada pregunta</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎮</span>
                      <span className="font-semibold text-gray-800">Juegos Cognitivos</span>
                    </div>
                    <p className="text-sm text-gray-600">+10 puntos por juego completado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TutorAssistant />
    </div>
  );
}