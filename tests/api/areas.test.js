const utils = require('../utils');

describe('Areas', () => {

  let employeeToken = '';

  beforeEach(async () => {
    const adminUser = require('../mocks/seeds').users[0];
    const employeeUser = require('../mocks/seeds').users[1];
    const [{ body: { token: token1 } }, { body: { token: token2 } } ]  = await Promise.all([
      utils.loginUser(adminUser.username, adminUser.password),
      utils.loginUser(employeeUser.username, employeeUser.password)
    ]);
    adminToken = token1;
    employeeToken = token2;
  });

  it('Should get areas', async () => {
    const response = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.length).toBe(5);
    const items = body.map(item => ({ name: item.name }))
    expect(items).toContainEqual( { name: 'Team player' })
    expect(items).toContainEqual( { name: 'Technical referent' })
  })

});
