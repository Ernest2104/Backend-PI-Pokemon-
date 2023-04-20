const { Router } = require('express');
const { Pokemon, Type } = require('../db');
const router = Router();
const axios = require('axios');

// pokemones de la API
const getApiInfo = async () => {
    // const arrayPokemons = []   
    // for (let id = 1; id <= 40; id++) {    
    //     arrayPokemons.push(axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`));// arrayPokemons -> array de promesas         
    // }

    // const apiInfo = await Promise.all(arrayPokemons)// Promise -> retorna una promesa cuando todas las promesas del argumento concluyeron
    // .then(pokemon => {
    //     const apiPokes = pokemon.map(poke => {
    //         return {
    //             id: poke.data.id,
    //             name: poke.data.name.charAt(0).toUpperCase() + poke.data.name.slice(1),
    //             hp: poke.data.stats[0].base_stat,
    //             attack: poke.data.stats[1].base_stat,
    //             defense: poke.data.stats[2].base_stat,
    //             speed: poke.data.stats[5].base_stat,
    //             weight: poke.data.weight,
    //             height: poke.data.height,
    //             sprite: poke.data.sprites.other.home.front_default,
    //             types: poke.data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
    //         }
    //     })
    //     return apiPokes;
    // })            
    // return apiInfo;

    // const resp = await axios
    //   .get("https://pokeapi.co/api/v2/pokemon?limit=40")
    //   .then((data) => {
    //     return data.data.pokemons.datas;
    //   })
    //   .then((data) => {
    //     return Promise.all(data.map((res) => axios.get(res.url))); // ENTRAR A CADA ELEMENTO Y HACERLE UN GET A SU URL
    //   })
    //   .then((data) => {
    //     return data.map((res) => res.data); // pokemons.dataADO FINAL DE CADA POKEMON CON TODOS SUS DATOS, SE GUARDAN EN RESP.
    //   });
    // let arrayPoke = resp.map((pokemons.data) => {  //DENTRO DE UN ARRAY ME TRAIGO TODAS LAS PROPIEDADES QUE QUIERO DE CADA POKEMON.
    //   return {
    //     id: pokemons.data.id,
    //     name: pokemons.data.name.charAt(0).toUpperCase() + poke.data.name.slice(1),
    //     hp: pokemons.data.stats[0].base_stat,
    //     attack: pokemons.data.stats[1].base_stat,
    //     defense: pokemons.data.stats[2].base_stat,
    //     speed: pokemons.data.stats[5].base_stat,
    //     weight: pokemons.data.weight,
    //     height: pokemons.data.height,
    //     sprite: pokemons.data.sprites.other.home.front_default,
    //     types: pokemons.data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
    //     // id: pokemons.data.id,
    //     // name: pokemons.data.name,
    //     // types: pokemons.data.types.map((t) => t.type.name), //lOS TIPOS ESTAN EN SU PROPIEDAD NAME
    //     // image: pokemons.data.sprites.front_default,
    //     // life: pokemons.data.stats[0].base_stat,
    //     // attack: pokemons.data.stats[1].base_stat,
    //     // defense: pokemons.data.stats[2].base_stat,
    //     // speed: pokemons.data.stats[3].base_stat,
    //     // height: pokemons.data.height,
    //     // weight: pokemons.data.weight,
    //   };
    // });
    // return arrayPoke;

    const apiPokemons = [];
    const pokemonRequest = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=40");
    const urlPokemonSubrequest = pokemonRequest.data.pokemons.datas.map((pokemon) => pokemon.url);
    await axios.all(urlPokemonSubrequest.map((urlPokemonSubrequest) => axios.get(urlPokemonSubrequest))).then(
      (pokemons) => {
        pokemons.map((pokemons) => apiPokemons.push({
            id: pokemons.data.id,
            name: pokemons.data.name.charAt(0).toUpperCase() + pokemons.data.name.slice(1),
            hp: pokemons.data.stats[0].base_stat,
            attack: pokemons.data.stats[1].base_stat,
            defense: pokemons.data.stats[2].base_stat,
            speed: pokemons.data.stats[5].base_stat,
            weight: pokemons.data.weight,
            height: pokemons.data.height,
            sprite: pokemons.data.sprites.other.home.front_default,
            types: pokemons.data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
        }));
      },
    );
    return apiPokemons;
};

// pokemones de la base de datos
const getDbInfo = async () => {
    return (
        await Pokemon.findAll({
        include:{
            model: Type,
            attributes: ['name'],
            through: {
                attributes: [],
            }
        }
        })
    )
};

//pokemones de la base de datos + pokemones de la API
const getAllPokemons = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const infoTotal = [...apiInfo, ...dbInfo];
    return infoTotal;
};

// GET /pokemons + GET /pokemons?name="..." -> async/await
router.get('/', async (req, res) => {
    const name = req.query.name
    try {
        const pokemonsTotal = await getAllPokemons();
        if (name) {
            const pokemonName = pokemonsTotal.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
            pokemonName.length ? res.status(200).send(pokemonName) : res.status(404).send('Pokemon no encontrado!');
        } else {
            res.status(200).send(pokemonsTotal);
        }
    } catch(error) {
        res.status(500).send(error);
    }
});

// POST /pokemons -> async/await 
router.post('/', async (req, res) => {
    const { name, hp, attack, defense, speed, weight, height, sprite, type, createInDb } = req.body;
    const pokemonCreated = await Pokemon.create ({
        name,
        hp,
        attack,
        defense,
        speed,
        weight,
        height,
        sprite,
        createInDb
    })
    const typesDb = await Type.findAll({
        where: { name: type }
    });
    pokemonCreated.addType(typesDb);
    res.status(200).send('Pokemon creado con éxito!')
});

// DELETE /pokemons -> async/await
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const pokemon = await Pokemon.findByPk(id)
    if (pokemon !== null) {
        await pokemon.destroy()
        res.status(200).send('Pokemon eliminado')
    } else res.status(404).send('Pokemon no encontrado')
});

// UPDATE /pokemons -> async/await
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const pokemon = await Pokemon.findByPk(id)
    if (pokemon !== null) {
        await pokemon.update(req.body)
        const typesDb = await Type.findAll({
              where: { name: req.body.type.map(t => t) }
        });
        pokemon.setTypes(typesDb);
        res.status(200).send('Pokemon modificado')
    } else res.status(404).send('Pokemon no encontrado')
})

// GET /pokemons/{idPokemon} -> async/await
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const pokemonTotal = await getAllPokemons();
    if (id) {
        const pokemonId = pokemonTotal.filter(p => p.id == id);
        pokemonId.length ? res.json(pokemonId) : res.status(404).send('Pokemon no encontrado!');
    }
});

module.exports = router;