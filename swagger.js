const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Product API',
    description: 'API for product management',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger_output.json'; 
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server');
});
    