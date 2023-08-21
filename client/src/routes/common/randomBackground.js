import image1 from "../../images/randomBackground/1.jpg";
import image2 from "../../images/randomBackground/2.jpg";
import image3 from "../../images/randomBackground/3.jpg";
import image4 from "../../images/randomBackground/4.jpg";
import image5 from "../../images/randomBackground/5.jpg";

import React, { useState, useEffect } from "react";

const RandomBackground = ({ children }) => {
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const images = [image1, image2, image3, image4, image5];

    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(randomImage);
  }, []);

  const styles = {
    backgroundImage: `
    linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url(${bgImage})
`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    borderRadius: "25px",
  };

  return <div style={styles}>{children}</div>;
};

export default RandomBackground;
