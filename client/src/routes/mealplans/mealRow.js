import RenderMealTypeRecipes from "./renderMealTypeRecipes";

const MealRow = ({ transformedData, mealType }) => {
  return (
    <tr className="mealplan-row">
      <th className="mealplan-type">{mealType}</th>
      <RenderMealTypeRecipes recipes={transformedData} mealType={mealType} />
    </tr>
  );
};

export default MealRow;
