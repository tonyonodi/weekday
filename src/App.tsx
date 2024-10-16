import React, { useState, useEffect } from "react";
import "./App.css";

interface HistoryEntry {
  date: string;
  guess: string;
  correct: boolean;
  timestamp: string;
}

// Days of the week starting with Monday
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Function to format the date as "1st January 2020"
const formatDate = (date: Date): string => {
  const day = date.getUTCDate();
  const month = date.toLocaleString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();
  const daySuffix = getDaySuffix(day);
  return `${day}${daySuffix} ${month} ${year}`;
};

// Function to get the correct suffix for the day
const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th"; // handles 11th to 13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
const Message = ({
  message,
  currentRandomDate,
  handleReset,
}: {
  message: "pass" | "fail";
  currentRandomDate: Date;
  handleReset: () => void;
}) => {
  const correctDay = (currentRandomDate.getUTCDay() + 6) % 7;
  const year = currentRandomDate.getUTCFullYear();
  const doomsDay = new Date(`${year}-06-06`).getDay();
  return (
    <>
      <p style={styles.message}>
        ❌ Incorrect! The correct day was <b>{daysOfWeek[correctDay]}</b>.
      </p>
      <p style={styles.message}>
        And doomsday for <b>{year}</b> was <b>{daysOfWeek[doomsDay]}</b>.
      </p>
      <button onClick={handleReset}>New Date</button>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    marginTop: "50px",
  },
  buttonContainer: {
    display: "inline-block",
    marginTop: "20px",
  },
  button: {
    display: "block",
    width: "150px",
    padding: "10px",
    margin: "5px auto",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    fontSize: "18px",
    marginTop: "20px",
  },
};

const App: React.FC = () => {
  // State variables
  const [currentRandomDate, setCurrentRandomDate] = useState<Date | null>(null);
  const [totalGuesses, setTotalGuesses] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState<"pass" | "fail" | null>(null);

  const totalCorrectGuesses = history.filter((entry) => entry.correct).length;

  // Load history from localStorage on component mount
  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("history") || "[]"
    ) as HistoryEntry[];
    setHistory(storedHistory);
    setTotalGuesses(storedHistory.length);

    // Calculate current streak
    let streak = 0;
    for (let i = storedHistory.length - 1; i >= 0; i--) {
      if (storedHistory[i].correct) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    generateNewDate();
  }, []);

  // Function to generate a new random date
  const generateNewDate = () => {
    const startDate = new Date(Date.UTC(1700, 0, 1));
    const endDate = new Date(Date.UTC(2400, 11, 31));
    const randomDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );
    setCurrentRandomDate(randomDate);
  };

  // Function to handle the user's guess
  const handleGuess = (guess: number) => {
    if (!currentRandomDate) return;

    // Adjust day so that Monday is 0 and Sunday is 6
    const correctDay = (currentRandomDate.getUTCDay() + 6) % 7;
    const isCorrect = correctDay === guess;

    const newHistoryEntry: HistoryEntry = {
      date: formatDate(currentRandomDate),
      guess: daysOfWeek[guess],
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    localStorage.setItem("history", JSON.stringify(updatedHistory));

    setTotalGuesses(updatedHistory.length);

    if (isCorrect) {
      setCurrentStreak(currentStreak + 1);
      setMessage("pass");
    } else {
      setCurrentStreak(0);
      setMessage("fail");
    }
  };

  if (!currentRandomDate) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Day of the Week Test</h1>
      <p>
        You may want to learn the{" "}
        <a href="https://en.wikipedia.org/wiki/Doomsday_rule">Doomsday rule</a>{" "}
        for caluclating weekdays.
      </p>
      <p>
        What day of the week is...
        <h2>{formatDate(currentRandomDate)}</h2>
      </p>
      {message === null ? (
        <div style={styles.buttonContainer}>
          {daysOfWeek.map((day, index) => (
            <button
              key={index}
              style={styles.button}
              onClick={() => handleGuess(index)}
            >
              {day}
            </button>
          ))}
        </div>
      ) : (
        <Message
          message={message}
          currentRandomDate={currentRandomDate}
          handleReset={() => {
            generateNewDate();
            setMessage(null);
          }}
        />
      )}
      <p>Total answers: {totalGuesses}</p>
      <p>Total correct answers: {totalCorrectGuesses}</p>
      <p>Current streak: {currentStreak}</p>
    </div>
  );
};

export default App;
