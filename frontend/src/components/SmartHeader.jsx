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
              x: { duration: 0.3 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 }
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
                ? 'bg-accent/15 text-accent animate-bounce shadow-sm shadow-accent/20' 
                : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'}
            `}>
              {item.icon}
            </div>
            
            <div className="flex flex-col min-w-0 flex-1 items-start text-left">
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  item.urgent ? 'text-accent' : 'text-primary/70 dark:text-primary-light/70'
                }`}>
                  {item.type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                  item.urgent ? 'text-accent' : 'text-text-muted dark:text-text-muted-dark'
                }`}>
                  {item.dayLabel}
                </span>
              </div>
              <div className="flex items-end justify-between w-full gap-2">
                <span className="text-lg md:text-xl font-black text-text dark:text-text-dark leading-none truncate block flex-1">
                  {item.name.replace(/'s birthday/i, '').replace(/ birthday/i, '')}
                </span>
                {item.dateLabel && (
                  <span className={`text-[10px] font-black uppercase tracking-[0.1em] shrink-0 ${
                    item.urgent ? 'text-accent' : 'text-text-muted dark:text-text-muted-dark'
                  }`}>
                    {item.dateLabel}
                  </span>
                )}
              </div>
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
        const birthdayRes = await fetch(`${API_BASE}/events/reminders`);
        const birthdayReminders = await birthdayRes.json();
        
        const items = [];

        // Process Birthdays - Only birthdays within 7 days as requested
        (Array.isArray(birthdayReminders) ? birthdayReminders : [])
          .filter(b => b.days_remaining >= 0 && b.days_remaining <= 7)
          .sort((a, b) => a.days_remaining - b.days_remaining)
          .slice(0, 5) // Limit to 5 as requested
          .forEach(b => {
            const isToday = b.days_remaining === 0;
            const dateObj = new Date(b.date);
            const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            items.push({
              id: `bday-${b.id}`,
              icon: isToday ? '🥳' : '🎂',
              name: b.title,
              type: 'Birthday',
              urgent: isToday,
              daysRemaining: b.days_remaining,
              dayLabel: isToday ? 'Today' : `In ${b.days_remaining} d`,
              dateLabel: dateLabel
            });
          });

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
    <div className="w-full max-w-2xl mx-auto mb-8 relative z-10">
      <div className="px-4 text-center md:text-left">
        {/* Date Subtitle */}
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold text-text-muted dark:text-text-muted-dark mb-2 px-1">
          {todayDate}
        </p>

        {/* Dynamic Greeting */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 flex flex-wrap items-baseline justify-center md:justify-start gap-x-4 text-text dark:text-text-dark">
          <span>{greeting},</span>
          <br className="md:hidden" />
          <span className="text-primary">Preetam</span>
          <span className="text-2xl md:text-4xl lg:text-5xl align-middle ml-1">✨</span>
        </h1>

        {/* Reminder Carousel */}
        {loading ? (
             <div className="flex justify-center md:justify-start">
               <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
                 <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark italic">
                   ⚡ Syncing reminders...
                 </span>
               </div>
             </div>
        ) : reminders.length > 0 ? (
          <ReminderCarousel reminders={reminders} />
        ) : null}
      </div>
    </div>
  );
}
