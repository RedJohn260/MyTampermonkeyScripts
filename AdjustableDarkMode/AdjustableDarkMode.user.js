// ==UserScript==
// @name         Adjustable Dark Mode
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Control background, text, button, link, and block element colors, persist changes across reloads, include a reset option, a shortcut to toggle the panel, and a whitelist feature. Improved panel layout.
// @author       RedJohn260
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the panel for controls
    let panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.left = '10px';
    panel.style.padding = '15px';
    panel.style.backgroundColor = '#f9f9f9';
    panel.style.zIndex = '9999';
    panel.style.border = '1px solid black';
    panel.style.fontSize = '14px';
    panel.style.display = 'none'; // Start with panel hidden
    panel.style.maxWidth = '300px';
    panel.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';

    // Create and style sections
    function createSection(title) {
        let section = document.createElement('div');
        section.style.marginBottom = '15px';

        let sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.fontSize = '16px';
        sectionTitle.style.marginBottom = '5px';
        section.appendChild(sectionTitle);

        return section;
    }

    // Background and Text color section
    let colorsSection = createSection('Colors');

    // Background color input
    let bgLabel = document.createElement('label');
    bgLabel.textContent = 'Background: ';
    let bgInput = document.createElement('input');
    bgInput.type = 'color';
    bgInput.style.marginLeft = '10px';
    colorsSection.appendChild(bgLabel);
    colorsSection.appendChild(bgInput);
    colorsSection.appendChild(document.createElement('br'));

    // Text color input
    let textLabel = document.createElement('label');
    textLabel.textContent = 'Text: ';
    let textInput = document.createElement('input');
    textInput.type = 'color';
    textInput.style.marginLeft = '45px';
    colorsSection.appendChild(textLabel);
    colorsSection.appendChild(textInput);

    // Button colors section
    let buttonSection = createSection('Button Colors');

    // Button background color input
    let buttonBgLabel = document.createElement('label');
    buttonBgLabel.textContent = 'Button BG: ';
    let buttonBgInput = document.createElement('input');
    buttonBgInput.type = 'color';
    buttonBgInput.style.marginLeft = '20px';
    buttonSection.appendChild(buttonBgLabel);
    buttonSection.appendChild(buttonBgInput);
    buttonSection.appendChild(document.createElement('br'));

    // Button text color input
    let buttonTextLabel = document.createElement('label');
    buttonTextLabel.textContent = 'Button Text: ';
    let buttonTextInput = document.createElement('input');
    buttonTextInput.type = 'color';
    buttonTextInput.style.marginLeft = '10px';
    buttonSection.appendChild(buttonTextLabel);
    buttonSection.appendChild(buttonTextInput);

    // Link colors section
    let linkSection = createSection('Link Colors');

    // Link color input
    let linkColorLabel = document.createElement('label');
    linkColorLabel.textContent = 'Link: ';
    let linkColorInput = document.createElement('input');
    linkColorInput.type = 'color';
    linkColorInput.style.marginLeft = '45px';
    linkSection.appendChild(linkColorLabel);
    linkSection.appendChild(linkColorInput);
    linkSection.appendChild(document.createElement('br'));

    // Link hover color input
    let linkHoverColorLabel = document.createElement('label');
    linkHoverColorLabel.textContent = 'Link Hover: ';
    let linkHoverColorInput = document.createElement('input');
    linkHoverColorInput.type = 'color';
    linkHoverColorInput.style.marginLeft = '10px';
    linkSection.appendChild(linkHoverColorLabel);
    linkSection.appendChild(linkHoverColorInput);

    // Whitelist section
    let whitelistSection = createSection('Whitelist');

    // Whitelist textarea
    let whitelistLabel = document.createElement('label');
    whitelistLabel.textContent = 'Whitelist (URLs):';
    whitelistLabel.style.display = 'block';
    let whitelistTextarea = document.createElement('textarea');
    whitelistTextarea.rows = 4;
    whitelistTextarea.cols = 30;
    whitelistTextarea.placeholder = 'Enter URLs (one per line)...';
    whitelistTextarea.style.marginTop = '5px';
    whitelistTextarea.style.width = '100%';
    whitelistSection.appendChild(whitelistLabel);
    whitelistSection.appendChild(whitelistTextarea);

    // Buttons section
    let buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    // Apply button
    let applyButton = document.createElement('button');
    applyButton.textContent = 'Apply';
    applyButton.style.marginTop = '10px';
    applyButton.style.flex = '1';
    applyButton.style.marginRight = '10px';

    // Reset button
    let resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.marginTop = '10px';
    resetButton.style.flex = '1';

    buttonContainer.appendChild(applyButton);
    buttonContainer.appendChild(resetButton);

    // Save whitelist button
    let saveWhitelistButton = document.createElement('button');
    saveWhitelistButton.textContent = 'Save Whitelist';
    saveWhitelistButton.style.marginTop = '10px';
    saveWhitelistButton.style.display = 'block';
    saveWhitelistButton.style.width = '100%';

    whitelistSection.appendChild(saveWhitelistButton);

    // Append sections to panel
    panel.appendChild(colorsSection);
    panel.appendChild(buttonSection);
    panel.appendChild(linkSection);
    panel.appendChild(whitelistSection);
    panel.appendChild(buttonContainer);

    document.body.appendChild(panel);

    // Function to apply the color changes
    function applyColors() {
        document.body.style.setProperty('background-color', bgInput.value, 'important');
        document.body.style.setProperty('color', textInput.value, 'important');

        // Change colors for all elements
        let allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
            if (getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)') {
                el.style.setProperty('background-color', bgInput.value, 'important');
            }
            el.style.setProperty('color', textInput.value, 'important');
        });

        // Change colors for specific elements
        document.querySelectorAll('p, br, blockquote').forEach((el) => {
            el.style.setProperty('color', textInput.value, 'important');
            el.style.setProperty('background-color', bgInput.value, 'important'); // Optional: to also change background color
        });

        // Change button colors
        let buttons = document.querySelectorAll('button');
        buttons.forEach((button) => {
            button.style.setProperty('background-color', buttonBgInput.value, 'important');
            button.style.setProperty('color', buttonTextInput.value, 'important');
        });

        // Change link colors
        let links = document.querySelectorAll('a');
        links.forEach((link) => {
            link.style.setProperty('color', linkColorInput.value, 'important');
            link.addEventListener('mouseenter', () => {
                link.style.setProperty('color', linkHoverColorInput.value, 'important');
            });
            link.addEventListener('mouseleave', () => {
                link.style.setProperty('color', linkColorInput.value, 'important');
            });
        });

        saveColors();
    }

    // Function to reset colors to default values
    function resetColors() {
        localStorage.removeItem('colorSettings');
        location.reload();
    }

    // Function to save color settings to localStorage
    function saveColors() {
        const colorSettings = {
            bgColor: bgInput.value,
            textColor: textInput.value,
            buttonBgColor: buttonBgInput.value,
            buttonTextColor: buttonTextInput.value,
            linkColor: linkColorInput.value,
            linkHoverColor: linkHoverColorInput.value
        };
        localStorage.setItem('colorSettings', JSON.stringify(colorSettings));
    }

    // Function to save the whitelist to localStorage
    function saveWhitelist() {
        const whitelist = whitelistTextarea.value.split('\n').map(url => url.trim()).filter(url => url !== '');
        localStorage.setItem('whitelist', JSON.stringify(whitelist));
    }

    // Function to load color settings from localStorage
    function loadColors() {
        const savedColors = JSON.parse(localStorage.getItem('colorSettings'));
        if (savedColors) {
            bgInput.value = savedColors.bgColor;
            textInput.value = savedColors.textColor;
            buttonBgInput.value = savedColors.buttonBgColor;
            buttonTextInput.value = savedColors.buttonTextColor;
            linkColorInput.value = savedColors.linkColor;
            linkHoverColorInput.value = savedColors.linkHoverColor;
            applyColors();
        }
    }

    // Function to load the whitelist from localStorage
    function loadWhitelist() {
        const savedWhitelist = JSON.parse(localStorage.getItem('whitelist'));
        if (savedWhitelist) {
            whitelistTextarea.value = savedWhitelist.join('\n');
            return savedWhitelist;
        }
        return [];
    }

    // Function to check if the current site is on the whitelist
    function isWhitelisted() {
        const currentUrl = window.location.href;
        const whitelist = loadWhitelist();
        return whitelist.some(url => currentUrl.includes(url));
    }

    // Toggle panel visibility with shortcut (Ctrl+Alt+D)
    function togglePanel() {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // Event listener for shortcut (Ctrl+Alt+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
            togglePanel();
        }
    });

    // Add event listeners for buttons
    applyButton.addEventListener('click', applyColors);
    resetButton.addEventListener('click', resetColors);
    saveWhitelistButton.addEventListener('click', saveWhitelist);

    // Check if the current site is on the whitelist before running the script
    if (isWhitelisted()) {
        loadColors(); // Load saved colors when the page loads
    }
})();