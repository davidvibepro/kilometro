import { useId } from 'react'
import Button from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  deleting?: boolean
  confirmLabel?: string // "Delete" unless another action is being confirmed, e.g. "Retire"
  onConfirm: () => void
  onCancel: () => void
}

// Asks "are you sure?" before every delete (and before other actions that cannot be undone)
function ConfirmDialog({
  open,
  title,
  message,
  deleting = false,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const messageId = useId()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-ink/70">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={deleting} autoFocus>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Please wait...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
