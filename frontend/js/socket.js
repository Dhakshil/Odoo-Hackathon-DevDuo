const socket = window.io ? window.io(APP_CONFIG.socketUrl) : null;

if (socket) {
  socket.on("connect", () => {
    console.log("Socket connected", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket unavailable", error.message);
  });
}

window.socket = socket;
