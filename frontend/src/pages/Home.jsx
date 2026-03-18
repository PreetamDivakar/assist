import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, Heart, User, CalendarDays, Sun, Moon } from 'lucide-react';
import { useThemeStore, useDashboardStore } from '../stores/store';
import { eventApi } from '../api/client';
import { Badge } from '../components/UI';
import SmartHeader from '../components/SmartHeader';

const sections = [
  {
    title: 'Jiya',
    icon: Heart,
    path: '/jiya',
    gradient: 'from-violet-500 to-purple-400',
    shadow: 'shadow-violet-500/20',
    statsKey: null,
    statsLabel: '',
  },
  {
    title: 'Pree',
    icon: User,
    path: '/pree',
    gradient: 'from-cyan-500 to-teal-400',
    shadow: 'shadow-cyan-500/20',
    statsKey: null,
    statsLabel: '',
  },
  {
    title: 'Birthdays',
    icon: Cake,
    path: '/birthdays',
    gradient: 'from-pink-500 to-rose-400',
    shadow: 'shadow-pink-500/20',
    statsKey: 'upcoming_birthdays_count',
    statsLabel: 'upcoming',
  },
  {
    title: 'Events',
    icon: CalendarDays,
    path: '/events',
    gradient: 'from-amber-500 to-orange-400',
    shadow: 'shadow-amber-500/20',
    statsKey: 'upcoming_events_count',
    statsLabel: 'upcoming',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { stats, setStats } = useDashboardStore();

  useEffect(() => {
    eventApi.getDashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center p-4 overflow-hidden">
      {/* BG Glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <motion.button
          onClick={toggleTheme}
          className="rounded-full p-3 backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Smart Header replaces old static title */}
      <SmartHeader stats={stats} />

      {/* 2×2 Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-6" style={{ width: 'min(100vw - 2rem, 100vh - 18rem, 36rem)', height: 'min(100vw - 2rem, 100vh - 18rem, 36rem)' }}>
        {sections.map((section, i) => (
          <motion.div
            key={section.path}
            onClick={() => navigate(section.path)}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br ${section.gradient} p-2 md:p-4 shadow-xl ${section.shadow} overflow-hidden`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Glass highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <section.icon className="mb-2 md:mb-3 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" />
            <span className="text-base md:text-lg lg:text-xl font-bold text-white drop-shadow">{section.title}</span>
            
            {stats && section.statsKey && stats[section.statsKey] > 0 && (
              <motion.div
                className="mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Badge variant="default">
                  <span className="text-white font-semibold bg-white/25 px-2 py-0.5 rounded-full text-xs">
                    {stats[section.statsKey]} {section.statsLabel}
                  </span>
                </Badge>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Dashboard footer stats */}
      {stats && (
        <motion.div
          className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-text-muted dark:text-text-muted-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>🎂 {stats.upcoming_birthdays_count} birthdays soon</span>
          <span>📅 {stats.today_events_count} today</span>
          <span>✅ {stats.bucket_list_completed}/{stats.bucket_list_total} bucket list</span>
        </motion.div>
      )}
    </div>
  );
}
