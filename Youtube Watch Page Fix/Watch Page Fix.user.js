// ==UserScript==
// @name         Youtube Watch Page Fix
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Removes some of the changes to the youtube watch page that were implemented on May 9, 2022.Based on Lightbeam24's style for Stylus: https://userstyles.world/style/4623/youtube-watch-page-fix.
// @author       RedJohn260, Lightbeam24
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/Youtube%20Watch%20Page%20Fix/Watch%20Page%20Fix.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/Youtube%20Watch%20Page%20Fix/Watch%20Page%20Fix.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// @grant        GM.getValue
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';
    GM_addStyle ( `
    .ytd-watch-metadata  {
        display: none !important;
    }
    #meta-contents[hidden], #info-contents[hidden] {
         display: block !important;
    }
    #comment-teaser.ytd-watch-metadata {
         display: none;
   }
   #owner.ytd-watch-metadata {
         border: none;
   }
   ytd-watch-metadata:not([modern-metapanel]) #owner.ytd-watch-metadata {
        border: none;
  }
  ytd-watch-metadata[smaller-yt-sans-light-title] h1.ytd-watch-metadata {
        font-family: "Roboto",sans-serif;
        font-weight: 400;
        font-size: 18px;
  }
  ytd-video-primary-info-renderer[use-yt-sans20-light] .title.ytd-video-primary-info-renderer {
        font-family: "Roboto",sans-serif;
        font-weight: 400;
        font-size: 18px;
  }
  .yt-formatted-string[style-target="bold"] {
        font-weight: 400;
  }
` );
})();