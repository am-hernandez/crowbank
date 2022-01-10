import Nav from "./components/Nav";
import Home from "./components/Home";
import Footer from "./components/Footer";
import bird from "./img/birdWL.png";

function App() {
  return (
    <div className="App">
      <header>
        <h1>
          Crow Bank {""}
          <img src={bird} alt="small bird" />
        </h1>
        <Nav />
      </header>

      <Home />

      <Footer />
    </div>
  );
}

export default App;
