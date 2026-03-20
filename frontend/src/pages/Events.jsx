import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2, Edit, Clock, Star, Tag, Search, CalendarDays } from 'lucide-react';
import { eventApi } from '../api/client';
import {
  EmptyState, SkeletonList, Input, Button, TextArea, Pagination, PageHeader, Badge, FloatingActionButton, Modal, ConfirmDialog, LoadingOverlay
} from '../components/UI';

import { useSwipe } from '../hooks/useSwipe';

const ITEMS_PER_PAGE = 10;

const categoryColors = {
  personal: { bg: 'bg-violet-500/10', text: 'text-violet-500', label: '💜 Personal' },
  work: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', label: '💼 Work' },
};

const statusColors = {
  today: 'border-success/40 bg-success/5',
  tomorrow: 'border-warning/40 bg-warning/5',
  upcoming: 'border-primary/30 bg-primary/5',
  future: 'border-border dark:border-border-dark bg-surface-card dark:bg-surface-card-dark',
};

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // category
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' or 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', category: 'personal', description: '', recurring: false });

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => timeFilter === 'week' && setTimeFilter('all'),
    onSwipeRight: () => timeFilter === 'all' && setTimeFilter('week'),
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evts, rems] = await Promise.all([eventApi.getAll(), eventApi.getReminders()]);
      setEvents(Array.isArray(evts) ? evts : []);
      setReminders(Array.isArray(rems) ? rems : []);
    } catch (e) {
      console.error('Failed to load events:', e);
      setError(e.message || 'Failed to load events');
      setEvents([]);
      setReminders([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setCurrentPage(1); }, [filter, timeFilter, search]);

  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter out birthdays from general events list as requested
  const allItems = [
    ...events.filter(e => e.category !== 'birthday'),
  ].sort((a, b) => a.days_remaining - b.days_remaining);

  const categoryFiltered = filter === 'all' ? allItems : allItems.filter(e => e.category === filter);
  
  const timeFiltered = timeFilter === 'all' 
    ? categoryFiltered 
    : categoryFiltered.filter(e => e.days_remaining <= 7);

  const searchFiltered = search 
    ? timeFiltered.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase()) || 
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
      )
    : timeFiltered;

  const paginated = searchFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setLoading(true);
    console.log("Saving Event:", form);
    try {
      if (editItem) {
        await eventApi.update(editItem.id, form);
      } else {
        await eventApi.create(form);
      }
      setShowAdd(false);
      setEditItem(null);
      setForm({ title: '', date: '', category: 'personal', description: '', recurring: false });
      await load();
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await eventApi.delete(deleteId);
      setDeleteId(null);
      load();
    }
  };

  const openEdit = (e) => {
    setEditItem(e);
    setForm({
      title: e.title,
      date: e.date ? e.date.split('T')[0] : '',
      category: e.category,
      description: e.description || '',
      recurring: e.recurring,
    });
    setShowAdd(true);
  };

  const todayItems = paginated.filter(e => e.status === 'today');
  const tomorrowItems = paginated.filter(e => e.status === 'tomorrow');
  const upcomingItems = paginated.filter(e => e.status === 'upcoming');
  const futureItems = paginated.filter(e => e.status === 'future');

  const renderGroup = (title, items, emoji) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-text-muted dark:text-text-muted-dark">
          {emoji} {title}
        </h3>
        <div className="flex flex-col gap-3">
          {items.map((e, i) => (
            <motion.div
              key={e.id}
              className="group rounded-3xl glass dark:glass-dark p-4 md:p-6 shadow-sm border border-white/10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 px-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-bold tracking-tight">{e.title}</span>
                    {e.isAutoReminder && <Badge variant="accent">auto</Badge>}
                  </div>
                  <p className="text-sm font-medium text-text-muted mb-2">
                    {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                  </p>
                  {e.description && <p className="text-xs text-text-muted dark:text-text-muted-dark leading-relaxed">{e.description}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    {e.status === 'today' ? (
                      <span className="text-lg font-black text-success">Today!</span>
                    ) : e.status === 'tomorrow' ? (
                      <span className="text-lg font-black text-warning">Tomorrow</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-primary">{e.days_remaining}</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">days</p>
                      </div>
                    )}
                  </div>
                  {!e.isAutoReminder && (
                    <div className="flex flex-col gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEdit(e)} className="rounded-xl p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(e.id)} className="rounded-xl p-2 bg-danger/10 text-danger hover:bg-danger/20"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto touch-pan-y"
      {...swipeHandlers}
    >
      <PageHeader title="Events & Reminders" onBack={() => navigate('/')}>
        <Button 
          onClick={() => { setForm({ title: '', date: '', category: 'personal', description: '', recurring: false }); setEditItem(null); setShowAdd(true); }}
          className="rounded-full !p-2 md:!p-2.5 shadow-md"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search events & reminders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl glass dark:glass-dark py-4 pl-12 pr-4 text-base outline-none transition-all focus:ring-4 focus:ring-primary/10 dark:text-text-dark"
        />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: '📋 All' },
          { id: 'personal', label: '💜 Personal' },
          { id: 'work', label: '💼 Work' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all border ${
              filter === f.id
                ? 'bg-primary border-primary text-white shadow-md'
                : 'glass dark:glass-dark text-text-muted border-white/20 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1 rounded-2xl glass dark:glass-dark p-1 shadow-sm w-fit">
          <button
            onClick={() => setTimeFilter('week')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              timeFilter === 'week'
                ? 'bg-white dark:bg-white/10 shadow-sm text-primary dark:text-white'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              timeFilter === 'all'
                ? 'bg-white dark:bg-white/10 shadow-sm text-primary dark:text-white'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark'
            }`}
          >
            View All
          </button>
        </div>
        {timeFilter === 'week' && (
          <p className="text-xs md:text-sm text-text-muted dark:text-text-muted-dark">
            Next <span className="font-semibold text-primary">7 Days</span>
          </p>
        )}
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-4 rounded-2xl bg-danger/10 p-4">
            <CalendarDays size={40} className="text-danger opacity-70" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-danger">Failed to load events</h3>
          <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">{error}</p>
          <Button onClick={load} variant="secondary">Retry</Button>
        </motion.div>
      ) : searchFiltered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events" description={search ? "No matches found." : timeFilter === 'all' ? "Add your first event or reminder" : "No events this month."} />
      ) : (
        <>
          {renderGroup('Today', todayItems, '🟢')}
          {renderGroup('Tomorrow', tomorrowItems, '🟡')}
          {renderGroup('This Week', upcomingItems, '🔵')}
          {renderGroup('Coming Up', futureItems, '⚪')}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(searchFiltered.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </>
      )}



      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditItem(null); }} title={editItem ? 'Edit Event' : 'Add Event'}>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event name" />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs md:text-sm font-medium text-text-muted dark:text-text-muted-dark">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
              className="rounded-xl border border-border bg-surface-card px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-surface-card-dark dark:text-text-dark transition-all"
            >
              <option value="personal">💜 Personal</option>
              <option value="work">💼 Work</option>
            </select>
          </div>
          <TextArea label="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={2} />
          <label className="flex items-center gap-2 text-sm dark:text-text-dark">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm(p => ({ ...p, recurring: e.target.checked }))} className="rounded accent-primary" />
            Recurring yearly
          </label>
          <Button onClick={handleSave} isLoading={loading}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Are you sure?" />
      
      <LoadingOverlay isActive={loading} message={editItem ? "Updating..." : "Loading..."} />
    </div>
  );
}
