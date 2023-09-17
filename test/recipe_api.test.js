const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const Recipe = require("../models/recipe");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
mongoose.set("bufferTimeoutMS", 30000);

let token = "";

beforeEach(async () => {
  await Recipe.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("secret", 10);
  const user = new User({ username: "root", name: "SuperUser", passwordHash });

  const savedUser = await user.save();

  const recipesWithTestUser = helper.initialRecipes.results.map((recipe) => ({
    title: recipe.title,
    image: recipe.image,
    spoonId: recipe.id,
    users: [savedUser._id],
  }));

  const recipeObjects = recipesWithTestUser.map((recipe) => new Recipe(recipe));
  const promiseArray = recipeObjects.map((recipe) => recipe.save());
  const savedRecipes = await Promise.all(promiseArray);

  savedRecipes.map(
    (recipe) => (savedUser.recipes = savedUser.recipes.concat(recipe._id))
  );
  await savedUser.save();

  const loggedIn = await api.post("/api/login").send({
    username: "root",
    password: "secret",
  });
  token = "bearer " + loggedIn.body.token;
  //console.log(token);
}, 10000);

describe("when we have recipes added", () => {
  test("recipes are correct length and JSON", async () => {
    //console.log("hello");
    const response = await api
      .get("/api/recipes")
      .expect("Content-Type", /application\/json/)
      .expect(200);

    //console.log(response);
  });

  test("recipes have an unique identifier property named id", async () => {
    const response = await api.get("/api/recipes");

    for (const blog of response.body) {
      expect(blog.id).toBeDefined();
      expect(blog._id).not.toBeDefined();
    }
  });
});

describe("addition of a new favorite recipe", () => {
  test("a valid recipe not yet in db can be added to db", async () => {
    //const testRecipes = helper.initialRecipes;
    //const testRecipe = testRecipes.results[0];

    const newRecipe = {
      spoonId: 99,
      title: "test Recipe",
      image: "test Recipe Image",
    };

    await api
      .post("/api/recipes")
      .set("Authorization", token)
      .send(newRecipe)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const recipes = await helper.recipesInDb();
    expect(recipes).toHaveLength(helper.initialRecipes.results.length + 1);
  });

  test("a valid recipe in the db can be added to users favorites only", async () => {
    const testRecipes = await helper.recipesInDb();
    const testRecipe = testRecipes[0];
    //console.log(testRecipes);

    const passwordHash = await bcrypt.hash("banana", 10);
    const newUser = new User({
      username: "test_RecipeExistsInDb",
      name: "SuperUser",
      passwordHash,
    });

    const savedUser = await newUser.save();

    const loggedIn = await api.post("/api/login").send({
      username: "test_RecipeExistsInDb",
      password: "banana",
    });
    const tempToken = "bearer " + loggedIn.body.token;

    await api
      .post("/api/recipes")
      .set("Authorization", tempToken)
      .send(testRecipe)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const recipes = await helper.recipesInDb();
    expect(recipes).toHaveLength(helper.initialRecipes.results.length);

    const testRecipeAfter = recipes.find(
      (recipe) => recipe.spoonId === testRecipe.spoonId
    );
    //console.log(typeof savedUser.id);
    //console.log(typeof testRecipeAfter.users[1]);
    expect(testRecipeAfter.users).toHaveLength(testRecipe.users.length + 1);
    const testRecipeAfterUsersStr = testRecipeAfter.users.map((user) =>
      user.toString()
    );
    expect(testRecipeAfterUsersStr).toContain(savedUser.id);
  });

  test("a recipe with missing spoonId property should not be added", async () => {
    const newRecipe = {
      title: "noSpoonIdTest",
      image: "noSpoonIdTestImg",
    };

    const result = await api
      .post("/api/recipes")
      .set("Authorization", token)
      .send(newRecipe)
      .expect(400);

    const recipes = await helper.recipesInDb();
    expect(recipes).toHaveLength(helper.initialRecipes.results.length);
    expect(result.body.error).toContain("Path `spoonId` is required");
  });

  test("a recipe with missing title property should not be added", async () => {
    const newRecipe = {
      spoonId: 9999,
      image: "noTitleRecipeTest",
    };

    const result = await api
      .post("/api/recipes")
      .set("Authorization", token)
      .send(newRecipe)
      .expect(400);

    const recipes = await helper.recipesInDb();
    expect(recipes).toHaveLength(helper.initialRecipes.results.length);
    expect(result.body.error).toContain("Path `title` is required");
  });

  test("a recipe cannot be added when token is not provided and returns 401 status code", async () => {
    const newRecipe = {
      spoonId: 99,
      title: "test Recipe",
      image: "test Recipe Image",
    };

    const result = await api
      .post("/api/recipes")
      .set("Authorization", "")
      .send(newRecipe)
      .expect(401);

    expect(result.text).toContain("jwt must be provided");

    const testRecipesAfter = await helper.recipesInDb();
    expect(testRecipesAfter).toHaveLength(helper.initialRecipes.results.length);

    const testUsersAfter = await helper.usersInDb();
    const testUserAfter = testUsersAfter[0];
    expect(testUserAfter.recipes).toHaveLength(testUser.recipes.length);
  });

  test("a valid recipe in the db will not be double counted in a user recipes or recipe db", async () => {
    const testRecipes = await helper.recipesInDb();
    const testRecipe = testRecipes[0];

    const testUsers = await helper.usersInDb();
    const testUser = testUsers[0];

    const newRecipe = {
      spoonId: testRecipe.spoonId,
      title: testRecipe.title,
      image: testRecipe.image,
    };

    await api
      .post("/api/recipes")
      .set("Authorization", token)
      .send(newRecipe)
      .expect(201);

    const recipesAfter = await helper.recipesInDb();
    expect(recipesAfter).toHaveLength(testRecipes.length);

    const testUsersAfter = await helper.usersInDb();
    const testUserAfter = testUsersAfter[0];
    expect(testUserAfter.recipes).toHaveLength(testUser.recipes.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
