const { Router } = require('express');
const routePokemon = require('./pokemon');
const routeType = require('./type');

// Importar todos los routers;
const router = Router();
// Configurar los routers
router.use('/pokemons', routePokemon);
router.use('/types', routeType);

module.exports = router;
