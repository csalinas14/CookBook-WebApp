const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  /*
  if (!password) {
    return response.status(400).json({
      error: "No password provided",
    });
  }
  */
  try {
    if (password.length < 6) {
      return response.status(400).json({
        error: "Invalid password length",
      });
    }
  } catch (error) {
    if (error instanceof TypeError) {
      return response.status(400).json({
        error: "No password provided",
      });
    }
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
