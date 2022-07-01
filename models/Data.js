// Model for User
const mongoose = require("mongoose");
const { Schema } = mongoose;

const DataSchema = new Schema(
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
    domain: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: Number,
    updatedAt: Number,
  },
  { timestamps: true }
);

const Data = mongoose.model("data", DataSchema);
module.exports = Data;
