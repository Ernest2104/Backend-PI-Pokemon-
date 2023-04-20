const { Type, conn } = require('../../src/db.js');
const { expect } = require('chai');

xdescribe('Type model', () => {
    before(() => conn.authenticate()
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      }));
    xdescribe('Validators', () => {
      beforeEach(() => Type.sync({ force: true }));
      describe('name', () => {
        xit('should throw an error if name is null', (done) => {
          Type.create({})
            .then(() => done(new Error('It requires a valid name')))
            .catch(() => done());
        });
        xit('should work when its a valid name', () => {
          Type.create({ name: 'Electric' });
        });
      });
    });
  });