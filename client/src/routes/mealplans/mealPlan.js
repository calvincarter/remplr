import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RemplrApi from "../../helper/api";
import UserContext from "../common/userContext";
import LoadingScreen from "../common/loading";
import MealDays from "./mealDays";
import MealRow from "./mealRow";
import Recipe from "../recipes/recipe";

import "../../styles/mealplans/mealplan.css";

const MealPlan = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const { id } = useParams();
  const { token } = useContext(UserContext);
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const data = await RemplrApi.getMealPlan(id);
        setMealPlan(data.mealPlan);
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      }
    };
    fetchMealPlan();
  }, [id]);

  if (!mealPlan) {
    return (
      <div>
        <LoadingScreen />
      </div>
    );
  }

  // Update data format for recipes received from API before preparing mealPlan table
  const transformData = (recipes) => {
    let transformed = {
      Breakfast: {},
      Lunch: {},
      Dinner: {},
      Snack: {},
    };

    recipes.forEach((recipe) => {
      if (!transformed[recipe.meal_type][recipe.meal_day]) {
        transformed[recipe.meal_type][recipe.meal_day] = [];
      }
      transformed[recipe.meal_type][recipe.meal_day].push(recipe);
    });

    return transformed;
  };

  const transformedData = transformData(mealPlan.recipes);

  return (
    <div className="mealplan">
      <div className="mealplan-header">
        <h1>{mealPlan.name}</h1>
        <small>Created by: {mealPlan.created_by}</small>
      </div>
      <div className="mealplan-table">
        <table>
          <thead>
            <MealDays />
          </thead>
          <tbody>
            <MealRow transformedData={transformedData} mealType="Breakfast" />
            <MealRow transformedData={transformedData} mealType="Lunch" />
            <MealRow transformedData={transformedData} mealType="Dinner" />
            <MealRow transformedData={transformedData} mealType="Snack" />
          </tbody>
        </table>
      </div>
      <div className="mealplan-recipes">
        {mealPlan.recipes.map((recipe) => {
          return (
            <Recipe
              key={recipe.recipe_id}
              recipeId={recipe.recipe_id}
              mealPlanRecipe={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MealPlan;
