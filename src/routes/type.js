const { Router } = require('express');
const { Type } = require('../db');
const router = Router();
const axios = require('axios');

const chargeTypes = async () => {
    // await Type.sync({ force: true })
    await Type.findOrCreate({ where: {name: 'All' }});
    const typesApi = await axios.get(`https://pokeapi.co/api/v2/type`);
    const types = await typesApi.data.results.map(t => t.name.charAt(0).toUpperCase() + t.name.slice(1));
    types.forEach( t => {
        Type.findOrCreate({
            where: { name: t }
        })
    })
    return chargeTypes;
}

router.get('/', async (req, res) => {
    await chargeTypes();
    const allTypes = await Type.findAll();
    res.status(200).send(allTypes);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const types = await Type.findAll();
    const type = types.filter(t => t.id == id);
    type.length ? res.send(type) : res.status(404).send('Tipo no encontrado');
} )

router.post('/', async (req, res) => {
    const { name } = req.body;
    const newType = await Type.create({
        name: name
    })
    res.status(200).send(newType).end();
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const type = await Type.findByPk(id);
    try {
        if (type !== null) {
            await type.destroy();
            return res.send('Tipo eliminado');
        } res.status(404).send('Tipo no encontrado');
    }
    catch(error) {
        console.error(error);
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const type = await Type.findByPk(id);
    console.log(type)
    try {
    if (type !== null) {
        await type.update({ name: name });
        res.send('Tipo modificado');
    } else res.status(404).send('Tipo no encontrado');
    } catch(error){
        console.log(error);
    }
})

module.exports = router;