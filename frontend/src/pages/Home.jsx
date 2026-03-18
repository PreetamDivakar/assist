import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SmartHeader from '../components/SmartHeader';
import AIChatBubble from '../components/AIChatBubble';
import { Calendar } from 'lucide-react';

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
    icon: Calendar,
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
    <div className="relative flex min-h-dvh fixed-home items-center justify-center p-4 overflow-hidden">
      {/* BG Glow orbs */}
      <div className="pointer-events-none absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] rounded-full bg-accent/10 blur-[120px]" />

      {/* Top-right controls - Removed theme toggle as requested */}

      {/* Smart Header replaces old static title */}
      <SmartHeader stats={stats} />

      {/* 2×2 Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl w-full px-4 mb-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.path}
            onClick={() => navigate(section.path)}
            className={`
              group relative flex cursor-pointer flex-col items-center justify-center 
              min-h-[160px] md:min-h-[220px] rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-8 
              glass dark:glass-dark premium-shadow overflow-hidden
            `}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Background Accent Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-[0.03] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity`} />
            
            <div className={`
              mb-3 md:mb-5 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-[1.25rem] md:rounded-[2.2rem]
              bg-gradient-to-br ${section.gradient} p-3.5 md:p-5 text-white shadow-lg ${section.shadow}
            `}>
              <section.icon className="w-full h-full" />
            </div>

            <span className="text-base md:text-xl font-bold tracking-tight text-text dark:text-text-dark text-center">{section.title}</span>
            
            {stats && section.statsKey && stats[section.statsKey] > 0 && (
              <motion.div
                className="mt-2 md:mt-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 border border-primary/20">
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-primary dark:text-primary-light">
                    {stats[section.statsKey]} {section.statsLabel}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <AIChatBubble />
    </div>
  );
}
