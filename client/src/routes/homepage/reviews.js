import { Link } from "react-router-dom";
import React, { useContext } from "react";
import UserContext from "../common/userContext";

const Reviews = () => {
  const { currentUser } = useContext(UserContext);

  return (
    <>
      {currentUser ? (
        <>
          <div className="home-reviews">
            <div className="home-review-title">
              <h1>FAQs</h1>
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="home-review-container">
              <div className="home-review">
                <h3>How can I like an ingredient?</h3>
                <p>
                  Go to the Ingredients section, find your desired ingredient,
                  and click on the heart icon to like it.
                </p>
              </div>
              <div className="home-review">
                <h3>How do I save a recipe to my favorites?</h3>
                <p>
                  Navigate to the Recipes section, find a recipe you love, and
                  click on the heart icon to save it to your favorites.
                </p>
              </div>
              <div className="home-review">
                <h3>Can I customize my meal plans?</h3>
                <p>
                  Yes, you can! Our platform allows for great flexibility in
                  customizing meal plans according to your preferences and
                  nutritional needs.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="home-reviews">
          <div className="home-review-title">
            <h1>REVIEWS</h1>
            <h2>Hear from other Nutritionists</h2>
          </div>
          <div className="home-review-container">
            <div className="home-review">
              <p>
                I absolutely love Remplr! It's a game-changer for my nutrition
                practice, allowing me to create personalized meal plans for my
                clients effortlessly."
              </p>
              <small>@frances</small>
            </div>
            <div className="home-review">
              <p>
                Thanks to Remplr, The recipe library is a treasure trove of
                deliciousness!
              </p>
              <small>@Ralph</small>
            </div>
            <div className="home-review">
              <p>
                Highly recommend Remplr for anyone serious about helping thier
                clients with their health goals.
              </p>
              <small>@Kat</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
