// ==UserScript==
// @name         Steam Workshop Item ID Display
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Display Steam Workshop item IDs on thumbnails or as tooltips, with a delay to allow loading.
// @author       RedJohn260
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/SteamWorkshopItemID/SteamWorkshopItemIDDisplay.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/SteamWorkshopItemID/SteamWorkshopItemIDDisplay.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @match        *://steamcommunity.com/workshop/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the item ID on each thumbnail
    function addItemID() {
        // Select all workshop item elements
        const items = document.querySelectorAll('.workshopItem');

        items.forEach(item => {
            // Find the link and extract the item ID from the URL
            const link = item.querySelector('a');
            if (link) {
                const url = link.href;
                const idMatch = url.match(/id=(\d+)/);
                if (idMatch && idMatch[1]) {
                    const itemID = idMatch[1];

                    // Create a small div overlay to display the ID on thumbnail
                    const idOverlay = document.createElement('div');
                    idOverlay.textContent = `ID: ${itemID}`;
                    idOverlay.style.position = 'absolute';
                    idOverlay.style.bottom = '5px';
                    idOverlay.style.left = '5px';
                    idOverlay.style.padding = '2px 5px';
                    idOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    idOverlay.style.color = 'white';
                    idOverlay.style.fontSize = '12px';
                    idOverlay.style.borderRadius = '3px';

                    // Apply the overlay div on the item
                    item.style.position = 'relative';
                    item.appendChild(idOverlay);

                    // Alternatively, add the item ID as a title tooltip
                    link.title = `ID: ${itemID}`;
                }
            }
        });
    }

    // Add a 1-second delay before running the addItemID function
    setTimeout(addItemID, 1000);

})();