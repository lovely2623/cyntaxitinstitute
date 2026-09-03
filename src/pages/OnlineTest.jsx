import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Comprehensive 50-Question Engine categorized strictly by Course
const questionBank = {
  DCA: [
    { id: 1, q: "Full form of Computer is?", o: ["Common Operating Machine Purposely Used for Technological and Educational Research", "Central Operating Machine Unit", "Common Optical Machine Unit", "Control Output Memory Unit"], a: 0 },
    { id: 2, q: "Which of the following is known as the Brain of Computer?", o: ["RAM", "CPU", "Hard Disk", "Monitor"], a: 1 },
    { id: 3, q: "1 Byte is equal to how many bits?", o: ["4 bits", "8 bits", "16 bits", "32 bits"], a: 1 },
    { id: 4, q: "Which memory is volatile and temporary?", o: ["ROM", "RAM", "Hard Disk", "Pen Drive"], a: 1 },
    { id: 5, q: "Shortcut key to cut selected text in Windows is?", o: ["Ctrl + C", "Ctrl + X", "Ctrl + Z", "Ctrl + V"], a: 1 },
    { id: 6, q: "Full form of GUI is?", o: ["Graphical User Interface", "General User Index", "Global Unit Interface", "Guidance User Info"], a: 0 },
    { id: 7, q: "What is the file extension of Microsoft Word 2016?", o: [".txt", ".docx", ".xlsx", ".pptx"], a: 1 },
    { id: 8, q: "Which of the following is an Operating System?", o: ["MS Excel", "Windows 10", "Google Chrome", "Adobe Reader"], a: 1 },
    { id: 9, q: "Shortcut key for undo action is?", o: ["Ctrl + Y", "Ctrl + U", "Ctrl + Z", "Ctrl + W"], a: 2 },
    { id: 10, q: "In MS Excel, rows are numbered as?", o: ["A, B, C...", "1, 2, 3...", "I, II, III...", "None"], a: 1 },
    { id: 11, q: "Full form of ROM is?", o: ["Read Only Memory", "Random Output Memory", "Real Online Memory", "Run Only Memory"], a: 0 },
    { id: 12, q: "Which device is primarily an input device?", o: ["Speaker", "Keyboard", "Plotter", "Monitor"], a: 1 },
    { id: 13, q: "What is the shortcut to print a document?", o: ["Ctrl + P", "Ctrl + Prt", "Alt + P", "Shift + P"], a: 0 },
    { id: 14, q: "In MS Word, which alignment distributes text evenly between margins?", o: ["Left", "Right", "Center", "Justify"], a: 3 },
    { id: 15, q: "The intersection of a row and a column in Excel is called a?", o: ["Box", "Cell", "Block", "Sheet"], a: 1 },
    { id: 16, q: "Full form of HTTP is?", o: ["HyperText Transfer Protocol", "High Transfer Text Program", "Hyper Terminal Tracking Path", "None"], a: 0 },
    { id: 17, q: "Which key is used to refresh active window?", o: ["F2", "F5", "F7", "F12"], a: 1 },
    { id: 18, q: "Which protocol is used for sending emails?", o: ["FTP", "SMTP", "HTTP", "IP"], a: 1 },
    { id: 19, q: "Which key moves cursor to the beginning of next line?", o: ["Shift", "Enter", "Spacebar", "Tab"], a: 1 },
    { id: 20, q: "Full form of URL is?", o: ["Uniform Resource Locator", "Universal Radio Link", "United Resource List", "None"], a: 0 },
    { id: 21, q: "Which function in Excel calculates the total sum?", o: ["TOTAL()", "ADD()", "SUM()", "COUNT()"], a: 2 },
    { id: 22, q: "Shortcut key to save as in MS Office is?", o: ["F12", "Ctrl + S", "Alt + S", "F2"], a: 0 },
    { id: 23, q: "Which shortcut selects all items in a folder or doc?", o: ["Ctrl + L", "Ctrl + A", "Ctrl + Shift + A", "Alt + A"], a: 1 },
    { id: 24, q: "Smallest unit of digital storage is?", o: ["Byte", "Bit", "Nibble", "KB"], a: 1 },
    { id: 25, q: "Full form of LAN is?", o: ["Local Area Network", "Line Access Node", "Large Area Network", "Live Access Net"], a: 0 },
    { id: 26, q: "Which key deletes characters to the left of cursor?", o: ["Delete", "Backspace", "Insert", "Escape"], a: 1 },
    { id: 27, q: "Which tab in MS Word contains Header & Footer options?", o: ["Home", "Insert", "Review", "View"], a: 1 },
    { id: 28, q: "In Excel, all formulas must begin with which symbol?", o: ["+", "=", "@", "#"], a: 1 },
    { id: 29, q: "Full form of ALU is?", o: ["Arithmetic Logic Unit", "Array Line Unit", "Access Link Utility", "None"], a: 0 },
    { id: 30, q: "Which printer uses ink spraying nozzles?", o: ["Dot Matrix", "Laser", "Inkjet", "Thermal"], a: 2 },
    { id: 31, q: "Which of the following is permanent secondary memory?", o: ["RAM", "Hard Disk Drive", "Cache", "Register"], a: 1 },
    { id: 32, q: "Shortcut key to open Run dialog box in Windows?", o: ["Win + R", "Win + E", "Alt + R", "Ctrl + R"], a: 0 },
    { id: 33, q: "Which key helps to exit full screen or cancel operations?", o: ["Enter", "Esc", "Tab", "Alt"], a: 1 },
    { id: 34, q: "Default orientation of MS Word page is?", o: ["Landscape", "Portrait", "Square", "Horizontal"], a: 1 },
    { id: 35, q: "Which function key checks spelling and grammar in Word?", o: ["F1", "F5", "F7", "F9"], a: 2 },
    { id: 36, q: "1 Kilobyte (KB) is equal to?", o: ["1000 Bytes", "1024 Bytes", "1048 Bytes", "512 Bytes"], a: 1 },
    { id: 37, q: "Full form of PDF is?", o: ["Portable Document Format", "Public Data File", "Personal Document Form", "Print Doc Format"], a: 0 },
    { id: 38, q: "Shortcut key to close the current active window?", o: ["Alt + F4", "Ctrl + W", "Both A and B", "Ctrl + Q"], a: 2 },
    { id: 39, q: "Which key activates uppercase letters permanently until toggled?", o: ["Shift", "Caps Lock", "Num Lock", "Ctrl"], a: 1 },
    { id: 40, q: "Which chart is best for showing proportions in Excel?", o: ["Bar Chart", "Pie Chart", "Line Chart", "Scatter"], a: 1 },
    { id: 41, q: "Full form of SSD is?", o: ["Solid State Drive", "System Storage Disk", "Secure Serial Drive", "Single State Drive"], a: 0 },
    { id: 42, q: "WWW stands for?", o: ["World Wide Web", "World Wide Waves", "Wide World Web", "World Web Wide"], a: 0 },
    { id: 43, q: "Which part of MS Excel holds sheets name tab?", o: ["Top Ribbon", "Bottom Left", "Right Margin", "Status Bar Top"], a: 1 },
    { id: 44, q: "Which software is used for presentation?", o: ["MS Word", "MS Excel", "MS PowerPoint", "MS Access"], a: 2 },
    { id: 45, q: "Shortcut key to start PowerPoint Slide Show from beginning?", o: ["F2", "F5", "Shift + F5", "F7"], a: 1 },
    { id: 46, q: "Which shortcut inserts a new slide in PowerPoint?", o: ["Ctrl + N", "Ctrl + M", "Ctrl + S", "Alt + N"], a: 1 },
    { id: 47, q: "Full form of IP address is?", o: ["Internet Protocol", "Internal Path", "Interface Port", "Interlink Program"], a: 0 },
    { id: 48, q: "Which protocol is used for secure browsing?", o: ["HTTP", "HTTPS", "FTP", "TELNET"], a: 1 },
    { id: 49, q: "Shortcut key to lock Windows screen instantly?", o: ["Win + L", "Win + D", "Ctrl + Alt + L", "Alt + L"], a: 0 },
    { id: 50, q: "Which folder stores deleted files in Windows?", o: ["Downloads", "Documents", "Recycle Bin", "Temp"], a: 2 }
  ],
  Steno: [
    { id: 1, q: "Pitman Shorthand system is primarily based on?", o: ["Alphabetical spelling", "Phonetics / Sounds", "Grammar syntax", "Latin characters"], a: 1 },
    { id: 2, q: "How many consonant sounds are recognized in Pitman Shorthand?", o: ["20", "24", "26", "28"], a: 1 },
    { id: 3, q: "Strokes in Pitman Shorthand are distinguished by?", o: ["Thickness and Direction", "Color only", "Size only", "Font family"], a: 0 },
    { id: 4, q: "Light strokes represent which type of sounds?", o: ["Voiced consonants", "Unvoiced / Light consonants", "Heavy vowels", "Diphthongs"], a: 1 },
    { id: 5, q: "Heavy strokes represent which type of sounds?", o: ["Light consonants", "Voiced / Heavy consonants", "Silent letters", "Punctuation"], a: 1 },
    { id: 6, q: "How many vowels are there in Pitman Shorthand?", o: ["5", "10", "12", "14"], a: 2 },
    { id: 7, q: "How many diphthongs are there in Shorthand?", o: ["2", "4", "6", "8"], a: 1 },
    { id: 8, q: "Vowels in Shorthand are written using?", o: ["Dots and Dashes", "Circles and Hooks", "Curves and Waves", "Squares"], a: 0 },
    { id: 9, q: "The sign for 'I' diphthong is written as?", o: ["Small upward arrow / tick", "Angular sign pointing downwards", "Semi circle", "Heavy dash"], a: 1 },
    { id: 10, q: "First position vowel is placed at which part of the stroke?", o: ["Beginning", "Middle", "End", "Below the line"], a: 0 },
    { id: 11, q: "Second position vowel is placed at which part of stroke?", o: ["Beginning", "Middle", "End", "None"], a: 1 },
    { id: 12, q: "Third position vowel is placed at which part of stroke?", o: ["Beginning", "Middle", "End", "Centre"], a: 2 },
    { id: 13, q: "The stroke for 'P' is written in which direction?", o: ["Downward at 60 degrees", "Upward at 30 degrees", "Horizontal", "Vertical"], a: 0 },
    { id: 14, q: "The stroke for 'B' is?", o: ["Light downward", "Heavy downward at 60 degrees", "Horizontal light", "Vertical heavy"], a: 1 },
    { id: 15, q: "The stroke for 'T' is written as?", o: ["Light horizontal", "Light vertical downward", "Heavy vertical", "Light curve"], a: 1 },
    { id: 16, q: "The stroke for 'D' is?", o: ["Heavy vertical downward", "Light vertical", "Horizontal heavy", "Slanting"], a: 0 },
    { id: 17, q: "Horizontal strokes are written in which direction?", o: ["Right to Left", "Left to Right", "Top to Bottom", "Bottom to Top"], a: 1 },
    { id: 18, q: "The stroke for 'K' is written as?", o: ["Light horizontal line", "Heavy horizontal line", "Light vertical", "Slant line"], a: 0 },
    { id: 19, q: "The stroke for 'G' (Gay) is written as?", o: ["Light horizontal line", "Heavy horizontal line", "Curved line", "Upward line"], a: 1 },
    { id: 20, q: "The stroke for 'Ch' (Chay) is inclined at?", o: ["30 degrees from vertical", "60 degrees from vertical", "90 degrees", "45 degrees"], a: 0 },
    { id: 21, q: "Grammalogues in shorthand refer to?", o: ["Frequently occurring words represented by single signs", "Numbers", "Sentences", "Punctuation only"], a: 0 },
    { id: 22, q: "Circle 'S' is written in which direction to straight strokes?", o: ["Left motion (anti-clockwise)", "Right motion (clockwise)", "Any direction", "Vertical only"], a: 0 },
    { id: 23, q: "To curve strokes, Circle 'S' is written?", o: ["Outside the curve", "Inside the curve", "At the bottom only", "None"], a: 1 },
    { id: 24, q: "Large initial circle represents?", o: ["SW (Sway)", "SS / SZ", "ST loop", "STR loop"], a: 0 },
    { id: 25, q: "A small loop at beginning or end of stroke represents?", o: ["SS", "ST sound", "STR sound", "Diphthong"], a: 1 },
    { id: 26, q: "A large loop representing 'STR' occupies how much space?", o: ["One third length", "Two thirds of stroke length", "Full length", "Half length"], a: 1 },
    { id: 27, q: "Small initial hook to straight strokes written with right motion represents?", o: ["L", "R", "N", "F"], a: 1 },
    { id: 28, q: "Small initial hook written with left motion to straight strokes represents?", o: ["L", "R", "W", "Y"], a: 0 },
    { id: 29, q: "Final small hook on the right side of straight stroke represents?", o: ["N hook", "F / V hook", "Shon hook", "Circle S"], a: 0 },
    { id: 30, q: "Final hook on the left side of straight stroke represents?", o: ["N hook", "F or V hook", "L hook", "R hook"], a: 1 },
    { id: 31, q: "The large final hook in Pitman shorthand represents?", o: ["-TION / -SION sound", "-ING", "-LY", "-NESS"], a: 0 },
    { id: 32, q: "Halving principle in shorthand adds which consonants?", o: ["T or D", "P or B", "K or G", "M or N"], a: 0 },
    { id: 33, q: "Doubling principle in shorthand adds which sounds?", o: ["Tr, Dr, Thr", "Pl, Bl", "Sp, St", "None"], a: 0 },
    { id: 34, q: "The stroke for 'M' is a?", o: ["Light horizontal curve", "Heavy horizontal curve", "Vertical stroke", "Slanting stroke"], a: 0 },
    { id: 35, q: "The stroke for 'N' is a?", o: ["Light horizontal curve (smiling curve)", "Vertical line", "Heavy curve", "Down stroke"], a: 0 },
    { id: 36, q: "The stroke for 'NG' is written as?", o: ["Heavy curve like N", "Light curve like N", "Straight line", "Hook"], a: 0 },
    { id: 37, q: "Stroke 'L' is normally written in which direction?", o: ["Upward", "Downward", "Leftward", "Only horizontal"], a: 0 },
    { id: 38, q: "Stroke 'R' has two forms: Ray and?", o: ["Ar (downward R)", "Er", "Re", "Or"], a: 0 },
    { id: 39, q: "When is downward 'Ar' used?", o: ["When preceded by a vowel", "When followed by a vowel", "At end always", "In middle always"], a: 0 },
    { id: 40, q: "Full stop in shorthand is denoted by?", o: ["A small cross (x)", "A dot (.)", "A colon (:)", "A dash (-)"], a: 0 },
    { id: 41, q: "Question mark in shorthand is indicated by?", o: ["Question mark with a small cross below", "Standard ?", "Double line", "Exclamation"], a: 0 },
    { id: 42, q: "Capital letters in shorthand are indicated by?", o: ["Two small slanting ticks beneath outline", "Circling outline", "Double stroke", "None"], a: 0 },
    { id: 43, q: "A phraseogram is?", o: ["Joining two or more word outlines without lifting pen", "Single letter", "Paragraph", "Punctuation"], a: 0 },
    { id: 44, q: "The word 'THE' when joined to a preceding word is written as?", o: ["A light slanted tick", "A dot", "A circle", "A loop"], a: 0 },
    { id: 45, q: "Standard speed requirement for Steno Grade D is typically?", o: ["80 WPM", "60 WPM", "120 WPM", "40 WPM"], a: 0 },
    { id: 46, q: "Standard speed requirement for Steno Grade C is typically?", o: ["100 WPM", "70 WPM", "50 WPM", "90 WPM"], a: 0 },
    { id: 47, q: "The upward stroke 'Hay' (H) is inclined at?", o: ["30 degrees", "60 degrees", "90 degrees", "45 degrees"], a: 0 },
    { id: 48, q: "Which consonant stroke is never halved?", o: ["MP / MB, NG", "T and D", "P and B", "Ch and J"], a: 0 },
    { id: 49, q: "The tick 'H' is joined initially to?", o: ["M, L, Ray", "K, G", "T, D", "P, B"], a: 0 },
    { id: 50, q: "Transcription means?", o: ["Converting shorthand outlines back into English/Hindi text", "Writing shorthand", "Typing test", "Reading signs"], a: 0 }
  ],
  "Short Term": [
    { id: 1, q: "HTML stands for?", o: ["HyperText Markup Language", "High Text Maker Line", "Hyperlink Transfer Mode", "None"], a: 0 },
    { id: 2, q: "Which tag is used for the largest heading in HTML?", o: ["<h6>", "<head>", "<h1>", "<heading>"], a: 2 },
    { id: 3, q: "What is CSS used for?", o: ["Styling and Designing Web Pages", "Database Storage", "Server Management", "Hardware setup"], a: 0 },
    { id: 4, q: "In CSS, what property changes the text color?", o: ["font-color", "color", "text-style", "background-color"], a: 1 },
    { id: 5, q: "Which HTML tag creates a hyperlink?", o: ["<a>", "<link>", "<href>", "<nav>"], a: 0 },
    { id: 6, q: "Which symbol denotes an ID selector in CSS?", o: [". (dot)", "# (hash)", "@ (at)", "* (asterisk)"], a: 1 },
    { id: 7, q: "Which symbol denotes a Class selector in CSS?", o: [". (dot)", "# (hash)", "$ (dollar)", "& (and)"], a: 0 },
    { id: 8, q: "JavaScript is mainly used for?", o: ["Page Interactivity & Logic", "Styling Colors", "Database Backup", "Hardware wiring"], a: 0 },
    { id: 9, q: "Which keyword declares a constant variable in modern JS?", o: ["var", "let", "const", "fixed"], a: 2 },
    { id: 10, q: "What does SQL stand for?", o: ["Structured Query Language", "Simple Quality Line", "Server Query Link", "Standard Queue Level"], a: 0 },
    { id: 11, q: "Which SQL command retrieves data from a database?", o: ["GET", "FETCH", "SELECT", "PULL"], a: 2 },
    { id: 12, q: "In SQL, which clause filters records?", o: ["WHERE", "ORDER BY", "GROUP BY", "LIMIT"], a: 0 },
    { id: 13, q: "Which HTML tag is used to insert an image?", o: ["<pic>", "<img>", "<src>", "<image>"], a: 1 },
    { id: 14, q: "What does API stand for?", o: ["Application Programming Interface", "Automated Program Index", "App Path Link", "None"], a: 0 },
    { id: 15, q: "Which format is widely used for sending data between server and web client?", o: ["JSON", "EXE", "BAT", "ZIP"], a: 0 },
    { id: 16, q: "What does Git do?", o: ["Version Control System", "Runs web server", "Designs images", "Antivirus protection"], a: 0 },
    { id: 17, q: "Which command records changes in Git repository?", o: ["git commit", "git push", "git init", "git status"], a: 0 },
    { id: 18, q: "What does CPU stand for?", o: ["Central Processing Unit", "Core Power Unit", "Central Program Utility", "None"], a: 0 },
    { id: 19, q: "Which HTML element contains meta information about the document?", o: ["<head>", "<body>", "<footer>", "<section>"], a: 0 },
    { id: 20, q: "Which CSS property controls text size?", o: ["font-size", "text-size", "size", "font-weight"], a: 0 },
    { id: 21, q: "How do you write a comment in HTML?", o: ["<!-- Comment -->", "// Comment", "/* Comment */", "# Comment"], a: 0 },
    { id: 22, q: "How do you write a single line comment in JavaScript?", o: ["// Comment", "<!-- Comment -->", "/* Comment */", "# Comment"], a: 0 },
    { id: 23, q: "What is the extension of a Python file?", o: [".py", ".pt", ".python", ".pyt"], a: 0 },
    { id: 24, q: "Which function prints text in Python?", o: ["print()", "echo()", "cout", "console.log()"], a: 0 },
    { id: 25, q: "Which data structure in Python uses key-value pairs?", o: ["Dictionary", "List", "Tuple", "Set"], a: 0 },
    { id: 26, q: "What is an IP address?", o: ["A unique numerical label assigned to every device on a network", "Website name", "Email ID", "Computer brand"], a: 0 },
    { id: 27, q: "Which protocol secures web traffic through encryption?", o: ["HTTPS", "HTTP", "FTP", "TELNET"], a: 0 },
    { id: 28, q: "In C++, which keyword prints output on console?", o: ["cout", "cin", "printf", "echo"], a: 0 },
    { id: 29, q: "Which operator is used to check equality in JavaScript?", o: ["== or ===", "=", "!=", ":="], a: 0 },
    { id: 30, q: "Which tag creates an unordered bulleted list in HTML?", o: ["<ul>", "<ol>", "<li>", "<list>"], a: 0 },
    { id: 31, q: "Which tag creates an ordered numbered list in HTML?", o: ["<ol>", "<ul>", "<li>", "<order>"], a: 0 },
    { id: 32, q: "In CSS, what is the default value of display property for a <div>?", o: ["block", "inline", "flex", "none"], a: 0 },
    { id: 33, q: "Which CSS box-model property adds space INSIDE the border?", o: ["padding", "margin", "outline", "border-radius"], a: 0 },
    { id: 34, q: "Which CSS property adds space OUTSIDE the border?", o: ["margin", "padding", "gap", "spacing"], a: 0 },
    { id: 35, q: "What does DOM stand for in Web Development?", o: ["Document Object Model", "Data Object Mode", "Digital Ordinance Module", "None"], a: 0 },
    { id: 36, q: "In JavaScript, which method converts a JSON string to an object?", o: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.convert()"], a: 0 },
    { id: 37, q: "Which method converts an object to a JSON string?", o: ["JSON.stringify()", "JSON.parse()", "JSON.encode()", "JSON.make()"], a: 0 },
    { id: 38, q: "Which HTTP status code signifies success (OK)?", o: ["200", "404", "500", "301"], a: 0 },
    { id: 39, q: "Which HTTP status code represents Not Found?", o: ["404", "200", "403", "502"], a: 0 },
    { id: 40, q: "In React, what is used to hold component state?", o: ["useState", "useEffect", "useRouter", "useDom"], a: 0 },
    { id: 41, q: "In React, which hook handles side-effects like fetching data?", o: ["useEffect", "useState", "useContext", "useRef"], a: 0 },
    { id: 42, q: "What does UI stand for?", o: ["User Interface", "Unified Index", "Universal Interlink", "Utility Info"], a: 0 },
    { id: 43, q: "What does UX stand for?", o: ["User Experience", "Universal Expansion", "Unified Excel", "User Execution"], a: 0 },
    { id: 44, q: "Which port is standard for HTTP?", o: ["80", "443", "21", "22"], a: 0 },
    { id: 45, q: "Which port is standard for secure HTTPS?", o: ["443", "80", "8080", "25"], a: 0 },
    { id: 46, q: "Which database is a popular NoSQL document database?", o: ["MongoDB", "MySQL", "PostgreSQL", "Oracle"], a: 0 },
    { id: 47, q: "In SQL, which command removes all rows from a table quickly?", o: ["TRUNCATE", "DROP", "ALTER", "KILL"], a: 0 },
    { id: 48, q: "Which HTML tag embeds an interactive video?", o: ["<video>", "<media>", "<movie>", "<play>"], a: 0 },
    { id: 49, q: "Shortcut key to open Developer Inspect Tools in Google Chrome?", o: ["F12 or Ctrl + Shift + I", "Ctrl + J", "F1", "Ctrl + P"], a: 0 },
    { id: 50, q: "Full form of SEO is?", o: ["Search Engine Optimization", "Single Engine Online", "System Enterprise Operation", "Site Evaluation Official"], a: 0 }
  ]
};

function OnlineTest() {
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem('activeExamStudent') || '{}');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [result, setResult] = useState(null);

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // Question course selector
  useEffect(() => {
    if (!student._id) {
      navigate('/Login');
      return;
    }

    const courseKey = (student.course || "").toUpperCase();
    if (courseKey.includes("STENO")) {
      setQuestions(questionBank.Steno);
    } else if (courseKey.includes("DCA") || courseKey.includes("ADCA")) {
      setQuestions(questionBank.DCA);
    } else {
      setQuestions(questionBank["Short Term"]);
    }
  }, [student, navigate]);

  // Request Fullscreen on Start
  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  }, []);

  // Submit test and sync directly with Certificate Details in backend
  const handleSubmit = useCallback(async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let score = 0;
    questions.forEach((q) => {
      if (userAnswersRef.current[q.id] !== undefined && userAnswersRef.current[q.id] === q.a) {
        score += 1;
      }
    });

    let grade = "A";
    const percentage = (score / 50) * 100;
    if (percentage >= 85) grade = "A++";
    else if (percentage >= 70) grade = "A+";
    else if (percentage >= 50) grade = "A";
    else if (percentage >= 40) grade = "B";
    else grade = "C";

    const currentDate = new Date().toISOString().split('T')[0];

    const updatedData = {
      ...student,
      hasGivenTest: true,
      testScore: score,
      testDate: currentDate,
      testGrade: grade,
      certificateDetails: {
        ...(student.certificateDetails || {}),
        studentName: student.name,
        fatherName: student.fatherName,
        regNo: student.studentId,
        courseName: student.course,
        duration: student.courseDuration || "6 Months",
        grade: grade,
        issueDate: currentDate
      }
    };

    try {
      await fetch(`${BASE_URL}/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      setResult({ score, total: 50, grade });
      sessionStorage.removeItem('activeExamStudent');
    } catch (e) {
      console.error(e);
      setResult({ score, total: 50, grade });
    }
  }, [BASE_URL, isSubmitted, questions, student]);

  // Anti-Cheat & Screen Freeze Security
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 116 || // F5
        (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'w' || e.key === 'W' || e.key === 'c' || e.key === 'u')) ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setWarnings((prev) => {
          const next = prev + 1;
          alert(`⚠️ Alert ${next}/3: Window / Tab switch detect hua! 3 warnings ke baad test auto-submit ho jayega.`);
          if (next >= 3) {
            handleSubmit();
          }
          return next;
        });
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSubmit, isSubmitted]);

  // 30 Minutes Timer Engine
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectOption = (optIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questions[currentIndex].id]: optIndex
    });
  };

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card shadow-lg border-0 rounded-4 text-center p-5 bg-white" style={{ maxWidth: '480px', width: '100%' }}>
          <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
          <h2 className="fw-bold text-dark mb-1">Test Submitted!</h2>
          <p className="text-muted small">Aapka exam score aur grade database mein update ho chuka hai.</p>

          <div className="p-4 my-4 rounded-4" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
            <h6 className="text-muted text-uppercase fw-bold mb-2">Final Marks Obtained</h6>
            <h1 className="fw-bold text-primary mb-2">{result.score} / {result.total}</h1>
            <span className="badge bg-success px-4 py-2 fs-6 rounded-pill">Assigned Grade: {result.grade}</span>
          </div>

          <button className="btn btn-dark w-100 rounded-pill py-2 fw-bold" onClick={() => navigate('/')}>
            Back To Cyntax Home
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center p-5"><h4>⏳ Questions Loading...</h4></div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#f1f5f9',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    }}>
      {/* Test Engine Header */}
      <header className="px-4 py-3 bg-dark text-white d-flex justify-content-between align-items-center shadow">
        <div>
          <h5 className="mb-0 fw-bold">{student.name} <span className="text-warning">({student.studentId})</span></h5>
          <small className="text-info">{student.course} Examination Console</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="badge bg-danger fs-5 px-3 py-2 rounded-pill shadow-sm">
            <i className="far fa-clock me-2"></i>{formatTimer(timeLeft)}
          </div>
          <button 
            className="btn btn-success fw-bold px-4 rounded-pill shadow-sm"
            onClick={() => {
              if (window.confirm("Bhai sach mein pura test submit karna hai?")) {
                handleSubmit();
              }
            }}
          >
            Submit Paper
          </button>
        </div>
      </header>

      {/* Main Question Interface */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-lg border-0 rounded-4 w-100 bg-white" style={{ maxWidth: '850px' }}>
          <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
              Tab Switch Warnings: {warnings}/3
            </span>
          </div>

          <div className="card-body px-4 py-3">
            <h4 className="fw-bold text-dark mb-4" style={{ lineHeight: '1.5' }}>
              Q{currentIndex + 1}. {currentQ.q}
            </h4>

            <div className="d-flex flex-column gap-3">
              {currentQ.o.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption(idx)}
                    className={`btn text-start p-3 rounded-3 border ${
                      isSelected 
                        ? 'btn-primary text-white shadow' 
                        : 'btn-outline-dark bg-light text-dark'
                    }`}
                    style={{ fontSize: '16px', fontWeight: '500', transition: '0.2s' }}
                  >
                    <b className="me-2">{String.fromCharCode(65 + idx)}.</b> {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-between">
            <button 
              className="btn btn-secondary rounded-pill px-4"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              <i className="fas fa-arrow-left me-1"></i> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button 
                className="btn btn-dark rounded-pill px-4"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                Next <i className="fas fa-arrow-right ms-1"></i>
              </button>
            ) : (
              <button 
                className="btn btn-success rounded-pill px-4 fw-bold shadow"
                onClick={() => {
                  if (window.confirm("Sabhi 50 questions check kar liye? Final submit karein?")) {
                    handleSubmit();
                  }
                }}
              >
                Final Submit
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OnlineTest;