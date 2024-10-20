const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const productRoutes = require('./products-route/productroutes');
const sellerRoutes = require('./seller-routes/sellerroutes');
const app = express();
const cors = require('cors'); 
app.use(cors());
const port = 3000;
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/products', productRoutes);
app.use('/seller', sellerRoutes);

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
  });