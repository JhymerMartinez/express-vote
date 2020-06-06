const config = require('../../src/config');

module.exports = {
  users: [
    {
      firstName: 'Admin',
      lastName: 'Admin',
      username: 'admin',
      password: '12345678',
      role: config.roles.ADMIN
    },
    {
      firstName: 'Employee 1',
      lastName: 'Employee 1',
      username: 'employee1',
      password: 'abcdefg',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Employee 2',
      lastName: 'Employee 2',
      username: 'employee2',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Employee 3',
      lastName: 'Employee 3',
      username: 'employee3',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Employee 4',
      lastName: 'Employee 4',
      username: 'employee4',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Employee 5',
      lastName: 'Employee 5',
      username: 'employee5',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    }
  ],
  areas: [
    {
      name: 'Team player'
    },
    {
      name: 'Technical referent'
    },
    {
      name: 'Key Player'
    },
    {
      name: 'Client satisfaction'
    },
    {
      name: 'Motivation'
    }
  ]
}
