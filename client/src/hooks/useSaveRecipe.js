import { useState, useContext, useEffect } from "react";
import RemplrApi from "../helper/api";
import UserContext from "../routes/common/userContext";

export const useSaveRecipe = (recipe) => {
  const [isSaved, setIsSaved] = useState(false);
  const [recipeNotFound, setRecipeNotFound] = useState(false);
  const { currentUser } = useContext(UserContext);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        // Check if the recipe is saved
        const savedRecipes = await RemplrApi.getUserSavedRecipes(
          currentUser.username
        );
        const found = savedRecipes.some(
          (savedRecipe) => savedRecipe.id === recipe.id
        );

        setIsSaved(found);
      } catch (error) {
        if (error.statusText === "Not Found") {
          setRecipeNotFound(true);
        }
      }
    };

    checkIfSaved();
  }, [recipe, currentUser]);

  const handleRecipeSave = async () => {
    if (!isSaved) {
      await RemplrApi.saveRecipe(currentUser.username, recipe.id);
      setAlertMessage(`Liked recipe ${recipe.title}!`);
      setIsSaved(true);
    }
  };

  const handleRecipeDelete = async () => {
    try {
      await RemplrApi.deleteSavedRecipe(currentUser.username, recipe.id);
      setIsSaved(false);
      setAlertMessage(`Unliked recipe ${recipe.title}!`);
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to unlike the recipe.");
    }
  };

  return {
    isSaved,
    handleRecipeSave,
    handleRecipeDelete,
    recipeNotFound,
    alertMessage,
  }; // Returning the new state
};
