/**
 * Just a TCP/IP server
 * Can be used with any Client
 * for simplicity
 * connect using net cat
 */
"use strict";

const server = require('net').createServer();
let sockets = {}, counter = 0;

function timestamp() {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
}

//look for new connections
server.on('connection', (socket) => {

  //create new id for every user
  counter = counter + 1;
  socket.id = counter;
  console.log("A Client Connected.." + socket.id);
  //ask for user name
  socket.write("Please enter your name: ");
  //on data receive from any user
  socket.on('data', (data) => {
    //if new user create new socket
    if (!sockets[socket.id]) {
      socket.name = data.toString().trim();
      console.log(socket.name);
      socket.write(`Welcome ${socket.name}!\n`);
      socket.write(`You:`);

      //tell all others that the user has joined
      if (Object.keys(sockets).length > 0) {
        Object.entries(sockets).forEach(([key, cs]) => {
          if (socket.id === key) {
            return;
          }
          cs.write(`\n`);
          cs.write(`${timestamp()}: ${socket.name} has joined the chat room.\n`);
          cs.write(`You: `);
        });
      }
      sockets[socket.id] = socket;
      return;
    }
    //transport chat to all users in the room
    Object.entries(sockets).forEach(([key, cs]) => {
      if (socket.id !== parseInt(key)) {
        cs.write(`\n`);
        cs.write(`${socket.name}@${timestamp()}: `);
        cs.write(data);
        cs.write(`You: `);
        //return;
      } else {
        cs.write(`You: `);
      }
    });
  });
  //if a user disconnects, tell everyone.
  socket.on('end', () => {
    var name = socket.name;
    delete sockets[socket.id];
    Object.entries(sockets).forEach(([key, cs]) => {
      cs.write(`\n`);
      cs.write(`${timestamp()}: ${name} has left this chat room\n`);
      cs.write(`You: `);
    });
    console.log('Client disconnected');
  });
});

//listen for all the connections at PORT.
server.listen(process.argv.slice(2)[0], () => console.log('Koki server has started. Now accepting incomming connections.'));
