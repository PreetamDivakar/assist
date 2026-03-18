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
  const [triggerAddNote, setTriggerAddNote] = useState(0);

  return (
    <div className="min-h-dvh p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Pree" onBack={() => navigate('/')}>
        {activeTab === 'notes' && (
          <Button 
            onClick={() => setTriggerAddNote(v => v + 1)}
            className="rounded-full !p-2 md:!p-2.5 shadow-md"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        )}
      </PageHeader>

      {/* Tabs - Segmented Control Style */}
      <div className="mb-8 flex gap-1 rounded-2xl glass dark:glass-dark p-1.5 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-white/10 shadow-sm text-primary dark:text-white'
                : 'text-text-muted hover:text-text dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && <DetailsTab key="details" />}
        {activeTab === 'notes' && <NotesTab key="notes" triggerAdd={triggerAddNote} />}
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
        clothing_sizes: d.clothing_sizes || {
          shirt_size: '',
          pant_size: '',
          underwear_size: '',
          baniyan_size: '',
          shoe_size: ''
        },
        personal: d.personal || {
          height_cm: '',
          height_ft: '',
          blood_group: '',
          company: '',
          fav_colour: ''
        },
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

  const FIELD_MAP = {
    clothing_sizes: [
      { key: 'shirt_size', label: 'Shirt Size' },
      { key: 'pant_size', label: 'Pant Size' },
      { key: 'underwear_size', label: 'Underwear Size' },
      { key: 'baniyan_size', label: 'Baniyan Size' },
      { key: 'shoe_size', label: 'Shoe Size (UK)' },
    ],
    personal: [
      { key: 'height_cm', label: 'Height (cm)' },
      { key: 'height_ft', label: 'Height (ft)' },
      { key: 'blood_group', label: 'Blood Group' },
      { key: 'company', label: 'Company' },
      { key: 'fav_colour', label: 'Fav Colour' },
    ]
  };

  const renderSection = (title, section, icon) => (
    <motion.div
      className="rounded-[2.5rem] glass dark:glass-dark p-6 md:p-8 premium-shadow mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary px-1">
        <span className="text-xl">{icon}</span> {title}
      </h3>
      <div className="grid gap-3 px-1">
        {FIELD_MAP[section].map(({ key, label }) => {
          const val = form[section]?.[key];
          return (
            <div key={key} className="flex items-center gap-2 md:gap-3 p-3 box-in-box mb-1 last:mb-0">
              <span className="w-24 md:w-28 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary/70 dark:text-primary-light/50 truncate px-1">
                {label}
              </span>
              {editing ? (
                <Input
                  value={val || ''}
                  onChange={(e) => updateField(section, key, e.target.value)}
                  className="!py-1 !px-2 !text-xs flex-1"
                />
              ) : (
                <span className="text-sm md:text-base truncate font-bold text-text dark:text-white flex-1 text-right md:text-left">{val || '—'}</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <motion.div className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {renderSection('Clothing Sizes', 'clothing_sizes', '👔')}
      {renderSection('Personal Information', 'personal', '👤')}
      <Button onClick={editing ? handleSave : () => setEditing(true)} variant={editing ? 'primary' : 'secondary'}>
        {editing ? <><Save size={16} className="inline mr-1" /> Save Changes</> : <><Edit size={16} className="inline mr-1" /> Edit</>}
      </Button>
    </motion.div>
  );
}

/* ─── Notes Tab ──────────────────────────────────────────── */
function NotesTab({ triggerAdd }) {
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

  // Handle header "Add" button trigger
  useEffect(() => {
    if (triggerAdd > 0) {
      setNoteForm({ title: '', content: '' });
      setEditNote(null);
      setShowAddNote(true);
    }
  }, [triggerAdd]);

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
          <div className="flex flex-col gap-4">
            {notes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((n, i) => (
              <motion.div
                key={n.id}
                className="group rounded-3xl glass dark:glass-dark p-5 md:p-6 shadow-sm border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 px-1">
                    <h4 className="text-lg font-bold tracking-tight mb-2">{n.title}</h4>
                    <p className="text-sm leading-relaxed text-text-muted dark:text-text-muted-dark whitespace-pre-wrap">{n.content}</p>
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                    <button onClick={() => { setEditNote(n); setNoteForm({ title: n.title, content: n.content }); setShowAddNote(true); }} className="rounded-xl p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteNoteId(n.id)} className="rounded-xl p-2 bg-danger/10 text-danger hover:bg-danger/20"><Trash2 className="w-4 h-4" /></button>
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
