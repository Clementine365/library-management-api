const swaggerUi = require('swagger-ui-express');
let swaggerDocument;

try {
    swaggerDocument = require('../swagger-output.json');
} catch (err) {
    console.warn('Swagger documentation not generated yet. Please run: npm run generate-docs');
    swaggerDocument = {
        swagger: "2.0",
        info: {
            title: "API Documentation",
            description: "Documentation not generated yet"
        },
        paths: {}
    };
}

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};