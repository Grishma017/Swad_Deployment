import { useState, useEffect } from 'react'
import { getRecipes, deleteRecipe } from '../services/api'
import RecipeDetailModal from '../components/RecipeDetailModal'
import './admin.css'

function AdminDashboard({ onSelectEdit, searchQuery = '' }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)

  useEffect(() => {
    let isMounted = true

    getRecipes()
      .then((data) => {
        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : [])
          setError('')
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load recipes.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return
    }
    setIsDeletingId(id)
    try {
      await deleteRecipe(id)
      setRecipes((prev) => prev.filter((r) => r._id !== id))
      setSuccessMsg(`Recipe "${name}" deleted successfully.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.message || 'Failed to delete recipe.')
    } finally {
      setIsDeletingId(null)
    }
  }

  const term = searchQuery.trim().toLowerCase()
  const filteredRecipes = recipes.filter((r) => {
    if (!term) return true
    return (
      r.name?.toLowerCase().includes(term) ||
      r.categories?.some((c) => c.toLowerCase().includes(term)) ||
      r.creatorName?.toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="admin-empty-state">
        <div className="admin-spinner" />
        <p style={{ marginTop: 12 }}>Loading recipes...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Alerts */}
      {successMsg && (
        <div className="admin-alert admin-alert-success" style={{ marginBottom: 20 }}>
          <span>✓ {successMsg}</span>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: 20 }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Recipes Table */}
      {filteredRecipes.length === 0 ? (
        <div className="dashboard-panel admin-empty-state">
          <p>
            {term
              ? `No recipes matching "${searchQuery}".`
              : 'No recipes available.'}
          </p>
        </div>
      ) : (
        <div className="recipes-table-container">
          <table className="recipes-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Recipe</th>
                <th style={{ width: '20%' }}>Category</th>
                <th style={{ width: '12%' }}>Cook Time</th>
                <th style={{ width: '13%' }}>Added By</th>
                <th style={{ width: '11%' }}>Added Date</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => (
                <tr key={recipe._id || recipe.name}>
                  {/* Recipe Name (Clicking opens view) */}
                  <td>
                    <button
                      type="button"
                      className="table-title-link"
                      onClick={() => setViewingRecipe(recipe)}
                      title="View recipe details"
                    >
                      {recipe.name}
                    </button>
                  </td>

                  {/* Category */}
                  <td>
                    {recipe.categories && recipe.categories.length > 0 ? (
                      <span className="table-cat-badge">
                        {recipe.categories.join(', ')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>

                  {/* Cook Time */}
                  <td>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {recipe.cookTime ? `${recipe.cookTime} min` : '—'}
                    </span>
                  </td>

                  {/* Added By */}
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      {recipe.creatorName || (recipe.creatorRole === 'Admin' ? 'Admin' : 'Swad Team')}
                    </span>
                  </td>

                  {/* Added Date */}
                  <td>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                      {recipe.createdAt
                        ? new Date(recipe.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </td>

                  {/* Actions: View, Edit, Delete */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 6,
                      }}
                    >
                      <button
                        type="button"
                        className="table-action-btn table-action-view"
                        onClick={() => setViewingRecipe(recipe)}
                        title="View recipe"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="table-action-btn table-action-edit"
                        onClick={() => onSelectEdit(recipe._id)}
                        title="Edit recipe"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="table-action-btn table-action-delete"
                        disabled={isDeletingId === recipe._id}
                        onClick={() => handleDelete(recipe._id, recipe.name)}
                        title="Delete recipe"
                      >
                        {isDeletingId === recipe._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recipe Detail Modal for View */}
      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
        />
      )}
    </div>
  )
}

export default AdminDashboard
