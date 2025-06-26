import Dexie, { type Table } from "dexie"
import { DEFAULT_SETTINGS } from '@/stores/settings'

// Define interfaces for your database tables
export interface HistoryEntry {
  id?: number
  timestamp: number
  expression?: string
  result?: string
  mode?: string
}

export interface Settings {
  id: number
  display: {
    precision: number
    useFractions: boolean
    formatting: {
      useThousandsSeparator: boolean
      formatBinary: boolean
      formatHexadecimal: boolean
      formatOctal: boolean
    }
    syntaxHighlighting: boolean
    textSize: string
  }
  calculator: {
    mode: string
    scientific?: {
      angleUnit: string
    }
    programmer?: {
      defaultBase: string
    }
  }
  appearance: {
    theme: string
    animationDisabled: boolean
    checkForUpdates: boolean
  }
  startup: {
    navigation: string
  }
}

// Define the database class
export class MathllyDatabase extends Dexie {
  history!: Table<HistoryEntry>
  settings!: Table<Settings>

  constructor() {
    super('mathlly-db')
    
    this.version(4).stores({
      history: '++id,timestamp',
      settings: 'id'
    }).upgrade(tx => {
      return tx.table('settings').toCollection().modify((settings: any) => {
        if (settings && !settings.display && settings.precision !== undefined) {
          const newSettings: Settings = {
            id: settings.id,
            display: {
              precision: settings.precision,
              useFractions: settings.useFractions,
              formatting: {
                useThousandsSeparator: settings.useThousandsSeparator,
                formatBinary: settings.formatBinary,
                formatHexadecimal: settings.formatHexadecimal,
                formatOctal: settings.formatOctal,
              },
              syntaxHighlighting: settings.syntaxHighlighting,
              textSize: settings.textSize,
            },
            calculator: {
              mode: settings.mode,
            },
            appearance: {
              theme: settings.theme,
              animationDisabled: settings.animationDisabled,
              checkForUpdates: settings.checkForUpdates,
            },
            startup: {
              navigation: settings.navigation,
            }
          }
          
          // Replace the old settings with the new structure
          Object.keys(settings).forEach(key => {
            delete settings[key]
          })
          
          Object.assign(settings, newSettings)
        }
      })
    })
  }
}

// Function to reset the database
export async function resetDatabase(): Promise<boolean> {
  try {
    // Close the current database connection
    await db.close()
    
    // Delete the database completely
    await Dexie.delete('mathlly-db')
    
    // Reload the page to reinitialize the database with defaults
    window.location.reload()
    
    return true
  } catch (error) {
    console.error("Error resetting database:", error)
    return false
  }
}

// Create database instance
const db = new MathllyDatabase()

// Perform database upgrade
db.on("ready", async () => {
  // If there are no settings, create default settings
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.add(DEFAULT_SETTINGS)
  }
})

export default db
