import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/navbar/Navbar";
import Header from "./components/header/Header";
import Featured from "./components/featured/Featured";
function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      <Header></Header>
      <div className="homeContainer">
        <Featured></Featured>
      </div>
    </div>
  );
}

export default App;
