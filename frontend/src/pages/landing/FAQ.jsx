import React, { useState } from "react";

const faqs = [
  {
    q: "Is it free to use?",
    a: "Yes, Campus Connect is completely free for students.",
  },
  {
    q: "How do I join my college?",
    a: "Just sign up using your verified college email ID.",
  },
  {
    q: "Can I register for events?",
    a: "Yes, you can register and participate in campus events directly.",
  },
  {
    q: "Is my personal data safe?",
    a: "We encrypt all personal data and ensure maximum security.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Frequently Asked <span className="text-indigo-600">Questions</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 cursor-pointer hover:shadow"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{faq.q}</h3>
                <span>{openIndex === i ? "−" : "+"}</span>
              </div>
              {openIndex === i && (
                <p className="mt-2 text-gray-600">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
