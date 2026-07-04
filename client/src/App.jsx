import { useState } from "react";
import Home from "./components/Home.jsx";
import Chat from "./components/Chat.jsx";
import Debrief from "./components/Debrief.jsx";

/**
 * Three-screen state machine: home -> chat -> debrief -> home.
 */
export default function App() {
  const [view, setView] = useState({ name: "home" });

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setView({ name: "home" })}>
          <span className="brand-mark">🛡</span> FoolProof
        </div>
        <div className="topbar-tag">Get fooled here, so you don't get fooled out there.</div>
      </header>

      {view.name === "home" && (
        <Home
          onStart={(session) => setView({ name: "chat", session })}
        />
      )}
      {view.name === "chat" && (
        <Chat
          session={view.session}
          onFinished={(result) => setView({ name: "debrief", result, session: view.session })}
          onQuit={() => setView({ name: "home" })}
        />
      )}
      {view.name === "debrief" && (
        <Debrief
          result={view.result}
          scenario={view.session.scenario}
          onHome={() => setView({ name: "home" })}
        />
      )}
    </div>
  );
}
