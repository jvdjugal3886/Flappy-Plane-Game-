import { useEffect, useRef, useState } from "react";
import ml5 from "ml5";

const Video = ({ isVideoOn, setIsVideoOn, setFist }) => {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState("None");
  const [classifier, setClassifier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVidStarted, setIsVidStarted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      try {
        const loadedClassifier = await ml5.imageClassifier(
          "https://teachablemachine.withgoogle.com/models/ETTQOlXEO/model.json",
          modelLoaded
        );
        setClassifier(loadedClassifier);
      } catch (error) {
        console.error("Model loading failed:", error);
        setLoading(false);
      }
    };

    const modelLoaded = () => {
      console.log("Model Loaded");
      setLoading(false);
      if (isVideoOn) {
        startVideo();
      }
    };
    loadModel();
  }, [isVideoOn, isVidStarted]);

  useEffect(() => {
    if (isVideoOn) {
      startVideo();
    } else {
      stopVideo();
    }
  }, [isVideoOn]);

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              setIsVidStarted(true);
              classifyGesture();
            };
          }
        })
        .catch((error) => {
          console.error("Error accessing camera: ", error);
        });
    }
  };
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    window.location.reload();
  };

  const classifyGesture = () => {
    if (classifier && videoRef.current && isVideoOn) {
      classifier.classify(videoRef.current, (results, error) => {
        if (error) {
          console.error("Classification error:", error);
          return;
        }
        setGesture(results[0].label);
        if (results[0].label === "Fist") {
          setFist(true);
        } else {
          setFist(false);
        }
        setResult(results);
        setTimeout(() => classifyGesture(), 30);
      });
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center mt-10 gap-4">
      <div className="relative">
        <video
          ref={videoRef}
          width={500}
          height={480}
          className="border-2 border-cyan-600 rounded-xl"
          autoPlay
          muted
        />
        <div className="absolute h-24 w-48 border-[3px] border-green-400 top-4 left-4 p-1">
          {loading && !result ? (
            <h2 className="text-lg font-semibold text-green-500">Please wait. <br /> Loading...</h2>
          ) : result ? (
            <>
              <h1 className="text-sm font-semibold text-green-500">
                Gesture: {gesture}
              </h1>
              <h1 className="text-sm font-semibold text-green-500">
                Confidence: {result[0]?.confidence?.toFixed(2)}
              </h1>
              <h1 className="text-sm font-semibold text-red-500">
                Gesture: {result[1]?.label}
              </h1>
              <h1 className="text-sm font-semibold text-red-500">
                Confidence: {result[1]?.confidence?.toFixed(2)}
              </h1>
            </>
          ) : <></>
        
        }
        </div>
      </div>
      {isVideoOn && (
        <button
          className="mt-4 px-3 py-2 outline-rose-500 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg shadow-md outline"
          onClick={() => {setIsVideoOn(false); stopVideo()}}
        >
          Close Gesture controll
        </button>
      )}
    </div>
  );
};

export default Video;
