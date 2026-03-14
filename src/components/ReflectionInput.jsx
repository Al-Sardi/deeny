import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, BookOpen, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CATEGORIES = [
  'patience',
  'gratitude',
  'tawakkul',
  'mercy',
  'discipline',
  'forgiveness',
  'humility',
  'other',
]

export default function ReflectionInput({ onSave, onClose, editData }) {
  const { t } = useTranslation()
  const [text, setText] = useState(editData?.text ?? '')
  const [refInput, setRefInput] = useState(
    editData?.referenceString ?? (editData?.surahNumber ? `${editData.surahNumber}:${editData.ayahNumber}` : '')
  )
  const [category, setCategory] = useState(editData?.category ?? '')
  const [saving, setSaving] = useState(false)

  function parseRef(input) {
    const trimmed = input.trim()
    if (!trimmed) return { surahNumber: null, ayahNumber: null, referenceString: null }
    const match = trimmed.match(/^(\d+)\s*:\s*(\d+)$/)
    if (match) {
      return {
        surahNumber: parseInt(match[1], 10),
        ayahNumber: parseInt(match[2], 10),
        referenceString: `${match[1]}:${match[2]}`,
      }
    }
    return { surahNumber: null, ayahNumber: null, referenceString: trimmed }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || saving) return

    setSaving(true)
    const ref = parseRef(refInput)
    await onSave({
      text: text.trim(),
      ...ref,
      category: category || null,
    })
    setSaving(false)
  }

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
          {editData ? t('reflection.edit_title') : t('reflection.new_title')}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <X size={16} className="text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-8">
        {/* Text input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('reflection.learning_label')} *
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('reflection.learning_placeholder')}
            rows={5}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            autoFocus
          />
        </div>

        {/* Verse reference */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <BookOpen size={12} strokeWidth={2} />
            {t('reflection.verse_label')}
          </label>
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder={t('reflection.verse_placeholder')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('reflection.category_label')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {t(`reflection.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={!text.trim() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} strokeWidth={2} />
            {saving ? t('reflection.saving') : t('reflection.save')}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
