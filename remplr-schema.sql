-- recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    vegetarian BOOLEAN,
    vegan BOOLEAN,
    dairyfree BOOLEAN,
    weightwatchersmartpoints INT,
    creditstext VARCHAR(255),
    title VARCHAR(255),
    readyinminutes INT,
    servings INT,
    sourceurl VARCHAR(255),
    image VARCHAR(255),
    imagetype VARCHAR(255),
    dishtype VARCHAR(255),
    diets VARCHAR(255),
    summary TEXT
);

-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255),
    is_admin BOOLEAN,
    is_client BOOLEAN,
    is_nutritionist BOOLEAN
);

-- nutritionist and client relationship table
CREATE TABLE IF NOT EXISTS client_nutritionist (
    id SERIAL PRIMARY KEY,
    client_id INT,
    nutritionist_id INT,
    FOREIGN KEY (client_id) REFERENCES users(id)
        ON UPDATE CASCADE,
    FOREIGN KEY (nutritionist_id) REFERENCES users(id)
        ON UPDATE CASCADE
);


-- ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    aisle VARCHAR(255),
    image VARCHAR(255),
    name VARCHAR(255),
    original TEXT,
    amount DECIMAL,
    unit VARCHAR(50)
);

-- ingredient nutrients table

    CREATE TABLE IF NOT EXISTS ingredient_nutrients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        amount NUMERIC,
        unit VARCHAR(255),
        percentofdailyneeds NUMERIC,
        ingredient_id INT,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
        ON UPDATE CASCADE
    );

--instructions table
CREATE TABLE IF NOT EXISTS instructions (
    id SERIAL PRIMARY KEY,
    recipe_id INT,
    number INT,
    step TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON UPDATE CASCADE
);

-- recipe nutrients table
CREATE TABLE IF NOT EXISTS recipe_nutrients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    amount DECIMAL,
    unit VARCHAR(50),
    percentofdailyneeds DECIMAL,
    recipe_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON UPDATE CASCADE
);

-- recipetoingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT,
    ingredient_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    ON UPDATE CASCADE
);


-- meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_by VARCHAR(255),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
);

-- meal_plan_recipes table
CREATE TABLE IF NOT EXISTS meal_plan_recipes (
    id SERIAL PRIMARY KEY,
    meal_plan_id INT,
    recipe_id INT,
    meal_type VARCHAR(255),
    meal_day VARCHAR(20),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON UPDATE CASCADE
);

-- user_saved_ingredients table
CREATE TABLE IF NOT EXISTS user_saved_ingredients (
    id SERIAL PRIMARY KEY,
    user_id INT,
    ingredient_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    ON UPDATE CASCADE
);

-- user_saved_recipes table
CREATE TABLE IF NOT EXISTS user_saved_recipes (
    id SERIAL PRIMARY KEY,
    user_id INT,
    recipe_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    ON UPDATE CASCADE
);

-- user_saved_meal_plans table
CREATE TABLE IF NOT EXISTS user_saved_meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INT,
    meal_plan_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id)
    ON UPDATE CASCADE
);

-- shared meal plans
CREATE TABLE shared_mealplans (
  mealplan_id INT NOT NULL,
  nutritionist_id INT NOT NULL,
  client_id INT NOT NULL,
  UNIQUE (mealplan_id),
  FOREIGN KEY (mealplan_id) REFERENCES meal_plans(id),
  FOREIGN KEY (nutritionist_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);