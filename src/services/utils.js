
const utils = {
  groupVotesByEmployeeId(votes) {
    return utils.groupBy('employee', votes);
  },

  groupVotesByAreaId(votes) {
    return utils.groupBy('area', votes);
  },

  groupBy(field = 'employee', votes) {
    const group = {}

    votes.forEach((vote) => {
      if (vote[field].id in group) {
        group[vote[field].id].votesCount++;
      } else {
        group[vote[field].id] = {
          employee: vote.employee,
          votesCount: 1
        }
      }
    });

    return group;
  }
}

module.exports = utils;
