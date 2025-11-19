// ==UserScript==
// @name         Nexusmods Show Updated Mods
// @version      1.0
// @description  Toggle to show only mods with updates available on NexusMods, remembers state, works on page changes.
// @author       RedJohn260
// @match        https://www.nexusmods.com/games/*/mods*
// @match        https://www.nexusmods.com/
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.nexusmods.com/&size=256
// @source       https://github.com/RedJohn260/MyTampermonkeyScripts/NexusmodsShowUpdatedMods
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @homepageURL  https://github.com/RedJohn260/MyTampermonkeyScripts/NexusmodsShowUpdatedMods
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/NexusmodsShowUpdatedMods/nexusmods-show-updated-mods.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/NexusmodsShowUpdatedMods/nexusmods-show-updated-mods.user.js
// @supportURL   https://github.com/RedJohn260/MyTampermonkeyScripts/issues
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let filterOn = localStorage.getItem('nexusUpdatedToggle') === 'true';

    function applyFilter() {
        const modsGrid = document.querySelector('.mods-grid');
        if (!modsGrid) return;

        const modTiles = modsGrid.querySelectorAll('div[class*="mod-tile"]');
        modTiles.forEach(tile => {
            const hasUpdate = tile.querySelector('[data-e2eid="mod-tile-update-available"]');
            tile.style.display = (filterOn && !hasUpdate) ? 'none' : '';
        });

        const btn = document.querySelector('#toggleUpdatedBtn');
        if (btn) {
            btn.style.backgroundColor = filterOn ? '#ff555522' : '';
            btn.title = filterOn ? 'Show all mods' : 'Show only mods with updates';
        }
    }

    function addToggleButton() {
        const container = document.querySelector('.ml-auto.hidden.gap-x-4.md\\:flex');
        if (!container || document.querySelector('#toggleUpdatedBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'toggleUpdatedBtn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Toggle Updates');
        btn.className = 'group/select flex min-h-9 shrink-0 select-none items-center justify-center transition-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-translucent-weaker text-neutral-moderate rounded px-3 enabled:hover-overlay enabled:before:rounded sm:px-2.5 sm:min-h-7';

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("role", "presentation");
        svg.classList.add("-mx-0.5", "shrink-0");
        svg.style.width = "1.25rem";
        svg.style.height = "1.25rem";
        svg.innerHTML = `<path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z" style="fill: currentcolor;"></path>`;
        btn.appendChild(svg);
        container.appendChild(btn);

        btn.title = filterOn ? 'Show all mods' : 'Show only mods with updates';
        btn.style.backgroundColor = filterOn ? '#ff555522' : '';

        btn.onclick = () => {
            filterOn = !filterOn;
            localStorage.setItem('nexusUpdatedToggle', filterOn);
            applyFilter();
        };
    }

    const observer = new MutationObserver(() => {
        addToggleButton();
        applyFilter();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        addToggleButton();
        applyFilter();
    });

    window.addEventListener('popstate', () => {
        applyFilter();
    });
})();