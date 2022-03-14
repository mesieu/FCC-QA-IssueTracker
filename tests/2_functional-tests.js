const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('Integration tests with chai-http', () => {
    //#1
    test('Create am issue with every field: POST request to api/issues/{project}', (done) => {
      let issue = {
        issue_title: 'test_title',
        issue_text: 'test_text',
        created_on: new Date(),
        updated_on: new Date(),
        created_by: 'test_creator',
        assigned_to: 'test_assignee',
        open: true,
        status_text: 'test_statusText',
      };
      chai
        .request(server)
        .get('/api/issues/testProject')
        .end((err, res) => {
          assert.equal(res.status, 200);
        });
    });
  });
});
