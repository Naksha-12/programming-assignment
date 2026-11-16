
import { useState } from "react";

function App() {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Please wait...");

    try {
      const response = await fetch(
        "http://localhost:5000/api/" + mode,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name, email, password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (mode === "register") {
        setMessage("Registration successful! Please login.");
        setMode("login");
        setPassword("");
      } else {
        setUser(email);
        setMessage("Login successful!");
      }

    } catch (error) {
      setMessage(error.message || "Server connection failed.");
    }
  }

  if (user) {
    return (
      <div className="container">
        <h1>Welcome!</h1>
        <p>You are successfully logged in.</p>
        <p>{user}</p>
        <button onClick={() => setUser("")}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Login & Registration</h1>

      <div className="tabs">
        <button onClick={() => {
          setMode("register");
          setMessage("");
        }}>
          Register
        </button>

        <button onClick={() => {
          setMode("login");
          setMessage("");
        }}>
          Login
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength="8"
          required
        />

        <button type="submit">
          {mode === "register" ? "Create Account" : "Login"}
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;
