const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Recipe = require("../models/recipe");
const { userExtractor } = require("../utils/middleware");

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

usersRouter.get("/favorites", userExtractor, async (request, response) => {
  //console.log(request.user);
  const user = await User.findById(request.user);
  await user.populate("recipes");
  response.json(user.recipes);
});

usersRouter.delete("/favorites", userExtractor, async (request, response) => {
  const body = request.body;
  const recipeId = body.id;
  const user = await User.findById(request.user);

  if (!recipeId) {
    response.status(400).end();
  }

  user.recipes = user.recipes.filter(
    (recipe) => recipe.id.toString() !== recipeId.toString()
  );

  await user.save();

  const recipe = await Recipe.findById(recipeId);
  recipe.users = recipe.users.filter((u) => u.id.toString() !== request.user);

  if (recipe.users.length === 0) {
    await recipe.delete();
  } else {
    await recipe.save();
  }
  response.status(204).end();
});

module.exports = usersRouter;
