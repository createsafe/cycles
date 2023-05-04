let express = require('express');
var app = express();
var http = require('http').createServer(app);

const { Notion } = require("@neurosity/notion");

require('dotenv').config();


const deviceId_1 = process.env.deviceId_1 || ""
const deviceId_2 = process.env.deviceId_2 || ""
const email = process.env.email || ""
const password = process.env.password || ""

const fs = require('fs')


const verifyEnvs = (email, password, deviceId_1, deviceId_2) => {
  const invalidEnv = (env) => {
    return env === "" || env === 0;
  };
  if (
    invalidEnv(email) ||
    invalidEnv(password) ||
    invalidEnv(deviceId_1) ||
    invalidEnv(deviceId_2)
  ) {
    console.error(
      "Please verify deviceId, email and password are in .env file, quitting..."
    );
    process.exit(0);
  }
};
verifyEnvs(email, password, deviceId_1, deviceId_2);

console.log(`${email} attempting to authenticate to ${deviceId_1}`);
console.log(`${email} attempting to authenticate to ${deviceId_2}`);

const mind_1 = new Notion({
  deviceId_1
});

const mind_2 = new Notion({
  deviceId_2
});

const mind_1_login = async () => {
  await mind_1
    .login({
      email,
      password
    })
    .catch((error) => {
      console.log(error);
      throw new Error(error);
    });
  console.log("Mind 1 logged in");
};

mind_1_login();

const mind_2_login = async () => {
  await mind_2
    .login({
      email,
      password
    })
    .catch((error) => {
      console.log(error);
      throw new Error(error);
    });
  console.log("Mind 2 logged in");
};

mind_2_login();

const WebSocket = require('ws');
const wss_1 = new WebSocket.Server({ port: 8080 });

wss_1.on('connection', function connection(ws) {
  console.log('WebSocket connected');

  // Send a message to the client
  ws.send('Hello from server!');

  // mind_1.brainwaves("raw").subscribe((brainwaves) => {
  //   ws.send(JSON.stringify(brainwaves));
  //   console.log(brainwaves);
  // });

  mind_1.focus().subscribe((focus) =>{
    ws.send(JSON.stringify(focus));
    console.log(focus);
  })


  // Handle incoming messages from the client
  ws.on('message', function incoming(message) {
    console.log('Received message:', message);
  });
});



const wss_2 = new WebSocket.Server({ port: 8081 });

wss_2.on('connection', function connection(ws) {
  console.log('WebSocket connected');

  // Send a message to the client
  ws.send('Hello from server!');

  // mind_2.brainwaves("raw").subscribe((brainwaves) => {
  //   ws.send(JSON.stringify(brainwaves));
  //   console.log(brainwaves);
  // });

  mind_2.focus().subscribe((focus) =>{
    ws.send(JSON.stringify(focus));
    console.log(focus);
  })

  // Handle incoming messages from the client
  ws.on('message', function incoming(message) {
    console.log('Received message:', message);
  });
});





app.use(express.static('src'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

http.listen(process.env.PORT||3000 , () => {
  console.log('listening on *:3000');
});
