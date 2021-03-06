const Playlist = require('./Playlist');

// DjQueue are indexed by roomId
const DjQueue = {};
let queues = {};
let queueIdsByRoom = {};
let nextId = 0;

DjQueue.create = function create(roomId, maxDjs = 4) {
  const queue = {
    roomId,
    id: nextId,
    active: Array(maxDjs).fill(null),
    waiting: [],
    maxDjs,
    currentDj: -1,
    currentTrack: null,
  };
  nextId += 1;
  queues[queue.id] = queue;
  queueIdsByRoom[roomId] = queue.id;
  return DjQueue.get(queue.id);
};

DjQueue.clearAll = function clearAll() {
  queues = {};
  queueIdsByRoom = {};
};

/* Return immutable DjQueue representation or null if there is none */
DjQueue.get = function get(id) {
  const q = queues[id];
  // Copy objects and Array's to make result immutable
  return id in queues
    ? Object.assign({}, q, { active: q.active.slice(), waiting: q.waiting.slice() })
    : null;
};

DjQueue.getByRoom = function getByRoom(roomId) {
  return roomId in queueIdsByRoom ? DjQueue.get(queueIdsByRoom[roomId]) : null;
};

DjQueue.enqueue = function enqueue(id, userId) {
  const queue = queues[id];
  if (queue.active.includes(userId) || queue.waiting.includes(userId)) {
    return;
  }
  const idx = queue.active.indexOf(null);
  if (idx === -1) {
    queue.waiting.push(userId);
  } else {
    // We have an open slot
    queue.active[idx] = userId;
  }
};

/* Return the id of next DJ in line, or null if there are no DJs */
DjQueue.next = function next(id) {
  const queue = queues[id];
  let idx = (queue.currentDj + 1) % queue.active.length;
  const start = idx;
  while (queue.active[idx] === null) {
    idx = (idx + 1) % queue.active.length;
    if (idx === start) {
      // No Djs :( reset currentDj to -1
      queue.currentDj = -1;
      return null;
    }
  }
  queue.currentDj = idx;
  const dj = queue.active[queue.currentDj];
  // return dj !== undefined ? dj : null;
  return dj;
};

/* Retrieve the next track for track change events in a room or return null if none are ready */
DjQueue.nextTrack = function nextTrack(id) {
  // Get the next DJ
  const dj = DjQueue.next(id);
  // If we have no DJ's return null
  if (dj === null) {
    queues[id].currentTrack = null;
    return Promise.resolve(queues[id].currentTrack);
  }
  // Grab DJ's playlist
  return Playlist.get(dj).then((data) => {
    // if playlist is empty
    if (!data || data.length === 0) {
      // remove the DJ from queue
      DjQueue.removeUser(id, dj);
      // Set currentDj index back by one in order to keep current position
      queues[id].currentDj = Math.max(0, queues[id].currentDj - 1);
      // Try again!
      return DjQueue.nextTrack(id).then((newData) => {
        queues[id].currentTrack = newData;
        return newData;
      });
    }
    // Return startTime of track
    queues[id].currentTrack = Object.assign({ startTime: Date.now() }, data[0]);
    return Playlist.rotate(dj).then(() => {
      return queues[id].currentTrack;
    });
  });
};

DjQueue.clearTrack = function skipTrackfunction(id) {
  const queue = queues[id];
  queue.currentTrack = null;
};

DjQueue.removeUser = function removeUser(id, userId) {
  const queue = queues[id];
  if (!queue) {
    return;
  }
  const idx = queue.active.indexOf(userId);
  // Check if users is a DJ
  if (idx !== -1) {
    // remove user from DJ spot
    queue.active[idx] = null;
    // set current track to null if this removed user was current dj
    if (idx === queue.currentDj) {
      queue.currentTrack = null;
    }
    // move next waiting user to newly opened slot
    if (queue.waiting.length > 0) {
      queue.active[idx] = queue.waiting.shift();
    }
    return; // We can exit as user was an active DJ and thus isn't waiting
  }
  // User was not a DJ, remove them from waiting instead
  queue.waiting = queue.waiting.filter(uid => uid !== userId);
};

module.exports = DjQueue;
