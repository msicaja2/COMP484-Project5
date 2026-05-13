///////////////////////// Variables /////////////////////////
/// Document elements
const startButton = document.querySelector("#start-button");
const quizContainer = document.querySelector(".quiz");
const timerDisplay = document.querySelector(".timer");
const stopButton = document.querySelector("#stop-button");

/// Define bounds
// Location 1: Woman's Research and Resource Center 
const loc1 = {
  name: "Women's Research and Resource",
  bounds: {
    north: 34.24432942996547,
    south: 34.24411874508262,
    west: -118.53399021939225,
    east: -118.53361355759611
  }
}

const loc2 = {
  name: "Jacaranda Hall",
  bounds: {
    north: 34.24207461838455,
    south: 34.24104254491749,
    west: -118.52945388411068,
    east: -118.52785341689871
  }
}

const loc3 = {
  name: "Student Recreation Center",
  bounds: {
    north: 34.24058416119741,
    south: 34.23933297388565,
    west: -118.52517998352053,
    east: -118.52472859079069
  }
}

const loc4 = {
  name: "Extended University Commons",
  bounds: {
    north: 34.240635190659624,
    south: 34.24045336914606,
    west: -118.5329532643481,
    east: -118.53248924220671
  }
}

const loc5 = {
  name: "Chaparral Hall",
  bounds: {
    north: 34.23857419677142,
    south: 34.237904413150424,
    west: -118.52722630676323,
    east: -118.52672871326381
  }
}


/// Locations array
let locations = [loc1, loc2, loc3, loc4, loc5];

/// Time elements
var minute = 0;
var second = 0;
var centisecond = 0;
let intervalID = null;

/// Other Variables
let totalCorrect = 0;
let totalWrong = 0;
let quizSteps = 0; // Functions as the current index for dynamic arrays
let resultMarkers = [];
let resultBoxes = [];
let quizArray = [];
let map;
let quizStarted = false;


//////////////////////// Set up for google maps ////////////////////////
window.initMap = function () {
  const location = { lat: 34.24225429874695, lng: -118.53080817365723 };

  map = new google.maps.Map(document.getElementById("google-map"), {
    center: location,
    zoom: 15.5,
    mapId: "89a275c8ff85fb505f75c2c4",


    // Disable panning and zooming
    zoomControl: false,
    draggable: false,

    // Disable other controls
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    cameraControl: false
  });

  map.addListener("dblclick", function (event) {
    if (quizStarted && quizSteps <= 4) { // Keep checking user input
      // Check if correct and update values to variables
      const guessedRight = checkGuess(event.latLng, quizArray[quizSteps]);

      if (guessedRight) { // If the guess is right, shoot confetti at mouse location
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            // domEvent allows to detection of current mouse location
            x: event.domEvent.clientX / window.innerWidth,
            y: event.domEvent.clientY / window.innerHeight
          }
        });
      }
    }
    else if (quizStarted && quizSteps == 5) { // End quiz and give final result
      endQuiz();
    }
  });
};

// Action listener for the start button
startButton.addEventListener("click", startQuiz);

//////////////////////// Functionality for quiz ////////////////////////

// Start/Restart button Functionality
function startQuiz() {
  // Indicate the quiz has started to enable Listener
  quizStarted = true;
  // Reset everything
  resetQuiz();
  // Start/restart timer
  intervalID = setInterval(updateTimer, 10);
  // Randomize the questions
  quizArray = shuffleArray(locations);
  // Add new question
  addQuestion();
}

// Reset Everything function
function resetQuiz() {
  // Set button text
  startButton.textContent = "Start Over";

  // Remove question and results divs
  const questionsToRemove = document.querySelectorAll(".added-to-quiz");
  questionsToRemove.forEach(div => {
    div.remove();
  });

  // Remove markers and boxes
  for (let i = 0; i < resultMarkers.length; ++i) {
    if (resultMarkers[i]) {
      resultMarkers[i].map = null;
    }
  }

  for (let i = 0; i < resultBoxes.length; ++i) {
    if (resultBoxes[i]) {
      resultBoxes[i].setMap(null);
    }
  }

  // Clear and null intervalID so timer doesn't go faster
  clearInterval(intervalID);
  intervalID = null;

  // Reset values
  totalCorrect = 0;
  totalWrong = 0;
  quizSteps = 0;
  minute = 0;
  second = 0;
  centisecond = 0;
  resultMarkers = [];
  resultBoxes = [];
}

// End quiz and give final results
function endQuiz() {
  const resultsDiv = document.createElement("div");

  // Customize div
  resultsDiv.style.whiteSpace = "pre-line"; // Allows line breaks
  resultsDiv.textContent = "RESULTS:\n" + "Questions Correct: " + totalCorrect + "\nQuestions Wrong: " + totalWrong;
  resultsDiv.style.fontSize = "1.8em";
  resultsDiv.style.backgroundColor = "#536878";
  resultsDiv.style.borderRadius = "0.4em";
  resultsDiv.style.padding = "0.2em";
  resultsDiv.style.marginTop = "0.5em";

  // Add class for removal later and add to document
  resultsDiv.classList.add("added-to-quiz");
  quizContainer.appendChild(resultsDiv);

  // Clear and null intervalID so timer doesn't go faster
  clearInterval(intervalID);
  intervalID = null;

  // If got all correct, shoot mega confetti
  if (totalCorrect == 5) {
    // Trigger confetti effect
    confetti({
        particleCount: 1000,
        spread: 200,
        origin: { y: 0.6 },
    });
  }

  quizStarted = false; // remove listener functionalities from map
}

// Add a question
function addQuestion() {
  // Create and edit div
  const questionDiv = document.createElement("div");
  questionDiv.textContent = "Where is " + String(quizArray[quizSteps].name) + "?";
  questionDiv.style.paddingTop = "1em";
  questionDiv.classList.add("added-to-quiz"); // Useful for removal

  // Append to the quiz container
  quizContainer.appendChild(questionDiv);
}

// Display the result of the user's selection
function giveAnswer(answer) {
  const answerDiv = document.createElement("div");
  answerDiv.style.paddingTop = "1em";
  if (answer) { // If answer is correct, say it is correct
    answerDiv.textContent = "Correct!";
    answerDiv.style.color = "green";
  }
  else {
    answerDiv.textContent = "Wrong!";
    answerDiv.style.color = "red";
  }
  answerDiv.classList.add("added-to-quiz"); // Useful for removal

  // Append to the quiz container
  quizContainer.appendChild(answerDiv);
}

// Check guess function
function checkGuess(clickedLoc, currLocation) {
  ++quizSteps;
  const bounds = new google.maps.LatLngBounds(
    { lat: currLocation.bounds.south, lng: currLocation.bounds.west },
    { lat: currLocation.bounds.north, lng: currLocation.bounds.east }
  );

  // Have result as a boolean
  const guessedCorrectly = bounds.contains(clickedLoc);

  // Display the marker and update the quiz
  if (guessedCorrectly) {
    // Add pin marker and box to the map
    createPin(clickedLoc, true);
    drawBox(currLocation.bounds,"#32cd32");

    // Update, give result
    giveAnswer(true);
    ++totalCorrect;

    if (quizSteps == 5) { // If reached the final question, end quiz
      endQuiz();
    }
    else { // If still more questions left, add another question
      addQuestion();
    }
  }
  else {
    // Add pin marker and box to the map
    createPin(clickedLoc, false);
    drawBox(currLocation.bounds, "red");


    // Update, give result
    giveAnswer(false);
    ++totalWrong;


    if (quizSteps == 5) { // If reached the final question, end quiz
      endQuiz();
    }
    else { // If still more questions left, add another question
      addQuestion();
    }
  }

  return guessedCorrectly;
}

/// Draw box function
function drawBox(bounds, color) {
  resultBoxes[quizSteps] = new google.maps.Rectangle({
    bounds: bounds,
    strokeColor: color,
    strokeOpacity: 1,
    strokeWeight: 0.5,
    fillColor: color,
    fillOpacity: 0.25,
    map: map
  });
}

/// Create pin marker function
function createPin(clickedLoc, answer) {

  if (answer) { // If answer is correct, color pin marker green
    const pin = new google.maps.marker.PinElement({
      background: "#32cd32",
      borderColor: "#137333",
      glyphColor: "white",
    });

    resultMarkers[quizSteps] = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: clickedLoc,
      title: "Correct!",
      content: pin.element
    });
  }
  else { // If answer is incorrect, keep red pin
    resultMarkers[quizSteps] = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: clickedLoc,
      title: "Correct!"
    });
  }
}


//////////////////////// Misc functions ////////////////////////

// Shuffle array function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

/// Timer functions

// Fix leading zeros issues
function fixTimeFormat(time) {
    if (time < 10) {
        return "0" + time;
    }
    else {
        return time;
    }
}

// Update timer
function updateTimer() {
  // Increment centisecond
  ++centisecond;

  // Update seconds/minute and do a reset if needed
  if (centisecond == 99) {
      ++second;
      centisecond = 0;
  }
  if (second == 60) {
      ++minute;
      second = 0;
  }

  // Update timer display
  timerDisplay.textContent = fixTimeFormat(minute) 
                            + ":" + fixTimeFormat(second) 
                            + ":" + fixTimeFormat(centisecond);
}

/// Stop button

function stopQuiz() {
  // Clear and null intervalID so timer doesn't go faster
  clearInterval(intervalID);
  intervalID = null;

  // Set quiz started to false so map interaction can stop
  quizStarted = false;
}

// Add event listener to stop button
stopButton.addEventListener("click", stopQuiz);


//////// Resizing for CSS changes
/*
// Resize function
function resizeMap() {
  google.maps.event.trigger(map, "resize");
  map.setCenter(location);
}

// Resive function call
resizeMap(); */