const editableRecipeFields = [
  'name',
  'description',
  'image',
  'imagePublicId',
  'categories',
  'ingredients',
  'instructions',
  'tips',
  'prepTime',
  'cookTime',
  'servings',
  'difficulty',
]

function escapeSearchTerm(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pickRecipeUpdateFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {}
  }

  return Object.fromEntries(
    editableRecipeFields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  )
}

module.exports = { escapeSearchTerm, pickRecipeUpdateFields }
