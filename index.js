const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./Routes/auth");

const PORT = process.env.PORT || 3000;
const app = express();


const DB = "mongodb+srv://user2:test123@cluster0.bekbbhb.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB is Connected"))
  .catch((error) => {
    console.error(`MongoDB connection error: ${error}`);
  });

app.use(express.json());
app.use(authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});