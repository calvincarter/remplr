import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import RemplrApi from "../../helper/api";
import "../../styles/recipes/recipes.css";
import RecipeCard from "./recipeCard";
import Alert from "../common/alert";
import UserContext from "../common/userContext";
import LoadingScreen from "../common/loading";
import EmptySafe from "../common/emptySafe";

const Recipes = ({ handleAddRecipe, mealPlanner, userSaved = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const { currentUser, token } = useContext(UserContext);

  const navigate = useNavigate();
  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let response;
        if (userSaved) {
          response = await RemplrApi.getUserSavedRecipes(currentUser.username);
          setRecipes(response || []);
        } else {
          response = await RemplrApi.getRecipes();
          setRecipes(response.recipes || []);
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [userSaved, currentUser]);

  return (
    <div className="recipes">
      {loading ? (
        <LoadingScreen />
      ) : recipes.length === 0 && userSaved ? (
        <EmptySafe message="No recipe saved yet!" />
      ) : (
        <>
          <Alert
            type="success"
            messages={[
              "Click on Recipe card to view recipe's nutritional information.",
            ]}
          />
          <div>
            {" "}
            <div>
              {userSaved && <h1>Your favorite Recipes</h1>}
              {!userSaved && <h1> Recipes you would enjoy!</h1>}
            </div>
            <div className="recipes-container">
              {recipes.map((recipe) => (
                <div className="recipe-card">
                  {mealPlanner ? (
                    <RecipeCard
                      recipe={recipe}
                      handleAddRecipe={handleAddRecipe}
                    />
                  ) : (
                    <Link to={`/recipes/${recipe.id}`}>
                      <RecipeCard
                        recipe={recipe}
                        handleAddRecipe={handleAddRecipe}
                        userSaved={userSaved}
                      />
                    </Link>
                  )}
                  {mealPlanner && (
                    <button
                      className="recipe-button"
                      onClick={() => handleAddRecipe(recipe)}
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Recipes;
