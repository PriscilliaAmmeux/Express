require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const port = 5000;

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

const movieHandlers = require("./movieHandlers");

app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

const usersHandlers = require("./userHandlers");

app.get("/api/users", usersHandlers.getUsers);
app.get("/api/users/:id", usersHandlers.getUserById);
// app.post("/api/users", usersHandlers.postUser);
app.put("/api/users/:id", usersHandlers.updateUser);
app.delete("/api/users/:id", usersHandlers.deleteUser);

const userHandlers = require("./userHandlers");

const { hashPassword } = require("./auth.js");

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

app.post("/api/users", hashPassword, usersHandlers.postUser);

const isItDwight = (req, res) => {
  if (
    req.body.email === "dwight@theoffice.com" &&
    req.body.password === "123456"
  ) {
    res.send("Credentials are valid");
  } else {
    res.sendStatus(401);
  }
};

app.post("/api/login", isItDwight);

const jwt = require("jsonwebtoken"); // don't forget to import

const verifyPassword = (req, res) => {
  argon2
    .verify(req.user.hashedPassword, req.body.password)
    .then((isVerified) => {
      if (isVerified) {
        const payload = { sub: req.user.id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        delete req.user.hashedPassword;
        res.send({ token, user: req.user });
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);
