import { useState, useEffect } from 'react'
import { categoryPages } from '../data/categoryPages.js'
import { categories } from '../data/categories.js'
import RecipeCard from '../components/RecipeCard.jsx'
import RecipeDetailModal from '../components/RecipeDetailModal.jsx'
import { getRecipes } from '../services/api.js'
import './CategoryRecipesPage.css'

function CategoryRecipesPage({ slug, searchQuery = '' }) {
  const page = categoryPages[slug]
  const currentCategoryObj = categories.find((c) => c.slug === slug)
  const categoryName = currentCategoryObj?.name || page?.title || ''

  // Start with static curated list; replace with live DB data when available
  const [recipes, setRecipes] = useState(page?.recipes || [])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategoryRecipes() {
      setLoading(true)
      try {
        if (!categoryName) return
        const data = await getRecipes({ category: categoryName })
        if (Array.isArray(data) && data.length > 0) {
          setRecipes(data)
        }
        // If DB returns empty, keep the static curated list (already in state)
      } catch {
        // Backend offline — keep static curated list
      } finally {
        setLoading(false)
      }
    }
    loadCategoryRecipes()
  }, [categoryName])

  if (!page) return null

  const normalised = searchQuery.trim().toLowerCase()
  const filtered = recipes.filter((r) => {
    if (!normalised) return true
    return (
      r.name?.toLowerCase().includes(normalised) ||
      r.description?.toLowerCase().includes(normalised)
    )
  })

  return (
    <section className="category-recipes-page">
      <header className="category-recipes-heading content-width">
        <h1>{page.title}</h1>
      </header>

      <div className="content-width">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div className="admin-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No recipes found{normalised ? ` for "${searchQuery}"` : ''}.</p>
          </div>
        ) : (
          <div className="recipe-grid" aria-label={`${page.title} recipes`}>
            {filtered.map((recipe) => (
              <RecipeCard
                recipe={recipe}
                key={recipe._id || recipe.name}
                showCategory={false}
                onSelect={(r) => setSelectedRecipe(r)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </section>
  )
}

export default CategoryRecipesPage
