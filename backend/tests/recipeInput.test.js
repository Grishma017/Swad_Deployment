const test = require('node:test')
const assert = require('node:assert/strict')
const { escapeSearchTerm, pickRecipeUpdateFields } = require('../utils/recipeInput')

test('escapes special characters so recipe search treats input literally', () => {
  const term = '[momo].*'
  const regex = new RegExp(escapeSearchTerm(term), 'i')

  assert.equal(regex.test(term), true)
  assert.equal(regex.test('mmm'), false)
})

test('only allows editable recipe fields in updates', () => {
  const updates = pickRecipeUpdateFields({
    name: 'Momo',
    difficulty: 'Medium',
    creatorRole: 'Admin',
    createdBy: 'another-user',
    createdAt: new Date(),
  })

  assert.deepEqual(updates, { name: 'Momo', difficulty: 'Medium' })
})

test('rejects non-object recipe update bodies', () => {
  assert.deepEqual(pickRecipeUpdateFields(null), {})
  assert.deepEqual(pickRecipeUpdateFields(['Momo']), {})
})
