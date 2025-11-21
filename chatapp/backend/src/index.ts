import WebSocket, { WebSocketServer, type RawData } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const users: Record<string, WebSocket> = {};

wss.on("connection", (socket) => {
    console.log("Socket Connected");

    socket.on("message", (message: RawData) => {
        const msg = message.toString();
        const parsedMsg = JSON.parse(msg);

        if(parsedMsg.type === "register"){
            users[parsedMsg.userId] = socket;
        }

        if(parsedMsg.type === "chat"){
            const sender = users[parsedMsg.from];
            const reciever = users[parsedMsg.to];

            if(!sender || !reciever){
                console.log("Chat Failed: missing user");
                return;
            }

            const response = JSON.stringify({
                type: "chat",
                payload: {
                    to: parsedMsg.to,
                    from: parsedMsg.from,
                    message: parsedMsg.message,
                    timestamp: parsedMsg.timestamp
                }
            });

            reciever.send(response);
            sender.send(response);
        }
    });
    
    socket.on("close", () => {
        for(const id in users){
            if(users[id] === socket){
                delete users[id];
                console.log("User disconnected", id);
            }
        }
    })
})