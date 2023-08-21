import "../../styles/mealplans/mealPlannerSteps.css";

const MealPlannerSteps = () => {
  return (
    <div className="mealplanner-steps">
      <p>Step 1: Start by Clicking on Create Meal Plan</p>
      <p>
        Step 2: Now, You have the basic structure of Meal Planner. Start by
        adding the meal plan row type with the help of associated button
        (Breakfast/ Lunch/ Dinner/ Snack ).
        <small>
          <i> Note: To remove specific row, hover to see the remove button.</i>
        </small>
      </p>
      <p>Step 3: Click on specific cell and you will see the recipe area.</p>
      <p>
        Step 4: See the recipe which meet your client's requirement? Click on
        Add button below the recipe to select that recipe
      </p>
      <p>
        Step 5:Want to change the recipe? Click on the cell again and select the
        new recipe to replace the recipe.
      </p>
      <p>
        Step 6: Once you are done satisfied with the meal plan. Click Save to
        Save the Meal Plan.
      </p>
      <p>
        Step 7: Give a name to your meal plan. Enter your username to confirm
        the name and click on start adding recipes to meal plan.
        <small>
          <i>
            {" "}
            NOTE: You will see this saved meal plan in your saved meal plans.
          </i>
        </small>
      </p>
    </div>
  );
};

export default MealPlannerSteps;
