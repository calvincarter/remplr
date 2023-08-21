import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../common/userContext";
import Recipes from "../recipes/recipes";

const UserSavedRecipes = () => {
  const { token } = useContext(UserContext);
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  return (
    <div className="userSavedRecipes">
      <Recipes userSaved={true}></Recipes>
    </div>
  );
};

export default UserSavedRecipes;
