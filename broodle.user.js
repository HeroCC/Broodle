// ==UserScript==
// @name         Broodle
// @namespace    https://herocc.com/
// @downloadURL  https://github.com/HeroCC/Broodle/raw/master/broodle.user.js
// @version      0.2
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

// Some strange bits about storing Maps http://2ality.com/2015/08/es6-map-json.html

(function() {
    'use strict';

    const fullAuto = false;
    let unit = "";
    let increment = 0.1;
    const startAt = 0.0;
    const endAt = 120.0;

    // These bits only apply if fullAuto = true
    const possibleUnits = ["", "m", "m/s", "m/s^2", "N", "cm", "cm/s", "cm/s^2", "kg", "kgm^2", "J"];

    // Begin real code here
    let answerInput;
    let submitButton;
    let continueButton;
    let possibleInputs = document.getElementsByTagName("input");
    for (var i = 0; i < possibleInputs.length; i++) {
        var inputType = possibleInputs[i].getAttribute("type");
        if (inputType == "text") {
            answerInput = possibleInputs[i];
        } else if (inputType == "submit") {
            if (submitButton == null) {
                submitButton = possibleInputs[i];
            } else if (continueButton == null) {
                continueButton = possibleInputs[i];
            }
        }
    }
    if (isNaN(answerInput) && fullAuto) continueButton.click(); // ABORT
    let qData = new Map();
    let qId = answerInput.id;
    if (GM_getValue(qId) != null) {
        qData = new Map(JSON.parse(GM_getValue(qId)));
    }

    // By now we should have the proper input text
    let lastTriedValue = parseFloat(qData.get('lastTriedValue'));
    if (isNaN(lastTriedValue)) lastTriedValue = 0;
    let answerToTry = lastTriedValue;
    if (answerInput.getAttribute("class") == "partiallycorrect") { // Assume our units are messed up
        if (qData.get('lastTriedUnitIndex') == null) qData.set('lastTriedUnitIndex', -1);
        let nextUnitIndex = qData.get('lastTriedUnitIndex') + 1;
        if (nextUnitIndex > possibleUnits.length) {
            alert("Unknown unit!");
            return;
        }
        unit = possibleUnits[nextUnitIndex];
        qData.set('lastTriedUnitIndex', nextUnitIndex);
    } else if (answerInput.getAttribute("class") == "correct") {
        if (fullAuto) {
            alert("GOING");
            continueButton.click();
        }
        return;
    } else if (answerInput.getAttribute("class") == "incorrect" || answerInput.getAttribute("class") == null) {
        let form = document.getElementsByTagName("form")[0];
        if (isNaN(lastTriedValue)) { lastTriedValue = startAt; }
        if (lastTriedValue >= endAt) {
            alert("Done! Couldn't find with these parameters");
            return;
        }
        answerToTry = answerToTry + increment;
    }

    qData.set('lastTriedValue', answerToTry);
    GM_setValue(qId, JSON.stringify([...qData]));
    answerInput.value = answerToTry.toFixed(decimalPlaces(increment)) + unit;
    submitButton.click();

})();
