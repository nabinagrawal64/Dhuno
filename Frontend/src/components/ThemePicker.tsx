import { useTheme } from '../context/ThemeContext'
import { themes, type Theme, type ThemeId } from '../themes'

const CheckIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10l4.5 4.5L16 6" />
  </svg>
)

function ThemeCard({ theme, isActive }: { theme: Theme; isActive: boolean }) {
  const { setTheme } = useTheme()

  const gradient = theme.gradientVia
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`
    : `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`

  return (
    <button
      type="button"
      onClick={() => setTheme(theme.id as ThemeId)}
      aria-pressed={isActive}
      aria-label={`Select ${theme.name} theme`}
      className={[
        'group relative flex flex-col gap-3 rounded-2xl p-1 text-left transition-all duration-300',
        isActive
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
          : 'ring-1 ring-white/10 hover:ring-white/30',
      ].join(' ')}
    >
      {/* Gradient preview swatch */}
      <div
        className="relative h-24 w-full rounded-xl overflow-hidden shadow-lg"
        style={{ background: gradient }}
      >
        {/* Sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Active checkmark */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-xl"
              style={{ backgroundColor: theme.gradientFrom + 'cc' }}
            >
              <CheckIcon />
            </div>
          </div>
        )}

        {/* Mini accent dots */}
        <div
          className="absolute bottom-2 right-2 flex gap-1.5"
          aria-hidden
        >
          <span
            className="block h-2.5 w-2.5 rounded-full opacity-90 shadow"
            style={{ backgroundColor: theme.gradientTo }}
          />
          <span
            className="block h-2.5 w-2.5 rounded-full opacity-70 shadow"
            style={{ backgroundColor: theme.gradientVia ?? theme.gradientFrom }}
          />
          <span
            className="block h-2.5 w-2.5 rounded-full opacity-50 shadow"
            style={{ backgroundColor: theme.gradientFrom }}
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-1 pb-1">
        <p
          className={[
            'text-sm font-bold tracking-tight transition-colors',
            isActive ? 'text-primary' : 'text-on-surface group-hover:text-primary',
          ].join(' ')}
        >
          {theme.name}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-on-surface-variant">
          {theme.tagline}
        </p>
      </div>
    </button>
  )
}

export default function ThemePicker() {
  const { currentTheme } = useTheme()

  return (
    <section
      id="theme-picker"
      className="glass-panel rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
        <div>
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" aria-hidden>
              palette
            </span>
            Appearance
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Choose a colour theme — changes apply instantly across the app.
          </p>
        </div>

        {/* Live swatch of active theme */}
        <div
          className="hidden sm:flex h-11 w-24 rounded-xl shadow-lg shrink-0"
          style={{
            background: currentTheme.gradientVia
              ? `linear-gradient(135deg, ${currentTheme.gradientFrom}, ${currentTheme.gradientVia}, ${currentTheme.gradientTo})`
              : `linear-gradient(135deg, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`,
          }}
          aria-label={`Current: ${currentTheme.name}`}
        />
      </div>

      {/* Theme grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={theme.id === currentTheme.id}
            />
          ))}
        </div>

        {/* Active theme banner */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary/8 border border-primary/15 px-4 py-3">
          <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden>
            check_circle
          </span>
          <span className="text-sm font-semibold text-on-surface">
            Active theme:{' '}
            <span className="text-primary">{currentTheme.name}</span>
            <span className="text-on-surface-variant font-normal">
              {' '}— {currentTheme.tagline}
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
