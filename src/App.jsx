import React, { useEffect, useState } from 'react';
import boom from "./assets/boom.png";
import building from "./assets/building.png";
import cityImg from "./assets/city.jpg";
import plane from "./assets/plane.png";
import Video from "./components/Video";

const App = () => {
  const buildingHeight = 160;
  const [planePosFromTop, setPlanePosFromTop] = useState(175);
  const [buildingPos, setBuildingPos] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [fist, setFist] = useState(true);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Updated collision detection helper function
  const checkCollision = (planePos, buildingPosition) => {
    const planeWidth = 80;  // Plane width
    const planeHeight = 40; // Plane height
    const buildingWidth = 96; // Building width
    const planeLeft = 56; // Left position of plane
    
    // Calculate plane boundaries
    const planeRight = planeLeft + planeWidth;
    const planeTop = planePos;
    const planeBottom = planePos + planeHeight;
    
    // Adjusted building boundaries - moved right by increasing base position
    const buildingLeft = 750 - buildingPosition; // Increased from 600 to 750
    const buildingRight = buildingLeft + buildingWidth;
    
    // Check if plane is within building horizontally
    if (planeRight > buildingLeft && planeLeft < buildingRight) {
      // Check if plane hits top building
      if (planeTop < buildingHeight) {
        return true;
      }
      // Check if plane hits bottom building
      if (planeBottom > 400 - buildingHeight) {
        return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    let animatePlaneId;
    const animatePlane = () => {
      setPlanePosFromTop((prevPos) => {
        if (checkCollision(prevPos, buildingPos)) {
          setIsOver(true);
          setIsStarted(false);
          return prevPos;
        }
        if (prevPos < 380) {
          return prevPos + 0.5;
        } else {
          setIsOver(true);
          setIsStarted(false);
          return prevPos;
        }
      });
      animatePlaneId = requestAnimationFrame(animatePlane);
    };
    if (isStarted) {
      animatePlaneId = requestAnimationFrame(animatePlane);
    }
    return () => cancelAnimationFrame(animatePlaneId);
  }, [buildingPos, isStarted]);

  useEffect(() => {
    if (!fist) {
      setPlanePosFromTop((prevPos) => {
        const newPos = prevPos - 40;
        return newPos > 0 ? newPos : 0;
      });
    }
  }, [fist]);

  const handleSpacePress = (event) => {
    if (event.key === " ") {
      event.preventDefault();
      setPlanePosFromTop((prevPos) => {
        if (prevPos > 2) {
          return prevPos - 30;
        }
        return prevPos;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSpacePress);
    return () => {
      window.removeEventListener("keydown", handleSpacePress);
    };
  }, []);

  useEffect(() => {
    if (isOver && !isStarted) {
      setFinalScore(score);
      if (score > highScore) {
        setHighScore(score);
      }
      setScore(0);
    }
    let animationFrameId;
    const animateBuilding = () => {
      setBuildingPos((prevPos) => {
        if (prevPos < 650) { // Increased from 500 to 650 to match new positioning
          return prevPos + 1;
        } else {
          setScore((prevScore) => prevScore + 1);
          return 0;
        }
      });
      animationFrameId = requestAnimationFrame(animateBuilding);
    };
    if (isStarted && !isOver) {
      animationFrameId = requestAnimationFrame(animateBuilding);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOver, isStarted, score, highScore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      {/* Header Bar */}
      <div className="w-full py-4 bg-opacity-30 bg-black backdrop-blur-md flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Flappy Plane
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-opacity-40 bg-black rounded-lg">
            <span className="text-yellow-400 font-bold">High Score: {highScore}</span>
          </div>
          <a 
            href="https://github.com/Galib-23/flappy-plane-react-ml5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-white transition-all duration-300"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-8">
          {isVideoOn && (
            <div className="w-[480px]">
              <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30">
                <h2 className="text-cyan-400 text-xl mb-4 text-center font-semibold">Gesture Control</h2>
                <div className="rounded-xl overflow-hidden">
                  <Video
                    setFist={setFist}
                    isVideoOn={isVideoOn}
                    setIsVideoOn={setIsVideoOn}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 max-w-2xl">
            <div className="text-center mb-6">
              <p className="text-cyan-400 text-lg">
                {isVideoOn ? (
                  "Use hand gestures to control the plane ✋"
                ) : (
                  <>
                    Press <span className="px-2 py-1 bg-white bg-opacity-10 rounded text-yellow-400 font-mono">SPACE</span> to control the plane
                  </>
                )}
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <div 
                className="relative h-[400px] w-full"
                style={{
                  backgroundImage: `url(${cityImg})`,
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-purple-900/30 backdrop-blur-[2px]"></div>
                
                <div className="absolute top-4 left-4 z-50">
                  <div className="bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
                    <span className="text-cyan-400 font-bold text-2xl">
                      {score}
                    </span>
                  </div>
                </div>

                {isOver && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl p-8 text-center">
                      <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
                      <p className="text-2xl text-yellow-400 mb-2">Score: {finalScore}</p>
                      <p className="text-lg text-cyan-400 mb-6">High Score: {highScore}</p>
                      <button
                        onClick={() => {
                          setBuildingPos(0);
                          setPlanePosFromTop(175);
                          setIsOver(false);
                          setIsStarted(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300"
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                )}

                <img
                  src={plane}
                  alt="plane"
                  className="absolute z-20 h-10 w-20 left-14 transition-all duration-75"
                  style={{ top: `${planePosFromTop}px` }}
                />
                
                <img
                  src={building}
                  className="absolute w-24 bottom-0 transition-all duration-75"
                  style={{
                    height: `${buildingHeight}px`,
                    right: `${buildingPos}px`,
                  }}
                />
                
                <img
                  src={building}
                  className="absolute w-24 transform -scale-y-100 top-0 transition-all duration-75"
                  style={{
                    height: `${buildingHeight}px`,
                    right: `${buildingPos}px`,
                  }}
                />

                {isOver && (
                  <img
                    src={boom}
                    alt="explosion"
                    className="absolute z-30 h-32 w-32"
                    style={{
                      top: `${planePosFromTop - 30}px`,
                      left: "40px"
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              {!isVideoOn && (
                <button
                  onClick={() => setIsVideoOn(true)}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-300"
                >
                  🖐 Gesture Control
                </button>
              )}
              
              {!isStarted && !isOver && (
                <button
                  onClick={() => setIsStarted(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg shadow-lg transition-all duration-300"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;