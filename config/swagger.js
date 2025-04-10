const swaggerUi = require("swagger-ui-express");
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Library Management API",
    description: "API for managing a library system",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

// Define the output file for the Swagger specification
const outputFile = "./swagger-output.json";
// Define the route files to be documented
const endpointsFiles = ["./routes/books.js", "./routes/index.js"];

// Function to initialize Swagger UI in Express
module.exports = (app) => {
  try {
    // Only try to load the existing documentation, don't generate it automatically
    const swaggerSpec = require("../swagger-output.json");
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger documentation initialized");
  } catch (err) {
    console.error("Error initializing Swagger documentation:", err.message);
    console.log(
      "Run 'npm run generate-docs' to generate Swagger documentation"
    );

    // Fallback to basic documentation
    const swaggerSpec = {
      ...doc,
      paths: {}, // Empty paths as fallback
    };
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};
