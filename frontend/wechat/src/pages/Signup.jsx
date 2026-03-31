import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/signup", form);
      alert(res.data.message);
      navigate("/page");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <br />
        <br />

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

        <button type="submit">Signup</button>
      </form>
      <button onClick={() => navigate("/login")}>login</button>
    </div>
  );
}

export default Signup;
