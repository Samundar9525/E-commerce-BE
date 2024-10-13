const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const productRoutes = require('./products-route/productroutes'); // Import routes
const app = express();
const cors = require('cors'); 
app.use(cors());
const port = 3000;

app.use(express.static('public'));

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Use product routes
app.use('/products', productRoutes);








// ----------------------------------------------------------------------------------------------------------------------------------Start server
// app.listen(port, '0.0.0.0', () => {
//   console.log(`App is running at http://localhost:${port}`);
// });
// Run on localhost
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
  });