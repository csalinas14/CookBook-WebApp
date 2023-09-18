const axios = require("axios");
const recipesRouter = require("express").Router();
const Recipe = require("../models/recipe");
const User = require("../models/user");
const { userExtractor } = require("../utils/middleware");
const config = require("../utils/config");

const apiKey = config.API_KEY;
const baseUrl = config.API_BASEURL;

recipesRouter.get("/", async (request, response) => {
  //console.log("hello");
  const recipes = await Recipe.find({}).populate("users");
  response.json(recipes);
});

recipesRouter.get("/recipeSearch", async (request, response) => {
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
  //console.log(body);
  //console.log(request.user);
  const spoonId = body.spoonId;

  const user = await User.findById(request.user);

  const recipeInDb = await Recipe.findOne({ spoonId });
  //console.log(recipeInDb);

  //console.log(savedRecipe);
  let savedRecipe;

  if (recipeInDb) {
    //recipeInDb.users = recipeInDb.users.concat(user._id);
    recipeInDb.users.addToSet(user._id);
    savedRecipe = await recipeInDb.save();
    console.log(savedRecipe);
  } else {
    const recipe = new Recipe({ ...body, users: [request.user] });
    savedRecipe = await recipe.save();
  }

  await savedRecipe.populate("users");
  //user.recipes = user.recipes.concat(savedRecipe.id);
  user.recipes.addToSet(savedRecipe._id);
  await user.save();
  response.status(201).json(savedRecipe);
});

recipesRouter.delete("/:id", userExtractor, async (request, response) => {
  console.log("hello");
  const recipeId = request.params.id;
  const user = await User.findById(request.user);

  if (!recipeId) {
    response.status(400).end();
  }

  user.recipes = user.recipes.filter(
    (recipe) => recipe.toString() !== recipeId.toString()
  );
  console.log(user);
  await user.save();

  const recipe = await Recipe.findById(recipeId);
  recipe.users = recipe.users.filter((u) => u.toString() !== request.user);

  if (recipe.users.length === 0) {
    await Recipe.findByIdAndDelete(recipeId);
  } else {
    await recipe.save();
  }
  response.status(204).end();
});
module.exports = recipesRouter;
