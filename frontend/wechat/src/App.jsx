import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Page from "./pages/Page";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/page" element={<Page />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
