const axios = require("axios");
const HandleDBMSMySQL = require("../config/database/HandleDBMSMySQL");

const db = new HandleDBMSMySQL();

async function capturePokemon(id = 0) {
  let pokemonId = 0;

  if (id === 0) {
    pokemonId = Math.floor(Math.random() * 100) + 1;
  }

  try {
    const pokemonExists = await checkIfPokemonExists(pokemonId);

    if (pokemonExists) {
      return {
        status: 400,
        message: "Este Pokémon já foi capturado anteriormente",
      };
    }

    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );

    const { abilities, base_experience, id, name, sprites } = response.data;
    const imageUrl = sprites.other.dream_world.front_default;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const sortedAbilities = abilities.map((ability, index) => ({
      sequence: index + 1,
      name: ability.ability.name,
      slot: ability.slot,
    }));

    const query = `
      INSERT INTO pokemon_captured
      (id_pokemon, name, abilities, base_experience, url)
      VALUES (?, ?, ?, ?, ?);
    `;

    const args = [
      id,
      capitalizedName,
      JSON.stringify(sortedAbilities),
      base_experience,
      imageUrl,
    ];

    await db.sqlInsert(query, args);

    return {
      status: 200,
      message: "Pokemon capturado com sucesso",
      data: {
        id,
        capitalizedName,
        sortedAbilities,
        base_experience,
        imageUrl,
      },
    };
  } catch (error) {
    console.error(`Error ao capturar Pokémon: ${error.message}`);
    return {
      status: 500,
      message: `Error ao capturar Pokémon: ${error.message}`,
    };
  }
}

async function battlePokemon(pokemonId) {
  try {
    // Consuming the external PokeAPI route to get a random Pokémon
    const randomPokemonId = Math.floor(Math.random() * 100) + 1;
    const enemyPokemonUrl = `https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`;
    const responseEnemyPokemon = await axios.get(enemyPokemonUrl);
    const enemyPokemonData = responseEnemyPokemon.data;

    // Consuming the external PokeAPI route to get the Pokémon with the provided ID
    const userPokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    const userResponse = await axios.get(userPokemonUrl);
    const userPokemonData = userResponse.data;

    // Calculating the "power" of the Pokémon as specified
    const calculatePower = (pokemon) => {
      const abilitiesCount = pokemon.abilities.length;
      const totalSlotValue = pokemon.abilities.reduce(
        (total, ability) => total + ability.slot,
        0
      );
      const power = Math.log(
        abilitiesCount * totalSlotValue * pokemon.base_experience
      );
      return power;
    };

    // Calculating the "power" for both Pokémons
    const userPower = calculatePower(userPokemonData);
    const enemyPower = calculatePower(enemyPokemonData);

    // Adding the "power" to the Pokémon data and saving it to the database
    const enemySql = `
        INSERT INTO pokemon_battle (enemy_id, enemy_power, user_pokemon_id)
        VALUES (?, ?, ?)
    `;
    const updateUserPower =
      "UPDATE pokemon_captured SET power = ? WHERE id_pokemon = ?";

    // Using async/await for database queries
    await db.sqlInsert(updateUserPower, [userPower, pokemonId]);
    await db.sqlInsert(enemySql, [randomPokemonId, enemyPower, pokemonId]);

    console.log(
      `Battle registered between Pokémon ID ${pokemonId} and random Pokémon ID ${randomPokemonId}.`
    );
    return { status: 200, message: "Battle completed" };
  } catch (error) {
    console.error(error);
    return { stauts: 500, error: "Erro ao lutar com Pokémon" };
  }
}

async function findAllPokemon() {
  const query = "SELECT * FROM pokemon_captured";

  db.sqlSelect(query, (err, result) => {
    if (err) throw err;

    console.log("Consulta à Pokédex realizada com sucesso.");
    return result;
  });
}

async function findPokemonById(pokemonId) {
  try {
    const getPokemonQuery =
      "SELECT * FROM pokemon_captured WHERE id_pokemon = ?";

    const result = await db.sqlSelect(getPokemonQuery, [pokemonId]);

    if (result.results.length > 0) {
      console.log(`Consulta ao Pokémon ID ${pokemonId} realizada com sucesso.`);
      return { status: 200, data: result.results[0] };
    } else {
      return { status: 404, message: "Pokémon não encontrado na Pokédex." };
    }
  } catch (erro) {
    console.error(erro);
    return { status: 500, error: "Erro ao consultar o Pokémon na Pokédex." };
  }
}

async function checkIfPokemonExists(pokemonId) {
  try {
    const checkQuery = `SELECT * FROM pokemon_captured WHERE id_pokemon = ?`;
    const checkResult = await db.sqlSelect(checkQuery, [pokemonId]);
    return checkResult.results.length > 0;
  } catch (error) {
    console.error(`Error ao verificar se o Pokémon existe: ${error.message}`);
    throw new Error(`Error ao verificar se o Pokémon existe: ${error.message}`);
  }
}

module.exports = { capturePokemon };
