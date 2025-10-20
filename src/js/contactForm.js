// contactForm.js
// Handles contact form validation and AJAX submission to Formspree
// contactForm.js (ES module)
function waitForCSSAndDOM(callback) {
  function checkReady() {
    const domReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const cssReady = document.documentElement.classList.contains('css-loaded') || window.mainCSSLoaded;
    if (domReady && cssReady) {
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    } else {
      requestAnimationFrame(checkReady);
    }
  }
  checkReady();
}

waitForCSSAndDOM(() => {
  const contactForm = document.querySelector('.contact__form');
  if (!contactForm) return;
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const submitButton = contactForm.querySelector('.contact__submit');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-'.]+$/,
      messages: {
        required: 'Please tell me your name so I know how to address you!',
        minLength: 'Your name should be at least 2 characters long.',
        maxLength: 'Please keep your name under 100 characters.',
        pattern: 'Please use only letters, spaces, hyphens, apostrophes, and periods in your name.',
      },
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
      messages: {
        required: 'I need your email address to get back to you!',
        pattern: 'Please enter a valid email address (like: you@example.com).',
        maxLength: 'Please keep your email address under 254 characters.',
      },
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      messages: {
        required: 'Please share your project ideas or questions with me!',
        minLength: 'Could you tell me a bit more? At least 10 characters would be helpful.',
        maxLength: 'Please keep your message under 1000 characters for now. We can discuss details later!',
      },
    },
  };
  function validateField(input, fieldName) {
    const rules = validationRules[fieldName];
    const value = input.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    clearFieldError(input, errorElement);
    if (rules.required && !value) {
      showFieldError(input, errorElement, rules.messages.required);
      return false;
    }
    if (!value) return true;
    if (rules.minLength && value.length < rules.minLength) {
      showFieldError(input, errorElement, rules.messages.minLength);
      return false;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      showFieldError(input, errorElement, rules.messages.maxLength);
      return false;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      showFieldError(input, errorElement, rules.messages.pattern);
      return false;
    }
    showFieldSuccess(input);
    return true;
  }
  function showFieldError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('contact__input--error');
    errorElement.textContent = message;
    errorElement.classList.add('contact__error--visible');
    // Ensure error message is associated with input
    if (!input.hasAttribute('aria-describedby')) {
      input.setAttribute('aria-describedby', errorElement.id);
    }
  }
  function showFieldSuccess(input) {
    input.setAttribute('aria-invalid', 'false');
    input.classList.add('contact__input--valid');
    input.classList.remove('contact__input--error');
  }
  function clearFieldError(input, errorElement) {
    input.removeAttribute('aria-invalid');
    input.classList.remove('contact__input--error', 'contact__input--valid');
    errorElement.textContent = '';
    errorElement.classList.remove('contact__error--visible');
    input.removeAttribute('aria-describedby');
  }
  function validateForm() {
    const nameValid = validateField(nameInput, 'name');
    const emailValid = validateField(emailInput, 'email');
    const messageValid = validateField(messageInput, 'message');
    return nameValid && emailValid && messageValid;
  }
  function handleFormSubmit(event) {
    event.preventDefault();
    const isFormValid = validateForm();
    if (isFormValid) {
      const formData = new FormData(contactForm);
      fetch('https://formspree.io/f/mpwyyeaa', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            showSubmissionSuccess();
          } else {
            return response.json().then((data) => {
              throw new Error(data.error || 'Submission failed. Please try again later.');
            });
          }
        })
        .catch((error) => {
          showSubmissionError(error.message);
        });
    } else {
      const firstInvalidField = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  }
  function showSubmissionSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'contact__success';
    successMessage.setAttribute('role', 'status');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.setAttribute('aria-atomic', 'true');
    successMessage.innerHTML = `
        <p><strong>Thank you for reaching out!</strong></p>
        <p>I've received your message and I'm excited to learn about your project. I'll get back to you within 24 hours to start our conversation!</p>
      `;
    contactForm.parentNode.insertBefore(successMessage, contactForm);
    contactForm.style.display = 'none';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Announce to screen reader
    announceToScreenReader('Thank you for reaching out! I have received your message.');
    setTimeout(() => {
      contactForm.reset();
      clearAllFieldStates();
      contactForm.style.display = 'block';
      successMessage.remove();
    }, 5000);
  }
  function showSubmissionError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'contact__error contact__error--visible';
    errorMessage.setAttribute('role', 'alert');
    errorMessage.setAttribute('aria-live', 'assertive');
    errorMessage.setAttribute('aria-atomic', 'true');
    errorMessage.innerHTML = `<p><strong>Sorry, something went wrong:</strong></p><p>${message}</p>`;
    contactForm.parentNode.insertBefore(errorMessage, contactForm);
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Announce to screen reader
    announceToScreenReader('Sorry, something went wrong: ' + message);
    setTimeout(() => {
      errorMessage.remove();
    }, 7000);
  }
  function clearAllFieldStates() {
    [nameInput, emailInput, messageInput].forEach((input) => {
      const fieldName = input.name;
      const errorElement = document.getElementById(`${fieldName}-error`);
      clearFieldError(input, errorElement);
    });
  }
  nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
  emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
  messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));
  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('contact__input--error')) {
      clearFieldError(nameInput, nameError);
    }
  });
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('contact__input--error')) {
      clearFieldError(emailInput, emailError);
    }
  });
  messageInput.addEventListener('input', () => {
    if (messageInput.classList.contains('contact__input--error')) {
      clearFieldError(messageInput, messageError);
    }
  });
  contactForm.addEventListener('submit', handleFormSubmit);
});
