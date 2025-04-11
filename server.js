// =======================================================
//                IMPORTS & INITIAL SETUP
// =======================================================
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const GitHubStrategy = require("passport-github2").Strategy;

const mongodb = require("./config/db");
const indexRoutes = require("./routes/index");
const userCollections = require("./controllers/userCollections");

const app = express();
const port = process.env.PORT || 3000;

// =======================================================
//                MIDDLEWARE SETUP
// =======================================================

// -------- Body Parser --------
app.use(bodyParser.json());

// -------- CORS --------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

// -------- Session Configuration --------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);

// -------- Passport Middleware --------
app.use(passport.initialize());
app.use(passport.session());

// -------- Manual CORS Headers (Optional Redundancy) --------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, x-Requested-with, Content-Type, Accept, z-Key"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

// =======================================================
//                PASSPORT STRATEGY
// =======================================================
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await userCollections.createUser(profile); // You may want to validate this function exists
        return done(null, profile);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// -------- Passport Serialize / Deserialize --------
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// =======================================================
//                ROUTES
// =======================================================

// -------- Swagger Docs Route --------
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));



// -------- OAuth GitHub Callback --------
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

// -------- API Routes --------
app.use("/", indexRoutes);

// -------- Root Redirect to Swagger --------
// NOTE: You can choose between this or the "Logged in as" route
app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // GitHub OAuth login
  }

  const user = req.session.user;
  res.send(`
    <h1>Welcome to the Library Management App</h1>
    <p>You are logged in as <strong>${user.displayName || user.username || user.login}</strong></p>
    <p><a href="/api-docs">View API Documentation</a></p>
  `);
});

// =======================================================
//                ERROR HANDLING
// =======================================================

// -------- Uncaught Exception Logger --------
process.on("uncaughtException", (err, origin) => {
  console.log(
    process.stderr.fd,
    `Caught exception: ${err}\n` + `Exception origin: ${origin}`
  );
});

// =======================================================
//                DATABASE & SERVER STARTUP
// =======================================================
mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log(`✅ Database connected`);
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
    });
  }
});
