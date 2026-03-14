import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  fetchReflections,
  createReflection,
  updateReflection,
  deleteReflection,
} from '../lib/supabaseReflections'
import ReflectionInput from './ReflectionInput'

function getWeekLabel(dateStr, t) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) return t('reflection.this_week')
  if (diffDays < 14) return t('reflection.last_week')
  const weeks = Math.floor(diffDays / 7)
  return t('reflection.weeks_ago', { count: weeks })
}

function getCategoryColor(cat) {
  const colors = {
    patience: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    gratitude: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    tawakkul: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    mercy: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    discipline: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    forgiveness: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    humility: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    other: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  }
  return colors[cat] || colors.other
}

export default function ReflectionTimeline({ onClose }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadReflections()
  }, [user.id])

  async function loadReflections() {
    const { data } = await fetchReflections(user.id)
    setReflections(data.map(rowToReflection))
    setLoading(false)
  }

  function rowToReflection(row) {
    return {
      id: row.id,
      text: row.text,
      surahNumber: row.surah_number,
      ayahNumber: row.ayah_number,
      referenceString: row.reference_str,
      category: row.category,
      createdAt: row.created_at,
    }
  }

  async function handleSave(data) {
    if (editItem) {
      const { data: updated } = await updateReflection(editItem.id, data)
      if (updated) {
        setReflections((prev) =>
          prev.map((r) => (r.id === editItem.id ? rowToReflection(updated) : r))
        )
      }
      setEditItem(null)
    } else {
      const { data: created } = await createReflection(user.id, data)
      if (created) {
        setReflections((prev) => [rowToReflection(created), ...prev])
      }
    }
    setShowInput(false)
  }

  async function handleDelete(id) {
    setDeletingId(id)
    const { error } = await deleteReflection(id)
    if (!error) {
      setReflections((prev) => prev.filter((r) => r.id !== id))
    }
    setDeletingId(null)
  }

  // Group reflections by week
  const grouped = reflections.reduce((acc, ref) => {
    const label = getWeekLabel(ref.createdAt, t)
    if (!acc[label]) acc[label] = []
    acc[label].push(ref)
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-50 dark:bg-zinc-950"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pb-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
      >
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {t('reflection.timeline_title')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditItem(null); setShowInput(true) }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 transition hover:bg-emerald-600"
          >
            <Plus size={16} className="text-white" strokeWidth={2.5} />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <X size={16} className="text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : reflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={40} className="mb-3 text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('reflection.empty')}</p>
            <button
              onClick={() => setShowInput(true)}
              className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              {t('reflection.write_first')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([weekLabel, items]) => (
              <div key={weekLabel}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {weekLabel}
                </p>
                <div className="relative space-y-3 pl-4">
                  {/* Timeline line */}
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-800" />

                  {items.map((ref, i) => (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-4 top-3 h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-white dark:bg-zinc-950" />

                      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                          "{ref.text}"
                        </p>

                        {ref.referenceString && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <BookOpen size={11} strokeWidth={2} />
                            Quran {ref.referenceString}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {ref.category && (
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getCategoryColor(ref.category)}`}>
                                {t(`reflection.categories.${ref.category}`)}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                              {new Date(ref.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditItem(ref); setShowInput(true) }}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                              <Pencil size={12} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDelete(ref.id)}
                              disabled={deletingId === ref.id}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            >
                              <Trash2 size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input overlay */}
      <AnimatePresence>
        {showInput && (
          <ReflectionInput
            onSave={handleSave}
            onClose={() => { setShowInput(false); setEditItem(null) }}
            editData={editItem}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
