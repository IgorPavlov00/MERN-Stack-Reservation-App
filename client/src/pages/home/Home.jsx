import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Featured from "../../components/featured/Featured";
import PropertyList from "../../components/propertyList/PropertyList";
import FeaturedProperties from "../../components/featuredProperties/featuredProperties";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";

const Section = ({ title, subtitle, children }) => (
  <section className="container section">
    <div className="sectionHead">
      <h2 className="sectionTitle">{title}</h2>
      {subtitle && <p className="sectionSubtitle">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Home = () => {
  return (
    <div className="page">
      <Navbar />
      <main>
        <Header />
        <Section title="Trending destinations" subtitle="Most popular choices for travellers right now">
          <Featured />
        </Section>
        <Section title="Browse by property type">
          <PropertyList />
        </Section>
        <Section title="Homes guests love" subtitle="Hand-picked stays with top guest ratings">
          <FeaturedProperties />
        </Section>
        <MailList />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
