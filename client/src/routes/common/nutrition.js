const Nutrition = ({ mapper }) => {
  return (
    <table className="nutrition-table">
      <thead className="nutrition-thead">
        <tr>
          <th className="nutrition-th">Nutrient</th>
          <th className="nutrition-th">Amount</th>
          <th className="nutrition-th">% of Daily Needs</th>
        </tr>
      </thead>
      <tbody className="nutrition-tbody">
        {mapper &&
          mapper.map((item, index) => (
            <tr key={index}>
              <td className="nutrition-td">{item.name}</td>
              <td className="nutrition-td">
                {item.amount} {item.unit}
              </td>
              <td className="nutrition-td">{item.percentofdailyneeds}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default Nutrition;
