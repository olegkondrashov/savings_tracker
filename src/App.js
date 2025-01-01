import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * We will create exactly 365 circles.
 * Minimum sum = 365 * 5 = 1825.
 * Maximum sum = 365 * 100 = 36500.
 * Each circle can be one of [5, 10, 15, 20, 30, 50, 100].
 */

/**
 * Generate a random distribution of 365 circles that sum exactly to "goal".
 * - Start with all circles = 5.
 * - Distribute leftover (goal - 1825) in increments of 5 among random circles,
 *   up to a maximum of 100 per circle.
 * - This yields a random but valid arrangement if feasible.
 */
function generateRandomCirclesForYear(goal) {
  const DAYS = 365;
  const MIN_AMOUNT = 5;
  const MAX_AMOUNT = 100;

  // 1) Initialize all 365 circles to the minimum (5)
  let circles = new Array(DAYS).fill(MIN_AMOUNT);

  // 2) Calculate leftover
  const baseSum = DAYS * MIN_AMOUNT; // 365 * 5 = 1825
  let leftover = goal - baseSum;

  // If leftover < 0, or leftover is not multiple of 5, or leftover too large -> not feasible
  // leftover > DAYS * (MAX_AMOUNT - MIN_AMOUNT) = 365 * 95 = 34675
  if (
    leftover < 0 ||
    leftover % 5 !== 0 ||
    leftover > DAYS * (MAX_AMOUNT - MIN_AMOUNT)
  ) {
    return [];
  }

  // 3) Randomly distribute leftover in increments of 5
  //    until leftover is 0 or we can't place any more increments
  while (leftover > 0) {
    // Pick a random circle index
    const randIdx = Math.floor(Math.random() * DAYS);

    // How much can we still add to that circle?
    const currentValue = circles[randIdx];
    const maxPossibleAdd = MAX_AMOUNT - currentValue; // e.g., up to 95 if currentValue=5

    // If we can add at least 5, do so
    if (maxPossibleAdd >= 5) {
      circles[randIdx] = currentValue + 5; // increment by 5
      leftover -= 5;
    }

    // If we can't add to that circle (it's already 100),
    // we just pick another circle in the next iteration.
    // The loop ends when leftover = 0 or no circle can accept more increments
    // (but in theory, we should always find a circle unless leftover is too big or distribution is stuck).
  }

  // leftover should be 0 if everything worked
  if (leftover === 0) {
    return circles;
  } else {
    // Something went wrong (shouldn’t happen if the goal is feasible).
    return [];
  }
}

function App() {
  // 1) State for the user’s goal (default: 6000).
  // 2) 365 circle amounts that sum to that goal.
  // 3) Which circles are currently selected.
  const [goal, setGoal] = useState(6000);
  const [circles, setCircles] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  /**
   * On first load, restore from localStorage if present:
   * - goal
   * - circles
   * - selected indices
   */
  useEffect(() => {
    const savedGoal = localStorage.getItem("yearGoal");
    const savedCircles = localStorage.getItem("yearCircles");
    const savedSelected = localStorage.getItem("yearSelected");

    if (savedGoal) {
      setGoal(JSON.parse(savedGoal));
    }
    if (savedCircles) {
      setCircles(JSON.parse(savedCircles));
    }
    if (savedSelected) {
      setSelectedIndices(JSON.parse(savedSelected));
    }
  }, []);

  /**
   * Let user change the goal (no generation yet).
   */
  const handleGoalChange = (e) => {
    setGoal(Number(e.target.value) || 0);
  };

  /**
   * Generate new distribution of 365 circles that sum to the goal.
   * Clear any previous selections for a fresh start.
   */
  const handleGenerate = () => {
    // Quick validity check
    if (goal < 1825 || goal > 36500 || goal % 5 !== 0) {
      alert(
        "Goal must be between 1825 and 36500 and be a multiple of 5 to fill 365 circles."
      );
      return;
    }

    const newCircles = generateRandomCirclesForYear(goal);

    if (newCircles.length === 0) {
      alert(
        "Could not generate 365 circles for that goal. Make sure your goal is feasible."
      );
      return;
    }

    // Update state and localStorage
    setCircles(newCircles);
    localStorage.setItem("yearCircles", JSON.stringify(newCircles));

    // Clear selections
    setSelectedIndices([]);
    localStorage.removeItem("yearSelected");

    // Save the new goal
    localStorage.setItem("yearGoal", JSON.stringify(goal));
  };

  /**
   * Toggle selection of a circle on click.
   */
  const handleCircleClick = (index) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        // remove
        return prev.filter((item) => item !== index);
      } else {
        // add
        return [...prev, index];
      }
    });
  };

  /**
   * Whenever selectedIndices changes, persist to localStorage.
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
   * Reset only the selections (keep the same 365 amounts).
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
          type="number"
          value={goal}
          onChange={handleGoalChange}
          className="goal-input"
        />
        <button onClick={handleGenerate} className="generate-button">
          Generate 365 Circles
        </button>
      </div>

      {circles.length > 0 && (
        <>
          <div className="circles-container">
            {circles.map((amount, index) => {
              const selected = selectedIndices.includes(index);
              return (
                <div
                  key={index}
                  className={`circle ${selected ? "circle-selected" : ""}`}
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
