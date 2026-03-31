import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/login", form);
      alert(res.data.message);
      navigate("/page");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <br />
        <br />

        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/signup")}>Signup</button>
    </div>
  );
}

export default Login;
