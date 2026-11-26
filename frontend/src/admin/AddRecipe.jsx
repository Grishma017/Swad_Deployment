import UserRecipeForm from '../user/UserRecipeForm'

function AddRecipe({ onNavigate, onRecipeCreated }) {
  return (
    <UserRecipeForm
      onNavigate={onNavigate}
      onSuccess={onRecipeCreated}
      returnTab="dashboard"
    />
  )
}

export default AddRecipe
