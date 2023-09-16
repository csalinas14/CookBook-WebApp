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
  test("a valid recipe can be added", async () => {
    const testUsers = await helper.usersInDb();
    const testUser = testUsers.find((user) => user.username === "root");

    const testRecipes = helper.initialRecipes;
    const testRecipe = testRecipes.results[0];

    const newRecipe = {
      spoonId: testRecipe.id,
      title: testRecipe.title,
      image: testRecipe.image,
    };

    await api
      .post("/api/recipes")
      .set("Authorization", token)
      .send(newRecipe)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
