/**
 * BottomNav - Fixed bottom tab bar for switching between Prayers and Tasbih.
 */
export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-md">
        <button
          onClick={() => onChangeTab('prayers')}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
            ${activeTab === 'prayers'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-400 dark:text-gray-500'
            }`}
        >
          {/* Checklist icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prayers
        </button>

        <button
          onClick={() => onChangeTab('tasbih')}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
            ${activeTab === 'tasbih'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-400 dark:text-gray-500'
            }`}
        >
          {/* Counter / beads icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tasbih
        </button>
      </div>
    </nav>
  )
}
