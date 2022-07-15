// ==UserScript==
// @name         Play All Button
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  This script returns "Play All" button for "Uploads" videos when on channel "Videos" tab.Site refresh (F5) required once on "Videos" channel tab. 
// @author       RedJohn260
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/PlayAllButton/PlayAllButton.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/PlayAllButton/PlayAllButton.user.js
// @match        ://*.youtube.com/c/*/videos
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        GM_getResourceText
// @run-at       document-start
// @grant        window.onurlchange
// ==/UserScript==

(function () {
    "use strict";
    var urlExt = "?view=57";
    var url = window.location.pathname;
    var newURL = window.location.protocol + "//"
            + window.location.host
            + url + urlExt
            + window.location.search
            + window.location.hash
            ;
        window.location.replace(newURL);
})();