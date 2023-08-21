import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import UserContext from "../common/userContext";

const CallToAction = () => {
  const { currentUser } = useContext(UserContext);
  return (
    <>
      {currentUser ? (
        <div className="home-login-action">
          <h1>HOW IT WORKS</h1>
          <Carousel className="home-login-action-steps">
            <Carousel.Item className="home-login-action-step">
              <small>1</small>
              <h3>Start by adding your clients.</h3>
            </Carousel.Item>
            <Carousel.Item className="home-login-action-step">
              <small>2</small>
              <h3>
                They will be automatically linked to you since you will be
                helping them with their meal plans.
              </h3>
            </Carousel.Item>
            <Carousel.Item className="home-login-action-step">
              <small>3</small>
              <h3>
                Look for ingredients that meet your client's needs and save them
                by clicking on the like button.
              </h3>
            </Carousel.Item>
            <Carousel.Item className="home-login-action-step">
              <small>4</small>
              <h3>
                Look for recipes and save the recipes you think will be liked by
                your client the most.
              </h3>
            </Carousel.Item>
            <Carousel.Item className="home-login-action-step">
              <small>5</small>
              <h3>
                Start creating meal plans. Once you save, you can see them under
                your saved meal plans.
              </h3>
            </Carousel.Item>
            <Carousel.Item className="home-login-action-step">
              <small>6</small>
              <h3>
                Easily share the meal plan with your clients with a simple
                selection. Note: single meal plans can also be shared with your
                other clients if that meets their needs.
              </h3>
            </Carousel.Item>
          </Carousel>
        </div>
      ) : (
        <div className="home-action">
          <h1>HOW IT WORKS</h1>
          <div className="home-action-steps">
            <div className="home-action-step">
              <small>1</small>
              <h3>
                Register to get access to our available database of recipes and
                ingredients.
              </h3>
            </div>
            <div className="home-action-step">
              <small>2</small>
              <h3>
                Add your clients and understand their likes and motivation.
              </h3>
            </div>
            <div className="home-action-step">
              <small>3</small>
              <h3>
                Use our simplified meal plan creator and share the meal plan
                with one click button.
              </h3>
            </div>
          </div>
          <div className="home-action-button">
            <Link to={`/get-started`}>
              <button>SIGN UP NOW</button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default CallToAction;
