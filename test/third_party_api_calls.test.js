const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Recipe = require("../models/recipe");
const User = require("../models/user");
const helper = require("./test_helper");
mongoose.set("bufferTimeoutMS", 30000);

describe("handling spoonacular api calls", () => {
  test("standard recipe api call is functional", async () => {
    const newRecipeSearch = {
      recipe: "burger",
    };

    const response = await api
      .get("/api/recipes")
      .send(newRecipeSearch)
      .expect("Content-Type", /application\/json/)
      .expect(200);

    const recipes = response.body;

    expect(recipes.number).toBe(2);
    expect(recipes.results[0].title.toLowerCase()).toMatch(
      RegExp(newRecipeSearch.recipe)
    );
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
