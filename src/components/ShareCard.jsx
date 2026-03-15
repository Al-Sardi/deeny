import { useState, useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Share2, Download, X, Flame, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import { formatLocalDate } from '../lib/dateUtils'

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export default function ShareCard({ prayers, streak, history, onClose }) {
  const { t } = useTranslation()
  const cardRef = useRef(null)
  const [generating, setGenerating] = useState(false)

  const todayComplete = Object.values(prayers).filter(Boolean).length
  const allDone = todayComplete === 5
  const currentStreak = streak + (allDone ? 1 : 0)

  // Weekly stats
  const weekStats = useMemo(() => {
    const today = new Date()
    const todayStr = formatLocalDate(today)
    let completed = 0
    const days = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = formatLocalDate(d)

      if (dateStr === todayStr) {
        const count = Object.values(prayers).filter(Boolean).length
        completed += count
        days.push({ count, total: 5 })
      } else {
        const found = history.find((h) => h.date === dateStr)
        const count = found ? Object.values(found.prayers).filter(Boolean).length : 0
        completed += count
        days.push({ count, total: 5 })
      }
    }

    return { completed, total: 35, days, pct: Math.round((completed / 35) * 100) }
  }, [prayers, history])

  const generateImage = useCallback(async () => {
    if (!cardRef.current || generating) return
    setGenerating(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )

      if (!blob) throw new Error('Failed to generate image')

      const file = new File([blob], 'deeny-stats.png', { type: 'image/png' })

      // Try native share (mobile)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Deeny',
          text: t('share.share_text'),
        })
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'deeny-stats.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    } finally {
      setGenerating(false)
    }
  }, [generating, t])

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs mx-auto my-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── The shareable card (compact) ── */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1A3A2A 0%, #2C5C45 40%, #1A3A2A 100%)',
          }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <img
                  src="/logo.png"
                  alt="Deeny"
                  className="w-5 h-5 rounded-full"
                  crossOrigin="anonymous"
                />
                <span className="text-white/90 font-bold text-sm tracking-tight">
                  Deeny
                </span>
              </div>
              <span className="text-white/40 text-[10px]">deeny.app</span>
            </div>

            {/* Streak hero */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                <Flame size={24} className="text-orange-400" />
              </div>
              <p className="text-4xl font-extrabold text-white tracking-tight">
                {currentStreak}
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                {t('share.day_streak')}
              </p>
            </div>

            {/* Today's prayers */}
            <div className="bg-white/10 rounded-xl p-3 mb-3">
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-2">
                {t('share.today')}
              </p>
              <div className="flex justify-between">
                {PRAYER_NAMES.map((name) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        prayers[name]
                          ? 'bg-emerald-500'
                          : 'bg-white/10'
                      }`}
                    >
                      {prayers[name] && (
                        <CheckCircle size={14} className="text-white" strokeWidth={2.5} />
                      )}
                    </div>
                    <span className="text-[9px] text-white/50">
                      {name.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center mt-2 text-white/70 text-xs font-medium">
                {todayComplete}/5 {t('share.completed')}
              </p>
            </div>

            {/* Weekly bar */}
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                  {t('share.this_week')}
                </p>
                <span className="text-emerald-400 font-bold text-xs">
                  {weekStats.pct}%
                </span>
              </div>
              <div className="flex justify-between gap-1">
                {weekStats.days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-white/10 rounded-full h-10 flex flex-col-reverse overflow-hidden">
                      <div
                        className="bg-emerald-500 rounded-full w-full"
                        style={{ height: `${(day.count / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-white/40">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer motivational text */}
            <p className="text-center text-white/30 text-[9px] mt-3">
              {allDone ? t('share.all_done_msg') : t('share.keep_going_msg')}
            </p>
          </div>
        </div>

        {/* ── Action buttons (outside the card, not captured) ── */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-3 text-sm font-medium text-white backdrop-blur-sm"
          >
            <X size={16} />
            {t('share.close')}
          </button>
          <button
            onClick={generateImage}
            disabled={generating}
            className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-[#2C5C45] disabled:opacity-50"
          >
            {generating ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#2C5C45] border-t-transparent rounded-full" />
            ) : navigator.canShare ? (
              <Share2 size={16} />
            ) : (
              <Download size={16} />
            )}
            {generating
              ? t('share.generating')
              : navigator.canShare
                ? t('share.share_button')
                : t('share.download_button')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
