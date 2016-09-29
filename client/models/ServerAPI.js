import io from 'socket.io-client';

const ServerAPI = {
  socket: null,
};

ServerAPI.connect = () => {
  // console.log("socket connecting");
  ServerAPI.socket = io('http://localhost:' + process.env.PORT);
};

ServerAPI.disconnect = () => {
  ServerAPI.socket.disconnect();
};

ServerAPI.onUpdate = (callback) => {
  ServerAPI.socket.on('room', (data) => {
    // console.log('Room event', data);
    callback(data);
  });
};

ServerAPI.joinRoom = (roomId) => {
  // console.log('client join room', roomId);
  ServerAPI.socket.emit('join', { roomId });
};

ServerAPI.login = (user) => {
  // console.log('Server API login', user);
  ServerAPI.socket.emit('login', { id: user.id, username: user.username, avatar_url: user.avatar_url });
};

ServerAPI.onLogin = (callback) => {
  // console.log('client join room', roomId);
  ServerAPI.socket.on('login', (data) => {
    callback(data);
  });
};

ServerAPI.enqueue = () => {
  // console.log('Server API enqueueDJ', user);
  ServerAPI.socket.emit('enqueue');
};

ServerAPI.dequeue = () => {
  // console.log('Server API dequeueDJ', user);
  ServerAPI.socket.emit('dequeue');
};

 // send currentDJ and current song to Voting model
ServerAPI.upvote = (currentDJ, track) => {
  console.log('Server API upvote => currentDJ = ', currentDJ, ' track =', track);
  ServerAPI.socket.emit('upvote', { currentDJ, track });
};

ServerAPI.downvote = (songId) => {
  ServerAPI.socket.emit('downvote', { songId });
};

// tracks => [{ songId: ele.songId, duration: ele.duration }, etc...]
ServerAPI.updatePlaylist = (tracks) => {
  ServerAPI.socket.emit('playlist', tracks);
};

ServerAPI.onPlaylistUpdate = (callback) => {
  ServerAPI.socket.on('playlist', (tracks) => {
    // tracks => [{ songId: ele.songId, duration: ele.duration }, etc...]
    callback(tracks);
  });
};

module.exports = ServerAPI;
