const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        tittle:'Library-management-api',
        description:'Library Magangement Team 13 Project'
    },
    host:'localhost:3000',
    schemes:['http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// this will gerner swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
