import React from "react";
import FrequentlyAskedQuestions from "./FrequentlyAskedQuestions";

const FAQExample = () => {
  // Example FAQ data
  const faqData = [
    {
      question: "What services do you provide?",
      answer:
        "We offer a comprehensive range of services including web development, mobile app development, UI/UX design, and digital marketing solutions tailored to meet your business needs.",
    },
    {
      question: "How long does a typical project take to complete?",
      answer:
        "Project timelines vary depending on complexity and scope. A basic website might take 2-4 weeks, while a complex web application could take 3-6 months. During our initial consultation, we'll provide you with a more accurate timeline for your specific project.",
    },
    {
      question: "What is your pricing structure?",
      answer:
        "We offer flexible pricing options including fixed-price quotes for well-defined projects and hourly rates for ongoing work. Each project is unique, so we create custom quotes based on your specific requirements and project scope.",
    },
    {
      question: "Do you provide ongoing support after project completion?",
      answer:
        "Yes, we offer various maintenance and support packages to ensure your digital products continue to function optimally after launch. These can include regular updates, bug fixes, content changes, and performance monitoring.",
    },
    {
      question: "How do we get started working together?",
      answer:
        "The process begins with an initial consultation where we discuss your goals and requirements. We then prepare a proposal outlining scope, timeline, and costs. Once approved, we proceed with the development process, keeping you involved at every stage.",
    },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <FrequentlyAskedQuestions
        title="Frequently Asked Questions"
        data={faqData}
      />
    </div>
  );
};

export default FAQExample;
