import React, { useState, useEffect } from "react";
import "./App.css"

/**
 * Utility to generate exactly 365 circles that sum to the given goal.
 * - Start all 365 at 5 (minimum).
 * - Distribute leftover in increments of 5 among random circles until each hits 100 or leftover is 0.
 */
function generateRandomCirclesForYear(goal) {
  const DAYS = 365;
  const MIN_AMOUNT = 5;
  const MAX_AMOUNT = 100;

  // Initialize all circles to minimum (5)
  let circles = new Array(DAYS).fill(MIN_AMOUNT);

  // Base sum is 365 * 5 = 1825
  const baseSum = DAYS * MIN_AMOUNT;
  let leftover = goal - baseSum;

  // Validate leftover
  // leftover must be >= 0 and <= 365*(100-5)=34675, and multiple of 5
  if (
    leftover < 0 ||
    leftover % 5 !== 0 ||
    leftover > DAYS * (MAX_AMOUNT - MIN_AMOUNT)
  ) {
    return [];
  }

  // Distribute leftover in increments of 5
  while (leftover > 0) {
    const randIdx = Math.floor(Math.random() * DAYS);

    const currentVal = circles[randIdx];
    const canAdd = MAX_AMOUNT - currentVal; // how much more we can add to this circle

    if (canAdd >= 5) {
      circles[randIdx] = currentVal + 5;
      leftover -= 5;
    }
    // If can't add at least 5, we skip and pick another random circle next loop
  }

  // If leftover ended at 0, success
  return leftover === 0 ? circles : [];
}

function App() {
  /**
   * 1) We keep the user’s goal *input* in a string to avoid leading-zero issues.
   * 2) We store the numeric data for circles in state once generated.
   * 3) We also track selected circle indices.
   */
  const [goalInput, setGoalInput] = useState("6000");  // text in the input
  const [circles, setCircles] = useState([]);          // array of circle amounts (365)
  const [selectedIndices, setSelectedIndices] = useState([]); // which circles are toggled

  /**
   * On first mount, load any saved data from localStorage.
   */
  useEffect(() => {
    const savedGoal = localStorage.getItem("yearGoal");      // numeric
    const savedCircles = localStorage.getItem("yearCircles");
    const savedSelected = localStorage.getItem("yearSelected");

    // If we have a saved numeric goal, convert it to string for the input
    if (savedGoal) {
      const parsedGoal = JSON.parse(savedGoal); 
      setGoalInput(String(parsedGoal));  // show in input
    }
    if (savedCircles) {
      setCircles(JSON.parse(savedCircles));
    }
    if (savedSelected) {
      setSelectedIndices(JSON.parse(savedSelected));
    }
  }, []);

  /**
   * Input change handler: remove non-digits, strip leading zeros, allow empty.
   */
  const handleGoalChange = (e) => {
    let val = e.target.value.replace(/\D+/g, ""); // keep only digits
    val = val.replace(/^0+/, "");                 // remove leading zeros
    setGoalInput(val);                            // if empty, we set ""
  };

  /**
   * Generate new 365-circle distribution for the user’s numeric goal.
   * Then store them in localStorage, reset selections, etc.
   */
  const handleGenerate = () => {
    const parsedGoal = parseInt(goalInput, 10) || 0;

    if (parsedGoal < 1825 || parsedGoal > 36500 || parsedGoal % 5 !== 0) {
      alert("Goal must be 1825–36500 and a multiple of 5 to fill 365 circles.");
      return;
    }

    const newCircles = generateRandomCirclesForYear(parsedGoal);
    if (newCircles.length === 0) {
      alert("Could not generate 365 circles for that goal (check constraints).");
      return;
    }

    // Update in-state
    setCircles(newCircles);
    setSelectedIndices([]);

    // Store in localStorage
    localStorage.setItem("yearGoal", JSON.stringify(parsedGoal));    // numeric
    localStorage.setItem("yearCircles", JSON.stringify(newCircles));
    localStorage.removeItem("yearSelected");
  };

  /**
   * Toggle circle selection on click.
   */
  const handleCircleClick = (index) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  /**
   * Whenever selectedIndices changes, store it in localStorage.
   */
  useEffect(() => {
    localStorage.setItem("yearSelected", JSON.stringify(selectedIndices));
  }, [selectedIndices]);

  /**
   * Calculate total of selected circles.
   */
  const totalSavings = selectedIndices.reduce((sum, idx) => {
    return sum + (circles[idx] || 0);
  }, 0);

  /**
   * Reset only the selections.
   */
  const handleReset = () => {
    setSelectedIndices([]);
    localStorage.removeItem("yearSelected");
  };

  return (
    <div className="App">
      <h1 className="title">365-Day Savings Tracker</h1>

      <div className="goal-container">
        <input
          type="text"
          value={goalInput}
          onChange={handleGoalChange}
          className="goal-input"
          placeholder="Enter goal (e.g. 6000)"
        />
        <button onClick={handleGenerate} className="generate-button">
          Generate 365 Circles
        </button>
      </div>

      {circles.length > 0 && (
        <>
          <div className="circles-container">
            {circles.map((amount, index) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <div
                  key={index}
                  className={`circle ${isSelected ? "circle-selected" : ""}`}
                  onClick={() => handleCircleClick(index)}
                >
                  {amount}
                </div>
              );
            })}
          </div>

          <div className="total-savings">
            Currently Selected: <strong>€ {totalSavings}</strong>
          </div>

          <button className="reset-button" onClick={handleReset}>
            Reset Selections
          </button>
        </>
      )}
    </div>
  );
}

export default App;
