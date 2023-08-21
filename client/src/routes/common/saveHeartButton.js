import React from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import "../../styles/common/common.css";

const SaveHeartButton = ({ isSaved, handleSave, handleDelete }) => {
  return isSaved ? (
    <FaHeart className="saved-heart" onClick={handleDelete} />
  ) : (
    <FaRegHeart className="save-heart" onClick={handleSave} />
  );
};

export default SaveHeartButton;
