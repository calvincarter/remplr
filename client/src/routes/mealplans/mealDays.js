const daysOfWeek = [
  "",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MealDays = () => {
  return (
    <>
      <tr>
        {daysOfWeek.map((day) => (
          <th key={day}>{day}</th>
        ))}
      </tr>
    </>
  );
};

export default MealDays;
