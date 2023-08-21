import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../common/userContext";
import Ingredients from "../ingredients/ingredients";

const UserSavedIngredients = () => {
  const { token } = useContext(UserContext);
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  return (
    <div className="userSavedIngredients">
      <Ingredients userSaved={true} />
    </div>
  );
};

export default UserSavedIngredients;
