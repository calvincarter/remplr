"use strict";

const app = require("./app");
const PORT = process.env.PORT;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("./client/build"));

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
