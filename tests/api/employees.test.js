const utils = require('../utils');

describe('Employees', () => {

  let adminToken = '';
  let employeeToken = ''
  let employeeUser;

  beforeEach(async () => {
    const adminUser = require('../mocks/seeds').users[0];
    employeeUser = require('../mocks/seeds').users[1];
    const [{ body: { token: token1 } }, { body: { token: token2 } }]  = await Promise.all([
      utils.loginUser(adminUser.username, adminUser.password),
      utils.loginUser(employeeUser.username, employeeUser.password)
    ]);
    adminToken = token1;
    employeeToken = token2;
  });

  it('Get employees as Amin', async () => {
    const response = await utils.sendRequest({
      url: '/employees',
      token: adminToken,
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.length).toBe(5);
    expect(body[0].username).toMatch(/employee/);
    expect(body[body.length - 1].username).toMatch(/employee/);
  })

  it('Get employees as Employee', async () => {
    const response = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.length).toBe(4);
    const employeeUserData = body.find((item) => item.username === employeeUser.username );
    expect(employeeUserData).toBeFalsy();
  })

  it('Get employees with no ID', async () => {

    const response = await utils.sendRequest({
      url: '/employees',
      token: adminToken,
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body[0].password).toBeFalsy();
    expect(body[0].salt).toBeFalsy();
    expect(body[body.length - 1].password).toBeFalsy();
    expect(body[body.length - 1].salt).toBeFalsy();

  })

  it('Create employee', async () => {

    const response = await utils.sendRequest({
      method: 'post',
      url: '/employees',
      token: adminToken,
      data: {
        firstName: 'Juan',
        lastName: 'Lima',
        username: 'juannew',
        password: '12345678',
      }
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body).toMatchObject({
      firstName: 'Juan',
      lastName: 'Lima',
      username: 'juannew',
    });
    expect(body.password).toBeFalsy();
    expect(body.salt).toBeFalsy();
  })

  it('Create employee and validate role', async () => {

    const response = await utils.sendRequest({
      method: 'post',
      url: '/employees',
      token: adminToken,
      data: {
        firstName: 'Juan',
        lastName: 'Lima',
        username: 'juannew',
        password: '12345678',
      }
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.role).toBe('employee');
  })

  it('Get available employees by area', async () => {

    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    });

    const selectedArea1 = areas[0];

    const { body: employees1 } = await utils.sendRequest({
      url: `/employees/areas/${selectedArea1._id}`,
      token: employeeToken,
    });

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea1._id,
        employeeId: employees1[0]._id,
        comment: 'a comment'
      }
    })

    const { body: employees2, status } = await utils.sendRequest({
      url: `/employees/areas/${selectedArea1._id}`,
      token: employeeToken,
    });

    const employeeExists = employees2.find(item => item._id === employees1[0]._id);

    expect(status).toBe(200);
    expect(employees1.length).toBe(4);
    expect(employeeExists).toBeFalsy();
    expect(employees2.length).toBe(3);
  });

});
