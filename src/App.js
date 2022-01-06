import Nav from "./components/Nav";
import Home from "./components/Home";
import Footer from "./components/Footer";
function App() {
  return (
    <div className="App">
      <header>
        <h1>Crow Bank</h1>
        <Nav />
      </header>

      <Home />

      <Footer />
    </div>
  );
}

export default App;
