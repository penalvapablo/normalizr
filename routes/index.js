const productTestController = require('../components/productTest/ProductTestController');

module.exports = (app) => {
  
  productTestController(app);

  app.get('*', (req, res) =>
    res.status(404).json({
      error: -2,
      description: `ruta ${req.originalUrl} método get no implementado`,
    })
  );
};
