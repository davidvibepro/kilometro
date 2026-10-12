import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from '../hooks/useToast'

interface ToastProviderProps {
  children: ReactNode
}

// Wraps the whole app so any page can call showToast() from useToast()
function ToastProvider({ children }: ToastProviderProps) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  const showToast = useCallback((text: string) => {
    // A new message replaces the old one and restarts the 3-second timer
    window.clearTimeout(timerRef.current)
    setMessage(text)
    timerRef.current = window.setTimeout(() => setMessage(null), 3000)
  }, [])

  return (
    <ToastContext value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:left-auto"
      >
        {message && (
          <p className="pointer-events-auto w-full rounded-lg border-l-4 border-ok bg-ink px-4 py-3 text-sm text-white shadow-lg sm:w-80">
            {message}
          </p>
        )}
      </div>
    </ToastContext>
  )
}

export default ToastProvider
