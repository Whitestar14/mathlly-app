import { type UseMemoryReturn } from '@/composables/useMemory'

declare module '@/composables/useMemory' {
  export function useMemory(): UseMemoryReturn
}