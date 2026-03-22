/// <reference types="vite/client" />

import type { DriftLogAPI } from '../preload'

declare global {
  interface Window {
    api: DriftLogAPI
  }
}
