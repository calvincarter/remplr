import React from "react";
import loadingGif from "../../images/loading.gif";
import "../../styles/common/loading.css";

const LoadingScreen = () => {
  return (
    <div className="loading">
      <img src={loadingGif} alt="Loading..." />
    </div>
  );
};

export default LoadingScreen;
