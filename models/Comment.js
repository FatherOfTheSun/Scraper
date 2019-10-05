var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new commentSchema object
// This is similar to a Sequelize model
var CommentSchema = new Schema({
    // `title` is of type String
    title: {
        type: String,
    },
    // `body` is of type String
    body: {
        type: String,
        required: true
    },
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the comment model
module.exports = Comment;