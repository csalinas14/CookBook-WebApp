const Recipe = require("../models/recipe");
const User = require("../models/user");

const initialRecipes = {
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

const usersInDb = async () => {
  const users = await User.find({});

  const usersJSON = users.map((user) => user.toJSON());

  return usersJSON;
};

module.exports = {
  initialRecipes,
  usersInDb,
};
