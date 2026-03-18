import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Save, Plus, Trash2, FileText } from 'lucide-react';
import { preeApi } from '../api/client';
import { Input, Button, TextArea, FloatingActionButton, Pagination, PageHeader, SkeletonList, EmptyState, Modal, ConfirmDialog } from '../components/UI';

const ITEMS_PER_PAGE = 10;

const TABS = [
  { id: 'details', label: 'Details', icon: User },
  { id: 'notes', label: 'Notes', icon: FileText },
];

export default function Pree() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Pree" onBack={() => navigate('/')} />

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
    preeApi.getDetails().then((d) => {
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
    const updated = await preeApi.updateDetails(form);
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
      {renderSection('Clothing Sizes', 'clothing_sizes', '👔')}
      {renderSection('Contact Info', 'contact_info', '📱')}
      {renderSection('Preferences', 'preferences', '💚')}
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
  const [showAddNote, setShowAddNote] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const loadNotes = () => {
    preeApi.getNotes().then(setNotes).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadNotes, []);

  const handleSaveNote = async () => {
    if (!noteForm.title) return;
    if (editNote) {
      await preeApi.updateNote(editNote.id, noteForm);
    } else {
      await preeApi.createNote(noteForm);
    }
    setShowAddNote(false);
    setEditNote(null);
    setNoteForm({ title: '', content: '' });
    loadNotes();
  };

  const handleDeleteNote = async () => {
    if (deleteNoteId) {
      await preeApi.deleteNote(deleteNoteId);
      setDeleteNoteId(null);
      loadNotes();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {loading ? <SkeletonList count={3} /> : notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Add notes about Pree" />
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
                          <button onClick={() => { setEditNote(n); setNoteForm({ title: n.title, content: n.content }); setShowAddNote(true); }} className="rounded-lg p-1 hover:bg-primary/10"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          <button onClick={() => setDeleteNoteId(n.id)} className="rounded-lg p-1 hover:bg-danger/10 text-danger"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
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

      <FloatingActionButton onClick={() => { setNoteForm({ title: '', content: '' }); setEditNote(null); setShowAddNote(true); }} icon={Plus} />

      <Modal isOpen={showAddNote} onClose={() => { setShowAddNote(false); setEditNote(null); }} title={editNote ? 'Edit Note' : 'Add Note'}>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={noteForm.title} onChange={(e) => setNoteForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title" />
          <TextArea label="Content" value={noteForm.content} onChange={(e) => setNoteForm(p => ({ ...p, content: e.target.value }))} placeholder="Write..." rows={4} />
          <Button onClick={handleSaveNote}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteNoteId} onClose={() => setDeleteNoteId(null)} onConfirm={handleDeleteNote} title="Delete Note" message="Are you sure?" />
    </motion.div>
  );
}
