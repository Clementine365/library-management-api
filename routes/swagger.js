const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");

try {
  const swaggerDocument = require("../swagger-output.json");
  router.use("/api-docs", swaggerUi.serve);
  router.get("/api-docs", swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.error("Error loading swagger document:", err.message);
  // Provide a simple fallback
  router.get("/api-docs", (req, res) => {
    res
      .status(500)
      .send(
        'Swagger documentation is not available. Please run "npm run generate-docs" first.'
      );
  });
}

module.exports = router;
