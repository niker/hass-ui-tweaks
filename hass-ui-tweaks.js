(function() {
  'use strict';

  //////////////////////////////////////////////////////////////////////////////
  /// Configuration

  // AI assist dialog width
  const assistWidth = '55vw';

  // AI assist dialog height
  const assistHeight = '90vh';

  // AI assist dialog can only be closed with X
  const assistCloseWithX = true;

  // AI assist dialog will protect its history from accidental clearing
  const assistProtectKeys = true;

  // AI assist dialog will prevent pasting of long texts, this is only useful to prevent cheating in text-based games 
  const assistPreventPaste = false;
  const maxAssistPasteLength = 12;

  // enable sidebar blur everywhere
  const sidebarBlurEnable = true;

  // set sidebar opacity
  const sidebarBlurOpacity = '0.8';

  // enable sidebar blur everywhere
  const backdropBlurEnable = true;

  // set sidebar opacity
  const backdropBlurAmount = '4px';

  // enable coloring of automation editor
  const enableAutomationColoring = true;

  // enable coloring of script editor    
  const enableScriptColoring = true;

  // enable left-hand guide lines for steps  
  const enableHideGuideLines = true;

  // editor coloring opacity - how much color to apply in percentage
  const editorColorOpacity = 7;

  // editor coloring saturation  
  const editorSaturation = 0.95;

  // editor coloring lightness
  const editorLightness = 0.32;

  // editor coloring hue step
  const editorHueStep = 28;

  // editor coloring hue start (default green)
  const editorHueStart = 120;

  //////////////////////////////////////////////////////////////////////////////
  /// AI assist tweaks

  function isAssistDialogOpen()
  {
    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const dialogOpen = voiceDialog?.shadowRoot?.querySelector('ha-dialog');
    return !!dialogOpen;
  }

  function isAssistChatFocused()
  {
    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const assistChat = voiceDialog?.shadowRoot?.querySelector('ha-assist-chat');
    const haInput = assistChat?.shadowRoot?.querySelector('ha-input');
    const waInput = haInput?.shadowRoot?.querySelector('wa-input');
    const chatInput = waInput?.shadowRoot?.querySelector('input');

    return !!chatInput && waInput?.shadowRoot?.activeElement === chatInput;
  }

  function adjustDialogWidth(isOpen)
  {
    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const dialogShadow = voiceDialog?.shadowRoot;

    if (!dialogShadow)
    {
      return;
    }

    const ha_dialog = dialogShadow.querySelector('ha-dialog');
    const dialog = ha_dialog?.shadowRoot.querySelector('wa-dialog');
    const surface = dialog?.shadowRoot?.querySelector('dialog');

    if (surface)
    {
      surface.style.minWidth = isOpen ? assistWidth : '';
      surface.style.setProperty('max-width', isOpen ? assistWidth : '', isOpen ? 'important' : '');
      surface.style.width = isOpen ? assistWidth : '';

      surface.style.minHeight = isOpen ? assistHeight : '';
      surface.style.setProperty('max-height', isOpen ? assistHeight : '', isOpen ? 'important' : '');
      surface.style.height = isOpen ? assistHeight : '';
    }

    if (assistCloseWithX && !dialog?.hutTweakBackdropCssApplied)
    {
      const shadowRoot = dialog?.shadowRoot;
      if (shadowRoot)
      {
        let styleEl = shadowRoot.querySelector('style[data-hut-backdrop-block]');
        if (!styleEl)
        {
          styleEl = document.createElement('style');
          styleEl.setAttribute('data-hut-backdrop-block', 'true');
          styleEl.textContent = `
                dialog::backdrop {
                  pointer-events: none !important;
                }
              `;
          shadowRoot.appendChild(styleEl);
          dialog.hutTweakBackdropCssApplied = true;
        }
      }
    }

    if (backdropBlurEnable)
    {
      const shadowRoot = dialog?.shadowRoot;
      if (shadowRoot)
      {
        let styleEl = shadowRoot.querySelector('style[data-hut-backdrop-blur]');
        if (!styleEl)
        {
          styleEl = document.createElement('style');
          styleEl.setAttribute('data-hut-backdrop-blur', 'true');
          styleEl.textContent = `
                dialog::backdrop {
                  backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
                  -webkit-backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
                }
              `;
          shadowRoot.appendChild(styleEl);
          dialog.hutTweakBackdropBlurCssApplied = true;
        }
      }
    }
  }

  const assistKeyHandler = (e) => {
    if (isAssistDialogOpen() && !isAssistChatFocused() && (e.code === 'KeyA' || e.code === 'KeyE' || e.code === 'KeyD' || e.code === 'KeyC' || e.code === 'KeyM')) {
      e.stopPropagation();
      e.preventDefault();
      console.log(e.code + ' intercepted by hass-ui-tweaks to protect assist dialog history.');
    }
  };

  function manageAssistShortcutsListener(isOpen) {
    if (!assistProtectKeys) {
      return;
    }

    if (isOpen && !document.hutAssistShortcutsActive) {
      document.addEventListener('keydown', assistKeyHandler, true);
      document.hutAssistShortcutsActive = true;
    } else if (!isOpen && document.hutAssistShortcutsActive) {
      document.removeEventListener('keydown', assistKeyHandler, true);
      document.hutAssistShortcutsActive = false;
    }
  }

  function allowDialogToPostUrlAndImages(isOpen)
  {
    if (!isOpen)
    {
      return;
    }

    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const assistChat = voiceDialog?.shadowRoot?.querySelector('ha-assist-chat');
    const messages = assistChat?.shadowRoot?.querySelectorAll('ha-markdown');

    if (!messages)
    {
      return;
    }

    // Get all message elements
    messages.forEach(messageRoot => {

      const message = messageRoot.shadowRoot.querySelector('ha-markdown-element');

      if (message.huiTweaks_injected_http)
      {
        return;
      }

      // Get the text content
      const text = message.outerText;

      if (text?.trimEnd()?.endsWith('…') === true)
      {
        return;
      }

      // Regular expression to match URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;

      // Find all URLs in the message
      const urls = text.match(urlRegex);

      if (urls)
      {
        // Create a new div to hold the formatted content
        const newContent = document.createElement('div');

        // Replace URLs with clickable links
        let formattedText = text;
        urls.forEach(url => {
          formattedText = formattedText.replace(
              url,
              `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
          );
        });

        // Set the new HTML content
        newContent.innerHTML = formattedText;

        // Replace the original content
        while (message.firstChild)
        {
          message.removeChild(message.firstChild);
        }
        message.appendChild(newContent);
      }
      message.huiTweaks_injected_http = true;
    });

    messages.forEach(messageRoot => {

      const message = messageRoot.shadowRoot.querySelector('ha-markdown-element');

      if (message.huiTweaks_injected_img)
      {
        return;
      }

      // Get the text content
      const text = message.outerText;

      if (text?.trimEnd()?.endsWith('…') === true)
      {
        return;
      }

      // Regular expression to match URLs
      const urlRegex = /(imgs?:\/\/[^\s]+)/g;
      // Find all img URLs in the message
      const urls = text.match(urlRegex);
      if (urls)
      {
        // Create a new div to hold the formatted content
        const newContent = document.createElement('div');
        // Replace URLs with image preview (max 40vh height) that is clickable and opens full image to new tab
        let formattedText = text;
        urls.forEach(url => {
          const curl = url.replace('imgs://', 'https://').replace('img://', 'http://');
          formattedText = formattedText.replace(
              url,
              `<a href="${curl}" target="_blank" rel="noopener noreferrer">
            <img src="${curl}" style="max-height: 40vh; max-width: 100%; min-height:40vh; object-fit: contain; display: block;" alt="Preview">
          </a>`
          );
        });
        // Set the new HTML content
        newContent.innerHTML = formattedText;
        // Replace the original content
        while (message.firstChild)
        {
          message.removeChild(message.firstChild);
        }
        message.appendChild(newContent);
      }
      message.huiTweaks_injected_img = true;
    });
  }

  function allowDialogToUseMarkdown(isOpen)
  {
    if (!isOpen)
    {
      return;
    }

    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const assistChat = voiceDialog?.shadowRoot?.querySelector('ha-assist-chat');
    const root = assistChat?.shadowRoot;

    if (!root)
    {
      return;
    }

    // Get all message elements
    const messages = root.querySelectorAll('.message');

    messages.forEach(message => {
      // Get the text content
      const text = message.textContent;

      if (text?.endsWith('…') === true)
      {
        return;
      }

      // Regular expression to match text between ** markers
      const boldRegex = /\*\*(.*?)\*\*/g;

      // Check if there are any bold markers
      if (text.includes('**'))
      {
        // Create a new div to hold the formatted content
        const newContent = document.createElement('div');

        // Replace **text** with <strong>text</strong>
        let formattedText = text;
        formattedText = formattedText.replace(boldRegex, '<strong>$1</strong>');

        // Set the new HTML content
        newContent.innerHTML = formattedText;

        // Replace the original content
        while (message.firstChild)
        {
          message.removeChild(message.firstChild);
        }
        message.appendChild(newContent);
      }
    });
  }


  function preventDialogPaste(isOpen)
  {
    if (!assistPreventPaste)
    {
      return;
    }

    if (!isOpen)
    {
      return;
    }

    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const assistChat = voiceDialog?.shadowRoot?.querySelector('ha-assist-chat');
    const haInput = assistChat?.shadowRoot?.querySelector('ha-input');
    const waInput = haInput?.shadowRoot?.querySelector('wa-input');
    const chatInput = waInput?.shadowRoot?.querySelector('input');
    if (!chatInput)
    {
      return;
    }
    if (chatInput._hutPastePrevented)
    {
      return;
    }
    chatInput._hutPastePrevented = true;
    chatInput.addEventListener('paste', (e) => {
      const pastedText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      if (pastedText.length > maxAssistPasteLength) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`hass-ui-tweaks prevented pasting ${pastedText.length} characters into assist chat.`);
      }
    }, true);
  }

  const baseTitle = document.title.replace(/^AI /, '');

  //////////////////////////////////////////////////////////////////////////////
  /// Automation editor tweaks

  const levelColors = {};

  function hslToRgb(h, s, l)
  {
    // h in [0, 360], s/l in [0, 1]
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;

    if (h < 60)
    {
      [r, g, b] = [c, x, 0];
    }
    else if (h < 120)
    {
      [r, g, b] = [x, c, 0];
    }
    else if (h < 180)
    {
      [r, g, b] = [0, c, x];
    }
    else if (h < 240)
    {
      [r, g, b] = [0, x, c];
    }
    else if (h < 300)
    {
      [r, g, b] = [x, 0, c];
    }
    else
    {
      [r, g, b] = [c, 0, x];
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  function getColorForLevel(level)
  {
    if (levelColors[level])
    {
      return levelColors[level];
    }

    const h = (editorHueStart + editorHueStep * level) % 360;
    const [r, g, b] = hslToRgb(h, editorSaturation, editorLightness);
    const rgba = `rgba(${r}, ${g}, ${b}, ${(editorColorOpacity + level) / 100})`;
    levelColors[level] = rgba;
    return rgba;
  }

  function crawlAndColor(panel, level, skip = false)
  {
    if (!skip && !panel.hass_ui_tweaks_color_set)
    {
      panel.hass_ui_tweaks_color_set = true;
      panel.style.backgroundColor = getColorForLevel(level);
    }

    if (!panel)
    {
      return;
    }

    const cards = panel.shadowRoot?.querySelectorAll('ha-card') || [];
    cards.forEach(el => {
      if (!el.hass_ui_tweaks_color_set)
      {
        el.hass_ui_tweaks_color_set = true;
        el.style.backgroundColor = getColorForLevel(level);
      }
    });

    const cardBackgrounds = panel.shadowRoot?.querySelectorAll('div.card-content, div.selector-row') || [];
    cardBackgrounds.forEach(bg => {
      if (!bg.hass_ui_tweaks_color_set)
      {
        bg.hass_ui_tweaks_color_set = true;
        bg.style.background = 'none';
        bg.style.backgroundColor = getColorForLevel(level);
        bg.style.marginRight = `${level <= 1 ? 10 : 0}px`;
        if (enableHideGuideLines)
        {
          bg.style.borderLeft = 'none';
          bg.style.borderBottom = 'none';
        }
      }
    });

    // Look for any ha-automation-* elements in the shadow DOM
    const automationElements = Array.from(panel.shadowRoot.querySelectorAll('*')).filter(el =>
        (el.tagName?.toLowerCase().startsWith('ha-automation-') || el.tagName?.toLowerCase() === 'ha-form' || el.tagName?.toLowerCase().startsWith('ha-selector')) && el.shadowRoot
    );

    automationElements.forEach(el => {
      // we found ha-expansion-panel elements, so we can color them
      crawlAndColor(el, level + 1, true);
    });
  }

  let editorUpdatesRunning = false;

  function colorEditor(type)
  {
    const root = document.querySelector('home-assistant')?.
        shadowRoot?.
        querySelector('home-assistant-main')?.shadowRoot?.
        querySelector(`ha-${type}-editor`)?.shadowRoot?.
        querySelector(`manual-${type}-editor`)?.shadowRoot;

    if (!root)
    {
      if (!editorUpdatesRunning)
      {
        setTimeout(applyEditorTweaks(), 500);
      }
      return;
    }

    if (!editorUpdatesRunning)
    {
      editorUpdatesRunning = true;
      setInterval(applyEditorTweaks(), 3000);
    }

    const sectionTypes = [
      'ha-automation-trigger',
      'ha-automation-condition',
      'ha-automation-action',
      'ha-script-field',
      'ha-automation'
    ];

    sectionTypes.forEach(sectionType => {
      const sectionTypeParent = sectionType === 'ha-script-field' ? 'ha-script-fields' : sectionType;
      const section = root.querySelector(sectionTypeParent)?.shadowRoot;
      if (!section)
      {
        return;
      }

      const rows = section.querySelectorAll(`${sectionType}-row`) || [];
      rows.forEach(row => crawlAndColor(row, 0, true));
    });
  }

  function blurSidebar()
  {
    if (!sidebarBlurEnable)
    {
      return;
    }

    if (document.hutSidebarTweaked)
    {
      return;
    }

    const drawer = document.querySelector('home-assistant')?.
        shadowRoot?.
        querySelector('home-assistant-main')?.shadowRoot?.
        querySelector(`ha-drawer`);

    const sidebar = drawer?.querySelector(`ha-sidebar`);
    const content = drawer?.shadowRoot?.querySelector('.mdc-drawer');

    if (!sidebar || !content)
    {
      return;
    }

    const sidebarStyle = getComputedStyle(sidebar);
    const sidebarBgColor = sidebarStyle.getPropertyValue('--sidebar-background-color').trim();
    const hex = sidebarBgColor.replace('#', '');
    let rgb = '30, 30, 30'; // fallback
    if (sidebarBgColor)
    {
      const rgbMatch = sidebarBgColor.match(/rgba?\(([^)]+)\)/);
      if (rgbMatch)
      {
        rgb = rgbMatch[1].split(',').slice(0, 3).map(v => v.trim()).join(', ');
      }
      else
      {
        // Try hex format
        const hex = sidebarBgColor.replace('#', '');
        rgb = [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16)
        ].join(', ');
      }
    }

    if (!sidebar.hutTweakApplied)
    {
      sidebar.style.backdropFilter = 'blur(8px) saturate(1.1)';
      sidebar.style.webkitBackdropFilter = 'blur(8px) saturate(1.1)';
      sidebar.style.backgroundColor = `rgba(${rgb}, ${sidebarBlurOpacity})`;
      sidebar.hutTweakApplied = true;
    }

    if (!content.hutTweakApplied)
    {
      content.style.background = 'none';
      content.hutTweakApplied = true;
    }

    document.hutSidebarTweaked = true;
  }

  function blurBackdrop()
  {
    if (!backdropBlurEnable)
    {
      return;
    }

    const homeAssistant = document.querySelector('home-assistant');
    const moreInfoDialog = homeAssistant?.shadowRoot?.querySelector('ha-more-info-dialog');
    const adaptiveDialog = moreInfoDialog?.shadowRoot?.querySelector('ha-adaptive-dialog');
    const haDialog = adaptiveDialog?.shadowRoot?.querySelector('ha-dialog');
    const waDialog = haDialog?.shadowRoot?.querySelector('wa-dialog');
    const shadowRoot = waDialog?.shadowRoot;
    if (shadowRoot && !waDialog.hutTweakBackdropBlurCssApplied)
    {
      let styleEl = shadowRoot.querySelector('style[data-hut-backdrop-blur]');
      if (!styleEl)
      {
        styleEl = document.createElement('style');
        styleEl.setAttribute('data-hut-backdrop-blur', 'true');
        styleEl.textContent = `
              dialog::backdrop {
                backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
                -webkit-backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
              }
            `;
        shadowRoot.appendChild(styleEl);
        waDialog.hutTweakBackdropBlurCssApplied = true;
      }
    }

    const quickBar = homeAssistant?.shadowRoot?.querySelector('ha-quick-bar');
    const adaptiveDialogQB = quickBar?.shadowRoot?.querySelector('ha-adaptive-dialog');
    const haDialogQB = adaptiveDialogQB?.shadowRoot?.querySelector('ha-dialog');
    const waDialogQB = haDialogQB?.shadowRoot?.querySelector('wa-dialog');
    const shadowRootQB = waDialogQB?.shadowRoot;
    if (shadowRootQB && !waDialogQB.hutTweakBackdropBlurCssApplied)
    {
      let styleElQB = shadowRootQB.querySelector('style[data-hut-backdrop-blur]');
      if (!styleElQB)
      {
        styleElQB = document.createElement('style');
        styleElQB.setAttribute('data-hut-backdrop-blur', 'true');
        styleElQB.textContent = `
              dialog::backdrop {
                backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
                -webkit-backdrop-filter: blur(${backdropBlurAmount}) saturate(1.1) !important;
              }
            `;
        shadowRootQB.appendChild(styleElQB);
        waDialogQB.hutTweakBackdropBlurCssApplied = true;
      }
    }
  }
  
  function applyAssistTweaks()
  {
    return () => {
      try
      {
        const isOpen = isAssistDialogOpen();

        if (isOpen && !document.title.startsWith('AI '))
        {
          document.title = 'AI ' + baseTitle;
        }
        else if (!isOpen && document.title.startsWith('AI '))
        {
          document.title = baseTitle;
        }

        adjustDialogWidth(isOpen);
        allowDialogToPostUrlAndImages(isOpen);
        allowDialogToUseMarkdown(isOpen);
        preventDialogPaste(isOpen);
        manageAssistShortcutsListener(isOpen);
      }
      catch
      {
        // ignore and try again in a bit
      }
    };
  }

  function applyEditorTweaks()
  {
    return () => {
      try
      {
        const url = new URL(window.location.href);
        if (enableAutomationColoring && url.pathname.includes('/config/automation/edit/'))
        {
          colorEditor('automation');          
        }
        else if (enableScriptColoring && url.pathname.includes('/config/script/edit/'))
        {
          colorEditor('script');          
        }
      }
      catch
      {
        // ignore and try again in a bit
      }
    };
  }

  function applyBlurTweaks()
  {
    return () => {
      try
      {
        blurSidebar();
        blurBackdrop();
      }
      catch
      {
        // ignore and try again in a bit
      }
    };
  }

  // Add this near the other function definitions, before the interval setup
  function setupUrlChangeListener()
  {
    // Listen for changes in browser history
    window.addEventListener('popstate', applyEditorTweaks());

    // Listen for programmatic navigation changes
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      applyEditorTweaks()();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      applyEditorTweaks()();
    };
  }

  // blur tweaks should be applied after every mouse click with 1ms delay and on reload
  document.addEventListener('click', () => setTimeout(applyBlurTweaks(), 1));
  setTimeout(applyBlurTweaks(), 1);

  // periodically watch for assist dialog being shown or closed
  setInterval(applyAssistTweaks(), 500);
  // periodically apply blur tweaks for keyboard-opened dialogs like quick-bar
  setInterval(applyBlurTweaks(), 500);

  // if we are on the right page, try to apply editor tweaks faster until it works;
  // then the update slows down to every 3 seconds to colorize newly added nodes
  setTimeout(applyEditorTweaks(), 500);

  // Listen for dynamic URL change
  setupUrlChangeListener();

})();


