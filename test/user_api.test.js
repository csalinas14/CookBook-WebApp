const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Recipe = require("../models/recipe");
const User = require("../models/user");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
mongoose.set("bufferTimeoutMS", 30000);

let token = "";

describe("initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({
      username: "tester",
      name: "SuperUser",
      passwordHash: passwordHash,
    });

    const savedUser = await user.save();

    const recipesWithTestUser = helper.initialRecipes.results.map((recipe) => ({
      title: recipe.title,
      image: recipe.image,
      spoonId: recipe.id,
      users: [savedUser._id],
    }));

    const recipeObjects = recipesWithTestUser.map(
      (recipe) => new Recipe(recipe)
    );
    const promiseArray = recipeObjects.map((recipe) => recipe.save());
    const savedRecipes = await Promise.all(promiseArray);

    savedRecipes.map(
      (recipe) => (savedUser.recipes = savedUser.recipes.concat(recipe._id))
    );
    await savedUser.save();

    const loggedIn = await api.post("/api/login").send({
      username: "tester",
      password: "secret",
    });
    token = "bearer " + loggedIn.body.token;
  });

  describe("user creation", () => {
    test("creation succeeds with a fresh username", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "testingBackend",
        name: "Admin",
        password: "banana",
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();

      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
      const usersnames = usersAtEnd.map((u) => u.username);
      expect(usersnames).toContain(newUser.username);
    });

    test("creation fails with proper statuscode if username is already taken", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "tester",
        name: "SuperUser",
        password: "apples",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("expected `username` to be unique");
      //console.log(result.body.error);
    });

    test("creation fails with proper statuscode and message is invalid password length", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "newUser",
        name: "SuperUser",
        password: "short",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("Invalid password length");

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toEqual(usersAtStart);
    });

    test("creation fails with proper statuscode and message when no user is defined", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        name: "SuperUser",
        password: "banana",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("Path `username` is required");

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toEqual(usersAtStart);
    });

    test("creation fails with proper statuscode and message when no password is defined", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "test",
        name: "SuperUser",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("No password provided");

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toEqual(usersAtStart);
    });
  });
});

describe("user information", () => {
  test("able to retrieve user favorite recipes", async () => {
    const usersAtStart = await helper.usersInDb();
    const usersRecipes = usersAtStart[0].recipes;

    const response = await api
      .get("/api/users/favorites")
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(usersRecipes.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
