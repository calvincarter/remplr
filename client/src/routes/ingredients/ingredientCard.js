import ingredientImg from "../../images/ingredient.webp";
import { useSaveIngredient } from "../../hooks/useSaveIngredient";
import SaveHeartButton from "../common/saveHeartButton";

const IngredientCard = ({ ingredient, userSaved }) => {
  const { isSaved, handleIngredientSave } = useSaveIngredient(ingredient);

  return (
    <div className="ingredients-card" key={ingredient.id}>
      <img
        src={
          ingredient.image
            ? "https://spoonacular.com/cdn/ingredients_100x100/" +
              ingredient.image
            : ingredientImg
        }
        alt={ingredient.name}
      />
      {/* Star icon to save ingredient */}
      {userSaved && isSaved && (
        <SaveHeartButton isSaved={isSaved} handleSave={handleIngredientSave} />
      )}

      <h3>{ingredient.name}</h3>
    </div>
  );
};

export default IngredientCard;
