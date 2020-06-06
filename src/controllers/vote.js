const createError = require('http-errors')
const moment = require('moment');
const Area = require('../models/area');
const User = require('../models/user');
const Vote = require('../models/vote');
const config = require('../config');
const utils = require('../services/utils');

module.exports = {
  async getVotesByMonth(req, res, next) {

    const defaultYear = moment().format('YYYY');
    const defaultMonth = moment().format('MM');

    const { year = defaultYear, month = defaultMonth} = req.params;

    const date = `${year}-${month}-${moment().day()}`;
    const momentDate = moment(date, 'YYYY-MM-DD');
    if (!momentDate.isValid()) {
      return next(createError(400, 'Invalid Date.'))
    }

    const startMonth = momentDate.startOf('month').format('YYYY-MM-DD');
    const endMonth = momentDate.endOf('month').format('YYYY-MM-DD');

    let votes = [];
    try {
      votes = await Vote.find({
        createdAt: {
          $gte: startMonth,
          $lte: endMonth
        },
      }).populate({
        path: 'employee',
        select: '-votes -salt'
      });
    } catch (error) {
      return next(createError(400, error));
    }

    const group = utils.groupVotesByEmployeeId(votes);
    const sortedVotedEmployees = Object.values(group).sort((a, b) => {
      return b.votesCount - a.votesCount;
    })
    const votedEmployeeIds = Object.keys(group);

    let otherEmployees = [];
    try {
      otherEmployees = await User.find({
        role: config.roles.EMPLOYEE,
        _id: {
          $nin: votedEmployeeIds
        }
      }).select('-votes -salt');
    } catch (error) {
      return next(createError(400, error));
    }

    const formatedOtherEmployees = (otherEmployees || []).map(item => {
      return {
        employee: item,
        votesCount: 0
      }
    })

    const result = [...sortedVotedEmployees, ...formatedOtherEmployees];

    res.json(result)
  },

  async addVote(req, res, next) {
    const { areaId, employeeId, comment = '' } = req.body;

    if (!areaId) {
      return next(createError(400, 'Missing areaId'))
    }

    if (!employeeId) {
      return next(createError(400, 'Missing employeeId'))
    }

    if (employeeId === req.user.id) {
      return next(createError(400, 'Voting by yourself is not allowed'))
    }

    let area = null;
    let employee = null;
    let voteExistsInThisMonth = [];

    try {
      const [areaData, employeeData] = await Promise.all([
        Area.findOne({_id: areaId}),
        User.findOne({_id: employeeId, role: config.roles.EMPLOYEE})
      ]);

      area = areaData;
      employee = employeeData;
      voteExistsInThisMonth = await Vote.findOne({
        area: area._id,
        employee: employee._id,
        elector: req.user._id,
        createdAt: {
          $gte: moment().startOf('month').format('YYYY-MM-DD'),
          $lte: moment().endOf('month').format('YYYY-MM-DD')
        }
      });
    } catch (error) {
      return next(createError(400, error));
    }

    if (voteExistsInThisMonth) {
      return next(createError(400, 'Only one vote is allowed'))
    }

    let vote = null;
    if (area && employee) {
      try {
        vote = await Vote.create({
          area: area._id,
          employee: employee._id,
          elector: req.user._id,
          comment
        });
      } catch (error) {
        return next(createError(400, error));
      }

      try {
        await User.updateOne({ _id: req.user._id },  {
          $push: {
            votes: vote.id
          }
        })
      } catch (error) {
        return next(createError(400, error));
      }
    }

    res.json({
      vote
    });
  },

  async getCurrentVotes(req, res, next) {
    let user = null;
    try {
      const startThisMonth = moment().startOf('month').format('YYYY-MM-DD');
      const endThisMonth = moment().endOf('month').format('YYYY-MM-DD');
      user = await User.findOne({
        _id: req.user._id,
      }).populate({
        path: 'votes',
        select: '-elector',
        populate: ['area', {
          path: 'employee',
          select: '-votes'
        }],
        match: {
          createdAt: {
            $gte: startThisMonth,
            $lte: endThisMonth
          }
        }
      })

    } catch (error) {
      return next(createError(400, error));
    }

    const { votes } = user || {};
    res.json(votes);
  },

  async getVotesByArea(req, res, next) {
    const { area_id: areaId } = req.params || {};

    let area = null;
    try {
      area = await Area.findOne({_id: areaId});
    } catch (error) {
      return next(createError(400, error));
    }

    let votes = [];
    try {
      votes = await Vote.find({
        area: area._id
      }).populate([{
        path: 'employee',
        select: '-votes -salt'
      }, {
        path: 'area',
        select: '_id'
      }]);

    } catch (error) {
      return next(createError(400, error));
    }

    const group = utils.groupVotesByAreaId(votes);
    const sortedVotedEmployees = Object.values(group).sort((a, b) => {
      return b.votesCount - a.votesCount;
    })
    const votedEmployeeIds = (votes || []).map(item => item.employee._id);

    let otherEmployees = [];
    try {
      otherEmployees = await User.find({
        role: config.roles.EMPLOYEE,
        _id: {
          $nin: votedEmployeeIds
        }
      }).select('-votes -salt');
    } catch (error) {
      return next(createError(400, error));
    }

    const formatedOtherEmployees = (otherEmployees || []).map(item => {
      return {
        employee: item,
        votesCount: 0
      }
    })

    const result = [...sortedVotedEmployees, ...formatedOtherEmployees];

    res.json(result)
  },

}
