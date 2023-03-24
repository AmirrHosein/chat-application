const readline = require("readline");
const io = require("socket.io-client");
const http = require("http");
const satelize = require("satelize");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);

http
  .get("http://api.ipify.org", (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`Public IP Address: ${data}`);

      satelize.satelize({ ip: data }, (err, payload) => {
        // console.log(payload);
        if (err) {
          console.error(`Error: ${err.message}`);
        } else {
          const { latitude, longitude } = payload;
          geocoder.reverse(
            { lat: latitude, lon: longitude },
            function (err, res) {
              if (err) {
                console.error(`Error: ${err.message}`);
              } else {
                // console.log(`Location: ${res[0].formattedAddress}`);
                // console.log(
                //   `Neighbors: ${res[0].streetName}, ${res[0].city}, ${res[0].state}, ${res[0].country}`
                // );
                startChat(payload.timezone);
              }
            }
          );
        }
      });
    });
  })
  .on("error", (err) => {
    console.error(`Error: ${err.message}`);
  });

function startChat(timezone) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const socket = io("http://localhost:5000");

  socket.on("connect", () => {
    console.log("Connected to server");

    rl.question("Enter your username: ", (username) => {
      console.log(`Welcome ${username}!`);

      rl.on("line", (input) => {
        //"America/Mazatlan"
        const message = `${username}: ${input}  ${getTimeString(timezone)}`;
        socket.emit("message", message);
      });
    });
  });

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
}

function getTimeString(timezone) {
  const now = new Date();
  const targetTime = new Date(
    Date.parse(now.toLocaleString("en-US", { timeZone: timezone }))
  );
  return targetTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
