import { useEffect, useRef, useState } from "react";

const App = () => {
  const [text, setText] = useState("");
  const [joined, setJoined] = useState("");
  const [messages, setMessages] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [nameInput, setNameInput] = useState("");
  const wssRef = useRef<WebSocket>(null);

  const handleJoin = () => {
    if(!nameInput) return;
    setJoined(nameInput);
  }

  const sendMessage = () => {
    if(!text || !joined) return;

    if(wssRef.current?.readyState !== WebSocket.OPEN){
      console.log("Ws not in ready State");
      return;
    };

    wssRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: text,
          timestamp: Date.now(),
        },
      })
    );

    setText("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    if(!joined) return;

    const wss = new WebSocket("ws://localhost:8080");

    wss.onopen = () => {
      wss.send(JSON.stringify({
        type: "join",
        payload: {
          socket: wss,
          roomId: joined
        }
      }))
    };

    wss.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("msg is here",msg)
      setMessages((prev) => [...prev, msg.payload]);
    };

    wssRef.current = wss;

    return () => wss.close();

  }, [joined])

  if (!joined) {
    return (
      <div className="p-10">
        <h2>Enter Room</h2>

        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          type="text"
          className="border p-2"
        />

        <button
          onClick={handleJoin}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Join
        </button>
      </div>
    );
  }

  
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, id) => (
          <div key={id} className="bg-gray-800 p-2 rounded">
            {msg.message}

            <div className="text-xs text-gray-400">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-[65%] border rounded p-2 bg-gray-900 text-white"
          placeholder="Enter your message"
          type="text"
        />

        <button
          onClick={sendMessage}
          className="w-[15%] p-2 bg-blue-600 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App