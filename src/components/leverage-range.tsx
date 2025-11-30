"use client";

import React, { useEffect, useState } from "react";

const LeverageRange = ({
  onValueChange,
}: {
  onValueChange: (value: number) => void;
}) => {
  const [value, setValue] = useState(1);

  // Labels: 10, 20, 30 ... 100
  const labels = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  useEffect(() => {
    const sheet: any = document.getElementById("dynamic-range-style");

    const percent = ((value - 1) / (150 - 1)) * 100; // correct 1–150 scaling
    const prefs = [
      "webkit-slider-runnable-track",
      "moz-range-track",
      "ms-track",
    ];

    let style = "";

    prefs.forEach((p) => {
      style += `
        .range {
          background: linear-gradient(to right, #37adbf 0%, #37adbf ${percent}%, #fff ${percent}%, #fff 100%);
        }
        .range input::-${p} {
          background: linear-gradient(to right, #37adbf 0%, #37adbf ${percent}%, #b2b2b2 ${percent}%, #b2b2b2 100%);
        }
      `;
    });

    sheet.textContent = style;
    if (value) {
      onValueChange(value);
    }
  }, [value]);

  return (
    <div>
      <style id="dynamic-range-style"></style>

      <div className="range bg-red-600!">
        <input
          type="range"
          min="1"
          max="150"
          step="1"
          value={value}
          className="bg-green-500"
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      {/* Number Labels: 10, 20, 30 ... 100 */}
      <ul className="range-labels">
        {labels.map((num, i) => (
          <li
            key={i}
            className={`text-[10px] ${value === num ? "active selected" : ""} ${
              value > num ? "selected" : ""
            }`}
            onClick={() => setValue(num)}
          >
            <span className="absolute -top-3"> {num}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeverageRange;
