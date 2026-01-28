import React, { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import Container from "Components/Container/Container";

/**
 * FrequentlyAskedQuestions Component
 * A reusable component to display FAQ sections
 *
 * @param {Object} props
 * @param {string} props.title - The title of the FAQ section
 * @param {Array} props.data - Array of FAQ items with question and answer properties
 * @returns {JSX.Element}
 */
const FrequentlyAskedQuestions = ({ title, data = [] }) => {
  const [activeItem, setActiveItem] = useState(null);

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const itemKey = `${categoryIndex}-${questionIndex}`;
    setActiveItem(activeItem === itemKey ? null : itemKey);
  };

  console.log(data);

  return (
    <div className="py-secondary">
      {title && <h2 className="text-center mb-8">{title}</h2>}
      <Container>
        <div className="w-full xl:w-1/2 mx-auto flex flex-col gap-y-14">
          {data.map((item, categoryIndex) => (
            <div key={`category-${categoryIndex}`}>
              <p className="text-white text-2xl font-bold mb-2">
                {item.FAQ_category}
              </p>
              <div className="flex flex-col gap-y-4">
                {item?.FAQ_content?.map((content, questionIndex) => {
                  const itemKey = `${categoryIndex}-${questionIndex}`;
                  return (
                    <div
                      key={itemKey}
                      onClick={() =>
                        toggleQuestion(categoryIndex, questionIndex)
                      }
                      className={`bg-grey text-white p-4 rounded-xl cursor-pointer transition-colors duration-300 ease-in-out ${
                        activeItem === itemKey ? "bg-lightGrey" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3>{content.question}</h3>
                        <div className="transform transition-transform duration-300">
                          {activeItem === itemKey ? (
                            <CaretUp
                              className="text-primary"
                              size={24}
                              weight="bold"
                            />
                          ) : (
                            <CaretDown
                              className="text-primary"
                              size={24}
                              weight="bold"
                            />
                          )}
                        </div>
                      </div>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          activeItem === itemKey
                            ? "grid-rows-[1fr] opacity-100 mt-6"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-lightWhite">{content.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default FrequentlyAskedQuestions;
