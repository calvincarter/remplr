import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RemplrApi from "../../helper/api";
import "../../styles/ingredients/ingredient.css";
import ingredientImg from "../../images/ingredient.webp";
import { useSaveIngredient } from "../../hooks/useSaveIngredient";
import SaveHeartButton from "../common/saveHeartButton";
import Nutrition from "../common/nutrition";
import UserContext from "../common/userContext";
import LoadingScreen from "../common/loading";
import Alert from "../common/alert";

const Ingredient = () => {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState(null);
  const {
    isSaved,
    handleIngredientSave,
    alertMessage,
    handleIngredientDelete,
  } = useSaveIngredient(ingredient);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  if (!currentUser) {
    navigate("/login");
  }

  useEffect(() => {
    async function fetchIngredient() {
      try {
        const response = await RemplrApi.getIngredient(id);
        setIngredient(response.ingredient);
      } catch (err) {
        console.error("Failed to fetch ingredient", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIngredient();
  }, [id]);

  return (
    <div className="ingredient-container">
      {alertMessage && <Alert type="success" messages={[alertMessage]} />}
      <div className="ingredient">
        {isLoading ? ( // Conditional rendering based on loading state
          <div>
            <LoadingScreen />
          </div>
        ) : (
          <div className="ingredient-detail">
            <img
              src={
                ingredient.image
                  ? "https://spoonacular.com/cdn/ingredients_100x100/" +
                    ingredient.image
                  : ingredientImg
              }
              alt={ingredient.name}
            />

            <h1>{ingredient.name}</h1>
            {/* Star icon to save ingredient */}
            <SaveHeartButton
              isSaved={isSaved}
              handleSave={handleIngredientSave}
              handleDelete={handleIngredientDelete}
            />

            <p>
              Amount: {ingredient.amount} {ingredient.unit}
            </p>
            <p>Aisle: {ingredient.aisle}</p>
          </div>
        )}
        {ingredient &&
          ingredient.nutrients &&
          ingredient.nutrients.length > 0 && (
            <Nutrition
              mapper={ingredient.nutrients}
              item={ingredient.nutrients}
            />
          )}
      </div>
    </div>
  );
};

export default Ingredient;
