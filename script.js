// Installing VexFlow, which is an open-source web-based music notation rendering API.
const VF = Vex.Flow;

// Create a SVG renderer and attach it to the DIV element named "boo".
var div = document.getElementById("boo")
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(1920 , 1080);
var context = renderer.getContext();
context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

// Create an array for each scale the user can select.
var cnmaj = new Array("c", "d", "e", "f", "g", "a", "b", "c");
var gnmaj = new Array("g", "a", "b", "c", "d", "e", "f", "g");
var dnmaj = new Array("d", "e", "f", "g", "a", "b", "c", "d");
var anmaj = new Array("a", "b", "c", "d", "e", "f", "g", "a");
var enmaj = new Array("e", "f", "g", "a", "b", "c", "d", "e");
var fnmaj = new Array("f", "g", "a", "b", "c", "d", "e", "f");
var bfmaj = new Array("b", "c", "d", "e", "f", "g", "a", "b");
var efmaj = new Array("e", "f", "g", "a", "b", "c", "d", "e");
var afmaj = new Array("a", "b", "c", "d", "e", "f", "g", "a");

// Create a position array to find the distance between notes. Only when the notes do not have the same number(c/4 and e/3).
var positionArray = new Array("c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5", "c/6");

// When the notes have the same number(c/4 and e/4 or c/3 and e/3) the program will use this array instead.
var letterArray = new Array("c", "d", "e", "f", "g", "a", "b");

// Variable for the user selected scale and scale degree.
var selectedScale;
var selectedDegree;

// Variables for the user's notes:
// Root note is based on which scale they select and the scale degree they select.
// Ex: Scale: C major. Scale degree: I. Therefore, the rootNote will be the first note of C major scale which is C.
var rootNote;

// Since the triads are in root position, when writing 4 voices the root note must be doubled.
// Therefore, extRootNote will be the same note as the rootNote.
var extRootNote;

// The third note is two notes above the root note.
var thirdNote;

// The fifthNote is 4 notes above the root note.
var fifthNote;

// Variables for the 4 voices:
// The 4 voices are bass, tenor, alto, and soprano.
// Since the triad is in root position the root note will always be in the bass voice position.
// Therefore, the 3 others notes(extRootNote, thirdNote, fifthNote) can be placed in the 3 other voice positions.
// So we created varaibles and placeholder variables for the 3 other voices.
var phSoprano, phAlto, phTenor;
var soprano, alto, tenor;

// Create a buffer array for each of the 3 voices.
var bufferFifth = new Array(2);
var bufferThird = new Array(2);
var bufferExtraRootNote = new Array(2);

// Variable for counter for how far notes are from each other.
var counter;

// Variable to check if the notes are more than an octave.
var moreThanOctave;

// Variables used for the button
var x, i, j, selElmnt, a, b, c;

// Look for any elements with the class custom-select
x = document.getElementsByClassName("custom-select");

for (i = 0; i < x.length; i++) 
{
  selElmnt = x[i].getElementsByTagName("select")[0];
  
  // For each element, create a new DIV that will act as the selected item
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);

  // For each element, create a new DIV that will contain the option list
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");

  for (j = 1; j < selElmnt.length; j++) 
  {
    // For each option in the original select element, create a new DIV that will act as an option item
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;

    c.addEventListener("click", function (e) 
    {
      // When an item is clicked, update the original select box and the selected item
      var y, i, k, s, h;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      h = this.parentNode.previousSibling;

      for (i = 0; i < s.length; i++) 
      {
        if (s.options[i].innerHTML == this.innerHTML) 
        {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");

          for (k = 0; k < y.length; k++) 
          {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  
  a.addEventListener("click", function (e) 
  {
    // When the select box is clicked, close any other select boxes and open/close the current select box
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) 
{
  // A function that will close all select boxes in the document except the current select box
  var x, y, i, arrNo = [];

  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  
  for (i = 0; i < y.length; i++) 
  {
    if (elmnt == y[i]) 
    {
      arrNo.push(i)
    } 
    else 
    {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) 
  {
    if (arrNo.indexOf(i)) 
    {
      x[i].classList.add("select-hide");
    }
  }
}

// If the user clicks anywhere outside the select box then close all select boxes
document.addEventListener("click", closeAllSelect);

// Key Signature rendering for scales
VF.KeySignature = (function() {
  function catchError(spec) {
    try {
      VF.keySignature(spec);
    } catch (e) {
      equal(e.code, 'BadKeySignature', e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
      'C',
      'F',
      'Bb',
      'Eb',
      'Ab',
      'Db',
      'Gb',
      'Cb',
      'G',
      'D',
      'A',
      'E',
      'B',
      'F#',
      'C#',
    ],

    MINOR_KEYS: [
      'Am',
      'Dm',
      'Gm',
      'Cm',
      'Fm',
      'Bbm',
      'Ebm',
      'Abm',
      'Em',
      'Bm',
      'F#m',
      'C#m',
      'G#m',
      'D#m',
      'A#m',
    ],

    Start: function() {
      QUnit.module('KeySignature');
      test('Key Parser Test', VF.Test.KeySignature.parser);
      VF.Test.runTests('Major Key Test', VF.Test.KeySignature.majorKeys);
      VF.Test.runTests('Minor Key Test', VF.Test.KeySignature.minorKeys);
      VF.Test.runTests('Stave Helper', VF.Test.KeySignature.staveHelper);
      VF.Test.runTests('Cancelled key test', VF.Test.KeySignature.majorKeysCanceled);
      VF.Test.runTests('Cancelled key (for each clef) test', VF.Test.KeySignature.keysCanceledForEachClef);
      VF.Test.runTests('Altered key test', VF.Test.KeySignature.majorKeysAltered);
      VF.Test.runTests('End key with clef test', VF.Test.KeySignature.endKeyWithClef);
      VF.Test.runTests('Key Signature Change test', VF.Test.KeySignature.changeKey);
    },

    parser: function() {
      expect(11);
      catchError('asdf');
      catchError('D!');
      catchError('E#');
      catchError('D#');
      catchError('#');
      catchError('b');
      catchError('Kb');
      catchError('Fb');
      catchError('Ab');
      catchError('Dbm');
      catchError('B#m');

      VF.keySignature('B');
      VF.keySignature('C');
      VF.keySignature('Fm');
      VF.keySignature('Ab');
      VF.keySignature('Abm');
      VF.keySignature('F#');
      VF.keySignature('G#m');

      ok(true, 'all pass');
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('Cb');

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('C#');
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('E');

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('Ab');
        keySig.padding = 20;
        keySig.addToStave(stave4);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, 'all pass');
    },

    keysCanceledForEachClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 380);
      ctx.scale(0.8, 0.8);
      var keys = [
        'C#',
        'Cb'
      ];

      var x = 20;
      var y = 20;
      var tx = x;
      ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function(clef) {
        keys.forEach(function(key) {
          var cancelKey = key === keys[0] ? keys[1] : keys[0];
          var vStave = new Vex.Flow.Stave(tx, y, 350);
          vStave.setClef(clef);
          vStave.addKeySignature(cancelKey);
          vStave.addKeySignature(key, cancelKey);
          vStave.addKeySignature(key);
          vStave.setContext(ctx).draw();
          tx += 350;
        });
        tx = x;
        y += 80;
      });

      ok(true, 'all pass');
    },

    majorKeysAltered: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['bs', 'bs']);
        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['+', '+', '+']);
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['n', 'bs', 'bb']);
        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['++', '+', 'n', '+']);
        keySig.padding = 20;
        keySig.addToStave(stave4);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();
      stave3.setContext(ctx);
      stave3.draw();
      stave4.setContext(ctx);
      stave4.draw();

      ok(true, 'all pass');
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MINOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },
    endKeyWithClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 200);
      ctx.scale(0.9, 0.9);
      var stave1 = new VF.Stave(10, 10, 350);
      stave1.setKeySignature('G')
        .setBegBarType(VF.Barline.type.REPEAT_BEGIN)
        .setEndBarType(VF.Barline.type.REPEAT_END)
        .setClef('treble')
        .addTimeSignature('4/4')
        .setEndClef('bass')
        .setEndKeySignature('Cb');
      var stave2 = new VF.Stave(10, 90, 350);
      stave2.setKeySignature('Cb')
        .setClef('bass')
        .setEndClef('treble')
        .setEndKeySignature('G');

      stave1.setContext(ctx).draw();
      stave2.setContext(ctx).draw();
      ok(true, 'all pass');
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      for (var i = 0; i < 8; ++i) {
        stave.addKeySignature(keys[i]);
      }

      for (var n = 8; n < keys.length; ++n) {
        stave2.addKeySignature(keys[n]);
      }

      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, 'all pass');
    },

    changeKey: function(options) {
      var vf = VF.Test.makeFactory(options, 900);

      var stave = vf.Stave(10, 10, 800)
        .addClef('treble')
        .addTimeSignature('C|');

      var voice = vf.Voice().setStrict(false).addTickables([
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
      ]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'all pass');
    }
  };

  return KeySignature;
}());

// Function for drawing staves
function drawStaves() 
{
  // Create two staves of a width of 400 at position 558, 0 and 558, 100 on the canvas.
  var stave = new VF.Stave(750, 0, 400);
  var stave2 = new VF.Stave(750, 100, 400);

  // Add a clef, a time signature, and a key signature to each stave.
  stave.addClef("treble").addTimeSignature("4/4").addKeySignature(scale1);
  stave2.addClef("bass").addTimeSignature("4/4").addKeySignature(scale1);

  // Connect the stave to the rendering context and then drawing the stave.
  stave.setContext(context).draw();
  stave2.setContext(context).draw();

  // Create 4 notes from the user's selected notes(all are whole notes in length). 
  var notes = 
  [
    new VF.StaveNote({ clef: "treble", keys: [alto, soprano], duration: "w" })
  ];

  var notes2 = 
  [
    new VF.StaveNote({ clef: "bass", keys: [rootNote, tenor], duration: "w" })
  ];

  // Create a voice in the 4/4 time signature and add the user's selected notes.
  var voices = 
  [
    new VF.Voice({ num_beats: parseInt(4), beat_value: parseInt(4) }).addTickables(notes)
  ]

  var voices2 = 
  [
    new VF.Voice({ num_beats: parseInt(4), beat_value: parseInt(4) }).addTickables(notes2)
  ]

  // Format and justify the notes to 400 pixels.
  var formatter = new VF.Formatter().joinVoices(voices).format(voices, 400);
  var formatter2 = new VF.Formatter().joinVoices(voices2).format(voices2, 400);

  // Render the voices.
  voices.forEach(function (v) { v.draw(context, stave); })
  voices2.forEach(function (v) { v.draw(context, stave2); })

  // When the draw staves button is pressed the clear button will appear and the draw button will disappear.
  document.getElementById("clearButton").style.color = "white";
  document.getElementById("clearButton").disabled = false;

  document.getElementById("drawButton").style.color = "grey";
  document.getElementById("drawButton").disabled = true;
}

// Function for getting user input for scale(key signature) and scale degree.
function getOption() 
{
  // Once the submit button is clicked the draw button will appear and the submit button will disappear.
  document.getElementById("drawButton").style.color = "white";
  document.getElementById("drawButton").disabled = false;

  document.getElementById("submitButton").style.color = "grey";
  document.getElementById("submitButton").disabled = true;

  // Gets the option selected from the button with id scale1
  selectElement = document.querySelector("#scale1");
  scale1 = selectElement.options[selectElement.selectedIndex].value;

  // Gets the option selected from the button with id degree1
  selectElement = document.querySelector("#degree1");
  degree1 = selectElement.options[selectElement.selectedIndex].value;

  // Switch statement for the user's selected scale.
  // Based on the user's selected scale the selectedScale variable will copy that specific scale array content.
  // Example: User selects C major. selectedScale = C major array content.
  switch (scale1) 
  {
    case "C":
      selectedScale = cnmaj.concat();
      break;
    case "G":
      selectedScale = gnmaj.concat();
      break;
    case "D":
      selectedScale = dnmaj.concat();
      break;
    case "A":
      selectedScale = anmaj.concat();
      break;
    case "E":
      selectedScale = enmaj.concat();
      break;
    case "F":
      selectedScale = fnmaj.concat();
      break;
    case "Bb":
      selectedScale = bfmaj.concat();
      break;
    case "Eb":
      selectedScale = efmaj.concat();
      break;
    case "Ab":
      selectedScale = afmaj.concat();
      break; 
  }

  // Switch statement for the user's selected scale degree.
  // Based on the user's selected scale degree, selected scale, and root position triad is how the 4 notes will be chosen.
  // Example: Scale: C Major. Scale Degree: II. Root Position. Root note is D, third note is two notes above D so the third note is F, fifth note is four notes above D so the fifth onte is A. And since the triads are in root position the root note is doubled. So, extra root note is also D.
  switch (degree1) 
  {
    case "0":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 0;
  
      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 4];
      fifthNote += ranOctaveRange[1];

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];
    
      break;
    case "1":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 1;

      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 4];
      fifthNote += ranOctaveRange[1];
      
      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2]; 

      break;
    case "2":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).  

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 2;
      
      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 4];
      fifthNote += ranOctaveRange[1];
    
      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];

      break;
    case "3":
       // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 3;
      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 4];
      fifthNote += ranOctaveRange[1];

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];
    
      break;
    case "4":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 4;

      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote += ranOctaveRange[0];

      selectedDegree = 0;

      fifthNote = selectedScale[selectedDegree + 1];
      fifthNote += ranOctaveRange[1];

      selectedDegree = 4;

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];

      break;
    case "5":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 5;

      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      selectedDegree = 0;

      thirdNote = selectedScale[selectedDegree];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 2];
      fifthNote += ranOctaveRange[1];

      selectedDegree = 5;

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];

      break;
    case "6":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 6;

      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      selectedDegree = 1;

      thirdNote = selectedScale[selectedDegree];
      thirdNote += ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 2];
      fifthNote += ranOctaveRange[1];

      selectedDegree = 6;

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];

      break;
    case "7":
      // Randomly assign which octave range the notes are (excluding root note which is always in the /2 range).

      // Array for the 3 possible options for the three notes ranges
      var range = ["/4", "/4", "/3"];

      // Array for randomly selected ranges from original range array
      var ranOctaveRange = [];

      var i = range.length;
      var j = 0;

      // Randomly assign the three option ranges to the third, fifth, and extra root notes.
      // After an option is selected that option is removed from the array.
      while (i--) 
      {
        j = Math.floor(Math.random() * (i + 1));
        ranOctaveRange.push(range[j]);
        range.splice(j, 1);
      }

      selectedDegree = 0;

      rootNote = selectedScale[selectedDegree];
      rootNote += "/2";

      thirdNote = selectedScale[selectedDegree + 2];
      thirdNote +=  ranOctaveRange[0];

      fifthNote = selectedScale[selectedDegree + 4];
      fifthNote += ranOctaveRange[1];

      extRootNote = selectedScale[selectedDegree];
      extRootNote += ranOctaveRange[2];

      break;
  }

  // When the submit button is pressed the user's inputted notes are entered into the variables and are displayed on the screen
  document.getElementById("thirdNote").innerHTML = thirdNote;
  document.getElementById("fifthNote").innerHTML = fifthNote;
  document.getElementById("extRootNote").innerHTML = extRootNote;
  document.getElementById("root").innerHTML = rootNote;

  document.getElementById("thirdNote").style.display = "inline-block";
  document.getElementById("fifthNote").style.display = "inline-block";
  document.getElementById("extRootNote").style.display = "inline-block";  
  document.getElementById("root").style.display = "inline-block";  

  // When writing in four voices the notes in the soprano and alto positions must be within an octave.
  // And the notes in the alto and tenor positions must also be within an octave.
  // So this functions checks those requirements.
  octaveIdentifier();
  
  // When the submit button is pressed a notifier will appear
  document.getElementById("pressed").style.display = "inline-block"; 
}


// Function for clearing the screen
function clearScreen() 
{
  // Drawing a light blue rectangle over the staves to clear the screen
  context.rect(550, 0, 1050, 1050, { stroke: 'none', fill: 'lightblue' });

  // When the clear screen button is pressed the notifier will disappear
  document.getElementById("pressed").style.display = "none"; 

  // When the clear screen button is pressed the two possible outputs if the notes are within an octave will disappear
  document.getElementById("isNotOctave").style.display = "none"; 
  document.getElementById("isOctave").style.display = "none"; 

  // When the clear screen button is pressed the output of the user's notes disappear
  document.getElementById("thirdNote").style.display = "none";
  document.getElementById("fifthNote").style.display = "none";
  document.getElementById("extRootNote").style.display = "none";  
  document.getElementById("root").style.display = "none";  
  
  // When the clear button is pressed the clear button will disappear
  document.getElementById("clearButton").style.color = "grey";
  document.getElementById("clearButton").disabled = true;

  // When the clear button is pressed the draw button will disappear
  document.getElementById("drawButton").style.color = "grey";
  document.getElementById("drawButton").disabled = true;

  // When the clear screen button is pressed the submit button will appear
  document.getElementById("submitButton").style.color = "white";
  document.getElementById("submitButton").disabled = false;
}

// When writing in four voices the notes in the soprano and alto positions must be within an octave.
// And the notes in the alto and tenor positions must also be within an octave.
// So this functions checks those requirements.
function octaveIdentifier()
{   
  // So we split the three notes with one into each buffer array. Each note will be in the format of "c/3". 
  // So it'll split to bufferFifth[0] = "c" and bufferFifth[1] = "3".
  bufferFifth = fifthNote.split("/");
  bufferThird = thirdNote.split("/");
  bufferExtraRootNote = extRootNote.split("/");

  // Initialize placeholder variables for the 3 voices(soprano, alto, tenor).
  phSoprano = "";
  phAlto = "";
  phTenor = "";
  
  // Starting Position 1:         or       Starting Position 2:
  //                      5                                     1    
  //                      3                                     3
  //                      1                                     5

  // Condition of when the fifth note's octave range is greater than the extra root note's octave range or both are equal to each other.
  // And when true we will keep the fifth note at the soprano position, the third note at the alto position, and the extra root note at the tenor position.
  if (parseInt(bufferFifth[1]) > parseInt(bufferExtraRootNote[1]) || parseInt(bufferFifth[1]) == parseInt(bufferExtraRootNote[1]))
  {
    // Position for this case and looks at 5 and 3: 
    //                                                 5
    //                                                 3
    //                                                 1
    // Condition of when the fifth note's octave range is different than the third note's octave range (soprano octave range doesn't equal alto octave range).
    if (bufferFifth[1] != bufferThird[1])
    {
      // Condition of when the fifth note's octave range is greater than the third note's octave range.
      if (parseInt(bufferThird[1]) < parseInt(bufferFifth[1]))
      {
        // Find the position of the smaller note(the third note in this case) in the position array.
        for (i = 0; i < positionArray.length; i++)
        {
          if (thirdNote == positionArray[i])
          {
            var startingPosition = i;
          }
        }

        // Find how many notes are between the starting position and the larger note(the fifth note in this case).
        // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the third note to the alto position.
        // Even if the counter is more than 8 we will still assign the fifth note to the soprano position and the third note to the alto position. This is because there is still a chance that the fifth note and extra root note are within an octave range, and the third note and the extra root note are also within an octave range.
        // Example: Soprano - g/4. Alto - e/3. Tenor - c/4.                                                                      
        // In this case g/4 and e/3 are not within an octave range. However, e/3 and c/4 are and c/4 and g/4 are also within an octave range. 
        // So we will still assign the values as usual but we will increase our moreThanOctave variable.
        for (i = startingPosition; i < positionArray.length; i++)
        {
          if (positionArray[i] == fifthNote)
          {
            if (counter <= 8)
            {
              phSoprano = fifthNote;
              phAlto = thirdNote;          
            }
            else if (counter > 8)
            {
              phSoprano = fifthNote;
              phAlto = thirdNote;

              moreThanOctave++;
            }
          }
          counter++;
        }
      }
      // Condition of the fifth note's octave range is less than the third note's octave range.
      else if (parseInt(bufferThird[1]) > parseInt(bufferFifth[1]))
      {
        // Find the position of the smaller note(the fifth note in this case) in the position array.
        for (i = 0; i < positionArray.length; i++)
        {
          if (fifthNote == positionArray[i])
          {
            var startingPosition = i;
          }
        }

        // Find how many notes are between the starting position and the larger note(the third note in this case).
        // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the fifth note to the alto position.
        // Even if the counter is more than 8 we will still assign the third note to the soprano position and the fifth note to the alto position. This is because there is still a chance that the third note and extra root note are within an octave range, and the fifth note and the extra root note are also within an octave range. 
        // So we will still assign the values as usual but we will increase our moreThanOctave variable.
        for (i = startingPosition; i < positionArray.length; i++)
        {
          if (positionArray[i] == thirdNote)
          {
            if (counter <= 8)
            {
              phSoprano = thirdNote;
              phAlto = fifthNote;            
            }
            else if (counter > 8)
            {
              phSoprano = thirdNote;
              phAlto = fifthNote;
              
              moreThanOctave++;
            }
          }
          counter++;
        }
      }
    }
    // Condition of when the fifth note's octave range is equal to the third note's octave range.
    else if (parseInt(bufferFifth[1]) == parseInt(bufferThird[1]))
    {
      // Find the position of both notes(the fifth note and third note in this case) in the letter array. 
      for (i = 0; i < letterArray.length; i++)
      {
        if (bufferFifth[0] == letterArray[i])
        {
          var letterPosition1 = i;
        }

        if (bufferThird[0] == letterArray[i])
        {
          var letterPosition2 = i;
        }
      }
      
      // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the third note in this case).
      // The third note is assigned to the soprano position and the fifth note is assigned to the alto position.
      if (letterPosition1 < letterPosition2)
      {
        phSoprano = thirdNote;
        phAlto = fifthNote;
      }
      // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the third note in this case).
      // The fifth note is assigned to the soprano position and the third note is assigned to the alto position.
      else if (letterPosition1 > letterPosition2)
      {
        phSoprano = fifthNote;
        phAlto = thirdNote;
      }
    }

    // Final Positions for this case: 
    //                                  5          or         3
    //                                  3                     5
    //                                  1                     1

    // Reset counter to 0.
    counter = 0;

    // Looks at the position and looks at 3 and 1: 
    //                                                 5
    //                                                 3
    //                                                 1
    // Condition of when the third note is in the alto voice position.
    if (phAlto == thirdNote)
    {
      // Condition of when the third note's octave range is different than the extra root note's octave range (alto octave range doesn't equal tenor octave range).
      if (bufferThird[1] != bufferExtraRootNote[1])
      {
        // Condition of when the third note's octave range is less than the extra root note's octave range.
        if (parseInt(bufferThird[1]) < parseInt(bufferExtraRootNote[1]))
        {
          // Find the position of the smaller note(the third note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (thirdNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }
          
          // Find how many notes are between the starting position and the larger note(the extra root note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the alto position and the third note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == extRootNote)
            {
              if (counter <= 8)
              {
                phAlto = extRootNote;
                phTenor = thirdNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
        // Condition of when the third note's octave range is greater than the extra root note's octave range.
        else if (parseInt(bufferThird[1]) > parseInt(bufferExtraRootNote[1]))
        {
          // Find the position of the smaller note(the extra root note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (extRootNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }
          
          // Find how many notes are between the starting position and the larger note(the third note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the alto position and the extra root note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == thirdNote)
            {
              if (counter <= 8)
              {
                phAlto = thirdNote;
                phTenor = extRootNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
      }
      // Condition of when the third note's octave range is equal to the extra root note's octave range.
      // The third note is assigned to the alto position and the extra root note is assigned to the tenor position.
      else if (parseInt(bufferThird[1]) == parseInt(bufferExtraRootNote[1]))
      {
        phAlto = thirdNote;
        phTenor = extRootNote; 
      }

      // Final Positions for this case: 
      //                                  5          or         5
      //                                  3                     1
      //                                  1                     3
    
      // Condition of when the moreThanOctave variable is equal to 1.
      // This is used to re-check if the soprano note and alto note are within an octave range.
      // Example: Original note position: Soprano - g/4. Alto - e/3. Tenor - c/4.        
      //          Then after checking, the note position would be: Soprano - g/4. Alto - c/4. Tenor - e/3.          //          Then checking one more time if the soprano and alto position are within an octave range to further verify the notes.   
      if (moreThanOctave == 1)
      {
        // First looks at 5 and 1 at the position : 
        //                                            5
        //                                            1
        //                                            3
        // Condition of when the extra root note is in the alto position.
        if (phAlto == extRootNote)
        {
          // Condition of when the fifth note's octave range is less than the extra root note's octave range. 
          if (parseInt(bufferFifth[1]) < parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of the smaller note(the fifth note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (fifthNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }
          
            // Find how many notes are between the starting position and the larger note(the extra root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the fifth note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == extRootNote)
              {
                if (counter <= 8)
                {
                  phSoprano = extRootNote;
                  phAlto = fifthNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is greater than the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferFifth[1]))
          {
            // Find the position of the smaller note(the extra root note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (extRootNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the fifth note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the extra root note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == fifthNote)
              {
                if (counter <= 8)
                {
                  phSoprano = fifthNote;
                  phAlto = extRootNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is equal to the extra root note's octave range.
          else if (parseInt(bufferFifth[1]) == parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of both notes(the fifth note and extra root note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferFifth[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferExtraRootNote[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
            
            // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the extra root note in this case).
            // The extra root note is assigned to the soprano position and the fifth note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = extRootNote;
              phAlto = fifthNote;
            }
            // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the extra root note in this case).
            // The fifth note is assigned to the soprano position and the extra root note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = fifthNote;
              phAlto = extRootNote;
            }      
          }
        }
        // Then looks at 5 and 3 at the position : 
        //                                            5
        //                                            3
        //                                            1
        // Condition of when the third note is in the alto position.
        else if (phAlto == thirdNote)
        {
          // Condition of when the fifth note's octave range is less than the third note's octave range. 
          if (parseInt(bufferFifth[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smazller note(the fifth note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (fifthNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the third note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the fifth note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = fifthNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE@");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is greater than the third note's octave range. 
          else if (parseInt(bufferThird[1]) < parseInt(bufferFifth[1]))
          {
            // Find the position of the smazller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }
            
            // Find how many notes are between the starting position and the larger note(the fifth note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == fifthNote)
              {
                if (counter <= 8)
                {
                  phSoprano = fifthNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE!");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
           }
          }
          // Condition of when the fifth note's octave range is equal to the third note's octave range.
          else if (parseInt(bufferFifth[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the fifth note and third note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferFifth[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }

            // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the fifth note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = fifthNote;
            }
            // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the third note in this case).
            // The fifth note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = fifthNote;
              phAlto = thirdNote;
            }  
          }
        }
      }
    }
    // Looks at the position and looks at 5 and 1: 
    //                                               3
    //                                               5
    //                                               1
    // Condition of when the fifth note is in the alto voice position.    
    else if (phAlto == fifthNote)
    {
      // Condition of when the fifth note's octave range is different than the extra root note's octave range (alto octave range doesn't equal tenor octave range).
      if (bufferFifth[1] != bufferExtraRootNote[1])
      {
        // Condition of when the extra root note's octave range is less than the fifth note's octave range.
        if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the extra root note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (extRootNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }

          // Find how many notes are between the starting position and the larger note(the fifth note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the alto position and the extra root note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == fifthNote)
            {
              if (counter <= 8)
              {
                phAlto = fifthNote;
                phTenor = extRootNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE#");
              }
            }
            counter++;
          }
        }
        // Condition of when the extra root note's octave range is greater than the fifth note's octave range.
        else if (parseInt(bufferExtraRootNote[1]) > parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the fifth note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (fifthNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }

          // Find how many notes are between the starting position and the larger note(the extra root note note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the alto position and the fifth note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == extRootNote)
            {
              if (counter <= 8)
              {
                phAlto = extRootNote;
                phTenor = fifthNote;       
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE$");
              }
            }
            counter++;
          }
        }
      }
      // Condition of when the fifth note's octave range is equal to the extra root note's octave range.
      // The fifth note is assigned to the alto position and the extra root note is assigned to the tenor position.
      else if (parseInt(bufferFifth[1]) == parseInt(bufferExtraRootNote[1]))
      {
        phAlto = fifthNote;
        phTenor = extRootNote;  
      }

      // Final Positions for this case: 
      //                                  3          or         3
      //                                  5                     1
      //                                  1                     5

      // Condition of when the moreThanOctave variable is equal to 1.
      // This is used to re-check if the soprano note and alto note are within an octave range.
      if (moreThanOctave == 1)
      {
        // First looks at 3 and 5 at the position : 
        //                                            3
        //                                            1
        //                                            5
        // Condition of when the extra root note is in the alto position.
        if (phAlto == extRootNote)
        {
          // Condition of when the third note's octave range is less than the extra root note's octave range.
          if (parseInt(bufferThird[1]) < parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of the smaller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the extra root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == extRootNote)
              {
                if (counter <= 8)
                {
                  phSoprano = extRootNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE%");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is greater than the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smaller note(the extra root note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (extRootNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the third note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the extra root note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = extRootNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE^");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is equal to the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the third note and extra root note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferExtraRootNote[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
            
            // Condition of when the first letter position(the extra root note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the extra root note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = extRootNote;
            }
            // Condition of when the first letter position(the extra root note in this case) is greater than the second letter position(the third note in this case).
            // The extra root note note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = extRootNote;
              phAlto = thirdNote;
            }    
          }
        }
        // Then looks at 5 and 3 at the position : 
        //                                            3
        //                                            5
        //                                            1
        // Condition of when the fifth note is in the alto position.
        else if (phAlto == fifthNote)
        {
          // Condition of when the fifth note's octave range is less than the third note's octave range. 
          if (parseInt(bufferFifth[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smaller note(the fifth note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (fifthNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the third note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the fifth note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = fifthNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE&");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is greater than the third note's octave range.
          else if (parseInt(bufferThird[1]) < parseInt(bufferFifth[1]))
          {
            // Find the position of the smaller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the fifth note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == fifthNote)
              {
                if (counter <= 8)
                {
                  phSoprano = fifthNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE*");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is equal to the third note's octave range.
          else if (parseInt(bufferFifth[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the fifth note and third note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferFifth[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
      
            // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the fifth note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = fifthNote;
            }
            // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the third note in this case).
            // The fifth note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = fifthNote;
              phAlto = thirdNote;
            }  
          }
        }
      }
    }
    // Assign all the placeholder variables for the voices to the actual voice variables.
    soprano = phSoprano;
    alto = phAlto;
    tenor = phTenor;
  }
  // Condition of when the fifth note's octave range is less than the extra root note's octave range.
  // And when true we will have the extra root note at the soprano position, the third note at the alto position, and the fifth note at the tenor position.
  else if (parseInt(bufferFifth[1]) < parseInt(bufferExtraRootNote[1]))
  {
    // Position for this case and looks at 5 and 3: 
    //                                                 1
    //                                                 3
    //                                                 5
    // Condition of when the extra root note's octave range is different than the third note's octave range (soprano octave range doesn't equal alto octave range).
    if (bufferExtraRootNote[1] != bufferThird[1])
    {
      // Condition of when the extra root note's octave range is greater than the third note's octave range.
      if (parseInt(bufferThird[1]) < parseInt(bufferExtraRootNote[1]))
      {
        // Find the position of the smaller note(the third note in this case) in the position array.
        for (i = 0; i < positionArray.length; i++)
        {
          if (thirdNote == positionArray[i])
          {
            var startingPosition = i;
          }
        }

        // Find how many notes are between the starting position and the larger note(the extra root note in this case).
        // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the third note to the alto position.
        // Even if the counter is more than 8 we will still assign the extra root note to the soprano position and the third note to the alto position. This is because there is still a chance that the extra root note note and fifth note are within an octave range, and the fifth note and the third note are also within an octave range.
        // So we will still assign the values as usual but we will increase our moreThanOctave variable.
        for (i = startingPosition; i < positionArray.length; i++)
        {
          if (positionArray[i] == extRootNote)
          {
            if (counter <= 8)
            {
              phSoprano = extRootNote;
              phAlto = thirdNote;
            }
            else if (counter > 8)
            {
              phSoprano = extRootNote;
              phAlto = thirdNote;

              moreThanOctave++;
            }
          }
          counter++;
        }
      }
      // Condition of the extra root note's octave range is less than the third note's octave range.
      else if (parseInt(bufferThird[1]) > parseInt(bufferExtraRootNote[1]))
      {
        // Find the position of the smaller note(the extra root note in this case) in the position array.
        for (i = 0; i < positionArray.length; i++)
        {
          if (extRootNote == positionArray[i])
          {
            var startingPosition = i;
          }
        }
      
        // Find how many notes are between the starting position and the larger note(the extra root note in this case).
        // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the third note to the alto position.
        // Even if the counter is more than 8 we will still assign the third note to the soprano position and the extra root note to the alto position. This is because there is still a chance that the extra root note note and fifth note are within an octave range, and the fifth note and the third note are also within an octave range.
        // So we will still assign the values as usual but we will increase our moreThanOctave variable.
        for (i = startingPosition; i < positionArray.length; i++)
        {
          if (positionArray[i] == thirdNote)
          {
            if (counter <= 8)
            {
              phSoprano = thirdNote;
              phAlto = extRootNote;  
            }
            else if (counter > 8)
            {
              phSoprano = thirdNote;
              phAlto = extRootNote;

              moreThanOctave++;
            }
          }
          counter++;
        }
      }
    }
    // Condition of when the third note's octave range is equal to the extra root note's octave range.
    else if (parseInt(bufferExtraRootNote[1]) == parseInt(bufferThird[1]))
    {
      // Find the position of both notes(the extra root note and third note in this case) in the letter array. 
      for (i = 0; i < letterArray.length; i++)
      {
        if (bufferExtraRootNote[0] == letterArray[i])
        {
          var letterPosition1 = i;
        }

        if (bufferThird[0] == letterArray[i])
        {
          var letterPosition2 = i;
        }
      }
      
      // Condition of when the first letter position(the extra root note in this case) is less than the second letter position(the third note in this case).
      // The third note is assigned to the soprano position and the extra root note is assigned to the alto position.
      if (letterPosition1 < letterPosition2)
      {
        phSoprano = thirdNote;
        phAlto = extRootNote;
      }
      // Condition of when the first letter position(the extra root note in this case) is greater than the second letter position(the third note in this case).
      // The extra root note is assigned to the soprano position and the third note is assigned to the alto position.
      else if (letterPosition1 > letterPosition2)
      {
        phSoprano = extRootNote;
        phAlto = thirdNote;
      }   
    }

    // Final Positions for this case: 
    //                                  1          or         3
    //                                  3                     1
    //                                  5                     5

    // Reset counter to 0.
    counter = 0;

    // Looks at the position and looks at 3 and 5: 
    //                                                 1
    //                                                 3
    //                                                 5
    // Condition of when the third note is in the alto voice position.
    if (phAlto == thirdNote)
    {
      // Condition of when the third note's octave range is different than the fifth note's octave range (alto octave range doesn't equal tenor octave range).
      if (bufferThird[1] != bufferFifth[1])
      {
        // Condition of when the third note's octave range is less than the fifth note's octave range.
        if (parseInt(bufferThird[1]) < parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the third note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (thirdNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }

          // Find how many notes are between the starting position and the larger note(the fifth note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the alto position and the third note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == fifthNote)
            {
              if (counter <= 8)
              {
                phAlto = fifthNote;
                phTenor = thirdNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
        // Condition of when the third note's octave range is greater than the fifth note's octave range.
        else if (parseInt(bufferThird[1]) > parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the fifth note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (fifthNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }
        
          // Find how many notes are between the starting position and the larger note(the third note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the alto position and the fifth note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == thirdNote)
            {
              if (counter <= 8)
              {
                phAlto = thirdNote;
                phTenor = fifthNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
      }
      // Condition of when the third note's octave range is equal to the fifth note's octave range.
      // The third note is assigned to the alto position and the fifth note is assigned to the tenor position.
      else if (parseInt(bufferThird[1]) == parseInt(bufferFifth[1]))
      {
        phAlto = thirdNote;
        phTenor = fifthNote;
      }

      // Final Positions for this case: 
      //                                  1          or         1
      //                                  3                     5
      //                                  5                     3
    
      // Condition of when the moreThanOctave variable is equal to 1.
      // This is used to re-check if the soprano note and alto note are within an octave range.  
      if (moreThanOctave == 1)
      {
        // First looks at 1 and 3 at the position : 
        //                                            1
        //                                            3
        //                                            5
        // Condition of when the third note is in the alto position.
        if (phAlto == thirdNote)
        {
          // Condition of when the third note's octave range is less than the extra root note's octave range.  
          if (parseInt(bufferThird[1]) < parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of the smaller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the extra root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == extRootNote)
              {
                if (counter <= 8)
                {
                  phSoprano = extRootNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is greater than the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smaller note(the extra root note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (extRootNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the third note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the extra root note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = extRootNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is equal to the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the third note and extra root note in this case) in the letter array.
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferExtraRootNote[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
            
            // Condition of when the first letter position(the extra root note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the extra root note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = extRootNote;
            }
            // Condition of when the first letter position(the extra root note in this case) is greater than the second letter position(the third note in this case).
            // The extra root note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = extRootNote;
              phAlto = thirdNote;
            }      
          }
        }
        // Then looks at 1 and 5 at the position : 
        //                                            1
        //                                            5
        //                                            3
        // Condition of when the fifth note is in the alto position.
        else if (phAlto == fifthNote)
        {
          // Condition of when the fifth note's octave range is less than the extra root note's octave range. 
          if (parseInt(bufferFifth[1]) < parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of the smazller note(the fifth note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (fifthNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }
          
            // Find how many notes are between the starting position and the larger note(the extra root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the fifth note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == extRootNote)
              {
                if (counter <= 8)
                {
                  phSoprano = extRootNote;
                  phAlto = fifthNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is greater than the extra root note's octave range. 
          else if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferFifth[1]))
          {
            // Find the position of the smazller note(the extra root note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (extRootNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the fifth note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the extra root note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == fifthNote)
              {
                if (counter <= 8)
                {
                  phSoprano = fifthNote;
                  phAlto = extRootNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
        }
      }
      // Condition of when the fifth note's octave range is equal to the extra root note's octave range.
      else if (parseInt(bufferFifth[1]) == parseInt(bufferExtraRootNote[1]))
      {
        // Find the position of both notes(the fifth note and extra root note in this case) in the letter array. 
        for (i = 0; i < letterArray.length; i++)
        {
          if (bufferFifth[0] == letterArray[i])
          {
            var letterPosition1 = i;
          }

          if (bufferExtraRootNote[0] == letterArray[i])
          {
            var letterPosition2 = i;
          }
        }
        
        // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the extra root note in this case).
        // The extra root note is assigned to the soprano position and the fifth note is assigned to the alto position.
        if (letterPosition1 < letterPosition2)
        {
          phSoprano = extRootNote;
          phAlto = fifthNote;
        }
        // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the extra root note in this case).
        // The fifth note is assigned to the soprano position and the extra root note is assigned to the alto position.
        else if (letterPosition1 > letterPosition2)
        {
          phSoprano = fifthNote;
          phAlto = extRootNote;
        }
      }  
    }
    // Looks at the position and looks at 1 and 5: 
    //                                               3
    //                                               1
    //                                               5
    // Condition of when the extra root note is in the alto voice position.    
    else if (phAlto == extRootNote)
    {
      // Condition of when the fifth note's octave range is different than the extra root note's octave range (alto octave range doesn't equal tenor octave range).
      if (bufferFifth[1] != bufferExtraRootNote[1])
      {
        // Condition of when the extra root note's octave range is less than the fifth note's octave range.
        if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the extra root note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (extRootNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }

          // Find how many notes are between the starting position and the larger note(the fifth note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the alto position and the extra root note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == fifthNote)
            {
              if (counter <= 8)
              {
                phAlto = fifthNote;
                phTenor = extRootNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
        // Condition of when the extra root note's octave range is greater than the fifth note's octave range.
        else if (parseInt(bufferExtraRootNote[1]) > parseInt(bufferFifth[1]))
        {
          // Find the position of the smaller note(the fifth note in this case) in the position array.
          for (i = 0; i < positionArray.length; i++)
          {
            if (fifthNote == positionArray[i])
            {
              var startingPosition = i;
            }
          }

          // Find how many notes are between the starting position and the larger note(the extra root note note in this case).
          // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the alto position and the fifth note to the tenor position.
          for (i = startingPosition; i < positionArray.length; i++)
          {
            if (positionArray[i] == extRootNote)
            {
              if (counter <= 8)
              {
                phAlto = extRootNote;
                phTenor = fifthNote;
              }
              else if (counter > 8)
              {
                console.log("MORE THAN AN OCTAVE");
              }
            }
            counter++;
          }
        }
      }
      // Condition of when the fifth note's octave range is equal to the extra root note's octave range.
      // The fifth note is assigned to the alto position and the extra root note is assigned to the tenor position.
      else if (parseInt(bufferFifth[1]) == parseInt(bufferExtraRootNote[1]))
      {
        phAlto = fifthNote;
        phTenor = extRootNote;  
      }

      // Final Positions for this case: 
      //                                  3          or         3
      //                                  1                     5
      //                                  5                     1

      // Condition of when the moreThanOctave variable is equal to 1.
      // This is used to re-check if the soprano note and alto note are within an octave range.
      if (moreThanOctave == 1)
      {
        // First looks at 3 and 1 at the position : 
        //                                            3
        //                                            1
        //                                            5
        // Condition of when the extra root note is in the alto position.
        if (phAlto == extRootNote)
        {
          // Condition of when the third note's octave range is less than the extra root note's octave range.
          if (parseInt(bufferThird[1]) < parseInt(bufferExtraRootNote[1]))
          {
            // Find the position of the smaller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the extra root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the extra root note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == extRootNote)
              {
                if (counter <= 8)
                {
                  phSoprano = extRootNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is greater than the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smaller note(the extra root note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (extRootNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the third root note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the extra root note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = extRootNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the third note's octave range is equal to the extra root note's octave range.
          else if (parseInt(bufferExtraRootNote[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the third note and extra root note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferExtraRootNote[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
            
            // Condition of when the first letter position(the extra root note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the extra root note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = extRootNote;
            }
            // Condition of when the first letter position(the extra root note in this case) is greater than the second letter position(the third note in this case).
            // The extra root note note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = extRootNote;
              phAlto = thirdNote;
            } 
          }
        }
        // Then looks at 3 and 5 at the position : 
        //                                            3
        //                                            5
        //                                            1
        // Condition of when the fifth note is in the alto position.
        else if (phAlto == fifthNote)
        {
          // Condition of when the fifth note's octave range is less than the third note's octave range.
          if (parseInt(bufferFifth[1]) < parseInt(bufferThird[1]))
          {
            // Find the position of the smaller note(the fifth note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (fifthNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }
          
            // Find how many notes are between the starting position and the larger note(the third note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the third note can be assigned to the soprano position and the fifth note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == thirdNote)
              {
                if (counter <= 8)
                {
                  phSoprano = thirdNote;
                  phAlto = fifthNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is greater than the third note's octave range.
          else if (parseInt(bufferThird[1]) < parseInt(bufferFifth[1]))
          {
            // Find the position of the smaller note(the third note in this case) in the position array.
            for (i = 0; i < positionArray.length; i++)
            {
              if (thirdNote == positionArray[i])
              {
                var startingPosition = i;
              }
            }

            // Find how many notes are between the starting position and the larger note(the fifth note in this case).
            // If the counter is less than or equal to 8 that means the notes are within an octave range and the fifth note can be assigned to the soprano position and the third note to the alto position.
            // However, if the counter is more or equal to 8 all of the placeholder variables will be reset to nothing.
            for (i = startingPosition; i < positionArray.length; i++)
            {
              if (positionArray[i] == fifthNote)
              {
                if (counter <= 8)
                {
                  phSoprano = fifthNote;
                  phAlto = thirdNote;         
                }
                else if (counter > 8)
                {
                  console.log("MORE THAN AN OCTAVE");
                  phSoprano = "";
                  phAlto = "";
                  phTenor = "";
                }
              }
              counter++;
            }
          }
          // Condition of when the fifth note's octave range is equal to the third note's octave range.
          else if (parseInt(bufferFifth[1]) == parseInt(bufferThird[1]))
          {
            // Find the position of both notes(the fifth note and third note in this case) in the letter array. 
            for (i = 0; i < letterArray.length; i++)
            {
              if (bufferFifth[0] == letterArray[i])
              {
                var letterPosition1 = i;
              }

              if (bufferThird[0] == letterArray[i])
              {
                var letterPosition2 = i;
              }
            }
            
            // Condition of when the first letter position(the fifth note in this case) is less than the second letter position(the third note in this case).
            // The third note is assigned to the soprano position and the fifth note is assigned to the alto position.
            if (letterPosition1 < letterPosition2)
            {
              phSoprano = thirdNote;
              phAlto = fifthNote;
            }
            // Condition of when the first letter position(the fifth note in this case) is greater than the second letter position(the third note in this case).
            // The fifth note is assigned to the soprano position and the third note is assigned to the alto position.
            else if (letterPosition1 > letterPosition2)
            {
              phSoprano = fifthNote;
              phAlto = thirdNote;
            }   
          }
        }
      }
    }
    // Assign all the placeholder variables for the voices to the actual voice variables.
    soprano = phSoprano;
    alto = phAlto;
    tenor = phTenor;
  }

  // Condition of if any of the final voice position is empty
  if (alto == "" || tenor == "" ||  soprano == "")
  {
    // Reset all placeholder and final voice position variables.
    alto = "";
    tenor = "";
    soprano = "";

    phAlto = "";
    phTenor = "";
    phSoprano = "";

    // Display is not octave text.
    document.getElementById("isNotOctave").style.display = "inline-block"; 

    // Disable draw button.
    document.getElementById("drawButton").style.color = "grey";
    document.getElementById("drawButton").disabled = true;

    // Disable submit button.
    document.getElementById("submitButton").style.color = "grey";
    document.getElementById("submitButton").disabled = true;

    // Enable clear button.
    document.getElementById("clearButton").style.color = "white";
    document.getElementById("clearButton").disabled = false;

    // Reset counter and moreThanOctave counter.
    moreThanOctave = 0;
    counter = 0;
  }
  else
  {
    // Reassign notes back to note variables.
    thirdNote = bufferThird[0] + "/" + bufferThird[1];
    fifthNote = bufferFifth[0] + "/" + bufferFifth[1];
    extRootNote = bufferExtraRootNote[0] + "/" + bufferExtraRootNote[1];
    
    // Display is octave text.
    document.getElementById("isOctave").style.display = "inline-block";

    // Reset counter and moreThanOctave counter.
    moreThanOctave = 0;
    counter = 0;
  }
}
