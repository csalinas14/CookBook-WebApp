const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  spoonId: Number,
  title: String,
  image: String,
  imageType: String,
  sourceUrl: String,
  spoonScore: Number,
  cheap: Boolean,
  vegan: Boolean,
  readyInMinutes: Number,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dishTypes: [],
});

recipeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
