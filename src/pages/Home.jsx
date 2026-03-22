import OceanScene from '../components/OceanScene';
import Slider from '../components/Slider';

import '../styles/Home.scss';
import '../styles/Ocean.scss';

function Home({ isModalOpen, onOpenModal }) {
  return (
    <section className="home">
      <OceanScene isModalOpen={isModalOpen} onOpenModal={onOpenModal} />
    </section>
  );
}

export default Home;
