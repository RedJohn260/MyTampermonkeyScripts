// ==UserScript==
// @name         YouTube Playlist Link Creator
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Auto-reload on the YouTube channel's videos page and add a playlist button without infinite loops
// @author       RedJohn260
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/YoutubePlaylistLinkCreator/YoutubePlaylistLinkCreator.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/YoutubePlaylistLinkCreator/YoutubePlaylistLinkCreator.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to reload the page when on /videos tab
    function reloadPageIfOnVideosTab() {
        const currentUrl = window.location.href;

        // Check if we're on the /videos tab and if the reload flag is not set
        if (currentUrl.includes('/videos') && !sessionStorage.getItem('hasReloaded')) {
            sessionStorage.setItem('hasReloaded', 'true'); // Set flag to indicate the page has been reloaded
            location.reload(); // Reload the page
        }
    }

    // Function to create a playlist link
    function CreatePlaylist(playlist_url) {
        try {
            window.open(playlist_url, '_blank');
        } catch (error) {
            console.error('YTPLC: Error accessing storage:', error);
        }
    }


    // Function to create a button with customizable properties
    function createButton(buttonText, playlist_url) {
        const button = document.createElement('button');
        button.id = "playlist-btn";
        button.innerText = buttonText;
        button.style.fontFamily = '"Roboto", "Arial", sans-serif';
        button.style.fontSize = "14px";
        button.style.lineHeight = "1.42rem";
        button.style.fontWeight = 500;
        button.style.marginLeft = '10px';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // YouTube gray
        button.style.color = '#f1f1f1';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.filter = "brightness(1) contrast(1) saturate(1)";
        // Click event to request storage access and create playlist
        button.onclick = function () {
            if (document.hasStorageAccess()) {
                CreatePlaylist(playlist_url);
            } else {
                // Directly request storage access from user gesture
                document.requestStorageAccess().then(() => {
                    CreatePlaylist(playlist_url);
                }).catch(error => {
                    console.error('YTPLC: Storage access denied:', error);
                });
            }
        };
        // Add hover effect
        button.addEventListener('mouseover', function () {
            button.style.backgroundColor = '#323232'; // Dark background on hover
        });

        // Remove hover effect
        button.addEventListener('mouseout', function () {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Reset background color
        });

        return button;
    }

    // Function to add the button to the specified container
    function addButtonsWithRetry(retries = 5) {

        // Check and request storage access
        const hasAccess = document.hasStorageAccess();
        if (!hasAccess) {
            document.requestStorageAccess();
        }

        const ytInitialData = window.ytInitialData;
        const channelId = ytInitialData?.metadata?.channelMetadataRenderer?.externalId;

        if (!channelId) {
            console.log("YTPLC: Channel ID could not be determined.");
            return;
        }

        const buttonContainer = document.querySelector('iron-selector#chips');
        if (buttonContainer) {

            // Add Button for all channel videos
            if (!document.getElementById('playlist-btn')) {

                const button_all = createButton('Play All', `https://www.youtube.com/playlist?list=UU${channelId.slice(2)}`);
                buttonContainer.appendChild(button_all);
                // Add Button for full channel videos
                const button_full = createButton('Play Full', `https://www.youtube.com/playlist?list=UULF${channelId.slice(2)}`);
                buttonContainer.appendChild(button_full);

                // Add Button for short channel videos
                const button_short = createButton('Play Shorts', `https://www.youtube.com/playlist?list=UUSH${channelId.slice(2)}`);
                buttonContainer.appendChild(button_short);
            }

        } else if (retries > 0) {
            setTimeout(() => addButtonsWithRetry(retries - 1), 500); // Retry after 500ms
        } else {
            console.log("YTPLC: Button container not found after several attempts.");
        }
    }

    // Function to clear the reload flag when navigating away from /videos
    function clearReloadFlagIfNotOnVideosTab() {
        if (!window.location.href.includes('/videos')) {
            sessionStorage.removeItem('hasReloaded'); // Clear the reload flag
        }
    }

    // MutationObserver callback function
    function observePageChanges() {
        const targetNode = document.querySelector('body'); // Observe changes on the entire page
        const config = { childList: true, subtree: true };

        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;

            // Clear the reload flag if we are not on the /videos tab
            clearReloadFlagIfNotOnVideosTab();

            // Check if we are on the /videos tab
            reloadPageIfOnVideosTab(); // Call function to reload the page

            if (currentUrl.includes('/videos')) {
                addButtonsWithRetry(); // Add buttons when on the channel's video tab
            }
        });

        observer.observe(targetNode, config);
    }

    // Run script after the page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            observePageChanges(); // Start observing page changes
        }, 1500);
    });
})();