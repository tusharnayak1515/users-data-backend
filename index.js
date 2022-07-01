const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const express = require('express');
const cors = require('cors');
const connectToMongo = require("./db");
const app = express();
const port = process.env.PORT || 5000;

connectToMongo();
app.use(cors());
app.use(express.json());

require("./models/User");
require("./models/Data");

app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/data", require("./routes/data.js"));

app.listen(port, (error)=> {
    if(error) {
        console.log(error);
    }
    else {
        console.log(`Server started successfully at port ${port}.`);
    }
});