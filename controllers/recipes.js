const axios = require("axios");
const recipesRouter = require("express").Router();

const apiKey = "ef9e7bcc61fd481b946adccb6b1e2e4e";
const baseUrl = "https://api.spoonacular.com/recipes/";

recipesRouter.get("/", async (request, response) => {
  const tempRecipes = {
    results: [
      {
        id: 631814,
        title: "$50,000 Burger",
        image: "https://spoonacular.com/recipeImages/631814-312x231.jpg",
        imageType: "jpg",
      },
      {
        id: 642539,
        title: "Falafel Burger",
        image: "https://spoonacular.com/recipeImages/642539-312x231.png",
        imageType: "png",
      },
    ],
    offset: 0,
    number: 2,
    totalResults: 54,
  };
  const body = request.body;

  if (!body.recipe) {
    response.status(400).end();
  }
  console.log(body);
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${baseUrl}complexSearch?query=${body.recipe}&number=2&apiKey=${apiKey}`,
    headers: {},
  };
  //let recipesJson = tempRecipes;
  const recipesJson = await axios.request(config);
  //recipesJson = JSON.stringify(recipesData.data);

  //console.log(recipesJson.data);
  const recipesId = recipesJson.data.results.map((r) => r.id);
  //console.log(recipesId);
  const recipesIdString = recipesId.join(",");
  console.log(recipesIdString);

  const config2 = {
    ...config,
    url: `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipesIdString}`,
  };
  const recipesInfo = await axios.request(config2);
  console.log(recipesInfo);
  response.json(recipesInfo.data);
});

module.exports = recipesRouter;
