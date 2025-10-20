// ==UserScript==
// @name         Twitch Chat Overlay
// @version      1.1
// @description  Shows Twitch chat messages as overlay on video with customizable settings panel, username colors + emotes. Auto-hide on inactivity.
// @author       RedJohn260
// @match        https://www.twitch.tv/*
// @icon         https://www.twitch.tv/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL  https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/TwitchChatOverlay/twitch-chat-overlay.user.js
// @updateURL    https://github.com/RedJohn260/MyTampermonkeyScripts/raw/refs/heads/main/TwitchChatOverlay/twitch-chat-overlay.user.js
// ==/UserScript==

(function () {
  'use strict';

  const settings = {
    enabled: GM_getValue('enabled', true),
    pinSide: GM_getValue('pinSide', 'right'),
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
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      z-index: 9999;
      pointer-events: none;
      transition: opacity 0.5s ease;
      opacity: 1;
    }
    .chat-message {
      color: white;
      margin: 4px 0;
      background: rgba(0, 0, 0, 0.5);
      padding: 6px 10px;
      border-radius: 8px;
      max-width: 100%;
      word-wrap: break-word;
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

  function createSlider(labelText, key, min, max, step, unit) {
    const label = document.createElement('label');
    const valSpan = document.createElement('span');
    valSpan.style.marginLeft = '6px';
    valSpan.textContent = settings[key] + (unit || '');
    label.textContent = labelText + ': ';
    label.appendChild(valSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = settings[key];
    input.style.width = '100%';
    input.oninput = () => {
      settings[key] = parseFloat(input.value);
      valSpan.textContent = settings[key] + (unit || '');
      saveSettings();
      applySettings();
    };

    label.appendChild(document.createElement('br'));
    label.appendChild(input);
    return label;
  }

  function createCheckbox(labelText, key) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = settings[key];
    input.onchange = () => {
      settings[key] = input.checked;
      saveSettings();
      applySettings();
    };
    label.appendChild(input);
    label.append(` ${labelText}`);
    return label;
  }

  function createDropdown(labelText, key, options) {
    const label = document.createElement('label');
    label.textContent = labelText + ': ';
    const select = document.createElement('select');
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (settings[key] === opt) option.selected = true;
      select.appendChild(option);
    });
    select.onchange = () => {
      settings[key] = select.value;
      saveSettings();
      applySettings();
    };
    label.appendChild(select);
    return label;
  }

  function createSettingsPanel(container) {
    const panel = document.createElement('div');
    panel.id = 'overlaySettingsPanel';
    panel.appendChild(createCheckbox('Enable Overlay', 'enabled'));
    panel.appendChild(createDropdown('Pin Side', 'pinSide', ['left', 'right']));
    panel.appendChild(createSlider('Overlay Width', 'overlayWidth', 100, 800, 10, 'px'));
    panel.appendChild(createSlider('Background Opacity', 'opacity', 0, 1, 0.05));
    panel.appendChild(createSlider('Font Size', 'fontSize', 10, 30, 1, 'px'));
    panel.appendChild(createSlider('Top Offset', 'offsetTop', 0, 500, 10, 'px'));
    panel.appendChild(createSlider('Bottom Offset', 'offsetBottom', 0, 500, 10, 'px'));
    panel.appendChild(createSlider('Max Messages', 'maxMessages', 1, 100, 1));
    panel.appendChild(createSlider('Hide Delay', 'hideDelay', 1, 60, 1, 's'));
    panel.appendChild(createCheckbox('Auto-hide when inactive', 'autoHide'));
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => {
      panel.style.display = 'none';
      toggleButton.style.display = 'block';
    };
    panel.appendChild(closeBtn);
    container.appendChild(panel);
    return panel;
  }

  let overlay, toggleButton, settingsPanel, hideTimer;

  function applySettings() {
    if (!overlay) return;
    overlay.style.display = settings.enabled ? 'flex' : 'none';
    overlay.style.width = `${settings.overlayWidth}px`;
    overlay.style.top = `${settings.offsetTop}px`;
    overlay.style.bottom = `${settings.offsetBottom}px`;
    overlay.style.left = settings.pinSide === 'left' ? '0' : 'unset';
    overlay.style.right = settings.pinSide === 'right' ? '0' : 'unset';
    overlay.style.opacity = '1';
    for (const msg of overlay.children) {
      msg.style.fontSize = `${settings.fontSize}px`;
      msg.style.background = `rgba(0,0,0,${settings.opacity})`;
    }
  }

  const initOverlay = () => {
    const video = document.querySelector('video');
    const chat = document.querySelector('[data-test-selector="chat-scrollable-area__message-container"]');
    if (!video || !chat) {
      setTimeout(initOverlay, 2000);
      return;
    }

    const videoParent = video.parentElement;
    videoParent.style.position = 'relative';

    overlay = document.createElement('div');
    overlay.className = 'chat-overlay-container';
    videoParent.appendChild(overlay);

    toggleButton = document.createElement('div');
    toggleButton.id = 'overlaySettingsToggle';
    toggleButton.textContent = '⚙️';
    videoParent.appendChild(toggleButton);

    settingsPanel = createSettingsPanel(videoParent);
    toggleButton.onclick = () => {
      settingsPanel.style.display = 'block';
      toggleButton.style.display = 'none';
    };

    applySettings();

    const observer = new MutationObserver(() => {
      if (!settings.enabled) return;
      const messages = chat.querySelectorAll('.chat-line__message');
      if (!messages.length) return;
      const lastNode = messages[messages.length - 1];
      const clone = lastNode.cloneNode(true);
      clone.className = 'chat-message';
      clone.style.background = `rgba(0,0,0,${settings.opacity})`;
      clone.style.fontSize = `${settings.fontSize}px`;
      overlay.appendChild(clone);
      overlay.scrollTop = overlay.scrollHeight;
      while (overlay.children.length > settings.maxMessages) overlay.removeChild(overlay.firstChild);

      // Auto-hide with fade
      if (settings.autoHide) {
        overlay.style.opacity = '1';
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => overlay.style.opacity = '0', settings.hideDelay * 1000);
      }
    });

    observer.observe(chat, { childList: true, subtree: true });
  };

  const waitForElements = setInterval(() => {
    if (document.querySelector('video') && document.querySelector('[data-test-selector="chat-scrollable-area__message-container"]')) {
      clearInterval(waitForElements);
      initOverlay();
    }
  }, 1000);
})();