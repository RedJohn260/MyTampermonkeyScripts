// ==UserScript==
// @name         Kick Chat Overlay
// @version      1.0
// @description  Shows chat messages as overlay on video with customizable settings panel and supports username colors + emotes.
// @author       RedJohn260
// @match        https://kick.com/*
// @icon         https://kick.com/favicon.ico
// @source       https://github.com/RedJohn260/MyTampermonkeyScripts/KickChatOverlay
// @homepage     https://github.com/RedJohn260/MyTampermonkeyScripts
// @homepageURL  https://github.com/RedJohn260/MyTampermonkeyScripts/KickChatOverlay
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/KickChatOverlay/kick-chat-overlay.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/KickChatOverlay/kick-chat-overlay.user.js
// @supportURL   https://github.com/RedJohn260/MyTampermonkeyScripts/issues
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  const settings = {
    opacity: GM_getValue('opacity', 0.6),
    fontSize: GM_getValue('fontSize', 18),
    overlayWidth: GM_getValue('overlayWidth', 300),
    offsetTop: GM_getValue('offsetTop', 50),
    offsetBottom: GM_getValue('offsetBottom', 50),
    maxMessages: GM_getValue('maxMessages', 10),
    hideDelay: GM_getValue('hideDelay', 10),
    autoHide: GM_getValue('autoHide', false),
  };

  function saveSettings() {
    for (const key in settings) GM_setValue(key, settings[key]);
  }

  const style = document.createElement('style');
  style.textContent = `
    .chat-overlay-container {
      position: absolute;
      right: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      z-index: 9999;
      pointer-events: none;
    }

    .chat-message {
      color: white;
      margin: 4px 0;
      background: rgba(0, 0, 0, 0.5);
      padding: 6px 10px;
      border-radius: 8px;
      max-width: 100%;
      word-wrap: break-word;
      transition: opacity 0.5s ease;
      font-family: sans-serif;
      pointer-events: auto;
    }

    #overlaySettingsToggle {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.5);
      color: white;
      font-size: 18px;
      padding: 6px 10px;
      border-radius: 6px;
      z-index: 10001;
      cursor: pointer;
      pointer-events: auto;
      transition: opacity 0.3s ease;
    }

    #overlaySettingsPanel {
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 12px;
      font-family: sans-serif;
      font-size: 14px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 280px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      display: none;
      position: absolute;
    }

    #overlaySettingsPanel label {
      display: block;
      margin-top: 8px;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  function createSlider(labelText, settingKey, min, max, step, unit) {
    const label = document.createElement('label');

    const valSpan = document.createElement('span');
    valSpan.style.marginLeft = '6px';
    valSpan.style.minWidth = '30px';
    valSpan.style.display = 'inline-block';
    valSpan.textContent = settings[settingKey] + (unit || '');

    label.textContent = labelText + ': ';
    label.appendChild(valSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = settings[settingKey];
    input.style.width = '100%';

    input.oninput = () => {
      settings[settingKey] = parseFloat(input.value);
      valSpan.textContent = settings[settingKey] + (unit || '');
      saveSettings();
      applySettings();
    };

    label.appendChild(document.createElement('br'));
    label.appendChild(input);

    return label;
  }

  function createCheckbox(labelText, settingKey) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = settings[settingKey];

    input.onchange = () => {
      settings[settingKey] = input.checked;
      saveSettings();
    };

    label.appendChild(input);
    label.append(` ${labelText}`);
    return label;
  }

  function createSettingsPanel(applySettings, container) {
    const panel = document.createElement('div');
    panel.id = 'overlaySettingsPanel';

    panel.appendChild(createSlider('Background Opacity', 'opacity', 0, 1, 0.05));
    panel.appendChild(createSlider('Font Size', 'fontSize', 10, 30, 1, 'px'));
    panel.appendChild(createSlider('Overlay Width', 'overlayWidth', 100, 800, 10, 'px'));
    panel.appendChild(createSlider('Top Offset', 'offsetTop', 0, 500, 10, 'px'));
    panel.appendChild(createSlider('Bottom Offset', 'offsetBottom', 0, 500, 10, 'px'));
    panel.appendChild(createSlider('Max Messages', 'maxMessages', 1, 100, 1));
    panel.appendChild(createSlider('Hide Delay', 'hideDelay', 1, 60, 1, 's'));
    panel.appendChild(createCheckbox('Hide Overlay When Inactive', 'autoHide'));

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.backgroundColor = '#444';
    closeBtn.style.color = 'white';
    closeBtn.onclick = () => {
      panel.style.display = 'none';
      toggleButton.style.display = 'block';
      toggleButton.style.opacity = '0';
      toggleButton.style.pointerEvents = 'none';
    };
    panel.appendChild(closeBtn);

    container.appendChild(panel);
    return panel;
  }

  function applySettings() {
    overlay.style.width = `${settings.overlayWidth}px`;
    overlay.style.top = `${settings.offsetTop}px`;
    overlay.style.bottom = `${settings.offsetBottom}px`;
    for (const msg of overlay.children) {
      msg.style.fontSize = `${settings.fontSize}px`;
      msg.style.background = `rgba(0,0,0,${settings.opacity})`;
    }
  }

  let overlay, toggleButton, settingsPanel, hideTimer;

  const initOverlay = () => {
    const video = document.querySelector('#video-player');
    const chat = document.querySelector('#chatroom-messages');
    if (!video || !chat) return;

    const videoParent = video.parentElement;
    videoParent.style.position = 'relative';

    overlay = document.createElement('div');
    overlay.className = 'chat-overlay-container';
    videoParent.appendChild(overlay);

    toggleButton = document.createElement('div');
    toggleButton.id = 'overlaySettingsToggle';
    toggleButton.textContent = '⚙️';
    videoParent.appendChild(toggleButton);

    toggleButton.style.opacity = '0';
    toggleButton.style.pointerEvents = 'none';
    videoParent.addEventListener('mouseenter', () => {
      toggleButton.style.opacity = '1';
      toggleButton.style.pointerEvents = 'auto';
    });
    videoParent.addEventListener('mouseleave', () => {
      if (settingsPanel.style.display === 'none') {
        toggleButton.style.opacity = '0';
        toggleButton.style.pointerEvents = 'none';
      }
    });

    settingsPanel = createSettingsPanel(applySettings, videoParent);

    toggleButton.onclick = () => {
      settingsPanel.style.display = 'block';
      toggleButton.style.display = 'none';
      const rect = toggleButton.getBoundingClientRect();
      const parentRect = videoParent.getBoundingClientRect();
      settingsPanel.style.top = (rect.bottom - parentRect.top + 10) + 'px';
      settingsPanel.style.left = (rect.left - parentRect.left + 10) + 'px';
    };

    applySettings();

    let lastMessageHTML = '';
    const observer = new MutationObserver(() => {
      // New chat messages container might be nested, adjust if Kick changes layout
      const messages = chat.querySelectorAll('div[style*="transform"] > div');
      if (!messages.length) return;

      const lastNode = messages[messages.length - 1];
      const newHTML = lastNode.innerHTML;
      if (newHTML && newHTML !== lastMessageHTML) {
        lastMessageHTML = newHTML;

        // Clone full node with styles and emotes
        const clone = lastNode.cloneNode(true);
        clone.className = 'chat-message';
        clone.style.background = `rgba(0,0,0,${settings.opacity})`;
        clone.style.fontSize = `${settings.fontSize}px`;
        clone.style.margin = '4px 0';
        clone.style.pointerEvents = 'auto';

        overlay.appendChild(clone);
        overlay.scrollTop = overlay.scrollHeight;

        while (overlay.children.length > settings.maxMessages) {
          overlay.removeChild(overlay.firstChild);
        }

        overlay.style.display = 'flex';
        if (hideTimer) clearTimeout(hideTimer);
        if (settings.autoHide) {
          hideTimer = setTimeout(() => {
            overlay.style.display = 'none';
          }, settings.hideDelay * 1000);
        }
      }
    });

    observer.observe(chat, { childList: true, subtree: true });
  };

  const waitForElements = setInterval(() => {
    if (document.querySelector('#video-player') && document.querySelector('#chatroom-messages')) {
      clearInterval(waitForElements);
      initOverlay();
    }
  }, 1000);
})();