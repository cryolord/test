import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const [toasts, setToasts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/items`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/health`)
      const data = await res.json()
      setApiStatus(data.database === 'connected' ? 'connected' : 'disconnected')
    } catch {
      setApiStatus('disconnected')
    }
  }, [])

  useEffect(() => {
    checkHealth()
    fetchItems()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [checkHealth, fetchItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      if (!res.ok) throw new Error('Create failed')
      setName('')
      setDescription('')
      await fetchItems()
      toast('Item created successfully')
    } catch (err) {
      toast('Failed to create item', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchItems()
      toast('Item deleted')
    } catch {
      toast('Failed to delete item', 'error')
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditDesc(item.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDesc('')
  }

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || null }),
      })
      if (!res.ok) throw new Error('Update failed')
      cancelEdit()
      await fetchItems()
      toast('Item updated')
    } catch {
      toast('Failed to update item', 'error')
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <h1>⚡ Deploy Test</h1>
          <div className="header-status">
            <span className={`status-dot ${apiStatus !== 'connected' ? 'disconnected' : ''}`}></span>
            <span>
              {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Create Form */}
        <div className="form-card">
          <h2>Create Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Item name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="desc">Description</label>
                <input
                  id="desc"
                  type="text"
                  placeholder="Optional description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !name.trim()}
              >
                {submitting ? '...' : '+ Add'}
              </button>
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="items-header">
          <h2>Items</h2>
          <span className="item-count">{items.length} total</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading items...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No items yet</h3>
            <p>Create your first item above to test the API connection.</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  {editingId === item.id ? (
                    <>
                      <input
                        className="form-group"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%', marginBottom: '0.4rem', outline: 'none' }}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                      <input
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%', outline: 'none' }}
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        placeholder="Description..."
                      />
                    </>
                  ) : (
                    <>
                      <div className="item-name">{item.name}</div>
                      {item.description && <div className="item-desc">{item.description}</div>}
                      <div className="item-meta">{formatDate(item.created_at)}</div>
                    </>
                  )}
                </div>
                <div className="item-actions">
                  {editingId === item.id ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(item.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  )
}

export default App
