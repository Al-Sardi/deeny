/**
 * BottomNav - Fixed bottom tab bar for Prayers, Tasbih, Streaks, and Calendar.
 */
export default function BottomNav({ activeTab, onChangeTab }) {
  const tabs = [
    {
      id: 'prayers',
      label: 'Prayers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'tasbih',
      label: 'Tasbih',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* Prayer bead ring */}
          <circle cx="12" cy="10" r="7" />
          {/* Beads on the ring */}
          <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="4" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="17.8" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="18" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="16" cy="13.8" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15.8" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="8" cy="13.8" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="6" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="6.2" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="4" r="1.2" fill="currentColor" stroke="none" />
          {/* Tassel / pendant */}
          <line x1="12" y1="17" x2="12" y2="21" />
          <circle cx="12" cy="21.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      id: 'streaks',
      label: 'Streaks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
