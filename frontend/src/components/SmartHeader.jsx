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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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
          className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold text-text-muted dark:text-text-muted-dark mb-2 px-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {todayDate}
        </motion.p>

        {/* Dynamic Greeting */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 flex flex-wrap items-baseline gap-x-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-text dark:text-text-dark">
            {greeting},
          </span>
          <br className="md:hidden" />
          <span className="text-primary">
            Preetam
          </span>
          <span className="text-2xl md:text-4xl lg:text-5xl align-middle ml-1">✨</span>
        </motion.h1>

        {/* "Funky" Glassmorphic Reminders */}
        {loading ? (
             <motion.div
             className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
           >
             <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark italic animate-pulse">
               ⚡ Loading reminders...
             </span>
           </motion.div>
        ) : reminders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reminders.map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-4 p-5 rounded-[2rem]
                  glass dark:glass-dark shadow-sm
                  transition-all cursor-default overflow-hidden group
                  ${item.urgent ? 'ring-2 ring-accent/20' : ''}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 100 }}
              >
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-2xl text-xl
                  ${item.urgent 
                    ? 'bg-danger/10 text-danger animate-pulse' 
                    : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'}
                `}>
                  {item.icon}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                    item.urgent ? 'text-danger' : 'text-primary dark:text-primary-light'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-base font-bold text-text dark:text-text-dark leading-tight truncate">
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
