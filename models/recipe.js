const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
//spoonacular api allows us to store title, id, and image permanently as preview information
//this will be used for saving user's favorite recipes in list format and will do an api call
//when clicked on
const recipeSchema = new mongoose.Schema({
  spoonId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

recipeSchema.plugin(uniqueValidator);

recipeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
