const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
mongoose.set("bufferTimeoutMS", 30000);

describe("initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("test", 10);
    const user = new User({
      username: "tester",
      name: "SuperUser",
      passwordHash: passwordHash,
    });

    await user.save();
  });

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

afterAll(async () => {
  await mongoose.connection.close();
});
