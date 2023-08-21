import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import UserContext from "./routes/common/userContext";
import Home from "./routes/homepage/home";
import Nav from "./routes/common/nav";
import LoginForm from "./routes/auth/login";
import RegisterForm from "./routes/auth/register";
import Ingredients from "./routes/ingredients/ingredients";
import Ingredient from "./routes/ingredients/ingredient";
import Recipes from "./routes/recipes/recipes";
import Recipe from "./routes/recipes/recipe";
import MealPlanner from "./routes/mealplans/mealPlanner";
import UserSavedRecipes from "./routes/users/userSavedRecipes";
import UserSavedIngredients from "./routes/users/userSavedIngredients";
import Profile from "./routes/users/profile";
import UserSavedMealPlans from "./routes/users/userSavedMealPlans";
import MealPlan from "./routes/mealplans/mealPlan";

const RouteContainer = ({
  currentUser,
  setCurrentUser,
  token,
  setToken,
  justLoggedIn,
  setJustLoggedIn,
  handleLogin,
  register,
  handleLogout,
  logout,
}) => {
  return (
    <>
      {" "}
      <UserContext.Provider
        value={{
          currentUser,
          setCurrentUser,
          setToken,
          justLoggedIn,
          setJustLoggedIn,
          token,
          logout,
        }}
      >
        <Router>
          <Nav handleLogout={handleLogout} />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              exact
              path="/login"
              element={<LoginForm login={handleLogin} />}
            />
            <Route
              exact
              path="/get-started"
              element={<RegisterForm register={register} />}
            />
            <Route exact path="/ingredients" element={<Ingredients />} />
            <Route exact path="/ingredients/:id" element={<Ingredient />} />
            <Route exact path="/recipes" element={<Recipes />} />
            <Route exact path="/recipes/:id" element={<Recipe />} />
            <Route exact path="/mealplanner" element={<MealPlanner />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route
              exact
              path="/favorite-ingredients"
              element={<UserSavedIngredients />}
            />
            <Route
              exact
              path="/favorite-recipes"
              element={<UserSavedRecipes />}
            />
            <Route
              exact
              path="/favorite-meal-plans"
              element={<UserSavedMealPlans />}
            />
            <Route exact path="/mealplans/:id" element={<MealPlan />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </>
  );
};

export default RouteContainer;
