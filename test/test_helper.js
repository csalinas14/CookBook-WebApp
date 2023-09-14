const Recipe = require("../models/recipe");
const User = require("../models/user");

const initialRecipes = [
  {
    spoonId: 631814,
    title: "$50,000 Burger",
    image: "https://spoonacular.com/recipeImages/631814-556x370.jpg",
    imageType: "jpg",
    sourceUrl: "http://www.foodista.com/recipe/FHT4DDYV/50000-burger",
    cheap: false,
    vegan: false,
    readyInMinutes: 45,
    users: [],
    dishTypes: ["lunch", "main course", "main dish", "dinner"],
  },
];

const usersInDb = async () => {
  const users = await User.find({});

  const usersJSON = users.map((user) => user.toJSON());

  return usersJSON;
};

module.exports = {
  initialRecipes,
  usersInDb,
};
