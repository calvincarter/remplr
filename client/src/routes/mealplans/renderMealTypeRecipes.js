import RecipeCard from "../recipes/recipeCard";

const RenderMealTypeRecipes = ({ recipes, mealType }) => {
  let days = [1, 2, 3, 4, 5, 6, 7]; // From Sunday to Monday

  return days.map((day) => (
    <td key={day}>
      {recipes[mealType][day]?.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </td>
  ));
};

export default RenderMealTypeRecipes;
