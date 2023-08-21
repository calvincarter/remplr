import { useState, useContext, useEffect } from "react";
import RemplrApi from "../helper/api";
import UserContext from "../routes/common/userContext";

export const useSaveIngredient = (ingredient) => {
  const [isSaved, setIsSaved] = useState(false);
  const [ingredientNotFound, setIngredientNotFound] = useState(false);
  const { currentUser } = useContext(UserContext);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        // Check if the ingredient is saved
        const savedIngredients = await RemplrApi.getUserSavedIngredients(
          currentUser.username
        );

        const found = savedIngredients.some(
          (savedIngredient) =>
            String(savedIngredient.id) === String(ingredient.id)
        );

        setIsSaved(found);
      } catch (error) {
        if (error.statusText === "Not Found") {
          setIngredientNotFound(true);
        }
      }
    };

    checkIfSaved();
  }, [ingredient, currentUser]);

  const handleIngredientSave = async () => {
    try {
      if (!isSaved) {
        await RemplrApi.saveIngredient(currentUser.username, ingredient.id);
        setIsSaved(true);
        setAlertMessage(`Liked ingredient ${ingredient.name}!`);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to like the ingredient.");
    }
  };

  const handleIngredientDelete = async () => {
    try {
      await RemplrApi.deleteSavedIngredient(
        currentUser.username,
        ingredient.id
      );
      setIsSaved(false);
      setAlertMessage(`Unliked ingredient ${ingredient.name}!`);
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to unlike the ingredient.");
    }
  };

  return {
    isSaved,
    handleIngredientSave,
    handleIngredientDelete,
    ingredientNotFound,
    alertMessage,
  };
};
