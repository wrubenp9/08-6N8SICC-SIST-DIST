const express = require('express');
const router = express.Router();
const pokemonController = require('../src/controller/PokemonControler');

router.post('/capture', pokemonController.capturePokemon);
router.post('/battle/:id', pokemonController.battlePokemon);
router.get('/all', pokemonController.getAllPokemon);
router.get('/:id', pokemonController.getPokemonById);

module.exports = router;
