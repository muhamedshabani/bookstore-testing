import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

// Native <dialog> gives focus trapping, Escape to close and a backdrop for free.
export default function Modal({ open, onClose, title, children, variant = 'center' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const position =
    variant === 'drawer'
      ? 'ml-auto mr-0 h-dvh max-h-dvh w-full max-w-md'
      : 'm-auto w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)]'

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className={`${position} bg-white p-0 text-ink shadow-2xl backdrop:bg-black/50`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 grid size-11 place-items-center text-ink-soft hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        {open && children}
      </div>
    </dialog>
  )
}
