import React, { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";
import Container from "Components/Container/Container";

import background from "assests/bghomd.png";

const FrequentlyAskedQuestions = ({ title, subtitle, items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);


  if (!items || items.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <img src={background} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <Container>
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-20">
          {/* Left — Title */}
          <div className="lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
            {title && (
              <h2 className="text-white text-3xl lg:text-5xl font-bold leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-400 mt-4 text-base lg:text-lg leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="hidden lg:block w-16 h-1 bg-primary rounded-full mt-6" />
          </div>

          {/* Right — Accordion */}
          <div className="lg:w-3/5 flex flex-col">
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={item._id || index}
                  className="border-b border-white/10"
                >
                  <button
                    onClick={() => setActiveIndex(isActive ? null : index)}
                    className="w-full flex items-center justify-between py-5 lg:py-6 text-left gap-4"
                  >
                    <span className={`text-base lg:text-lg font-medium transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-white"
                    }`}>
                      {item.question}
                    </span>
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? "bg-primary text-white rotate-0" : "bg-white/10 text-white"
                    }`}>
                      {isActive ? <Minus size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                    </span>
                  </button>

                  <div className={`grid transition-all duration-300 ease-in-out ${
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <p className="text-gray-400 text-sm lg:text-base leading-relaxed pb-6">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FrequentlyAskedQuestions;
