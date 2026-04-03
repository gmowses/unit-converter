import { useState } from 'react'
import { Sun, Moon, Languages, Ruler } from 'lucide-react'

const translations = {
  en: {
    title: 'Universal Unit Converter',
    subtitle: 'Convert length, weight, temperature and speed. All calculations run client-side.',
    length: 'Length',
    weight: 'Weight',
    temperature: 'Temperature',
    speed: 'Speed',
    inputValue: 'Input value',
    fromUnit: 'From',
    results: 'Results',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Conversor Universal de Unidades',
    subtitle: 'Converta comprimento, peso, temperatura e velocidade. Tudo no navegador.',
    length: 'Comprimento',
    weight: 'Peso',
    temperature: 'Temperatura',
    speed: 'Velocidade',
    inputValue: 'Valor de entrada',
    fromUnit: 'De',
    results: 'Resultados',
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations
type Category = 'length' | 'weight' | 'temperature' | 'speed'

const LENGTH_UNITS = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'mi'] as const
const WEIGHT_UNITS = ['mg', 'g', 'kg', 'lb', 'oz', 'ton'] as const
const TEMP_UNITS = ['°C', '°F', 'K'] as const
const SPEED_UNITS = ['m/s', 'km/h', 'mph', 'knots', 'ft/s'] as const

// All to base unit (m, g, K, m/s)
const lengthToM: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, mi: 1609.344 }
const weightToG: Record<string, number> = { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495, ton: 1e6 }
const speedToMs: Record<string, number> = { 'm/s': 1, 'km/h': 1/3.6, mph: 0.44704, knots: 0.514444, 'ft/s': 0.3048 }

function convertLength(val: number, from: string): Record<string, string> {
  const base = val * (lengthToM[from] ?? 1)
  const res: Record<string, string> = {}
  for (const u of LENGTH_UNITS) {
    const v = base / (lengthToM[u] ?? 1)
    res[u] = formatNum(v)
  }
  return res
}

function convertWeight(val: number, from: string): Record<string, string> {
  const base = val * (weightToG[from] ?? 1)
  const res: Record<string, string> = {}
  for (const u of WEIGHT_UNITS) {
    const v = base / (weightToG[u] ?? 1)
    res[u] = formatNum(v)
  }
  return res
}

function convertTemp(val: number, from: string): Record<string, string> {
  let celsius: number
  if (from === '°C') celsius = val
  else if (from === '°F') celsius = (val - 32) * 5/9
  else celsius = val - 273.15 // K

  return {
    '°C': formatNum(celsius),
    '°F': formatNum(celsius * 9/5 + 32),
    'K': formatNum(celsius + 273.15),
  }
}

function convertSpeed(val: number, from: string): Record<string, string> {
  const base = val * (speedToMs[from] ?? 1)
  const res: Record<string, string> = {}
  for (const u of SPEED_UNITS) {
    const v = base / (speedToMs[u] ?? 1)
    res[u] = formatNum(v)
  }
  return res
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(4)
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return parseFloat(n.toPrecision(8)).toString()
}

const CATEGORIES: { key: Category; icon: string }[] = [
  { key: 'length', icon: '📏' },
  { key: 'weight', icon: '⚖️' },
  { key: 'temperature', icon: '🌡️' },
  { key: 'speed', icon: '💨' },
]

const UNITS_BY_CAT: Record<Category, readonly string[]> = {
  length: LENGTH_UNITS,
  weight: WEIGHT_UNITS,
  temperature: TEMP_UNITS,
  speed: SPEED_UNITS,
}

export default function UnitConverter() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [category, setCategory] = useState<Category>('length')
  const [fromUnit, setFromUnit] = useState<string>('m')
  const [inputVal, setInputVal] = useState('1')

  const t = translations[lang]

  const toggleDark = () => {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  const units = UNITS_BY_CAT[category]

  const getResults = (): Record<string, string> | null => {
    const num = parseFloat(inputVal)
    if (isNaN(num)) return null
    if (category === 'length') return convertLength(num, fromUnit)
    if (category === 'weight') return convertWeight(num, fromUnit)
    if (category === 'temperature') return convertTemp(num, fromUnit)
    if (category === 'speed') return convertSpeed(num, fromUnit)
    return null
  }

  const results = getResults()

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat)
    setFromUnit(UNITS_BY_CAT[cat][0])
    setInputVal('1')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Ruler size={18} className="text-white" />
            </div>
            <span className="font-semibold">Unit Converter</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/unit-converter" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${category === key ? 'bg-teal-500 text-white border-teal-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <span>{icon}</span>
                {t[key]}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input panel */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.inputValue}</label>
                <input
                  type="number"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 font-mono text-xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.fromUnit}</label>
                <div className="grid grid-cols-3 gap-2">
                  {units.map(u => (
                    <button
                      key={u}
                      onClick={() => setFromUnit(u)}
                      className={`px-3 py-2 rounded-lg text-sm font-mono font-semibold border transition-colors ${fromUnit === u ? 'bg-teal-500 text-white border-teal-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <h2 className="font-semibold">{t.results}</h2>
              {results ? (
                <div className="space-y-3">
                  {Object.entries(results).map(([unit, value]) => (
                    <div
                      key={unit}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 ${unit === fromUnit ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800' : 'bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800'}`}
                    >
                      <span className="font-mono text-sm font-semibold text-zinc-500 dark:text-zinc-400 w-16">{unit}</span>
                      <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-400 italic text-sm">Enter a value to see results</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-teal-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
