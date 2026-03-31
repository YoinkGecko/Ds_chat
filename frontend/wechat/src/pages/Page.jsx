import { useEffect, useState } from "react";
import axios from "axios";

function Page() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // fetch users (via LB → best server)
  useEffect(() => {
    async function fetchUsers() {
      try {
        // step 1: get best server
        const lbRes = await axios.get("http://localhost:4000/bs");
        const server = lbRes.data.bestServer;

        // step 2: call that server
        const res = await axios.get(`${server}/users`);

        setUsers(res.data);
      } catch (err) {
        alert(err);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <h3>Users</h3>

        {users.map((user, index) => (
          <div
            key={index}
            onClick={() => setSelectedUser(user.username)}
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              background: selectedUser === user.username ? "#e6f7ff" : "white",
            }}
          >
            <div>
              <b>{user.username}</b>
            </div>
            <div style={{ fontSize: "12px", color: "gray" }}>{user.phone}</div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "70%", padding: "10px" }}>
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser}</h3>
            {/* chat UI comes later */}
          </>
        ) : (
          <h3>Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
}

export default Page;
