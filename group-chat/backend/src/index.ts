import { WebSocketServer, WebSocket, type RawData } from "ws";

const wss = new WebSocketServer({ port: 8080 });

type User = {
    socket: WebSocket,
    room: string,
}

let allSockets: User[] = []

wss.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("message", (message: RawData) => {
        const msg = message.toString();
        const parsedMsg = JSON.parse(msg);

        if(parsedMsg.type == "join"){
            allSockets.push({
                socket: socket,
                room: parsedMsg.payload.roomId
            })
        };

        if(parsedMsg.type === "chat"){
            const currentUserRoom = allSockets.find(u => u.socket === socket)?.room;
            if (!currentUserRoom) {
              console.log("User not exist");
              return;
            };

            allSockets
                .filter((u) => u.room === currentUserRoom)
                .forEach(u => u.socket.send(JSON.stringify({
                    type: "chat",
                    payload: {
                        message: parsedMsg.payload.message,
                        timestamp: parsedMsg.payload.timestamp
                    }
                })))
        }
    });

    socket.on("close", () => {
        allSockets.filter(u => u.socket !== socket);
        console.log("User left the room");
    })
})