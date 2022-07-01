const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

const connectToMongo = () => {
    try {
      mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
          console.log("Connected to MongoDB successfully!");
        });
    } 
    catch (error) {
      console.log(`MongoDb Connection error: ${error}`);
    }
  };
  
  module.exports = connectToMongo;