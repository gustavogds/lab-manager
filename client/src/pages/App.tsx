import { Route, Routes } from "react-router";

import "./App.scss";
import Navbar from "../components/Navbar/Navbar";
import { Overlays } from "../components/my-own-modal-handler";
import Home from "../pages/Home/Home";

const App = () => {
  return (
    <div className="app">
      <Overlays />
      <Navbar />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
