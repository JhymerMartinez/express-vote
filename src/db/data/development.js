const config = require('../../config');

module.exports = {
  users: [
    {
      firstName: 'Jhon',
      lastName: 'Doe',
      username: 'admin',
      password: '12345678',
      role: config.roles.ADMIN
    },
    {
      firstName: 'Eliot',
      lastName: 'Cowan',
      username: 'eliot',
      password: 'abcdefg',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Shanae',
      lastName: 'Calvert',
      username: 'shane',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Vanessa',
      lastName: 'Hoover',
      username: 'vanessa',
      password: 'abcd123',
      role: config.roles.EMPLOYEE
    },
    {
      firstName: 'Haya',
      lastName: 'Hunter',
      username: 'haya1',
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
