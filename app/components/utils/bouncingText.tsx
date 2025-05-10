import React from "react";

const BouncingText: React.FC = () => {
  const letters = ["D", "i", "p", "", "B", "u", "y", "i", "n", "g"];

  return (
    <div className="flex text-4xl font-bold text-black bouncing-text">
      {letters.map((letter, index) => (
        <div
          key={index}
        >
          {letter}
        </div>
      ))}
    </div>
  );
};

export default BouncingText;
