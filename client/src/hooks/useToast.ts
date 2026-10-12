import { createContext, useContext } from 'react'

// Filled in by <ToastProvider> (components/Toast.tsx)
export const ToastContext = createContext<(message: string) => void>(() => {})

// Returns showToast(message), which shows a short success message
export function useToast() {
  return useContext(ToastContext)
}
