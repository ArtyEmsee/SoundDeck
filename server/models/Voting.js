const User = require('./User');
const DjQueue = require('./DjQueue');

const Voting = {};

let votings = {};
let votingIdsByRoom = {};
let nextId = 0;
const skipRatio = 0.4;
const mercy = 3;

Voting.create = function create(roomId) {
  const voting = {
    roomId,
    id: nextId,
    track: null,
    downvoteCount: 0,
    totalCount: 1,
    voted: {},
    downvotes: {},
  };
  nextId += 1;
  votings[voting.id] = voting;
  votingIdsByRoom[roomId] = voting.id;
  return Voting.get(voting.roomId);
};

Voting.clearAll = function clearAll() {
  votings = {};
  votingIdsByRoom = {};
  nextId = 0;
};

Voting.get = function get(id) {
  return votings[id];
};

Voting.getByRoom = function get(roomId) {
  return votings[votingIdsByRoom[roomId]];
};

Voting.upvote = function upvote(roomId, userId, currentDJ, track) {
  const voting = votings[votingIdsByRoom[roomId]];
  if (voting.track === track) {
    if (userId in voting.voted) {
      if (voting.voted[userId] === 'upvote') {
        return;
      }
      voting.downvoteCount -= 1;
    }
    User.get(currentDJ).likes = User.get(currentDJ).likes + 1;
    voting.voted[userId] = 'upvote';
  }
};

Voting.downvote = function downvote(roomId, userId, currentDJ, track) {
  const voting = votings[votingIdsByRoom[roomId]];
  if (voting.track === track) {
    if (userId in voting.voted) {
      if (voting.voted[userId] === 'downvote') {
        return;
      }
      User.get(currentDJ).likes = User.get(currentDJ).likes - 1;
    }
    voting.downvoteCount += 1;
    if (voting.downvoteCount / voting.totalCount >= skipRatio) {
      // skip track
      DjQueue.clearTrack(DjQueue.getByRoom(roomId).id);
      voting.downvotes[currentDJ] += 1;
      if (voting.downvotes[currentDJ] >= mercy) {
        // kickout the DJ
        delete voting.downvotes[currentDJ];
        DjQueue.removeUser(DjQueue.getByRoom(roomId).id, currentDJ);
      }
    }
    voting.voted[userId] = 'downvote';
  }
};

Voting.newTrack = function newTrack(roomId, track) {
  const voting = votings[votingIdsByRoom[roomId]];
  voting.track = track.songId;
  voting.downvoteCount = 0;
  voting.voted = {};
};

Voting.updateTotalUser = function updateTotalUser(roomId, totalCount) {
  const voting = votings[votingIdsByRoom[roomId]];
  voting.totalCount = totalCount;
};

Voting.DJenqueue = function DJenqueue(roomId, djList) {
  const voting = votings[votingIdsByRoom[roomId]];
  djList.forEach((dj) => {
    if (dj != null && !(dj.id in voting.downvotes)) {
      voting.downvotes[dj.id] = 0;
    }
  });
};

Voting.DJdequeue = function DJdequeue(roomId, djList) {
  const voting = votings[votingIdsByRoom[roomId]];
  const newDjIds = djList.map(dj => dj && dj.id.toString());
  const oldDjIds = Object.keys(voting.downvotes);
  oldDjIds.forEach((oldDj) => {
    if (!newDjIds.includes(oldDj)) {
      delete voting.downvotes[oldDj];
    }
  });

  newDjIds.forEach((newDj) => {
    if (newDj != null && !(newDj in voting.downvotes)) {
      voting.downvotes[newDj] = 0;
    }
  });
};
module.exports = Voting;
