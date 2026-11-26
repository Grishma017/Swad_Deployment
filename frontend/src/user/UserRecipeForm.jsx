import { useState, useRef } from 'react'
import { createRecipe, updateRecipe, uploadRecipeImage } from '../services/api'
import { categories } from '../data/categories'
import './user.css'

function PhotoUpload({ imageUrl, onUpload, onRemove }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const result = await uploadRecipeImage(file)
      onUpload(result.url, result.publicId)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (uploading) {
    return (
      <div className="sf-photo-area is-uploading">
        <div className="image-uploading-overlay">
          <div className="admin-spinner" /> Uploading image…
        </div>
      </div>
    )
  }

  if (imageUrl) {
    return (
      <div className="sf-photo-preview">
        <img src={imageUrl} alt="Recipe dish preview" />
        <button
          type="button"
          className="sf-photo-remove"
          onClick={onRemove}
          aria-label="Remove photo"
        >
          Remove photo
        </button>
      </div>
    )
  }

  return (
    <div
      className={`sf-photo-area${dragging ? ' dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files[0])
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <div className="sf-photo-content">
        <div className="sf-camera-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <span className="sf-photo-title">Add a photo of your dish</span>
        <span className="sf-photo-subtitle">
          Drag and drop your photo here, or click to browse
        </span>
        <span className="sf-photo-hint">Supports JPG, PNG, WEBP up to 5 MB</span>
      </div>
      {error && <p className="sf-photo-err">{error}</p>}
    </div>
  )
}

function ListField({ items, onChange, placeholder, addText }) {
  function update(i, val) {
    const copy = [...items]
    copy[i] = val
    onChange(copy)
  }
  function add() {
    onChange([...items, ''])
  }
  function remove(i) {
    if (items.length === 1) {
      onChange([''])
    } else {
      onChange(items.filter((_, idx) => idx !== i))
    }
  }

  return (
    <div className="sf-list">
      {items.map((item, i) => (
        <div key={i} className="sf-list-row">
          <input
            className="sf-list-input"
            type="text"
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            className="sf-list-x"
            onClick={() => remove(i)}
            title="Remove item"
            aria-label="Remove item"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="sf-list-add" onClick={add}>
        + {addText}
      </button>
    </div>
  )
}

function StepListField({ items, onChange, placeholder, addText }) {
  function update(i, val) {
    const copy = [...items]
    copy[i] = val
    onChange(copy)
  }
  function add() {
    onChange([...items, ''])
  }
  function remove(i) {
    if (items.length === 1) {
      onChange([''])
    } else {
      onChange(items.filter((_, idx) => idx !== i))
    }
  }

  return (
    <div className="sf-step-list">
      {items.map((item, i) => (
        <div key={i} className="sf-step-row">
          <textarea
            className="sf-step-textarea"
            rows="2"
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            className="sf-list-x"
            onClick={() => remove(i)}
            title="Remove step"
            aria-label="Remove step"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="sf-list-add" onClick={add}>
        + {addText}
      </button>
    </div>
  )
}

function UserRecipeForm({
  initial = null,
  onNavigate,
  onSuccess,
  returnTab = 'my-recipes',
}) {
  const editing = !!initial

  const [name, setName] = useState(initial?.name || '')
  const [imageUrl, setImageUrl] = useState(initial?.image || '')
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId || '')
  const [selectedCategories, setSelectedCategories] = useState(initial?.categories || [])
  const [intro, setIntro] = useState(initial?.description || '')
  const [ingredients, setIngredients] = useState(
    initial?.ingredients?.length ? initial.ingredients : ['']
  )
  const [instructions, setInstructions] = useState(
    initial?.instructions?.length ? initial.instructions : ['']
  )
  const [tips, setTips] = useState(initial?.tips?.length ? initial.tips : [''])
  const [prepTime, setPrepTime] = useState(
    initial?.prepTime !== undefined ? String(initial.prepTime) : ''
  )
  const [cookTime, setCookTime] = useState(
    initial?.cookTime !== undefined ? String(initial.cookTime) : ''
  )
  const [servings, setServings] = useState(
    initial?.servings !== undefined ? String(initial.servings) : ''
  )
  const [difficulty, setDifficulty] = useState(initial?.difficulty || 'Easy')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function toggleCategory(catName) {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Please enter a recipe title.')
      return
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one category.')
      return
    }

    const payload = {
      name: name.trim(),
      description: intro.trim(),
      image: imageUrl,
      imagePublicId,
      categories: selectedCategories,
      ingredients: ingredients.map((s) => s.trim()).filter(Boolean),
      instructions: instructions.map((s) => s.trim()).filter(Boolean),
      tips: tips.map((s) => s.trim()).filter(Boolean),
      prepTime: prepTime ? Number(prepTime) : undefined,
      cookTime: cookTime ? Number(cookTime) : undefined,
      servings: servings ? Number(servings) : undefined,
      difficulty,
    }

    setLoading(true)
    try {
      const saved = editing
        ? await updateRecipe(initial._id, payload)
        : await createRecipe(payload)
      setSuccess(editing ? 'Recipe updated successfully.' : 'Recipe published successfully.')
      onSuccess && onSuccess(saved)
      setTimeout(() => onNavigate(returnTab), 1200)
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sf-page">
      <header className="sf-header">
        <h1 className="sf-title">{editing ? 'Edit Recipe' : 'Share a recipe'}</h1>
        <p className="sf-intro">
          {editing
            ? 'Make it your own again: update the ingredients, steps, or little details that matter.'
            : 'Tell us what makes it yours: a family favorite, a weekday go-to, or a dish you grew up with.'}
        </p>
      </header>

      {error && <div className="user-alert user-alert-error">{error}</div>}
      {success && <div className="user-alert user-alert-success">{success}</div>}

      <form className="sf-form" onSubmit={handleSubmit}>
        {/* Recipe name */}
        <div className="sf-section sf-section-name">
          <label className="sf-label" htmlFor="recipe-name">What do you call this dish?</label>
          <input
            className="sf-name"
            id="recipe-name"
            type="text"
            placeholder="Recipe title (e.g. Grandma's Sel Roti)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Photo Upload */}
        <div className="sf-section">
          <label className="sf-label">Dish Photo</label>
          <PhotoUpload
            imageUrl={imageUrl}
            onUpload={(url, pid) => {
              setImageUrl(url)
              setImagePublicId(pid)
            }}
            onRemove={() => {
              setImageUrl('')
              setImagePublicId('')
            }}
          />
          <div className="sf-photo-url-field">
            <label htmlFor="recipe-image-url">Or paste an image URL</label>
            <input
              id="recipe-image-url"
              type="url"
              placeholder="https://example.com/dish.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImagePublicId('')
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="sf-section">
          <label className="sf-label">Story & Description</label>
          <textarea
            className="sf-textarea"
            rows="4"
            placeholder="What makes this dish special? Share its origin or when it is traditionally enjoyed..."
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="sf-section">
          <label className="sf-label">Category</label>
          <div className="sf-cats">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                className={`sf-cat${selectedCategories.includes(cat.name) ? ' active' : ''}`}
                onClick={() => toggleCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Time & Details (2x2 Grid) */}
        <div className="sf-section">
          <label className="sf-label">Time & Details</label>
          <div className="sf-grid-2x2">
            <div className="sf-field-box">
              <span className="sf-sublabel">Prep Time (minutes)</span>
              <input
                type="number"
                min="0"
                placeholder="20"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
            <div className="sf-field-box">
              <span className="sf-sublabel">Cook Time (minutes)</span>
              <input
                type="number"
                min="0"
                placeholder="30"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
            <div className="sf-field-box">
              <span className="sf-sublabel">Servings</span>
              <input
                type="number"
                min="1"
                placeholder="4"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
            <div className="sf-field-box">
              <span className="sf-sublabel">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="sf-section">
          <label className="sf-label">Ingredients</label>
          <ListField
            items={ingredients}
            onChange={setIngredients}
            placeholder="e.g. 2 cups finely ground rice flour"
            addText="Add ingredient"
          />
        </div>

        {/* Cooking Instructions */}
        <div className="sf-section">
          <label className="sf-label">Cooking Instructions</label>
          <StepListField
            items={instructions}
            onChange={setInstructions}
            placeholder="Describe this step in detail..."
            addText="Add step"
          />
        </div>

        {/* Tips */}
        <div className="sf-section">
          <label className="sf-label">Tips & Notes</label>
          <ListField
            items={tips}
            onChange={setTips}
            placeholder="e.g. For extra crispiness, fry on medium heat and serve hot"
            addText="Add tip"
          />
        </div>

        {/* Bottom Actions */}
        <div className="sf-actions">
          <button
            type="button"
            className="sf-cancel"
            onClick={() => onNavigate(returnTab)}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="sf-publish" disabled={loading}>
            {loading ? 'Saving…' : editing ? 'Save changes' : 'Publish Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserRecipeForm
