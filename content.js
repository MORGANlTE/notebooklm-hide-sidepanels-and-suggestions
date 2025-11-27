(function () {
  ("use strict");

  const TOGGLE_BUTTON_ID = "suggestions-toggle-button";
  const HIDDEN_CLASS = "nblm-suggestions-hidden";
  let suggestionsHidden = false; // Default state

  // Function to apply the display style based on the current state
  const applySuggestionsVisibility = () => {
    // Target the follow-up element and the side panels
    const selectors = [
      "follow-up",
      "section.source-panel",
      "section.studio-panel"
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
          if (suggestionsHidden) {
            element.classList.add(HIDDEN_CLASS);
          } else {
            element.classList.remove(HIDDEN_CLASS);
          }
      });
    });

    // Handle chat panel expansion
    const chatPanel = document.querySelector("section.chat-panel");
    if (chatPanel) {
        if (suggestionsHidden) {
            chatPanel.classList.add("nblm-chat-expanded");
        } else {
            chatPanel.classList.remove("nblm-chat-expanded");
        }
    }
  };

  // Function to update the icon and text on our toggle button
  const updateButtonState = () => {
    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (!button) return;

    const icon = button.querySelector("mat-icon");
    const label = button.querySelector(".button-label-text");

    if (icon && label) {
      const actionText = suggestionsHidden ? "Show" : "Hide";
      // Using 'layers' and 'layers_clear' as requested for a different icon
      icon.textContent = suggestionsHidden ? "layers_clear" : "layers";
      label.textContent = `${actionText}`;
      button.setAttribute("aria-label", `${actionText}`);
    }
  };

  // Main toggle function that runs on click
  const toggleSuggestions = () => {
    try {
      suggestionsHidden = !suggestionsHidden; // Flip the state
      chrome.storage.local.set({ suggestionsHidden: suggestionsHidden }); // Save the new state
      applySuggestionsVisibility();
      updateButtonState();
    } catch (error) {
      console.error("NotebookLM Toggle Error:", error);
      if (error.message.includes("Extension context invalidated")) {
        alert("The extension has been updated. Please reload this page to continue.");
      }
    }
  };

  // Function to create and inject our button into the page
  const createToggleButton = () => {
    // Check if the button itself already exists to prevent duplicates
    if (document.getElementById(TOGGLE_BUTTON_ID)) {
      return;
    }

    // Find the <share-button> component, which is a more stable target
    const shareButtonComponent = document.querySelector("share-button");

    // Ensure the component and its parent container exist
    if (shareButtonComponent && shareButtonComponent.parentElement) {
      const parentContainer = shareButtonComponent.parentElement;

      // 1. Create the button element directly.
      const toggleButton = document.createElement("button");
      toggleButton.id = TOGGLE_BUTTON_ID;

      // Copy the classes from the other buttons to ensure consistent styling
      toggleButton.className =
        "mdc-fab mat-mdc-fab-base mat-mdc-fab mat-mdc-button-base mat-primary mdc-fab--extended mat-mdc-extended-fab";

      // Add a right margin for proper spacing
      toggleButton.style.marginRight = "8px";

      toggleButton.addEventListener("click", toggleSuggestions);

      // 2. Create the icon
      const icon = document.createElement("mat-icon");
      icon.className =
        "mat-icon notranslate google-symbols mat-icon-no-color fab-icon";
      icon.setAttribute("role", "img");

      // 3. Create the text label structure
      const labelWrapper = document.createElement("span");
      labelWrapper.className = "mdc-button__label";
      const labelText = document.createElement("span");
      labelText.className = "button-label-text"; // Custom class for easy selection
      labelWrapper.appendChild(labelText);

      // 4. Add the icon and label to the button
      toggleButton.appendChild(icon);
      toggleButton.appendChild(labelWrapper);

      // 5. Insert the button DIRECTLY into the parent container
      // Insert before the share button.
      parentContainer.insertBefore(toggleButton, shareButtonComponent);

      // 6. Set the initial state of the button's text and icon
      updateButtonState();
    }
  };

  // --- SCRIPT EXECUTION STARTS HERE ---

  // Load the saved state from storage first
  chrome.storage.local.get("suggestionsHidden", (data) => {
    suggestionsHidden = data.suggestionsHidden || false;
    // The MutationObserver will handle the initial creation and application
  });

  // Watch the page for changes to inject our button and update suggestions
  const observer = new MutationObserver((mutations) => {
    createToggleButton();
    applySuggestionsVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
