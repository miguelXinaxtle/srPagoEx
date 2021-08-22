const app = require('../app');

const request = require('supertest');

describe('Inicio', () => {
  describe('GET /', () => {
    it('should get 200', done => {
      request(app).get('/').expect(200, done);
    });

    it('should get Servicio arriba!', done => {
      request(app).get('/').expect('Servicio arriba!', done);
    });

    it('should get 200 /frauds/:id', done => {
      request(app).get('/frauds/222222').expect(200, done);
    });

    it('should get 200 /frauds/:id', done => {
      request(app).get('/frauds/222222').expect([
        {
          "transaction_id": "222222",
          "isFraud": true,
          "data": [
            "ATGCGA",
            "CAGTGC",
            "TTATGT",
            "AGAAGG",
            "CCCCTA",
            "TCACTG"
          ]
        }
      ], done);
    });

    it('should get 200 /frauds?page=0&size=2', done => {
      request(app).get('/frauds?page=0&size=2').expect(200, done);
    });

    it('should get 200 /frauds?page=0&size=2', done => {
      request(app).get('/frauds?page=0&size=2').expect([
        {
          "transaction_id": "111111",
          "isFraud": true,
          "data": [
            "ATGCGA",
            "CAGTGC",
            "TTATGT",
            "AGAAGG",
            "CCCCTA",
            "TCACTG"
          ]
        },
        {
          "transaction_id": "111222",
          "isFraud": false,
          "data": [
            "TTGCGA",
            "CAGTGC",
            "TTATGT",
            "AGAAGG",
            "GCCCTA",
            "TCACTG"
          ]
        }], done);
    });

    it('should get 200 /stats', done => {
      request(app).get('/stats').expect(200, done);
    });

    it('should get 200 /stats', done => {
      request(app).get('/stats').expect({
        "count_fraud": 11,
        "count_not_fraud": 5,
        "ratio": 2.2
      }, done);
    });

  });
  describe('POST /', () => {

    it('should post 200 /frauds', done => {
      request(app).post('/frauds').send({
        "transaction_id": "999001",
        "data": [
          "ATGCGA",
          "CAGTGC",
          "TTATGT",
          "AGAAGG",
          "CCCCTA",
          "TCACTG"
        ]
      }).expect(200, done);
    });

    it('should post 403 /frauds', done => {
      request(app).post('/frauds').send({
        "transaction_id": "999002",
        "data": [
          "TTGCGA",
          "CAGTGC",
          "TTATGT",
          "AGAAGG",
          "GCCCTA",
          "TCACTG"
        ]
      }).expect(403, done);
    });
  })
});
