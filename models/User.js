// Model for User
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    data: [
      {
        type: Schema.Types.ObjectId,
        ref: "data"
      },
    ],
    createdAt: Number,
    updatedAt: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserSchema);
module.exports = User;
