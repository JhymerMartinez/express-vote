const moment = require('moment');
const utils = require('../utils');

describe('Votes', () => {

  let adminToken = '';
  let employeeToken = '';
  let employeeData = {};

  beforeEach(async () => {
    const adminUser = require('../mocks/seeds').users[0];
    const employeeUser = require('../mocks/seeds').users[1];
    const [{ body: { token: token1 } }, { body: { token: token2, user } } ]  = await Promise.all([
      utils.loginUser(adminUser.username, adminUser.password),
      utils.loginUser(employeeUser.username, employeeUser.password)
    ]);
    adminToken = token1;
    employeeToken = token2;
    employeeData = user;
  });

  it('Should vote', async () => {
    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    });
    const { body: employees } = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    });

    const selectedArea = areas[0];
    const selectedEmployee = employees[0];

    const response = await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea._id,
        employeeId: selectedEmployee._id,
        comment: 'a comment'
      }
    })
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.vote.area).toBe(selectedArea._id);
    expect(body.vote.employee).toBe(selectedEmployee._id);
  })

  it('Should prevent vote for myself', async () => {
    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    });

    const selectedArea = areas[0];
    const selectedEmployee = employeeData;

    const response = await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea._id,
        employeeId: selectedEmployee._id,
        comment: 'a comment'
      }
    })

    const { status } = response;
    expect(status).toBe(400);
  });

  it('Should prevent to vote twice the same employee with the same area', async () => {
    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    });
    const { body: employees } = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    });

    const selectedArea = areas[0];
    const selectedEmployee = employees[0];

    // request # 1
    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea._id,
        employeeId: selectedEmployee._id,
        comment: 'a comment'
      }
    })

    // request # 2
    const response = await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea._id,
        employeeId: selectedEmployee._id,
        comment: 'a new comment'
      }
    })
    const { status } = response;
    expect(status).toBe(400);
  })

  it('Should get votes for each employee', async () => {

    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employeeToken,
    });
    const { body: employees } = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    });

    const selectedArea1 = areas[0];
    const selectedArea2 = areas[1];
    const selectedEmployee1 = employees[0];
    const selectedEmployee2 = employees[1];
    const selectedEmployee3 = employees[2];

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea1._id,
        employeeId: selectedEmployee1._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea1._id,
        employeeId: selectedEmployee2._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employeeToken,
      data: {
        areaId: selectedArea2._id,
        employeeId: selectedEmployee3._id,
        comment: 'a comment'
      }
    })

    const response = await utils.sendRequest({
      url: '/votes/current',
      token: employeeToken,
    })

    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.length).toBe(3);
    expect(body[0].employee.role).toBe('employee');
    expect(body[0].area).toBeTruthy();
  })

  it('Should get ranking by month', async () => {

    // Get employees
    const { body: employees } = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    });

    // Login employees
    const employee1 = employees[0];
    const employee2 = employees[1];
    const { password: password1 } = require('../mocks/seeds').users.find(item => item.username === employee1.username);
    const { password: password2 } = require('../mocks/seeds').users.find(item => item.username === employee2.username);
    const [
      { body: { token: employee1Token, user: employee1Data } },
      { body: { token: employee2Token, user: employee2Data } }
    ] = await Promise.all([
      utils.loginUser(employee1.username, password1),
      utils.loginUser(employee2.username, password2)
    ]);

    // Get Areas
    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employee1Token,
    });

    const area1 = areas[0];
    const area2 = areas[1];

    // Vote
    const employee3 = employees[2];
    const employee4 = employees[3];

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee1Token,
      data: {
        areaId: area1._id,
        employeeId: employee3._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee1Token,
      data: {
        areaId: area2._id,
        employeeId: employee3._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee2Token,
      data: {
        areaId: area1._id,
        employeeId: employee3._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee2Token,
      data: {
        areaId: area1._id,
        employeeId: employee4._id,
        comment: 'a comment'
      }
    })

    // Get results by admin
    const currentYear = moment().format('YYYY');
    const currentMonth = moment().format('MM');

    const response = await utils.sendRequest({
      url: `/votes/date/${currentYear}/${currentMonth}`,
      token: adminToken,
    })

    const { body, status } = response;
    expect(status).toBe(200);
    expect(body.length).toBe(5);
    expect(body[0].votesCount).toBe(3);
    expect(body[1].votesCount).toBe(1);
    expect(body[2].votesCount).toBe(0);
    expect(body[3].votesCount).toBe(0);
    expect(body[4].votesCount).toBe(0);
  })

  it('Should get ranking by area', async () => {

    // Get employees
    const { body: employees } = await utils.sendRequest({
      url: '/employees',
      token: employeeToken,
    });

    // Login employees
    const employee1 = employees[0];
    const employee2 = employees[1];
    const { password: password1 } = require('../mocks/seeds').users.find(item => item.username === employee1.username);
    const { password: password2 } = require('../mocks/seeds').users.find(item => item.username === employee2.username);
    const [
      { body: { token: employee1Token, user: employee1Data } },
      { body: { token: employee2Token, user: employee2Data } }
    ] = await Promise.all([
      utils.loginUser(employee1.username, password1),
      utils.loginUser(employee2.username, password2)
    ]);

    // Get Areas
    const { body: areas } = await utils.sendRequest({
      url: '/areas',
      token: employee1Token,
    });

    const area1 = areas[0];
    const area2 = areas[1];

    // Vote
    const employee3 = employees[2];
    const employee4 = employees[3];

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee1Token,
      data: {
        areaId: area1._id,
        employeeId: employee3._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee1Token,
      data: {
        areaId: area2._id,
        employeeId: employee4._id,
        comment: 'a comment'
      }
    })

    await utils.sendRequest({
      method: 'post',
      url: '/votes',
      token: employee2Token,
      data: {
        areaId: area1._id,
        employeeId: employee3._id,
        comment: 'a comment'
      }
    })

    // Get results by admin
    const response1 = await utils.sendRequest({
      url: `/votes/areas/${area1._id}`,
      token: adminToken,
    })

    const response2 = await utils.sendRequest({
      url: `/votes/areas/${area2._id}`,
      token: adminToken,
    })

    const { body: body1, status: status1 } = response1;
    const { body: body2, status: status2 } = response2;
    expect(status1).toBe(200);
    expect(body1.length).toBe(5);
    expect(body1[0].votesCount).toBe(2);
    expect(body1[4].votesCount).toBe(0);
    expect(status2).toBe(200);
    expect(body2.length).toBe(5);
    expect(body2[0].votesCount).toBe(1);
    expect(body2[4].votesCount).toBe(0);
  })
});
