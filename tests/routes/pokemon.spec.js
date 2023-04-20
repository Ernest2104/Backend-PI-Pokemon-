/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require('chai');
const session = require('supertest-session');
const app = require('../../src/app.js');
const { Pokemon, conn } = require('../../src/db.js');

const agent = session(app);
const pokemon = {
  name: 'Pikachu',
};

xdescribe('Pokemon routes', () => {
  before(() => conn.authenticate()
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  }));
  beforeEach(() => Pokemon.sync({ force: true })
    .then(() => Pokemon.create(pokemon)));
  xdescribe('GET /pokemons', () => {
    xit('should get 200', () =>
      agent.get('/pokemons').expect(200)
    );
  });
});
  
xdescribe('POST /pokemons', () => {
  xit("POST agrega un nuevo Pokemon",  () => {
    agent.post('/pokemons')
    .send({ name: 'Pikachu' })
    .expect(200)
    .then((res) => {
      expect(res.body).to.eql('Pikachu');
    })
  })
});

xdescribe('pokemons/:id', () => {
  xit('GET responde con el personaje encontrado x id', () => {
      agent.get('pokemons/1')
      .expect(200)
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body).to.eql('Pikachu');
      });
  });
})
