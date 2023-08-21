import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/recipes/recipe.css";
import RemplrApi from "../../helper/api";
import { useSaveRecipe } from "../../hooks/useSaveRecipe";
import SaveHeartButton from "../common/saveHeartButton";
import "../common/nutrition";
import Nutrition from "../common/nutrition";
import UserContext from "../common/userContext";
import LoadingScreen from "../common/loading";
import Alert from "../common/alert";

const Recipe = ({ recipeId, mealPlanRecipe }) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const id = recipeId || params.id;
  const [recipe, setRecipe] = useState(null);
  const { isSaved, handleRecipeSave, handleRecipeDelete, alertMessage } =
    useSaveRecipe(recipe);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  if (!currentUser) {
    navigate("/login");
  }
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await RemplrApi.getRecipe(id);
        setRecipe(data.recipe);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  return (
    <div className="recipe-container">
      {alertMessage && <Alert type="success" messages={[alertMessage]} />}
      <div className="recipe">
        {isLoading ? (
          <div>
            <LoadingScreen />
          </div>
        ) : (
          <>
            <div className="recipe-header">
              <h1>{recipe.title}</h1>
              <img src={recipe.image} alt={recipe.title} />
              <small className="recipe-caption">
                {/* Star icon to save Recipe */}
                {!mealPlanRecipe && (
                  <SaveHeartButton
                    isSaved={isSaved}
                    handleSave={handleRecipeSave}
                    handleDelete={handleRecipeDelete}
                  />
                )}

                <a href={recipe.sourceurl} target="_blank" rel="noreferrer">
                  Source: {recipe.creditstext}
                </a>
              </small>
              <p>
                {recipe.vegetarian && (
                  <span title="Vegetarian">🌱 Vegetarian</span>
                )}
                {recipe.vegan && <span title="Vegan">🥕 Vegan</span>}
                {recipe.dairyFree && (
                  <span title="Dairy-Free">🥛❌ Diary free</span>
                )}
              </p>
              <p>Time to cook: {recipe.readyinminutes} minutes</p>
              <p>Servings: {recipe.servings}</p>
              <p>Diets: {recipe.diets}</p>
            </div>
            <div className="recipe-details">
              {!mealPlanRecipe && (
                <Nutrition
                  mapper={recipe.nutrients}
                  item={recipe.nutrients.nutrient}
                />
              )}
              <div className="recipe-prep">
                <h2>Ingredients</h2>
                <ul>
                  {recipe.ingredients &&
                    recipe.ingredients.map((Recipe, index) => (
                      <li key={index}>
                        {Recipe.amount} {Recipe.unit} {Recipe.name}
                      </li>
                    ))}
                </ul>
                <h2>Instructions</h2>
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <ol>
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction.step}</li>
                    ))}
                  </ol>
                ) : (
                  <p>Instructions for this recipe have not been posted yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Recipe;
