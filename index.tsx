import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const TOTAL_QUESTIONS_PER_LEVEL = 10;
const MAX_LEVELS = 4; // Increased to 4 levels
const STARTING_LIVES = 3;
const OPERATORS = ['+', '-', '×', '÷'];

const CORRECT_MESSAGES = [
    "Super gemacht!",
    "Genau richtig!",
    "Du bist ein Mathe-Genie!",
    "Weiter so!",
    "Fantastisch!",
    "Ausgezeichnet!"
];

const INCORRECT_MESSAGES = [
    "Keine Sorge, Übung macht den Meister.",
    "Fast geschafft, versuch es weiter!",
    "Das war knifflig, beim nächsten Mal klappt's!",
    "Gib nicht auf!",
    "Jeder Fehler ist eine Chance zu lernen."
];

type GameState = 'start' | 'playing' | 'level-cleared' | 'finished' | 'game-over';

const Fireworks = () => {
    const numParticles = 100; // Increased for a fuller effect
    const particles = Array.from({ length: numParticles }).map((_, index) => {
        const style = {
            '--hue': Math.floor(Math.random() * 360),
            '--angle': `${(360 / numParticles) * index}deg`,
            '--radius': `${Math.random() * 200 + 100}px`, // Increased radius for bigger explosion
            '--delay': `${Math.random() * 0.2}s`,
            '--duration': `${Math.random() * 1 + 1}s`, // Increased duration
        } as React.CSSProperties;
        return <div key={index} className="particle" style={style}></div>;
    });

    return <div className="fireworks-container">{particles}</div>;
};


const App = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(STARTING_LIVES);
    const [problem, setProblem] = useState<{ problemString: string, answer: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [score, setScore] = useState(0);
    const [scoreAtLevelStart, setScoreAtLevelStart] = useState(0);
    const [showFireworks, setShowFireworks] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);

    const generateProblem = () => {
        let problemString: string;
        let answer: number;

        if (level === 1) {
            let num1: number, num2: number;
            const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];

            switch (operator) {
                case '+':
                    num1 = Math.floor(Math.random() * 100) + 1;
                    num2 = Math.floor(Math.random() * 100) + 1;
                    answer = num1 + num2;
                    break;
                case '-':
                    num1 = Math.floor(Math.random() * 100) + 1;
                    num2 = Math.floor(Math.random() * 100) + 1;
                    if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure positive result
                    answer = num1 - num2;
                    break;
                case '×':
                    num1 = Math.floor(Math.random() * 12) + 1; // Smaller numbers for multiplication
                    num2 = Math.floor(Math.random() * 12) + 1;
                    answer = num1 * num2;
                    break;
                case '÷':
                    // Ensure whole number division
                    do {
                        num2 = Math.floor(Math.random() * 10) + 2; // Divisor
                        const multiplier = Math.floor(Math.random() * 10) + 1;
                        num1 = num2 * multiplier; // Dividend
                    } while (num1 > 100 || num1 === num2);
                    answer = num1 / num2;
                    break;
                default:
                    throw new Error('Invalid operator');
            }
            problemString = `${num1} ${operator} ${num2}`;
        } else if (level === 2) { // Level 2: Problems with parentheses
            const type = Math.floor(Math.random() * 2);

            if (type === 0) { // Format: (a + b) ÷ c
                const c = Math.floor(Math.random() * 8) + 2; // Divisor: 2-9
                const result = Math.floor(Math.random() * 10) + 2; // Result: 2-11
                const sum = c * result;
                const a = Math.floor(Math.random() * (sum - 1)) + 1;
                const b = sum - a;
                problemString = `(${a} + ${b}) ÷ ${c}`;
                answer = result;
            } else { // Format: (a - b) × c
                const c = Math.floor(Math.random() * 10) + 2; // Multiplier: 2-11
                const a = Math.floor(Math.random() * 10) + 5; // First number in parens: 5-14
                const b = Math.floor(Math.random() * (a - 2)) + 1; // Second num in parens, ensure result > 1
                problemString = `(${a} - ${b}) × ${c}`;
                answer = (a - b) * c;
            }
        } else if (level === 3) { // Level 3: Linear Equations (e.g., ax + b = c)
            let x: number, a: number, b: number, c: number;
            do {
                x = Math.floor(Math.random() * 19) - 9; // x from -9 to 9, excluding 0
            } while (x === 0);
        
            a = Math.floor(Math.random() * 8) + 2; // a from 2 to 9
            b = Math.floor(Math.random() * 31) - 15; // b from -15 to 15
        
            c = a * x + b;
        
            const bString = b === 0 ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`);
            problemString = `${a}x${bString} = ${c}`;
            answer = x;
        } else { // Level 4: Linear equations with terms on both sides
            let x: number, a: number, b: number, c: number, d: number;
            const operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
            const xOnLeft = Math.random() < 0.5;
    
            do {
                x = Math.floor(Math.random() * 19) - 9; // x from -9 to 9, excluding 0
            } while (x === 0);
    
            a = Math.floor(Math.random() * 8) + 2; // a from 2 to 9
    
            let constantSideResult: number;
            let constantSideString: string;
            
            switch (operator) {
                case '+':
                    c = Math.floor(Math.random() * 50) + 1;
                    d = Math.floor(Math.random() * 50) + 1;
                    constantSideResult = c + d;
                    constantSideString = `${c} + ${d}`;
                    break;
                case '-':
                    d = Math.floor(Math.random() * 49) + 1;  // d from 1 to 49
                    c = Math.floor(Math.random() * 50) + d + 1; // c > d
                    constantSideResult = c - d;
                    constantSideString = `${c} - ${d}`;
                    break;
                case '×':
                    c = Math.floor(Math.random() * 9) + 2; // 2-10
                    d = Math.floor(Math.random() * 9) + 2; // 2-10
                    constantSideResult = c * d;
                    constantSideString = `${c} × ${d}`;
                    break;
                default: // Should not happen
                  c = 1; d = 1; constantSideResult = 1; constantSideString = "1";
            }
    
            b = constantSideResult - (a * x);
    
            const xSideString = `${a}x${b === 0 ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`)}`;
    
            if (xOnLeft) {
                problemString = `${xSideString} = ${constantSideString}`;
            } else {
                problemString = `${constantSideString} = ${xSideString}`;
            }
            answer = x;
        }
        
        setProblem({ problemString, answer });
        setUserAnswer('');
        setIsAnswered(false);
        setFeedbackMessage('');
    };

    useEffect(() => {
        // Generate a problem when a new game starts or a new level begins.
        // This ensures `generateProblem` uses the updated `level` state.
        if (gameState === 'playing' && questionNumber === 1) {
            generateProblem();
        }
    }, [gameState, level]);

    useEffect(() => {
        if (gameState === 'playing' && !isAnswered && inputRef.current) {
            inputRef.current.focus();
        }
    }, [problem, gameState, isAnswered]);

    useEffect(() => {
        if (isAnswered && nextButtonRef.current) {
            nextButtonRef.current.focus();
        }
    }, [isAnswered]);
    
    useEffect(() => {
        if (lives <= 0 && gameState === 'playing') {
            setTimeout(() => {
                setGameState('game-over');
            }, 1200); // Delay to show the final incorrect feedback
        }
    }, [lives, gameState]);

    const startQuiz = () => {
        setLevel(1);
        setGameState('playing');
        setScore(0);
        setScoreAtLevelStart(0);
        setQuestionNumber(1);
        setLives(STARTING_LIVES);
    };

    const handleCheckAnswer = () => {
        if (!userAnswer) return;
        
        const answerIsCorrect = parseInt(userAnswer, 10) === problem!.answer;
        setIsCorrect(answerIsCorrect);
        setIsAnswered(true);

        if (answerIsCorrect) {
            setScore(prev => prev + 1);
            setShowFireworks(true);
            const randomMessage = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
            setFeedbackMessage(randomMessage);
            setTimeout(() => setShowFireworks(false), 3000); // Increased timeout for longer animation
        } else {
            setLives(prev => prev - 1);
            const randomMessage = INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)];
            setFeedbackMessage(randomMessage);
        }
    };

    const handleNextQuestion = () => {
        if (questionNumber < TOTAL_QUESTIONS_PER_LEVEL) {
            setQuestionNumber(prev => prev + 1);
            generateProblem();
        } else {
            if (level < MAX_LEVELS) {
                setGameState('level-cleared');
            } else {
                setGameState('finished');
            }
        }
    };

    const startNextLevel = () => {
        setScoreAtLevelStart(score);
        setLevel(prev => prev + 1);
        setQuestionNumber(1);
        setLives(prev => prev + 1); // No more cap on lives
        setGameState('playing');
    };
    
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !isAnswered) {
             handleCheckAnswer();
        }
    };

    if (gameState === 'start') {
        return (
            <div className="app-container">
                <div className="start-screen">
                    <h1>Mathe-Quiz</h1>
                    <p>Teste deine Kopfrechenfähigkeiten. Du startest mit {STARTING_LIVES} Versuchen.</p>
                    <button className="button button-primary" onClick={startQuiz}>Quiz starten</button>
                </div>
            </div>
        );
    }
    
    if (gameState === 'game-over') {
        return (
            <div className="app-container">
                <div className="final-score">
                    <h2>Game Over!</h2>
                    <p>Du hast leider keine Versuche mehr.</p>
                    <p>Dein Endstand: {score} Punkte.</p>
                    <button className="button button-primary" onClick={startQuiz}>Nochmal spielen</button>
                </div>
            </div>
        );
    }

    if (gameState === 'level-cleared') {
        const levelScore = score - scoreAtLevelStart;
        return (
            <div className="app-container">
                <div className="final-score">
                    <h2>Level {level} abgeschlossen!</h2>
                    <p className="bonus-life-message">✨ Bonus! Du erhältst ein zusätzliches Leben für den nächsten Level. ✨</p>
                    <p>Ergebnis in diesem Level: {levelScore} von {TOTAL_QUESTIONS_PER_LEVEL}.</p>
                    <p>Gesamtpunkte: {score}</p>
                    <button className="button button-primary" onClick={startNextLevel}>Level {level + 1} starten</button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const lastLevelScore = score - scoreAtLevelStart;
        return (
            <div className="app-container">
                <div className="final-score">
                    <h2>Glückwunsch!</h2>
                    <p>Du hast alle Level geschafft!</p>
                    <p>Ergebnis im letzten Level: {lastLevelScore} von {TOTAL_QUESTIONS_PER_LEVEL}.</p>
                    <p>Dein Endstand: {score} Punkte.</p>
                    <button className="button button-primary" onClick={startQuiz}>Nochmal von vorne?</button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {showFireworks && <Fireworks />}
            <h1>Mathe-Quiz - Level {level}</h1>
            
            <div className="status-bar">
                <span>Frage: {questionNumber} / {TOTAL_QUESTIONS_PER_LEVEL}</span>
                <span>Punkte: {score}</span>
                <div className="lives-container" aria-label={`Verbleibende Versuche: ${lives}`}>
                    <span className="heart" aria-hidden="true">❤️</span>
                    <span aria-hidden="true">x {lives}</span>
                </div>
            </div>
            
            {problem && (
                <div className={`problem-area ${level >= 3 ? 'problem-area-equation' : ''}`}>
                    {level < 3
                        ? `${problem.problemString} = ?`
                        : problem.problemString
                    }
                </div>
            )}
            
            <div className="input-area">
                 <input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Deine Antwort"
                    disabled={isAnswered}
                    aria-label="Antwort"
                />
            </div>
            
            {!isAnswered ? (
                 <button className="button button-primary" onClick={handleCheckAnswer} disabled={!userAnswer}>
                    Prüfen
                </button>
            ) : (
                <button 
                    ref={nextButtonRef}
                    className="button button-primary" 
                    onClick={handleNextQuestion}
                    disabled={lives <= 0}
                >
                    {questionNumber === TOTAL_QUESTIONS_PER_LEVEL ? `Level ${level} beenden` : 'Nächste Frage'}
                </button>
            )}

            <div className="feedback-area" aria-live="polite">
                {isAnswered && (
                    isCorrect ? (
                        <p className="feedback-correct">
                            Richtig! 🎉
                            <span>{feedbackMessage}</span>
                        </p>
                    ) : (
                        <p className="feedback-incorrect">
                            Falsch. Die richtige Antwort ist {problem?.answer}.
                            <span>{feedbackMessage}</span>
                        </p>
                    )
                )}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if(container){
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}