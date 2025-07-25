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

  // enable coloring of automation editor
  const enableAutomationColoring = true;

  // enable coloring of script editor    
  const enableScriptColoring = true;

  // editor coloring opacity - how much color to apply in percentage
  const editorColorOpacity = 5;

  // editor coloring saturation  
  const editorSaturation = 0.95;

  // editor coloring lightness
  const editorLightness = 0.33;

  // editor coloring hue step
  const editorHueStep = 122;

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
    const textField = assistChat?.shadowRoot?.querySelector('ha-textfield');
    const chatInput = textField?.shadowRoot?.querySelector('input');

    return !!chatInput && textField?.shadowRoot?.activeElement === chatInput;
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

    const dialog = dialogShadow.querySelector('ha-dialog');
    const surface = dialog?.shadowRoot?.querySelector('.mdc-dialog__surface');

    if (surface)
    {
      surface.style.minWidth = isOpen ? assistWidth : '';
      surface.style.minHeight = isOpen ? assistHeight : '';
    }

    if (assistCloseWithX)
    {
      const backdrop = dialog?.shadowRoot?.querySelector('.mdc-dialog__scrim');
      if (backdrop)
      {
        backdrop.style.pointerEvents = 'auto'; // Ensure it can receive events

        backdrop.addEventListener('click', (e) => {
          // Only prevent clicks if the backdrop itself was clicked
          if (e.target === backdrop)
          {
            e.stopPropagation();
            e.preventDefault();
          }
        });
      }
    }
  }

  function assistDialogInterceptShortcuts()
  {
    if (!assistProtectKeys)
    {
      return;
    }

    // Intercept action keys globally, those keys would otherwise put 
    // chat history at risk when text field is not selected.
    //
    // Would reopen the dialog and clear history:
    // A - Assist dialog
    // Hitting ESC to dismiss the dialog also closes the assist dialog:
    // E - Entity search dialog 
    // D - Device search dialog
    // C - Commands dialog
    document.addEventListener('keydown', (e) => {
      if ((e.code === 'KeyA' || e.code === 'KeyE' || e.code === 'KeyD' || e.code === 'KeyC' || e.code === 'KeyM') && isAssistDialogOpen() && !isAssistChatFocused())
      {
        e.stopPropagation();
        e.preventDefault();
        console.log(e.code + ' intercepted by hass-ui-tweaks to protect assist dialog history.');
      }
    }, true);
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
    });

    messages.forEach(message => {
          // Get the text content
          const text = message.textContent;

          if (text?.endsWith('…') === true)
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
        }
    );
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
    if (!skip && !panel.style.backgroundColor)
    {
      panel.style.backgroundColor = getColorForLevel(level);
    }

    if (!panel)
    {
      return;
    }

    // Look for any ha-automation-* elements in the shadow DOM
    const automationElements = Array.from(panel.querySelectorAll('*')).filter(el =>
        (el.tagName?.toLowerCase().startsWith('ha-automation-') || el.tagName?.toLowerCase() === 'ha-form' || el.tagName?.toLowerCase().startsWith('ha-selector')) && el.shadowRoot
    );

    automationElements.forEach(el => {
      let nextLevel = Array.from(el.shadowRoot.querySelectorAll('ha-card > ha-expansion-panel'));
      if (nextLevel.length === 0)
      {
        // we need to go to a deeper shadow dom but keep the level
        crawlAndColor(el.shadowRoot, level, true);
      }
      else
      {
        // we found ha-expansion-panel elements, so we can color them
        nextLevel.forEach(p => crawlAndColor(p, level + 1));
      }
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
      'ha-automation-action'
    ];

    sectionTypes.forEach(sectionType => {
      const section = root.querySelector(sectionType)?.shadowRoot;
      if (!section)
      {
        return;
      }

      const rows = section.querySelectorAll(`${sectionType}-row`);
      rows.forEach(row => {
        const panels = row.shadowRoot?.querySelectorAll('ha-expansion-panel') || [];
        panels.forEach(panel => crawlAndColor(panel, 0));
      });
    });
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
        assistDialogInterceptShortcuts();

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

  // periodically watch for assist dialog being shown or closed
  setInterval(applyAssistTweaks(), 500);

  // if we are on the right page, try to apply editor tweaks faster until it works;
  // then the update slows down to every 3 seconds to colorize newly added nodes
  setTimeout(applyEditorTweaks(), 500);

  // Listen for dynamic URL change
  setupUrlChangeListener();

})();


