const axios = require("axios");
const recipesRouter = require("express").Router();
const Recipe = require("../models/recipe");
const User = require("../models/user");
const { userExtractor } = require("../utils/middleware");
const config = require("../utils/config");

const apiKey = config.API_KEY;
const baseUrl = config.API_BASEURL;

recipesRouter.get("/", async (request, response) => {
  const body = request.body;

  if (!body.recipe) {
    response.status(400).end();
  }
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${baseUrl}complexSearch?query=${body.recipe}&number=2&apiKey=${apiKey}`,
    headers: {},
  };
  const recipesInfo = await axios.request(config);

  //old api additional call
  /*
  const recipesId = recipesJson.data.results.map((r) => r.id);
  const recipesIdString = recipesId.join(",");

  const config2 = {
    ...config,
    url: `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipesIdString}`,
  };
  const recipesInfo = await axios.request(config2);
  */
  response.json(recipesInfo.data);
});

recipesRouter.post("/", userExtractor, async (request, response) => {
  const body = request.body;

  const user = await User.findById(request.user);

  const recipeInDb = await Recipe.findOne(body.spoonId);

  let savedRecipe;

  if (recipeInDb) {
    recipeInDb.users = recipeInDb.users.concat(user._id);
    savedRecipe = await recipeInDb.save();
    await savedRecipe.populate("users");
    user.recipes = user.recipes.concat(recipeInDb._id);
    await user.save();
  }
  response.status(201).json(savedRecipe);
});

module.exports = recipesRouter;
