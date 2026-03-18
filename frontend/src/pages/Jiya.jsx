import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Trash2, Edit, Check, Save, FileText, ListChecks, User } from 'lucide-react';
import { jiyaApi } from '../api/client';
import {
  EmptyState, SkeletonList, Input, Button, TextArea, Pagination, PageHeader, FloatingActionButton, Modal, ConfirmDialog
} from '../components/UI';

const ITEMS_PER_PAGE = 10;

const TABS = [
  { id: 'details', label: 'Details', icon: User },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'bucketlist', label: 'Bucket List', icon: ListChecks },
];

export default function Jiya() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Jiya" onBack={() => navigate('/')} />

      {/* Tabs */}
      <div className="mb-4 md:mb-6 flex gap-1 rounded-2xl bg-surface-card p-1 dark:bg-surface-card-dark">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 md:gap-2 rounded-xl py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && <DetailsTab key="details" />}
        {activeTab === 'notes' && <NotesTab key="notes" />}
        {activeTab === 'bucketlist' && <BucketListTab key="bucketlist" />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Details Tab ────────────────────────────────────────── */
function DetailsTab() {
  const [details, setDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jiyaApi.getDetails().then((d) => {
      setDetails(d);
      setForm({
        clothing_sizes: d.clothing_sizes || {},
        contact_info: d.contact_info || {},
        preferences: d.preferences || {},
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const updated = await jiyaApi.updateDetails(form);
    setDetails(updated);
    setEditing(false);
  };

  const updateField = (section, key, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  if (loading) return <SkeletonList count={3} />;

  const renderSection = (title, section, icon) => (
    <motion.div
      className="rounded-2xl border border-border bg-surface-card p-3 md:p-4 dark:border-border-dark dark:bg-surface-card-dark"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-2 md:mb-3 flex items-center gap-2 text-xs md:text-sm font-semibold text-primary">
        {icon} {title}
      </h3>
      <div className="grid gap-2">
        {Object.entries(form[section] || {}).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 md:gap-3">
            <span className="w-24 md:w-28 text-[10px] md:text-xs font-medium capitalize text-text-muted dark:text-text-muted-dark truncate">
              {key.replace(/_/g, ' ')}
            </span>
            {editing ? (
              <input
                value={val}
                onChange={(e) => updateField(section, key, e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-card px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-surface-card-dark dark:text-text-dark min-w-0 transition-all"
              />
            ) : (
              <span className="text-xs md:text-sm truncate">{val || '—'}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {renderSection('Clothing Sizes', 'clothing_sizes', '👗')}
      {renderSection('Contact Info', 'contact_info', '📱')}
      {renderSection('Preferences', 'preferences', '💜')}
      <Button onClick={editing ? handleSave : () => setEditing(true)} variant={editing ? 'primary' : 'secondary'}>
        {editing ? <><Save size={16} className="inline mr-1" /> Save Changes</> : <><Edit size={16} className="inline mr-1" /> Edit</>}
      </Button>
    </motion.div>
  );
}

/* ─── Notes Tab ──────────────────────────────────────────── */
function NotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const load = () => {
    jiyaApi.getNotes().then(setNotes).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.title) return;
    if (editItem) {
      await jiyaApi.updateNote(editItem.id, form);
    } else {
      await jiyaApi.createNote(form);
    }
    setShowAdd(false);
    setEditItem(null);
    setForm({ title: '', content: '' });
    load();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await jiyaApi.deleteNote(deleteId);
      setDeleteId(null);
      load();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {loading ? <SkeletonList count={3} /> : notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Add notes about routines, habits, and more" />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {notes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((n, i) => (
              <motion.div
                key={n.id}
                className="group rounded-2xl border border-border bg-surface-card p-3 md:p-4 dark:border-border-dark dark:bg-surface-card-dark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-semibold truncate">{n.title}</h4>
                    <p className="mt-1 text-xs md:text-sm text-text-muted dark:text-text-muted-dark whitespace-pre-wrap line-clamp-4">{n.content}</p>
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                    <button onClick={() => { setEditItem(n); setForm({ title: n.title, content: n.content }); setShowAdd(true); }} className="rounded-lg p-1 hover:bg-primary/10"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                    <button onClick={() => setDeleteId(n.id)} className="rounded-lg p-1 hover:bg-danger/10 text-danger"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(notes.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <FloatingActionButton onClick={() => { setForm({ title: '', content: '' }); setEditItem(null); setShowAdd(true); }} icon={Plus} />

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditItem(null); }} title={editItem ? 'Edit Note' : 'Add Note'}>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title" />
          <TextArea label="Content" value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your note..." rows={4} />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Note" message="Are you sure?" />
    </motion.div>
  );
}

/* ─── Bucket List Tab ────────────────────────────────────── */
function BucketListTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const load = () => {
    jiyaApi.getBucketList().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async () => {
    if (!newTitle) return;
    await jiyaApi.createBucketItem({ title: newTitle });
    setNewTitle('');
    setShowAdd(false);
    load();
  };

  const toggleComplete = async (item) => {
    await jiyaApi.updateBucketItem(item.id, { completed: !item.completed });
    load();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await jiyaApi.deleteBucketItem(deleteId);
      setDeleteId(null);
      load();
    }
  };

  const completed = items.filter(i => i.completed).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Progress</span>
            <span className="text-sm font-semibold text-primary">{completed}/{items.length}</span>
          </div>
          <div className="h-2 rounded-full bg-border dark:bg-border-dark overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {loading ? <SkeletonList count={4} /> : items.length === 0 ? (
        <EmptyState icon={ListChecks} title="Bucket list is empty" description="Start adding dreams and goals!" />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item, i) => (
              <motion.div
                key={item.id}
                className={`group flex items-center gap-2 md:gap-3 rounded-2xl border p-2.5 md:p-3 transition-all ${
                  item.completed
                    ? 'border-success/20 bg-success/5'
                    : 'border-border bg-surface-card dark:border-border-dark dark:bg-surface-card-dark'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <motion.button
                  onClick={() => toggleComplete(item)}
                  className={`flex h-5 w-5 md:h-6 md:w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    item.completed ? 'border-success bg-success text-white' : 'border-border dark:border-border-dark hover:border-primary'
                  }`}
                  whileTap={{ scale: 0.8 }}
                >
                  {item.completed && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Check size={12} className="md:w-[14px] md:h-[14px]" />
                    </motion.div>
                  )}
                </motion.button>
                <span className={`flex-1 text-xs md:text-sm truncate ${item.completed ? 'line-through opacity-50' : ''}`}>{item.title}</span>
                <button onClick={() => setDeleteId(item.id)} className="rounded-lg p-1 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100 hover:bg-danger/10 text-danger shrink-0">
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </motion.div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(items.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <FloatingActionButton onClick={() => setShowAdd(true)} icon={Plus} />

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Bucket List Item">
        <div className="flex flex-col gap-4">
          <Input label="What's on your list?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Visit Paris" />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Item" message="Remove from bucket list?" />
    </motion.div>
  );
}
