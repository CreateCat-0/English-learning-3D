'use client';

const {
  useState,
  useEffect,
  useRef
} = React;
function MainComponent() {
  const [words, setWords] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timeoutId, setTimeoutId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [bgmAudio, setBgmAudio] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [countdownAudio, setCountdownAudio] = useState(null);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState([]);
  const [initialInput, setInitialInput] = useState("");
  const inputRef = useRef(null);
  const bgmRef = useRef(null);
  const speak = text => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);
  useEffect(() => {
    if (showAnswer && words[currentIndex]) {
      speak(words[currentIndex].word);
    }
  }, [showAnswer]);
  useEffect(() => {
    if (gameStarted && !allComplete && !bgmAudio) {
      const bgm = new Audio("dotabatare-su.mp3");
      bgm.loop = true;
      bgm.volume = 0.3;
      bgm.play();
      setBgmAudio(bgm);
      bgmRef.current = bgm;
    }
    if (gameStarted && !allComplete) {
      const id = setTimeout(() => {
        const audio = new Audio("Countdown06-1.mp3");
        setCountdownAudio(audio);
        audio.play();
        audio.onended = () => {
          if (!words[currentIndex].correct) {
            setIsTimeUp(true);
            setIsRotating(true);
            setTimeout(() => {
              setShowAnswer(true);
              setIsRotating(false);
              setTimeout(() => {
                const newParticles = words[currentIndex].word.split("").map(() => {
                  return [...Array.from({
                    length: 20
                  })].map(() => ({
                    angle: Math.random() * Math.PI * 2,
                    speed: 2 + Math.random() * 3,
                    delay: Math.random() * 0.2
                  }));
                });
                setParticles(newParticles);
                setIsAnimating(true);
                setTimeout(() => {
                  setShowAnswer(false);
                  setIsAnimating(false);
                  setInput("");
                  setIsTimeUp(false);
                  if (currentIndex < words.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    const incorrectWords = words.filter((_, idx) => !words[idx].correct);
                    if (incorrectWords.length === 0) {
                      setAllComplete(true);
                    } else {
                      setWords(incorrectWords);
                      setCurrentIndex(0);
                    }
                  }
                }, 1000);
              }, 5000);
            }, 500);
          }
        };
      }, 15000);
      setTimeoutId(id);
      return () => clearTimeout(id);
    }
  }, [currentIndex, gameStarted, allComplete]);
  useEffect(() => {
    if (allComplete && bgmAudio) {
      bgmAudio.pause();
      const clearAudio = new Audio("Phrase03-2.mp3");
      clearAudio.play();
    }
  }, [allComplete]);
  useEffect(() => {
    return () => {
      if (bgmAudio) {
        bgmAudio.pause();
      }
      if (countdownAudio) {
        countdownAudio.pause();
      }
    };
  }, []);
  const handlePlayAgain = () => {
    const initialWordPairs = initialInput.split("\n").map(line => {
      const [word, meaning, showCircles] = line.split(",");
      return {
        word: word.trim(),
        meaning: meaning.trim(),
        showCircles: showCircles ? showCircles.trim() === "0" : false,
        correct: false
      };
    }).filter(pair => pair.word && pair.meaning);
    const selectedWords = initialWordPairs.filter((_, index) => checkedQuestions.includes(index));
    setWords(selectedWords);
    setCurrentIndex(0);
    setShowQuestionList(false);
    setCheckedQuestions([]);
    setGameStarted(true);
    setAllComplete(false);
    if (bgmRef.current) {
      bgmRef.current.currentTime = 0;
      bgmRef.current.play();
    } else {
      const bgm = new Audio("dotabatare-su.mp3");
      bgm.loop = true;
      bgm.volume = 0.3;
      bgm.play();
      setBgmAudio(bgm);
      bgmRef.current = bgm;
    }
  };
  const toggleQuestionCheck = index => {
    setCheckedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };
  const countAlphabetChars = str => {
    return str.replace(/[^a-zA-Z]/g, "").length;
  };
  const handleInputChange = e => {
    const newValue = e.target.value;
    const lastValue = input;
    const newAlphabetCount = countAlphabetChars(newValue);
    const lastAlphabetCount = countAlphabetChars(lastValue);
    if (newAlphabetCount - lastAlphabetCount >= 2) {
      setInput("");
    } else {
      setInput(newValue);
    }
  };
  const handleInitialSubmit = e => {
    e.preventDefault();
    const input = e.target.wordInput.value;
    setInitialInput(input);
    const wordPairs = input.split("\n").map(line => {
      const [word, meaning, showCircles] = line.split(",");
      return {
        word: word.trim(),
        meaning: meaning.trim(),
        showCircles: showCircles ? showCircles.trim() === "0" : false,
        correct: false
      };
    }).filter(pair => pair.word && pair.meaning);
    setWords(wordPairs);
    setGameStarted(true);
  };
  const handleInputSubmit = e => {
    if (e.key === "Enter") {
      if (input === words[currentIndex].word) {
        if (countdownAudio) {
          countdownAudio.pause();
          setCountdownAudio(null);
        }
        const audio = new Audio("Party_Popper03-1(Dry).mp3");
        audio.play();
        const newParticles = words[currentIndex].meaning.split("").map(() => {
          return [...Array.from({
            length: 20
          })].map(() => ({
            angle: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 3,
            delay: Math.random() * 0.2
          }));
        });
        setParticles(newParticles);
        setIsAnimating(true);
        const updatedWords = [...words];
        updatedWords[currentIndex].correct = true;
        setWords(updatedWords);
        clearTimeout(timeoutId);
        setTimeout(() => {
          setIsAnimating(false);
          setInput("");
          if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            const incorrectWords = words.filter((_, idx) => !words[idx].correct);
            if (incorrectWords.length === 0) {
              setAllComplete(true);
            } else {
              setWords(incorrectWords);
              setCurrentIndex(0);
            }
          }
        }, 1000);
      } else {
        setInput("");
      }
    }
  };
  if (!gameStarted) {
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4"
    }, /*#__PURE__*/React.createElement("form", {
      onSubmit: handleInitialSubmit,
      className: "w-full max-w-lg"
    }, /*#__PURE__*/React.createElement("textarea", {
      name: "wordInput",
      className: "w-full h-64 p-4 mb-4 rounded-lg border-2 border-[#6366f1] font-inter text-xl focus:outline-none focus:border-[#4f46e5] transition-colors",
      placeholder: "\u5358\u8A9E, \u610F\u5473, 0 (\u4E00\u884C\u306B\u4E00\u3064\u306E\u5358\u8A9E\u30DA\u30A2)"
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "w-full py-3 bg-[#6366f1] text-white rounded-lg font-inter hover:bg-[#4f46e5] transition-colors"
    }, "Start")));
  }
  if (allComplete) {
    if (showQuestionList) {
      const initialWordPairs = initialInput.split("\n").map(line => {
        const [word, meaning, showCircles] = line.split(",");
        return {
          word: word.trim(),
          meaning: meaning.trim(),
          showCircles: showCircles ? showCircles.trim() === "0" : false,
          correct: false
        };
      }).filter(pair => pair.word && pair.meaning);
      return /*#__PURE__*/React.createElement("div", {
        className: "min-h-screen bg-gray-100 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "max-w-lg mx-auto"
      }, /*#__PURE__*/React.createElement("div", {
        className: "h-[80vh] overflow-y-auto mb-4"
      }, initialWordPairs.map((word, index) => /*#__PURE__*/React.createElement("div", {
        key: index,
        onClick: () => toggleQuestionCheck(index),
        className: "flex items-center justify-between p-2 bg-white mb-2 rounded cursor-pointer text-[20px]"
      }, /*#__PURE__*/React.createElement("span", null, `${word.word}, ${word.meaning}`), checkedQuestions.includes(index) && /*#__PURE__*/React.createElement("span", {
        className: "text-green-500"
      }, "\u2713")))), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowQuestionList(false),
        className: "w-full py-2 bg-gray-500 text-white rounded"
      }, "Back"), checkedQuestions.length > 0 && /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayAgain,
        className: "w-full py-2 bg-blue-500 text-white rounded"
      }, "Play Again"))));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-6xl font-inter text-green-500 animate-bounce mb-4"
    }, "Clear\u0021"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowQuestionList(true),
      className: "px-4 py-2 bg-green-500 text-white rounded"
    }, "View Questions"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex flex-col items-center justify-center p-4 relative"
  }, /*#__PURE__*/React.createElement("video", {
    className: "fixed top-0 left-0 w-full h-full object-cover -z-10",
    src: "227353_medium.mp4",
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "fixed top-[30%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative mb-4"
  }, !isAnimating && !showAnswer && /*#__PURE__*/React.createElement("div", {
    className: `text-8xl font-bold text-center text-black relative ${isRotating ? "animate-flip" : ""}`,
    style: {
      textShadow: "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
      backfaceVisibility: "hidden"
    }
  }, words[currentIndex].meaning, words[currentIndex].showCircles && /*#__PURE__*/React.createElement("div", {
    className: "absolute top-[-40px] left-1/2 transform -translate-x-1/2 flex gap-2"
  }, Array(words[currentIndex].word.length).fill().map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "w-[30px] h-[30px] rounded-full bg-white"
  })))), showAnswer && !isAnimating && /*#__PURE__*/React.createElement("div", {
    className: "text-8xl font-bold font-inter text-blue-500 text-center",
    style: {
      textShadow: "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff"
    }
  }, words[currentIndex].word), isAnimating && /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 left-0 w-full h-full"
  }, (showAnswer ? words[currentIndex].word : words[currentIndex].meaning).split("").map((char, i) => {
    var _particles$i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "inline-block relative",
      style: {
        width: `${100 / (showAnswer ? words[currentIndex].word : words[currentIndex].meaning).length}%`
      }
    }, (_particles$i = particles[i]) === null || _particles$i === void 0 ? void 0 : _particles$i.map((particle, j) => /*#__PURE__*/React.createElement("div", {
      key: j,
      className: "absolute w-[6px] h-[6px] rounded-full bg-white",
      style: {
        left: "50%",
        top: "50%",
        animation: "particleAnimation 1s cubic-bezier(.17,.67,.83,.67) forwards",
        animationDelay: `${particle.delay}s`,
        "--angle": `${particle.angle}rad`,
        "--speed": particle.speed
      }
    })));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fixed top-[60%] left-1/2 -translate-x-1/2 w-full max-w-4xl"
  }, /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "text",
    value: input,
    onChange: handleInputChange,
    onKeyPress: handleInputSubmit,
    disabled: isAnimating || showAnswer,
    className: "w-full h-[100px] text-[100px] p-4 rounded border-2 border-[#6366f1] font-inter focus:outline-none focus:border-[#4f46e5] bg-white/80 text-center"
  })), /*#__PURE__*/React.createElement("style", {
    jsx: true,
    global: true
  }, `
        @keyframes particleAnimation {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(0px, 0px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(
              calc(cos(var(--angle)) * var(--speed) * 100px),
              calc(sin(var(--angle)) * var(--speed) * 100px)
            );
          }
        }

        @keyframes flip {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }

        .animate-flip {
          animation: flip 0.5s linear forwards;
        }
      `));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(MainComponent, null));
