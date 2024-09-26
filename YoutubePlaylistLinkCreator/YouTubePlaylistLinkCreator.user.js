// ==UserScript==
// @name         YouTube Playlist Link Creator
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Auto-reload on the YouTube channel's videos page and add a playlist button without infinite loops
// @author       RedJohn260
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/YoutubePlaylistLinkCreator/YoutubePlaylistLinkCreator.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/main/YoutubePlaylistLinkCreator/YoutubePlaylistLinkCreator.user.js
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

    // Function to create a temporary playlist link
    function createTemporaryPlaylist() {
        const ytInitialData = window.ytInitialData;
        const channelId = ytInitialData?.metadata?.channelMetadataRenderer?.externalId;

        if (!channelId) {
            console.log("YTPLC: Channel ID could not be determined.");
            return;
        }

        const playlistUrl = `https://www.youtube.com/playlist?list=UU${channelId.slice(2)}`;
        console.log(`YTPLC: Your temporary playlist URL is:\n${playlistUrl}`);
        window.open(playlistUrl, '_blank');
    }

    // Function to add the button to the specified container
    function addButton() {
        const buttonContainer = document.querySelector('iron-selector#chips');
        if (!buttonContainer) return;

        // Check if the button already exists
        if (!document.getElementById('temp-playlist-btn')) {
            const button = document.createElement('button');
            button.id = 'temp-playlist-btn';
            button.innerText = 'Create Playlist';
            button.style.marginLeft = '10px';
            button.style.padding = '8px 16px';
            button.style.backgroundColor = '#FF0000'; // YouTube red
            button.style.color = '#000000';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.onclick = createTemporaryPlaylist;

            buttonContainer.appendChild(button);
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
                addButton(); // Add button when on the channel's video tab
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
