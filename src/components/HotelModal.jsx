import { useState, useEffect } from 'react';
import Modal from './Modal';
import '../styles/HotelModal.scss';

export default function HotelModal({ isOpen, onClose, onCloseStart, closeDelay }) {
  const [showPSA, setShowPSA] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowPSA(true);
    }
  }, [isOpen]);

  const closePSA = () => {
    setShowPSA(false);
  };

  return (
    <>
      {showPSA && (
        <div className="psa-modal-overlay">
          <div className="psa-modal">
            <button className="psa-modal__close" onClick={closePSA} aria-label="Close">
              ✕
            </button>
            <div className="psa-modal__content">
              <h2 className="psa-modal__title">Hotel PSA</h2>
              <p className="psa-modal__body">
                Hello friends and family! Our hotel's room block got a bit screwy, long story, so if you want to book a room at the hotel with a block (Sonesta Select, Tinton Falls) just reach out to myself, or any member of my immediate family like my mom or pops. We reserved a block of rooms to make sure there would be availability because there is a festival (Sea.Hear.Now) causing some mayhem with hotels! So we can transfer a King ($159/night) or Double Queen ($189/night) for you, just let us know.
              </p>
              <button className="psa-modal__okay-btn" onClick={closePSA}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
      
    <Modal isOpen={isOpen} onClose={onClose} onCloseStart={onCloseStart} closeDelay={closeDelay} className="modal--hotels">
      <div className="hotel-cards">
        <a href="https://www.sonesta.com/sonesta-select/nj/tinton-falls/sonesta-select-tinton-falls-eatontown?isGroupCode=true&groupCode=091926ENGI_1&checkin=2026-09-19&checkout=2026-09-21" target="_blank" rel="noopener noreferrer" className="hotel-card hotel-card--featured" style={{ '--i': 0 }}>
          <div className="hotel-card__image">
            <img src="https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/140553/photos/72026613_XL.jpg?tr=w-1200%2Cfo-auto" alt="Sonesta Select Tinton Falls" />
          </div>
          <div className="hotel-card__content">
            <h3>Sonesta Select</h3>
            <p className="hotel-card__address">600 Hope Rd, Tinton Falls, NJ 07724</p>
            <p className="hotel-card__drive-time">Room Block Code: <strong style={{ fontFamily: 'courier new', letterSpacing: '0.1em' }}>091926ENGI_1</strong></p>
            <p className="hotel-card__drive-time">🚗 25 min drive</p>

            <div className="hotel-card__pills">
              <span className="pill">Room Block</span>
              <span className="pill">Venue Bus Transportation</span>
            </div>
            <div className="hotel-card__book-btn">Book</div>
          </div>
        </a>

        <a href="https://www.waveresort.com/" target="_blank" rel="noopener noreferrer" className="hotel-card" style={{ '--i': 1 }}>
          <div className="hotel-card__image">
            <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/2f/4f/dc/wave-resort.jpg?w=900&h=500&s=1" alt="Wave Resort" />
          </div>
          <div className="hotel-card__content">
            <h3>Wave Resort</h3>
            <p className="hotel-card__address">110 Ocean Ave, Long Branch, NJ 07740</p>
            <p className="hotel-card__drive-time">🚗 10 min drive</p>
            <div className="hotel-card__book-btn">Book</div>
          </div>
        </a>

        <a href="https://www.theoysterpointhotel.com/" target="_blank" rel="noopener noreferrer" className="hotel-card" style={{ '--i': 2 }}>
          <div className="hotel-card__image">
            <img src="https://images.trvl-media.com/lodging/1000000/50000/41800/41752/25576089.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" alt="The Oyster Point Hotel" />
          </div>
          <div className="hotel-card__content">
            <h3>The Oyster Point Hotel</h3>
            <p className="hotel-card__address">146 Bodman Pl, Red Bank, NJ 07701</p>
            <p className="hotel-card__drive-time">🚗 20 min drive</p>
            <div className="hotel-card__book-btn">Book</div>
          </div>
        </a>

        <a href="http://themollypitcher.com/" target="_blank" rel="noopener noreferrer" className="hotel-card" style={{ '--i': 3 }}>
          <div className="hotel-card__image">
            <img src="https://images.trvl-media.com/lodging/1000000/10000/2000/1975/ca460c9b.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" alt="The Molly Pitcher Inn" />
          </div>
          <div className="hotel-card__content">
            <h3>The Molly Pitcher Inn</h3>
            <p className="hotel-card__address">88 Riverside Ave, Red Bank, NJ 07701</p>
            <p className="hotel-card__drive-time">🚗 20 min drive</p>
            <div className="hotel-card__book-btn">Book</div>
          </div>
        </a>

        <a href="https://www.beachwalkseabright.com/" target="_blank" rel="noopener noreferrer" className="hotel-card" style={{ '--i': 4 }}>
          <div className="hotel-card__image">
            <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/8e/6a/b2/hotel-exterior.jpg?w=900&h=500&s=1" alt="Beachwalk at Sea Bright" />
          </div>
          <div className="hotel-card__content">
            <h3>Beachwalk at Sea Bright</h3>
            <p className="hotel-card__address">344 Ocean Ave, Sea Bright, NJ 07760</p>
            <p className="hotel-card__drive-time">🚗 5 min drive</p>
            <div className="hotel-card__book-btn">Book</div>
          </div>
        </a>
      </div>
    </Modal>
    </>
  );
}
