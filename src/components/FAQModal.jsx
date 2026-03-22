import { useState } from 'react';
import Modal from './Modal';
import Card from './Card';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import '../styles/FAQModal.scss';

const FAQ_ITEMS = [
  {
    question: 'Do you have a gift registry?',
    answer: 'We do not have a registry. We mean it when we say that your presence at our wedding is the greatest gift we could ask for, and we can’t wait to celebrate with you! If you did want to gift us something, we are asking for cash gifts to go towards our honeymoon and future adventures!'
  },
  {
    question: 'What is the dress code?',
    answer: 'Formal, but colorful and beach-friendly! The ceremony will be outdoors on the beach (weather permitting) so prioritize your comfort. We will move inside after the ceremony, but you can still enjoy the beach and the balconies to your liking throughout.'
  },
  {
    question: 'What time should I arrive?',
    answer: 'The ceremony begins at 5:30 PM. Doors will open at 5:00 PM, and we recommend arriving early to find parking and get settled before the ceremony starts.'
  },
  {
    question: 'What time does the bus leave the hotel for the venue?',
    answer: 'The bus boards at the Sonesta Select Hotel at 4:15 PM, and will leave at 4:30 PM.'
  },
  {
    question: 'What time does the bus leave the venue to the hotel?',
    answer: 'The bus boards at 11:00 PM, and will leave at 11:15 PM to drop off guests at the Sonesta Select Hotel.'
  },
  {
    question: 'Are children invited?',
    answer: 'Children are welcome.'
  },
  {
    question: 'Will dinner be served?',
    answer: 'Absolutely! Dinner will be served at around 7:00 PM, followed by dessert and dancing.'
  },
  {
    question: 'What is the parking situation?',
    answer: 'There is free parking available at the venue, though it may be limited.'
  },
];

function FAQItem({ question, answer, isExpanded, onToggle }) {
  return (
    <li className="faq-item">
      <button
        className="faq-item__header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__toggle">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && <div className="faq-item__answer">{answer}</div>}
    </li>
  );
}

export default function FAQModal({ isOpen, onClose, onCloseStart, closeDelay }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} onCloseStart={onCloseStart} closeDelay={closeDelay}>
      <Card className="faq-card">
        <CardHeader>
          <h2>Frequently Asked Questions</h2>
        </CardHeader>
        <CardBody>
          <ul className="faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isExpanded={expandedIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </ul>
        </CardBody>
      </Card>
    </Modal>
  );
}
