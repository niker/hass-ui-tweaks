(function () {
  'use strict';

  function isAssistDialogOpen() {
    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const dialogOpen = voiceDialog?.shadowRoot?.querySelector('ha-dialog');
    return !!dialogOpen;
  }

  function adjustDialogWidth(isOpen) {
    const homeAssistant = document.querySelector('home-assistant');
    const voiceDialog = homeAssistant?.shadowRoot?.querySelector('ha-voice-command-dialog');
    const dialogShadow = voiceDialog?.shadowRoot;

    if (!dialogShadow) return;

    const dialog = dialogShadow.querySelector('ha-dialog');
    const surface = dialog?.shadowRoot?.querySelector('.mdc-dialog__surface');

    if (surface) {
      surface.style.minWidth = isOpen ? '55vw' : '';
      surface.style.minHeight = isOpen ? '90vh' : '';
    }
    
    const backdrop = dialog?.shadowRoot?.querySelector('.mdc-dialog__scrim');
    if(backdrop) {      
      backdrop.style.pointerEvents = 'auto'; // Ensure it can receive events

      backdrop.addEventListener('click', (e) => {
        // Only prevent clicks if the backdrop itself was clicked
        if (e.target === backdrop) {
          e.stopPropagation();
          e.preventDefault();
        }
      });
    }     
  }

  const baseTitle = document.title.replace(/^AI /, '');

  setInterval(() => {
    try
    {
      const isOpen = isAssistDialogOpen();

      if (isOpen && !document.title.startsWith('AI ')) {
        document.title = 'AI ' + baseTitle;
      } else if (!isOpen && document.title.startsWith('AI ')) {
        document.title = baseTitle;
      }

      adjustDialogWidth(isOpen);
    }
    catch
    {
      // ignore and try again in a bit
    }
  }, 500);
})();