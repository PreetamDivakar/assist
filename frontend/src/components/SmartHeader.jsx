import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../api/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const ReminderCarousel = ({ reminders }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reminders.length);
  }, [reminders.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reminders.length) % reminders.length);
  }, [reminders.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const item = reminders[currentIndex];

  return (
    <div className="relative group w-full max-w-lg mx-auto">
      <div className="relative h-24 flex items-center justify-center overflow-hidden px-4">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) > 50;
              if (swipe) {
                if (offset.x > 0) prev();
                else next();
              }
            }}
            className={`
              absolute w-[calc(100%-2rem)] flex items-center gap-4 p-4 rounded-3xl
              bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10
              shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
              cursor-grab active:cursor-grabbing
              ${item.urgent ? 'ring-2 ring-accent/30' : ''}
            `}
          >
            <div className={`
              flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl text-2xl
              ${item.urgent 
                ? 'bg-danger/15 text-danger animate-pulse shadow-sm shadow-danger/20' 
                : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'}
            `}>
              {item.icon}
            </div>
            
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                item.urgent ? 'text-danger' : 'text-primary/70 dark:text-primary-light/70'
              }`}>
                {item.type} • {item.day}
              </span>
              <span className="text-base font-semibold text-text dark:text-text-dark leading-tight truncate">
                {item.text}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons - Tablet/Desktop Only */}
      <div className="hidden md:block">
        <button
          onClick={prev}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 dark:bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 dark:hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-text-muted dark:text-text-muted-dark" />
        </button>
        <button
          onClick={next}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 dark:bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 dark:hover:bg-white/10"
        >
          <ChevronRight className="w-5 h-5 text-text-muted dark:text-text-muted-dark" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {reminders.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? 'w-4 bg-primary' 
                : 'w-1.5 bg-text-muted/20 dark:bg-text-muted-dark/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function SmartHeader({ stats }) {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const [birthdayRes, upcomingRes] = await Promise.all([
          fetch(`${API_BASE}/events/reminders`),
          fetch(`${API_BASE}/events/upcoming?days=7`)
        ]);
        
        const birthdayReminders = await birthdayRes.json();
        const upcomingEvents = await upcomingRes.json();
        
        const items = [];

        // Process Birthdays for the next 7 days
        (Array.isArray(birthdayReminders) ? birthdayReminders : [])
          .filter(b => b.days_remaining >= 0 && b.days_remaining <= 7)
          .forEach(b => {
            const isToday = b.days_remaining === 0;
            items.push({
              id: `bday-${b.id}`,
              icon: isToday ? '🎂' : '🎁',
              text: isToday ? `${b.title} is today!` : `${b.title} in ${b.days_remaining} days`,
              type: 'birthday',
              urgent: isToday,
              daysRemaining: b.days_remaining,
              day: isToday ? 'TODAY' : `In ${b.days_remaining}d`
            });
          });

        // Process Upcoming Events
        (Array.isArray(upcomingEvents) ? upcomingEvents : [])
          .forEach(e => {
            const isToday = e.days_remaining === 0;
            items.push({
              id: `event-${e.id}`,
              icon: '📅',
              text: isToday ? `${e.title} — today!` : `${e.title}`,
              type: 'event',
              urgent: isToday,
              daysRemaining: e.days_remaining,
              day: isToday ? 'TODAY' : `In ${e.days_remaining}d`
            });
          });

        // Sort by urgency/days remaining
        items.sort((a, b) => a.daysRemaining - b.daysRemaining);

        setReminders(items);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
        setLoading(false);
      }
    };

    fetchReminders();
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
          className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold text-text-muted dark:text-text-muted-dark mb-2 px-1 text-center md:text-left"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {todayDate}
        </motion.p>

        {/* Dynamic Greeting */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 flex flex-wrap items-baseline justify-center md:justify-start gap-x-4"
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

        {/* Reminder Carousel */}
        {loading ? (
             <div className="flex justify-center md:justify-start">
               <motion.div
                 className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
               >
                 <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark italic animate-pulse">
                   ⚡ Syncing reminders...
                 </span>
               </motion.div>
             </div>
        ) : reminders.length > 0 ? (
          <ReminderCarousel reminders={reminders} />
        ) : null}
      </div>
    </motion.div>
  );
}
