"use client";

import React, { useEffect, useRef, useState } from "react";

const LeverageRange = ({
  onValueChange,
}: {
  onValueChange: (value: number) => void;
}) => {
  const [value, setValue] = useState(1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Labels now match the full 150 range → 10, 20, 30 ... 150
  const labels = Array.from({ length: 15 }, (_, i) => (i + 1) * 10);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const min = Number(input.min ?? 1);
    const max = Number(input.max ?? 150);
    const currentValue = Number(value);

    // correct percentage of the slider
    const percent = ((currentValue - min) / (max - min)) * 100;

    // apply gradient directly on the range input
    input.style.background = `
      linear-gradient(
        to right,
        #37adbf 0%,
        #37adbf ${percent}%,
        #b2b2b2 ${percent}%,
        #b2b2b2 100%
      )
    `;

    onValueChange(currentValue);
  }, [value, onValueChange]);

  return (
    <div>
      <style id="dynamic-range-style"></style>

      <div className="range">
        <input
          ref={inputRef}
          type="range"
          min="1"
          max="150"
          step="1"
          value={value}
          className="bg-green-500"
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <ul className="range-labels">
        {labels.map((num, i) => (
          <li
            key={i}
            className={`text-[10px] ${
              value === num ? "active selected" : ""
            } ${value > num ? "selected" : ""}`}
            onClick={() => setValue(num)}
          >
            <span className="absolute -top-3">{num}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeverageRange;
