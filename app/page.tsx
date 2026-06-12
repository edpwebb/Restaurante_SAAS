import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Registro from './components/Registro';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Menu />
        <Registro />
      </main>
      <Footer />
    </>
  );
}