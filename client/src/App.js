import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/navbar/Navbar";
import Header from "./components/header/Header";
import Featured from "./components/featured/Featured";
import PropertyList from "./components/propertyList/PropertyList";
import MailList from "./components/mailList/MailList";
import FeaturedProperties from "./components/featuredProperties/featuredProperties";
import Footer from "./components/footer/Footer";
function App() {
  return (
    <div>
      <Navbar />
      <Header />
      <div className="homeContainer">
        <Featured />
        <h1 className="homeTitle">Browse by property type</h1>
        <PropertyList />
        <h1 className="homeTitle">Homes guests love</h1>
        <FeaturedProperties />
        {/* <MailList /> */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
