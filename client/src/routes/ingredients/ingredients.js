import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import RemplrApi from "../../helper/api";
import "../../styles/ingredients/ingredients.css";
import Alert from "../common/alert";
import IngredientCard from "./ingredientCard";
import UserContext from "../common/userContext";
import LoadingScreen from "../common/loading";
import EmptySafe from "../common/emptySafe";

const Ingredients = ({ userSaved = false }) => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        let validIngredients;
        if (userSaved) {
          validIngredients = await RemplrApi.getUserSavedIngredients(
            currentUser.username
          );
          setIngredients(validIngredients);
        } else {
          const response = await RemplrApi.getIngredients();
          // Filtering only valid ingredients based on their name
          validIngredients = response.ingredients.filter((ingredient) =>
            isValidName(ingredient.name)
          );
          setIngredients(validIngredients);
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIngredients();
  }, [userSaved, currentUser]);

  const isValidName = (name) => {
    // List of invalid patterns
    const invalidPatterns = [
      "--",
      "© - 2013",
      "© 2016",
      "niã§oise",
      "————",
      "°",
    ];

    // Return false if name contains any of the invalid patterns
    return !invalidPatterns.some((pattern) => name.includes(pattern));
  };

  return (
    <div className="ingredients">
      {isLoading ? (
        <LoadingScreen />
      ) : ingredients.length === 0 && userSaved ? (
        <EmptySafe message="No ingredient saved yet!" />
      ) : (
        <>
          <Alert
            type="success"
            messages={[
              "Click on ingredient card to view ingredient's nutritional information.",
            ]}
          />
          <div>
            <div>
              {" "}
              {userSaved && <h1>Your favorite Ingredients</h1>}
              {!userSaved && <h1> Ingredients you would love!</h1>}
            </div>
            <div className="ingredients-container">
              {ingredients.map((ingredient) => (
                <Link to={`/ingredients/${ingredient.id}`}>
                  <IngredientCard
                    ingredient={ingredient}
                    userSaved={userSaved}
                  />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ingredients;
