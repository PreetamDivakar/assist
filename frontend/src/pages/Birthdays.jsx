import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Search, Plus, Trash2, Edit, Bell, BellOff } from 'lucide-react';
import { birthdayApi } from '../api/client';
import {
  EmptyState, SkeletonList, Input, Button, TextArea, Pagination, PageHeader, Badge, FloatingActionButton, Modal, ConfirmDialog
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
      setBirthdays(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { setCurrentPage(1); load(); }, [search, filter]);

  const handleSave = async () => {
    if (!form.name || !form.date) return;
    if (editItem) {
      await birthdayApi.update(editItem.id, form);
    } else {
      await birthdayApi.create(form);
    }
    setShowAdd(false);
    setEditItem(null);
    setForm({ name: '', date: '', notes: '' });
    load();
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
    setForm({ name: b.name, date: b.date, notes: b.notes || '' });
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
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-3 top-1/2 w-4 h-4 md:w-5 md:h-5 -translate-y-1/2 text-text-muted dark:text-text-muted-dark" />
        <input
          type="text"
          placeholder="Search birthdays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface-card py-2.5 md:py-3 pl-9 md:pl-10 pr-4 text-sm md:text-base outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-surface-card-dark dark:text-text-dark"
        />
      </div>

      {!search && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl bg-surface-card p-1 dark:bg-surface-card-dark w-fit">
            <button
              onClick={() => setFilter('month')}
              className={`rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium transition-all ${
                filter === 'month'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow'
                  : 'text-text-muted hover:text-text dark:text-text-muted-dark'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow'
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
              {birthdays.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((b, i) => (
                <motion.div
                  key={b.id}
                  className={`group relative rounded-2xl border p-4 transition-all ${
                    b.is_upcoming
                      ? 'border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5 shadow-lg shadow-accent/10'
                      : 'border-border bg-surface-card dark:border-border-dark dark:bg-surface-card-dark'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 shrink min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <span className="text-sm md:text-base font-semibold truncate">{b.name}</span>
                        {b.is_upcoming && <Badge variant="warning">🔥 Upcoming!</Badge>}
                        {b.reminder_enabled ? (
                          <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-light shrink-0" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-text-muted dark:text-text-muted-dark shrink-0" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs md:text-sm text-text-muted dark:text-text-muted-dark truncate">
                        {new Date(b.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                      {b.notes && <p className="mt-1 text-xs text-text-muted dark:text-text-muted-dark line-clamp-2 md:line-clamp-none">{b.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-xl md:text-2xl font-bold ${b.days_remaining <= 3 ? 'text-accent' : 'text-primary'}`}>
                          {b.days_remaining}
                        </span>
                        <p className="text-[10px] md:text-xs text-text-muted dark:text-text-muted-dark">days left</p>
                      </div>
                      <div className="flex flex-col gap-1 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(b)} className="rounded-lg p-1 hover:bg-primary/10">
                          <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="rounded-lg p-1 hover:bg-danger/10 text-danger">
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Birthday"
        message="Are you sure you want to delete this birthday?"
      />
    </div>
  );
}
