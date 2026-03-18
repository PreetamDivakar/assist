import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Search, Plus, Trash2, Edit, Bell, BellOff } from 'lucide-react';
import { birthdayApi } from '../api/client';
import {
  EmptyState, SkeletonList, Input, Button, TextArea, Pagination, PageHeader, Badge, FloatingActionButton, Modal, ConfirmDialog, LoadingOverlay
} from '../components/UI';

const ITEMS_PER_PAGE = 10;

export default function Birthdays() {
  const navigate = useNavigate();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('month'); // 'month' or 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', notes: '' });

  const currentMonth = new Date().getMonth() + 1;

  const load = async () => {
    setLoading(true);
    try {
      const data = search
        ? await birthdayApi.getAll(search)
        : filter === 'all'
          ? await birthdayApi.getAll()
          : await birthdayApi.getByMonth(currentMonth);
      
      // Sort by days_remaining (closest first) as requested
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => a.days_remaining - b.days_remaining);
      
      setBirthdays(sorted);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load birthdays');
    }
    setLoading(false);
  };

  useEffect(() => { setCurrentPage(1); load(); }, [search, filter]);

  const handleSave = async () => {
    if (!form.name || !form.date) return;
    setLoading(true);
    try {
      if (editItem) {
        await birthdayApi.update(editItem.id, form);
      } else {
        await birthdayApi.create(form);
      }
      setShowAdd(false);
      setEditItem(null);
      setForm({ name: '', date: '', notes: '' });
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to save birthday');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await birthdayApi.delete(deleteId);
      setDeleteId(null);
      load();
    }
  };

  const openEdit = (b) => {
    setEditItem(b);
    // Ensure date is in YYYY-MM-DD format for the input
    const dateStr = b.date ? b.date.split('T')[0] : '';
    setForm({ name: b.name, date: dateStr, notes: b.notes || '' });
    setShowAdd(true);
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Birthdays" onBack={() => navigate('/')}>
        <Button 
          onClick={() => { setForm({ name: '', date: '', notes: '' }); setEditItem(null); setShowAdd(true); }}
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
          placeholder="Search birthdays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl glass dark:glass-dark py-4 pl-12 pr-4 text-base outline-none transition-all focus:ring-4 focus:ring-primary/10 dark:text-text-dark"
        />
      </div>

      {!search && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1 rounded-2xl glass dark:glass-dark p-1 shadow-sm w-fit">
            <button
              onClick={() => setFilter('month')}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                filter === 'month'
                  ? 'bg-white dark:bg-white/10 shadow-sm text-primary dark:text-white'
                  : 'text-text-muted hover:text-text dark:text-text-muted-dark'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-white/10 shadow-sm text-primary dark:text-white'
                  : 'text-text-muted hover:text-text dark:text-text-muted-dark'
              }`}
            >
              View All
            </button>
          </div>
          {filter === 'month' && (
            <p className="text-xs md:text-sm text-text-muted dark:text-text-muted-dark">
              Showing <span className="font-semibold text-primary">{months[currentMonth - 1]}</span>
            </p>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : birthdays.length === 0 ? (
        <EmptyState icon={Cake} title="No birthdays found" description={search ? 'Try a different search' : filter === 'all' ? 'Your birthday list is empty. Add one!' : 'No birthdays this month. Add one!'} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {birthdays.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((b) => (
                <motion.div
                  key={b.id}
                  className={`group relative rounded-3xl p-5 transition-all glass dark:glass-dark premium-shadow ${
                    b.is_upcoming ? 'ring-2 ring-accent/20' : ''
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg font-bold tracking-tight">{b.name}</span>
                        {b.is_upcoming && <Badge variant="warning">🔥 Upcoming!</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-muted">
                          {new Date(b.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </span>
                        {b.reminder_enabled ? (
                          <Bell className="w-4 h-4 text-primary" />
                        ) : (
                          <BellOff className="w-4 h-4 text-text-muted opacity-40" />
                        )}
                      </div>
                      {b.notes && <p className="mt-2 text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">{b.notes}</p>}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className={`text-3xl font-black ${b.days_remaining <= 3 ? 'text-danger' : 'text-primary'}`}>
                          {b.days_remaining}
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">days left</p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(b)} className="rounded-xl p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="rounded-xl p-2 bg-danger/10 text-danger hover:bg-danger/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(birthdays.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </>
      )}



      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditItem(null); }} title={editItem ? 'Edit Birthday' : 'Add Birthday'}>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter name" />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
          <TextArea label="Notes" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" rows={2} />
          <Button onClick={handleSave} isLoading={loading}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Birthday"
        message="Are you sure you want to delete this birthday?"
      />

      <LoadingOverlay isActive={loading} message={editItem ? "Updating..." : "Creating..."} />
    </div>
  );
}
