import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  CheckSquare, TrendingUp, Grid3x3, BookHeart, Compass,
  ArrowRight, Sun, Star, CheckCircle, BookOpen, Shield,
  Bell, Sparkles, PenLine,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRef } from 'react'

/* ─── Reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Feature card data ─── */
const features = [
  { key: 'prayer_tracking', Icon: CheckSquare, bg: 'bg-[#EAF0EC]', color: 'text-[#2C5C45]' },
  { key: 'streaks', Icon: TrendingUp, bg: 'bg-[#FFF8E7]', color: 'text-[#D4AF37]' },
  { key: 'quran_reader', Icon: BookOpen, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { key: 'streak_freeze', Icon: Shield, bg: 'bg-blue-50', color: 'text-blue-600' },
  { key: 'reflections', Icon: PenLine, bg: 'bg-teal-50', color: 'text-teal-600' },
  { key: 'notifications', Icon: Bell, bg: 'bg-amber-50', color: 'text-amber-600' },
  { key: 'heatmap', Icon: Grid3x3, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { key: 'names', Icon: BookHeart, bg: 'bg-purple-50', color: 'text-purple-600' },
]

/* ─── Heatmap mock data ─── */
const heatmapRows = [
  [3,2,3,1,3,2,3],
  [3,3,0,2,3,3,3],
  [2,3,3,3,1,2,3],
  [3,0,1,3,3,3,3],
]

/* ─── Testimonials data ─── */
const testimonials = [
  { initial: 'M', nameKey: 'aisha', sourceKey: 'founder' },
  { initial: 'O', nameKey: 'omar', sourceKey: 'playstore' },
  { initial: 'F', nameKey: 'fatima', sourceKey: 'appstore' },
]

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-[#FDFBF7] text-[#2D3748] antialiased landing-pattern">

      {/* ═══════ Navigation ═══════ */}
      <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Deeny" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-2xl tracking-tight text-[#1A3A2A]">Deeny</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#features" className="text-gray-500 hover:text-[#2C5C45] transition-colors">{t('landing.nav_features')}</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-[#2C5C45] transition-colors">{t('landing.nav_how')}</a>
              <a href="#testimonials" className="text-gray-500 hover:text-[#2C5C45] transition-colors">{t('landing.nav_stories')}</a>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-[#2C5C45] font-medium hover:text-[#1A3A2A] transition-colors">
                {t('landing.login')}
              </Link>
              <Link to="/signup" className="bg-[#2C5C45] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#1A3A2A] hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {t('landing.get_started')}
              </Link>
            </div>
            {/* Mobile buttons */}
            <div className="flex sm:hidden items-center gap-3">
              <Link to="/login" className="text-[#2C5C45] text-sm font-medium">
                {t('landing.login')}
              </Link>
              <Link to="/signup" className="bg-[#2C5C45] text-white px-4 py-2 rounded-full text-sm font-medium">
                {t('landing.get_started')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════ Hero ═══════ */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#EAF0EC] text-[#2C5C45] font-medium text-sm mb-6">
                <Star className="w-4 h-4 mr-2 text-[#D4AF37]" />
                {t('landing.hero_badge')}
              </div>
              <h1 className="text-5xl tracking-tight font-extrabold text-[#1A3A2A] sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl mb-6 leading-tight">
                {t('landing.hero_title_1')}<br />
                <span className="text-[#2C5C45]">{t('landing.hero_title_2')}</span>
              </h1>
              <p className="mt-3 text-lg text-gray-500 sm:text-xl sm:mt-5 mb-8 lg:max-w-lg">
                {t('landing.hero_desc')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:max-w-lg sm:mx-auto lg:mx-0">
                <Link
                  to="/signup"
                  className="bg-[#2C5C45] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#1A3A2A] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {t('landing.get_started')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-white text-[#2C5C45] border border-gray-200 px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center"
                >
                  {t('landing.join_journey')}
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-400">{t('landing.available')}</p>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-16 lg:mt-0 lg:col-span-6 relative"
            >
              <div className="relative w-full max-w-sm mx-auto floating-anim">
                <div className="absolute -inset-4 bg-[#EAF0EC] rounded-full blur-3xl opacity-70" />
                <div className="phone-mockup w-full aspect-[1/2.1] mx-auto z-10 flex flex-col pt-12 px-6 pb-6 relative">
                  <div className="phone-notch" />
                  {/* Inside phone */}
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-xs text-gray-400">{t('landing.phone_today')}</p>
                      <h3 className="font-bold text-xl">{t('landing.phone_prayer')}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EAF0EC] flex items-center justify-center text-[#2C5C45]">
                      <Sun className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 border border-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">{t('landing.phone_streak')}</span>
                      <span className="text-[#2C5C45] font-bold bg-[#EAF0EC] px-2 py-1 rounded-lg text-sm">{t('landing.phone_days')}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      {['M','T','W','T','F'].map((d, i) => (
                        <div
                          key={i}
                          className={`w-8 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            i < 3
                              ? 'bg-[#2C5C45] text-white shadow-md'
                              : i === 3
                                ? 'border-2 border-[#2C5C45] text-[#2C5C45]'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#2C5C45] text-white rounded-3xl p-6 shadow-lg text-center mt-auto">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
                    <span className="font-semibold text-lg">{t('landing.phone_log')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ Features ═══════ */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#2C5C45] font-semibold tracking-wide uppercase text-sm mb-3">
              {t('landing.features_label')}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-[#1A3A2A] sm:text-4xl">
              {t('landing.features_title')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              {t('landing.features_desc')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.key} delay={i * 0.06}>
                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 h-full">
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-5`}>
                    <f.Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`landing.feat_${f.key}`)}</h3>
                  <p className="text-gray-500 text-sm">{t(`landing.feat_${f.key}_desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Journey — wide card */}
          <Reveal delay={0.5} className="mt-8">
            <div className="bg-[#2C5C45] text-white rounded-3xl p-8 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{t('landing.feat_journey')}</h3>
                  <p className="text-[#EAF0EC] text-lg max-w-xl">{t('landing.feat_journey_desc')}</p>
                </div>
                <a href="#how-it-works" className="inline-flex items-center text-white font-medium hover:text-[#D4AF37] transition-colors whitespace-nowrap">
                  {t('landing.feat_journey_link')} <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ How It Works ═══════ */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">{t('landing.how_title')}</h2>
            <p className="text-xl text-gray-500">{t('landing.how_desc')}</p>
          </Reveal>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10 -translate-y-1/2" />

            {[1, 2, 3].map((step) => (
              <Reveal key={step} delay={(step - 1) * 0.1} className="flex flex-col items-center text-center max-w-xs">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative ${
                  step === 2
                    ? 'bg-[#2C5C45] border-4 border-white shadow-lg z-10 scale-110'
                    : 'bg-[#FDFBF7] border border-gray-200 shadow-sm'
                }`}>
                  <span className={`text-2xl font-bold ${step === 2 ? 'text-white' : 'text-[#2C5C45]'}`}>{step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t(`landing.step${step}_title`)}</h3>
                <p className="text-gray-500">{t(`landing.step${step}_desc`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ App Preview (Bento) ═══════ */}
      <section className="py-24 bg-[#FDFBF7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('landing.preview_title')}</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Heatmap */}
            <Reveal>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">{t('landing.heatmap_title')}</h3>
                  <span className="text-[#2C5C45] text-sm font-semibold bg-[#EAF0EC] px-3 py-1 rounded-full">
                    {t('landing.heatmap_period')}
                  </span>
                </div>
                <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-gray-50">
                  <div className="grid grid-cols-7 gap-1">
                    {heatmapRows.flat().map((level, i) => (
                      <div key={i} className={`aspect-square rounded-[4px] ${
                        ['bg-[#EAF0EC]', 'bg-[#A3C9B3]', 'bg-[#5C9A75]', 'bg-[#2C5C45]'][level]
                      }`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-4">
                    <span>{t('landing.less')}</span>
                    <div className="flex gap-1">
                      {['bg-[#EAF0EC]','bg-[#A3C9B3]','bg-[#5C9A75]','bg-[#2C5C45]'].map((c, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                      ))}
                    </div>
                    <span>{t('landing.more')}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Weekly Report & Reflections */}
            <Reveal delay={0.1}>
              <div className="bg-[#2C5C45] text-white p-8 rounded-[2rem] shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">{t('landing.preview_report')}</h3>
                  <Sparkles className="text-[#D4AF37] w-6 h-6" />
                </div>
                <div className="space-y-4">
                  {/* Weekly completion bar */}
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">{t('landing.preview_weekly')}</span>
                      <span className="text-[#D4AF37] font-bold text-lg">86%</span>
                    </div>
                    <div className="bg-white/20 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#D4AF37] w-[86%] h-full rounded-full" />
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-[#EAF0EC]">
                      {['M','T','W','T','F','S','S'].map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className={`w-5 h-5 rounded-full ${i < 6 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Reflection preview */}
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <PenLine className="w-4 h-4 text-emerald-300" />
                      <span className="text-sm font-medium">{t('landing.preview_reflection')}</span>
                    </div>
                    <p className="text-[#EAF0EC] text-sm italic">{t('landing.preview_reflection_text')}</p>
                    <div className="mt-2 inline-block bg-white/20 text-xs px-2 py-0.5 rounded-full">2:153</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ Testimonials ═══════ */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('landing.testimonials_title')}</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((tm, i) => (
              <Reveal key={tm.nameKey} delay={i * 0.1}>
                <div className="bg-[#FDFBF7] p-8 rounded-3xl h-full flex flex-col">
                  <div className="flex text-[#D4AF37] mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic flex-1">
                    &ldquo;{t(`landing.review_${tm.nameKey}`)}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {tm.initial}
                    </div>
                    <div className="ml-3">
                      <p className="font-bold text-sm">{t(`landing.reviewer_${tm.nameKey}`)}</p>
                      <p className="text-xs text-gray-500">{t(`landing.review_source_${tm.sourceKey}`)}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Final CTA ═══════ */}
      <section className="relative py-24 bg-[#2C5C45] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-3xl" />
        </div>
        <Reveal className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden">
            <img src="/logo.png" alt="Deeny" className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-6">
            {t('landing.cta_title')}
          </h2>
          <p className="text-xl text-[#EAF0EC] mb-10 max-w-2xl mx-auto">
            {t('landing.cta_desc')}
          </p>
          <Link
            to="/signup"
            className="bg-white text-[#2C5C45] px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 mx-auto"
          >
            {t('landing.cta_button')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Reveal>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Deeny" className="w-5 h-5 rounded-full" />
            <span className="font-bold text-xl text-[#1A3A2A]">Deeny</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="/datenschutz" className="hover:text-[#2C5C45] transition">{t('landing.privacy')}</Link>
            <Link to="/impressum" className="hover:text-[#2C5C45] transition">Impressum</Link>
            <a href="mailto:support@deeny.app" className="hover:text-[#2C5C45] transition">{t('landing.support')}</a>
          </div>
          <p className="text-sm text-gray-400">{t('landing.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
