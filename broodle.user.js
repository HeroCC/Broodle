// ==UserScript==
// @name         Broodle
// @namespace    https://herocc.com/
// @version      0.1
// @description  Brute Solve Moodle
// @author       CC
// @match        http://*/mod/quiz/attempt.php*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

function decimalPlaces(num) {
  // Thanks https://stackoverflow.com/a/10454560/1709894!
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
}

(function() {
    'use strict';
    
    // EDIT USER PREFS HERE
    const unit = " m/s";
    const increment = 0.01;
    const startAt = 0.0;
    const endAt = 10.0;
    // DO NOT EDIT BELOW THIS LINE

    let answerInput;
    let possibleInputs = document.getElementsByTagName("input");
    for (var i = 0; i < possibleInputs.length; i++) {
        var inputType = possibleInputs[i].getAttribute("type");
        if (inputType == "text") {
            answerInput = possibleInputs[i];
        }
    }
    //if (isNaN(answerInput)) return;

    // By now we should have the proper input text
    let lastTriedValue = parseFloat(GM_getValue('lastTriedValue'));
    if (answerInput.getAttribute("class") != "incorrect") {
        alert("Found the answer! You may need to click 'Check' again for the correct answer to save");
        GM_setValue('lastTriedValue', startAt);
        return;
    }
    answerInput.value = 'Starting...';

    let form = document.getElementsByTagName("form")[0];
    if (isNaN(lastTriedValue)) { lastTriedValue = startAt; }
    if (lastTriedValue >= endAt) {
        alert("Done! Couldn't find with these parameters");
        return;
    }

    let answerToTry = lastTriedValue + increment;
    GM_setValue('lastTriedValue', answerToTry);
    answerInput.value = answerToTry.toFixed(decimalPlaces(increment)) + unit;
    form.submit();

})();
