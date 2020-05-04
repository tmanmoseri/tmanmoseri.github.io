$(document).ready(function () {

//    MY custom preloader //

    var svg = new Walkway({
        selector: "#Layer_1",
        duration: 4000,
        easing: 'easeInOutCubic'
    }).draw();

    $('#svg-img').fadeIn(100);
    $('#my-div').delay(4000).fadeOut(500);

    //    waypoint animation //

    $('.js--wp--1').waypoint(function (direction) {
        $('.js--line-1').addClass("animated rollIn");
        $('.js--h-1').addClass("animated zoomIn");
        $('.js--latest-products').addClass("animated fadeIn");
        if (direction == 'down'){
                $('nav').addClass("on");
        }
        else{
                $('nav').removeClass("on");
        }
    }, {
        offset: '50%'
    });

    $('.js--wp--2').waypoint(function (direction) {
        $('.js--line-2').addClass("animated rollIn");
        $('.js--h-2').addClass("animated zoomIn");
        $('.js--trending').addClass("animated fadeIn");
    }, {
        offset: '50%'
    });

    $('.js--wp--3').waypoint(function (direction) {
        $('.js--line-3').addClass("animated rollIn");
        $('.js--h-3').addClass("animated zoomIn");
    }, {
        offset: '50%'
    });

    $('.js--wp--4').waypoint(function (direction) {
        $('.js--left').addClass("animated slideInLeft");
        $('.js--right').addClass("animated slideInRight");
    }, {
        offset: '50%'
    });

    $('.js--wp--5').waypoint(function (direction) {
        $('.js--letter-left').addClass("animated slideInLeft");
        $('.js--letter-right').addClass("animated slideInRight");
        $('.js--heart').addClass("animated flash");
    }, {
        offset: '0%'
    });


//    mobele navigation section   //

        $('.js--nav-icon').click(function () {
        var nav = $('.js--main-nav');
        var icon = $('.js--nav-icon i');
        nav.animate({width:'toggle'},500);

        if (icon.hasClass('ion-ios-more')) {
            icon.addClass('ion-close-circled');
            icon.removeClass('ion-ios-more');
        } else {
            icon.addClass('ion-ios-more');
            icon.removeClass('ion-close-circled');
        }
    });



});


try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far.
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

/**************************
Voice recognition
*************************/

recognition.onstart = function() {
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');
  };
}



/*-----------------------------
      App buttons and input
------------------------------*/
//function to record voice into notecontent
$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();
});

//function to pause voice
$('#pause-record-btn').on('click', function(e) {
  recognition.stop();//
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

//function to save voice into notecontent
$('#save-note-btn').on('click', function(e) {
  recognition.stop();// passing notecontent msg to recognition()

  if(!noteContent.length) {
    instructions.text('Could not save empty note. Please add a message to your note.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }

})


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis
------------------------------*/

function readOutLoud(message) {
    var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
    speech.text = message;
    speech.volume = 5;
    speech.rate = 1;
    speech.pitch = 2;

    window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;
    });
  }
  else {
    html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    }
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime);
}

/**
--------------------------------------
testing
--------------------------------------
**/

function text(){


myFunction = null;

}



function myFunction(elmnt,clr) {
  elmnt.style.color = clr;
}

/****
creating a new button by onclick()
****/
function Audio(){

  var welcome = "Welcome to Zensar technology. Please fill the login form below or click the register button to register..";
 var x = document.getElementById("1");

 x.style.display = "none";

readOutLoud(welcome);
}








function Fname(){

  var Fname = "Please enter your first name..";


readOutLoud(Fname);
}
function lname(){

  var lname = "Please enter your last name..";
readOutLoud(lname);
}
function contact(){

  var contact = "Please enter your contact number..";
readOutLoud(contact);
}
function ID(){

  var ID = "Please enter your id number..";
readOutLoud(ID);
}

function Veh_no(){

  var Veh_no = "Please enter your vehicle number plate..";

readOutLoud(Veh_no);
}

function Company(){

  var Company = "Please enter your company name..";

readOutLoud(Company);
}

function reason(){

  var reason = "Please enter your reason for visiting..";

readOutLoud(reason);
}

function ID_Regt(){

  var ID_Regt = "Please enter your id register number..";

readOutLoud(ID_Regt);
}
function timein(){

  var ID_Regt = "Please enter the current time..";

readOutLoud(ID_Regt);
}

function submit1(){

  var submit = "Thaks for registering on our app. Please do not forget to sign out before you leave...";



readOutLoud(submit);

}
function noinputs(){

  var error = "please enter valid imputs..";

readOutLoud(error);

}




//If the length of the element's string is 0 then display helper message

   function required(x)

    {
      var x;

    var empt1 = document.forms["form1"]["firstName"].value;
     var empt2 = document.forms["form1"]["LastName"].value;
      var empt3 = document.forms["form1"]["Contact_Details"].value;
       var empt4 = document.forms["form1"]["Veh_Reno"].value;
       var empt5 = document.forms["form1"]["Reason_For_Entry"].value;
        var empt6 = document.forms["form1"]["TimeIn"].value;
         var empt7 = document.forms["form1"]["ID_Ret"].value;




          if(x == 2 && empt1 !== ""){
             lname();
            display(x);
          }
           if(x == 3 && empt2 !== "")
              {
              contact();
             display(x);
        }
         if(x == 4 && empt3 !== "")
          {
           Veh_no();
           display(x);
        }
         if(x == 5 && empt4 !== "")
              {
               reason();
               display(x);
        }
        if(x == 6 && empt5 !== "")
          {
         timein();
         display(x);
        }
        if(x == 7 && empt6 !== "")
          {
         ID_Regt();
         display(x);
        }
         if(x == 8 && empt7 !== "")
          {
         submit1();
         display(x);

        }


        else{
           noinputs();

      }



   }





function display(x) {

if(x == 1){
  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }

if(x == 2){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "block";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 3){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "block";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 4){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "block";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 5){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "block";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 6){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "block";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 7){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "block";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 8){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "block";

   var g = document.getElementById("9");

    g.style.display = "none";

  }
  if(x == 9){

   var y = document.getElementById("1");

    y.style.display = "none";

  var y = document.getElementById("2");

    y.style.display = "none";

     var a = document.getElementById("3");

    a.style.display = "none";

   var b = document.getElementById("4");

    b.style.display = "none";

   var c = document.getElementById("5");

    c.style.display = "none";

   var d = document.getElementById("6");

    d.style.display = "none";

   var e = document.getElementById("7");

    e.style.display = "none";

   var f = document.getElementById("8");

    f.style.display = "none";

   var g = document.getElementById("9");

    g.style.display = "block";

  }
}
