const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('Integration tests with chai-http', () => {
    //#1
    test('create issue with every field', (done) => {
      let issue = {
        issue_title: 'test_title',
        issue_text: 'test_text',
        created_by: 'test_creator',
        assigned_to: 'test_assignee',
        status_text: 'test_statusText',
      };
      chai
        .request(server)
        .post('/api/issues/testProject')
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
    //#2
    test('create issue with required fields', (done) => {
      let issue = {
        issue_title: 'test_title',
        issue_text: 'test_text',
        created_by: 'test_creator',
      };
      chai
        .request(server)
        .post('/api/issues/projectTest')
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
    //#3
    test('create issue with missing required fields', (done) => {
      let issue = {
        issue_title: 'test_title',
        issue_text: 'test_text',
      };
      chai
        .request(server)
        .post('/api/issues/projectTest')
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
