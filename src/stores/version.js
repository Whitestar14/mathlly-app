import { defineStore } from 'pinia'
import pkg from '../../package.json'

export const useVersionStore = defineStore('version', {
  state: () => ({
    version: pkg.version,
    buildDate: new Date().toISOString()
  }),
  
  getters: {
    versionInfo: (state) => ({
      full: state.version,
      ...state.version.split('.').reduce((acc, val, idx) => ({
        ...acc,
        [['major', 'minor', 'patch'][idx]]: val
      }), {}),
      isBeta: state.version.includes('beta')
    })
  }
})