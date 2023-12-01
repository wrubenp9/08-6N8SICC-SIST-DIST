const pokemonService = require("../service/PokemonService");

async function capturePokemon(req, res) {
  try {
    const result = await pokemonService.capturePokemon();
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function battlePokemon(req, res) {
  try {
    const pokemonId = req.params.id;
    const result = await pokemonService.battlePokemon(pokemonId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllPokemon(req, res) {
  try {
    const result = await pokemonService.findAllPokemon();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getPokemonById(req, res) {
  try {
    const pokemonId = req.params.id;
    const result = await pokemonService.findPokemonById(pokemonId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  capturePokemon,
  battlePokemon,
  getAllPokemon,
  getPokemonById,
};
