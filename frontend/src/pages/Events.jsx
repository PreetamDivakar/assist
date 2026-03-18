import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Trash2, Edit, Clock, Star, Tag, Search } from 'lucide-react';
import { eventApi } from '../api/client';
import {
  EmptyState, SkeletonList, Input, Button, TextArea, Pagination, PageHeader, Badge, FloatingActionButton, Modal, ConfirmDialog
} from '../components/UI';

const ITEMS_PER_PAGE = 10;

const categoryColors = {
  birthday: { bg: 'bg-pink-500/10', text: 'text-pink-500', label: '🎂 Birthday' },
  personal: { bg: 'bg-violet-500/10', text: 'text-violet-500', label: '💜 Personal' },
  custom: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: '⭐ Custom' },
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
  const [timeFilter, setTimeFilter] = useState('all'); // 'month' or 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', category: 'custom', description: '', recurring: false });

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

  const allItems = [
    ...reminders.map(r => ({ ...r, isAutoReminder: true })),
    ...events,
  ].sort((a, b) => a.days_remaining - b.days_remaining);

  const categoryFiltered = filter === 'all' ? allItems : allItems.filter(e => e.category === filter);
  
  const timeFiltered = timeFilter === 'all' 
    ? categoryFiltered 
    : categoryFiltered.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
      });

  const searchFiltered = search 
    ? timeFiltered.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase()) || 
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
      )
    : timeFiltered;

  const paginated = searchFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    if (editItem) {
      await eventApi.update(editItem.id, form);
    } else {
      await eventApi.create(form);
    }
    setShowAdd(false);
    setEditItem(null);
    setForm({ title: '', date: '', category: 'custom', description: '', recurring: false });
    load();
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
      date: e.date,
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
        <div className="flex flex-col gap-2">
          {items.map((e, i) => (
            <motion.div
              key={`${e.id}-${e.title}-${i}`}
              className={`group rounded-2xl border p-4 transition-all ${statusColors[e.status] || statusColors.future}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 shrink min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <span className="text-sm md:text-base font-semibold truncate">{e.title}</span>
                    {e.isAutoReminder && <Badge variant="accent">auto</Badge>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[e.category]?.bg} ${categoryColors[e.category]?.text} shrink-0`}>
                      {categoryColors[e.category]?.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs md:text-sm text-text-muted dark:text-text-muted-dark truncate">
                    {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                  </p>
                  {e.description && <p className="mt-1 text-xs text-text-muted dark:text-text-muted-dark line-clamp-2 md:line-clamp-none">{e.description}</p>}
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="text-right">
                    {e.status === 'today' ? (
                      <span className="text-base md:text-lg font-bold text-success">Today!</span>
                    ) : e.status === 'tomorrow' ? (
                      <span className="text-base md:text-lg font-bold text-warning">Tomorrow</span>
                    ) : (
                      <>
                        <span className="text-xl md:text-2xl font-bold text-primary">{e.days_remaining}</span>
                        <p className="text-[10px] md:text-xs text-text-muted dark:text-text-muted-dark">days</p>
                      </>
                    )}
                  </div>
                  {!e.isAutoReminder && (
                    <div className="flex flex-col gap-1 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEdit(e)} className="rounded-lg p-1 hover:bg-primary/10"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                      <button onClick={() => setDeleteId(e.id)} className="rounded-lg p-1 hover:bg-danger/10 text-danger"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
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
    <div className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Events & Reminders" onBack={() => navigate('/')} />

      {/* Search */}
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-3 top-1/2 w-4 h-4 md:w-5 md:h-5 -translate-y-1/2 text-text-muted dark:text-text-muted-dark" />
        <input
          type="text"
          placeholder="Search events & reminders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface-card py-2.5 md:py-3 pl-9 md:pl-10 pr-4 text-sm md:text-base outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-surface-card-dark dark:text-text-dark"
        />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: '📋 All' },
          { id: 'birthday', label: '🎂 Birthdays' },
          { id: 'personal', label: '💜 Personal' },
          { id: 'custom', label: '⭐ Custom' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                : 'bg-surface-card text-text-muted hover:bg-primary/10 dark:bg-surface-card-dark dark:text-text-muted-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-surface-card p-1 dark:bg-surface-card-dark w-fit">
          <button
            onClick={() => setTimeFilter('month')}
            className={`rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium transition-all ${
              timeFilter === 'month'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium transition-all ${
              timeFilter === 'all'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark'
            }`}
          >
            View All
          </button>
        </div>
        {timeFilter === 'month' && (
          <p className="text-xs md:text-sm text-text-muted dark:text-text-muted-dark">
            Showing <span className="font-semibold text-primary">{new Date().toLocaleString('default', { month: 'long' })}</span>
          </p>
        )}
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

      <FloatingActionButton onClick={() => { setForm({ title: '', date: '', category: 'custom', description: '', recurring: false }); setEditItem(null); setShowAdd(true); }} icon={Plus} />

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
              <option value="birthday">🎂 Birthday</option>
              <option value="personal">💜 Personal</option>
              <option value="custom">⭐ Custom</option>
            </select>
          </div>
          <TextArea label="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={2} />
          <label className="flex items-center gap-2 text-sm dark:text-text-dark">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm(p => ({ ...p, recurring: e.target.checked }))} className="rounded accent-primary" />
            Recurring yearly
          </label>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Are you sure?" />
    </div>
  );
}
