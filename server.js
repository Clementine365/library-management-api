const express = require("express");
const bodyParser = require("body-parser");
const booksRoutes = require("./routes/books");
const swagger = require("./config/swagger");
const mongodb = require("./config/db");
const userCollections = require("./controllers/userCollections");
const app = express();
const passport = require("passport");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const cors = require("cors");
const port = process.env.PORT || 3000;

// app.use(bodyParser.json());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept, Z-key'
//     );
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     next();
// });
app
  .use(bodyParser.json())
  .use(
    session({
      secret: process.env.SESSION_SECRET, // Use environment variable for secret
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI, // Change MONGODB_URL to MONGODB_URI to match .env
        ttl: 14 * 24 * 60 * 60, // Session TTL (optional)
      }),
    })
  )
  .use(passport.session())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, x-Requested-with, Content-Type, Accept, z-Key"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PATCH, POST, PUT, DELETE, OPTIONS"
    ); // Corrected typo
    next();
  })
  .use(cors({ methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"] }))
  .use(cors({ origin: "*" }))
  .use("/books", booksRoutes)
  .use("/", require("./routes/index.js"));

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await userCollections.createUser(profile);
        // console.log('User profile saved:', result);
        return done(null, profile);
      } catch (err) {
        // console.error('Error saving user:', err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send(
    req.session.user !== undefined
      ? `Logged in as ${req.session.user.username}`
      : "Logged out"
  );
});

app.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/api-docs",
    session: false,
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
  }
);

// Add swagger documentation
swagger(app);

// Redirect root to API documentation
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Routes

//handles and catch any unhandled error
process.on("uncaughtException", (err, origin) => {
  console.log(
    process.stderr.fd,
    `Caught exception: ${err}\n` + `Exception origin: ${origin}`
  );
});

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log(
        `Database is connected and server is running on port ${port}`
      );
      console.log(
        `Swagger documentation available at http://localhost:${port}/api-docs`
      );
    });
  }
});
