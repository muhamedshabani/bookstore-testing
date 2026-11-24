import { AlertCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import { EmptyState, ErrorState, Spinner } from '../../components/States'
import { useApi } from '../../hooks/useApi'
import EntityForm from './EntityForm'

// One admin tab: a searchable table of records with create, edit and delete.
// `config` describes the resource: api, columns, form fields and how to map records to form values.
export default function EntityTab({ config, onChanged, notify }) {
  const { data, error, loading, reload } = useApi(() => config.load(), [config])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null | { record } | { record: null } for create
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const filtered = useMemo(() => {
    const records = data?.records ?? []
    const needle = search.trim().toLowerCase()
    if (!needle) return records
    return records.filter((r) => config.searchText(r).toLowerCase().includes(needle))
  }, [data, search, config])

  const refresh = async () => {
    await reload()
    onChanged?.()
  }

  const save = async (values) => {
    const dto = config.toDto(values)
    if (editing.record) {
      await config.api.update(editing.record.id, dto)
      notify(`${config.singular} updated.`)
    } else {
      await config.api.create(dto)
      notify(`${config.singular} created.`)
    }
    setEditing(null)
    await refresh()
  }

  const confirmDelete = async () => {
    setDeletingBusy(true)
    setDeleteError(null)
    try {
      await config.api.remove(deleting.id)
      notify(`${config.singular} deleted.`)
      setDeleting(null)
      await refresh()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeletingBusy(false)
    }
  }

  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-80">
          <label htmlFor={`search-${config.key}`} className="field-label">
            Search {config.plural.toLowerCase()}
          </label>
          <input
            id={`search-${config.key}`}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input"
          />
        </div>
        <button type="button" onClick={() => setEditing({ record: null })} className="btn-solid">
          <Plus className="size-4" aria-hidden="true" /> Add {config.singular.toLowerCase()}
        </button>
      </div>

      {loading ? (
        <Spinner label={`Loading ${config.plural.toLowerCase()}`} />
      ) : filtered.length === 0 ? (
        <EmptyState title={search ? `No ${config.plural.toLowerCase()} match “${search}”` : `No ${config.plural.toLowerCase()} yet`} />
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">{config.plural}</caption>
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.label} scope="col" className={`px-4 py-3 font-semibold ${column.className ?? ''}`}>
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-surface/60">
                  {config.columns.map((column) => (
                    <td key={column.label} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>
                      {column.render(record)}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing({ record })}
                      aria-label={`Edit ${config.label(record)}`}
                      className="inline-grid size-11 place-items-center text-ink-soft hover:text-brand-strong"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null)
                        setDeleting(record)
                      }}
                      aria-label={`Delete ${config.label(record)}`}
                      className="inline-grid size-11 place-items-center text-ink-soft hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.record ? `Edit ${config.singular.toLowerCase()}` : `Add ${config.singular.toLowerCase()}`}
      >
        {editing && data && (
          <EntityForm
            fields={config.fields(data)}
            initialValues={config.toForm(editing.record)}
            onSubmit={save}
            onCancel={() => setEditing(null)}
            submitLabel={editing.record ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
          />
        )}
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={`Delete ${config.singular.toLowerCase()}?`}>
        {deleting && (
          <div className="flex flex-col">
            <div className="space-y-4 px-6 py-5">
              <p>
                <strong>{config.label(deleting)}</strong> will be permanently deleted. This can't be undone.
              </p>
              {deleteError && (
                <p role="alert" className="flex items-start gap-2 bg-danger-tint p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {deleteError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button type="button" onClick={() => setDeleting(null)} className="btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={deletingBusy} className="btn-danger">
                {deletingBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
