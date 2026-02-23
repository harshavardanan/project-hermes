import React, { useState } from "react";
import { useChat } from "./ChatProvider";

export default function ChatUI() {
  const {
    activeChatId,
    setActiveChat,
    messages,
    sendMessage,
    createGroup,
    groups,
    userId,
    isTyping,
    sendTypingStatus,
  } = useChat();
  const [msgInput, setMsgInput] = useState("");
  const [groupName, setGroupName] = useState("");

  const chatMessages = messages.filter(
    (m) => m.conversationId === activeChatId
  );

  const handleSend = () => {
    sendMessage(msgInput);
    setMsgInput("");
    sendTypingStatus(false);
  };

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Sidebar */}
        <div className="col-md-3 border-end bg-white d-flex flex-column">
          <div className="p-3 bg-primary text-white">
            <h5 className="mb-0">Chat SDK</h5>
          </div>

          <div className="p-3 border-bottom bg-light">
            <div className="input-group">
              <input
                className="form-control form-control-sm"
                placeholder="New Group..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button
                className="btn btn-sm btn-dark"
                onClick={() => {
                  if (groupName) createGroup(groupName);
                  setGroupName("");
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto">
            <div className="list-group list-group-flush">
              <button
                onClick={() => setActiveChat("Global_Test")}
                className={`list-group-item list-group-item-action ${
                  activeChatId === "Global_Test" ? "active" : ""
                }`}
              >
                💬 Test DM Room
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveChat(g.id)}
                  className={`list-group-item list-group-item-action ${
                    activeChatId === g.id ? "active" : ""
                  }`}
                >
                  👥 {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-md-9 d-flex flex-column bg-white">
          {activeChatId ? (
            <>
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{activeChatId}</h6>
                {isTyping && (
                  <small className="text-success animate-pulse">
                    typing...
                  </small>
                )}
              </div>

              <div
                className="flex-grow-1 p-3 overflow-auto d-flex flex-column bg-light"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/graphy.png")',
                }}
              >
                {chatMessages.map((m) => {
                  const isMe = m.senderId === userId;
                  return (
                    <div
                      key={m.id}
                      className={`p-2 mb-2 rounded shadow-sm ${
                        isMe
                          ? "bg-primary text-white align-self-end"
                          : "bg-white align-self-start"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      {!isMe && (
                        <small className="d-block fw-bold opacity-75">
                          {m.senderId}
                        </small>
                      )}
                      <div>{m.text}</div>
                      <div
                        className="text-end"
                        style={{ fontSize: "0.6rem", opacity: 0.8 }}
                      >
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-top bg-white">
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Type a message..."
                    value={msgInput}
                    onChange={(e) => {
                      setMsgInput(e.target.value);
                      sendTypingStatus(e.target.value.length > 0);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button className="btn btn-primary px-4" onClick={handleSend}>
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="m-auto text-muted text-center">
              <h3>Select a chat to begin</h3>
              <p>Isolated Project Environment: ACTIVE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
