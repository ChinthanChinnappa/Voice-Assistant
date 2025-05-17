const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const statusEl = document.querySelector('.status');

// Responses
const responses = {
    greetings: [
        'I am good, how are you?',
        'I am fine, thank you!',
        'I am doing well, how about you?',
        'I am great, thanks for asking!'
    ],
    weather: [
        'The weather is nice today',
        'It is sunny outside, perfect day to go out!',
        'It is raining today, better take an umbrella',
        'It is cloudy today, but no rain expected'
    ],
    jokes: [
        'Why don\'t scientists trust atoms? Because they make up everything!',
        'Did you hear about the mathematician who\'s afraid of negative numbers? He will stop at nothing to avoid them!',
        'Why don\'t skeletons fight each other? They don\'t have the guts!',
        'I invented a new word yesterday: Plagiarism!'
    ],
    farewell: [
        'Goodbye! Have a great day!',
        'See you later!',
        'Bye bye! Come back soon!',
        'Farewell, my friend!'
    ],
    name: [
        'I am your voice assistant!',
        'You can call me VA, short for Voice Assistant',
        'I\'m your personal digital assistant',
        'I don\'t have a name yet, what would you like to call me?'
    ],
    time: function() {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}`;
    },
    date: function() {
        const now = new Date();
        return `Today is ${now.toLocaleDateString()}`;
    },
    default: [
        "I didn't quite catch that. Could you repeat?",
        "I'm not sure I understand. Can you try again?",
        "Sorry, I didn't get that.",
        "Could you say that differently?"
    ]
};

// Check if the browser supports the Speech API
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    content.textContent = 'Speech API not supported - please use Chrome, Edge, or Safari';
    btn.disabled = true;
    statusEl.textContent = 'API not supported';
}

// Check speech synthesis support
if (!('speechSynthesis' in window)) {
    content.textContent += '\n\nSpeech synthesis not supported - voice responses disabled';
    statusEl.textContent = 'Speech synthesis not supported';
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

// Speech synthesis setup
let voices = [];

function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log('Voices loaded:', voices);
}

// Load voices when they change
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices(); // Load immediately if available

recognition.onstart = function() {
    statusEl.textContent = 'Listening...';
    btn.classList.add('listening');
    if (content.textContent === 'Conversation will appear here...') {
        content.textContent = 'Listening...';
    } else {
        content.textContent += '\n\nListening...';
    }
};

recognition.onend = function() {
    statusEl.textContent = 'Ready';
    btn.classList.remove('listening');
};

recognition.onerror = function(event) {
    console.error('Recognition error:', event.error);
    statusEl.textContent = 'Error: ' + event.error;
    btn.classList.remove('listening');
    content.textContent += `\nError: ${event.error}`;
};

recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    content.textContent += `\nYou: ${transcript}`;
    processCommand(transcript);
};

btn.addEventListener('click', () => {
    try {
        if (content.textContent === 'Conversation will appear here...') {
            content.textContent = 'Starting...';
        }
        statusEl.textContent = 'Starting...';
        recognition.start();
    } catch (err) {
        console.error('Recognition error:', err);
        statusEl.textContent = 'Error starting recognition';
        content.textContent += '\nError starting recognition';
    }
});

function processCommand(message) {
    let response;
    
    if (message.includes('hello') || message.includes('hi')) {
        response = "Hello there! How can I help you today?";
    } 
    else if (message.includes('how are you')) {
        response = responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    else if (message.includes('weather')) {
        response = responses.weather[Math.floor(Math.random() * responses.weather.length)];
    }
    else if (message.includes('joke')) {
        response = responses.jokes[Math.floor(Math.random() * responses.jokes.length)];
    }
    else if (message.includes('time') && !message.includes('sometime')) {
        response = responses.time();
    }
    else if (message.includes('date')) {
        response = responses.date();
    }
    else if (message.includes('name')) {
        response = responses.name[Math.floor(Math.random() * responses.name.length)];
    }
    else if (message.includes('goodbye') || message.includes('bye')) {
        response = responses.farewell[Math.floor(Math.random() * responses.farewell.length)];
    }
    else {
        response = responses.default[Math.floor(Math.random() * responses.default.length)];
    }
    
    content.textContent += `\nAssistant: ${response}`;
    content.scrollTop = content.scrollHeight;
    
    speak(response);
}

function speak(message) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    
    // Wait for voices to be loaded if not available yet
    if (voices.length === 0) {
        voices = window.speechSynthesis.getVoices();
    }
    
    if (voices.length > 0) {
        // Prefer English voices
        const englishVoices = voices.filter(voice => voice.lang.includes('en'));
        if (englishVoices.length > 0) {
            speech.voice = englishVoices[0]; // Use first English voice
        } else {
            speech.voice = voices[0]; // Fallback to first available voice
        }
    }
    
    // Error handling 
    speech.onerror = function(event) {
        console.error('Speech synthesis error:', event);
        content.textContent += `\nError: Could not speak the response`;
    };
    
    window.speechSynthesis.speak(speech);
}