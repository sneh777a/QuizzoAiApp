import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import io from "socket.io-client";

const WaitingRoom = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizData, setQuizData] = useState(location.state?.quizData || null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Calculate time remaining until quiz starts
  const calculateTimeRemaining = (scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // Initialize socket connection and event listeners
  useEffect(() => {
    if (!quizId || !user) return;

    console.log("Initializing socket connection...");

    // Connect to socket server
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { token: localStorage.getItem("token") },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Connected to socket server with ID:", newSocket.id);

      // Join quiz room
      newSocket.emit("join-quiz-room", {
        quizId,
        userId: user._id,
        username: user.username,
      });
    });

    // Listen for connection acknowledgment
    newSocket.on("connection_acknowledged", (data) => {
      console.log("Connection acknowledged by server:", data);
    });

    newSocket.on("joined-quiz-room", (data) => {
      if (data.success) {
        console.log(`Successfully joined quiz room: ${data.quizId}`);
      }
    });

    // Add this new event listener for the complete participants list
    newSocket.on("participants-updated", (data) => {
      console.log("Received updated participants list:", data.participants);
      setParticipants(data.participants);
    });

    // Keep the existing user-joined event for backward compatibility
    newSocket.on("user-joined", (data) => {
      console.log(`${data.username} joined the quiz room`);
      setParticipants((prev) => {
        // Check if user already exists in the list
        const existingIndex = prev.findIndex((p) => p.userId === data.userId);

        if (existingIndex !== -1) {
          // Update existing participant
          const updatedParticipants = [...prev];
          updatedParticipants[existingIndex] = {
            userId: data.userId,
            username: data.username,
            joinedAt: data.timestamp,
            status: "waiting",
          };
          return updatedParticipants;
        } else {
          // Add new participant
          return [
            ...prev,
            {
              userId: data.userId,
              username: data.username,
              joinedAt: data.timestamp,
              status: "waiting",
            },
          ];
        }
      });
    });

    newSocket.on("user-left", (data) => {
      console.log(`${data.username} left the quiz room`);
      setParticipants((prev) => {
        return prev.map((p) => {
          if (p.userId === data.userId) {
            return { ...p, status: "left" };
          }
          return p;
        });
      });
    });

    newSocket.on("quiz-started", (data) => {
      console.log("Quiz started:", data);
      // Navigate to active quiz page
      navigate(`/quizzes/active/${quizId}`);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError(
        `Failed to connect to the quiz server: ${err.message}. Please try again.`
      );
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
      setError(`Socket error: ${err.message}. Please try again.`);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        newSocket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.emit("leave-quiz-room", {
          quizId,
          userId: user._id,
          username: user.username,
        });
        newSocket.disconnect();
      }
    };
  }, [quizId, user, navigate]);

  // Update countdown timer
  useEffect(() => {
    if (!quizData?.scheduledFor) return;

    const timer = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(quizData.scheduledFor);
      setCountdown(timeRemaining);

      // If countdown reaches zero, clear interval
      if (
        timeRemaining.hours === 0 &&
        timeRemaining.minutes === 0 &&
        timeRemaining.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData]);

  // Initialize participants from quizData
  useEffect(() => {
    if (quizData?.participants) {
      setParticipants(quizData.participants);
    }
  }, [quizData]);

  // Handle leaving the waiting room
  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave-quiz-room", {
        quizId,
        userId: user._id,
        username: user.username,
      });
    }
    navigate("/quizzes");
  };

  if (!quizData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-primary theme-transition">
          Quiz information not available
        </h2>
        <p className="mt-2 text-secondary theme-transition">
          {error || "Unable to load quiz data. Please try joining again."}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/quizzes/join")}
            className="modern-button"
          >
            Back to Join Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="modern-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-primary theme-transition">
              Waiting Room
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary theme-transition">
              Waiting for the quiz to start
            </p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="modern-button-secondary text-xs px-3 py-1.5"
          >
            Leave Room
          </button>
        </div>
        <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
          <dl>
            <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Quiz Title
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                {quizData.title}
              </dd>
            </div>
            <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Creator
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                {quizData.creator?.username || "Unknown"}
              </dd>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Category
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                {quizData.category}
                {quizData.topicName && ` - ${quizData.topicName}`}
              </dd>
            </div>
            <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Difficulty
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quizData.difficulty === "easy"
                      ? "bg-success-light dark:bg-success-dark text-success-light dark:text-success-dark"
                      : quizData.difficulty === "medium"
                      ? "bg-warning-light dark:bg-warning-dark text-warning-light dark:text-warning-dark"
                      : "bg-error-light dark:bg-error-dark text-error-light dark:text-error-dark"
                  } theme-transition`}
                >
                  {quizData.difficulty.charAt(0).toUpperCase() +
                    quizData.difficulty.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Scheduled Start Time
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                {formatDate(quizData.scheduledFor)}
              </dd>
            </div>
            <div className="bg-card px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 theme-transition">
              <dt className="text-sm font-medium text-secondary theme-transition">
                Time Remaining
              </dt>
              <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2 theme-transition">
                {countdown ? (
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <span className="text-2xl font-bold">
                        {countdown.hours.toString().padStart(2, "0")}
                      </span>
                      <p className="text-xs">Hours</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">:</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">
                        {countdown.minutes.toString().padStart(2, "0")}
                      </span>
                      <p className="text-xs">Minutes</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">:</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">
                        {countdown.seconds.toString().padStart(2, "0")}
                      </span>
                      <p className="text-xs">Seconds</p>
                    </div>
                  </div>
                ) : (
                  "Calculating..."
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 modern-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-primary theme-transition">
            Participants (
            {participants.filter((p) => p.status !== "left").length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-secondary theme-transition">
            People who have joined this quiz
          </p>
        </div>
        <div className="border-t border-primary-100 dark:border-primary-800 theme-transition">
          <div className="divide-y divide-primary-100 dark:divide-primary-800 theme-transition">
            {participants.filter((p) => p.status !== "left").length > 0 ? (
              participants
                .filter((p) => p.status !== "left")
                .map((participant, index) => (
                  <div
                    key={participant.userId || index}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center theme-transition">
                        <span className="text-primary-600 dark:text-primary-400 font-medium theme-transition">
                          {participant.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary theme-transition">
                          {participant.username}
                        </div>
                        {participant.joinedAt && (
                          <div className="text-xs text-secondary theme-transition">
                            Joined{" "}
                            {new Date(
                              participant.joinedAt
                            ).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {participant.status && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light dark:bg-success-dark text-success-light dark:text-success-dark theme-transition">
                        {participant.status}
                      </span>
                    )}
                  </div>
                ))
            ) : (
              <div className="px-4 py-5 text-center text-sm text-secondary theme-transition">
                No participants have joined yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-secondary theme-transition">
          The quiz will start automatically at the scheduled time.
          <br />
          You will be automatically redirected when the quiz begins.
        </p>
      </div>
    </div>
  );
};

export default WaitingRoom;
