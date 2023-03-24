const io = require("socket.io")(5000);
const fs = require("fs");

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    socket.broadcast.emit("message", message);

    // Append message to chat log file
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} - ${message}\n`;
    fs.appendFile("chatlog.txt", logLine, (err) => {
      if (err) throw err;
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
