import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, CalendarDays } from 'lucide-react';
import { API_BASE } from '../api/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function SmartHeader({ stats }) {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Fetch upcoming birthday reminders + today's events
    Promise.all([
      fetch(`${API_BASE}/events/reminders`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/events/today`).then(r => r.json()).catch(() => []),
    ]).then(([birthdayReminders, todayEvents]) => {
      const items = [];

      // Add today's birthdays
      const todayBirthdays = (Array.isArray(birthdayReminders) ? birthdayReminders : [])
        .filter(b => b.days_remaining === 0);
      todayBirthdays.forEach(b => {
        items.push({
          id: `bday-today-${b.id}`,
          icon: '🎂',
          text: `${b.title} is today!`,
          type: 'birthday',
          urgent: true,
        });
      });

      // Add upcoming birthdays (next 5 days)
      const upcomingBirthdays = (Array.isArray(birthdayReminders) ? birthdayReminders : [])
        .filter(b => b.days_remaining > 0 && b.days_remaining <= 5);
      upcomingBirthdays.forEach(b => {
        items.push({
          id: `bday-${b.id}`,
          icon: '🎁',
          text: `${b.title} in ${b.days_remaining} day${b.days_remaining > 1 ? 's' : ''}`,
          type: 'birthday',
          urgent: false,
        });
      });

      // Add today's events
      const eventsToday = Array.isArray(todayEvents) ? todayEvents : [];
      eventsToday.forEach(e => {
        items.push({
          id: `event-today-${e.id}`,
          icon: '📅',
          text: `${e.title} — today!`,
          type: 'event',
          urgent: true,
        });
      });

      setReminders(items.slice(0, 4)); // Max 4 reminders shown
    });
  }, []);

  const greeting = getGreeting();
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto mb-8 relative z-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="px-4">
        {/* Date Subtitle */}
        <motion.p
          className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-primary/60 dark:text-primary-light/50 mb-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {todayDate}
        </motion.p>

        {/* Dynamic Greeting */}
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-text dark:text-text-dark">
            {greeting},
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent italic mr-2">
            Preetam!
          </span>
          <span className="text-2xl md:text-3xl lg:text-4xl align-middle">✨</span>
        </motion.h1>

        {/* "Funky" Glassmorphic Reminders */}
        {reminders.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {reminders.map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-2xl
                  backdrop-blur-xl border-t border-l border-white/20
                  shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]
                  transition-all cursor-default overflow-hidden group
                  ${item.urgent 
                    ? 'bg-accent/10 dark:bg-accent/20 border-accent/20' 
                    : 'bg-white/40 dark:bg-white/5 border-white/30 dark:border-white/10'}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 100 }}
              >
                {/* Background Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-base
                  ${item.urgent 
                    ? 'bg-accent/20 text-accent animate-pulse' 
                    : 'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-light'}
                `}>
                  {item.icon}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5 ${
                    item.urgent ? 'text-accent' : 'text-primary dark:text-primary-light'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-sm md:text-base font-semibold text-text dark:text-text-dark leading-tight">
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-lg">🌈</span>
            <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark italic">
              All clear! Enjoy your {new Date().getHours() < 17 ? 'productive day' : 'evening'}...
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
