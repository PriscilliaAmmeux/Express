require("dotenv").config();
const express = require("express");

const app = express();

const port = process.env.APP_PORT ?? 5000;

app.use(express.json());

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

const Session = require("express-session");
const FileStore = require("session-file-store")(Session);
const path = require("path");

app.use(
  Session({
    store: new FileStore({
      path: path.join(__dirname, "/tmp"),
      encrypt: true,
    }),
    secret: "it' a secret, you will not know !",
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.get("/", welcome);

const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");
const validator = require("./validator");
const {
  hashPassword,
  verifyPassword,
  verifyToken,
  verifyId,
} = require("./auth.js");

app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);
app.get("/api/session-in", (req, res) => {
  req.session.song = "fais dodo ! ";
  res.send("Cola mon petit frère");
});
app.get("/api/session-out", (req, res) => {
  res.send(req.session.song);
});
app.post(
  "/api/users",
  validator.validateUser,
  hashPassword,
  userHandlers.postUser
);
app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

app.use(verifyToken);
app.post("/api/movies", validator.validateMovie, movieHandlers.postMovie);
app.put("/api/movies/:id", validator.validateMovie, movieHandlers.putMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.use(verifyId);
app.put(
  "/api/users/:id",
  validator.validateUser,
  hashPassword,
  userHandlers.putUser
);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
