// -------------------------------------------------------------
// Accessible Calculator Logic
// -------------------------------------------------------------
// Purpose: Implements a keyboard- and screen-reader-friendly calculator using BEM classes.
// Features:
//   - Handles button and keyboard input
//   - Supports basic arithmetic operations
//   - Provides ARIA roles and attributes for accessibility
//   - Updates screen and button states for user feedback
// -------------------------------------------------------------
// Key Concepts:
//   - Event listeners
//   - State management
//   - ARIA accessibility
//   - BEM CSS methodology
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  // ------------------------------
  // DOM Element References
  // ------------------------------
  const calculator = document.querySelector('.calculator');
  if (!calculator) return;

  const screen = calculator.querySelector('.CALCULATOR-_screen');
  const buttons = calculator.querySelectorAll('.CALCULATOR-_button');

  // ------------------------------
  // Calculator State Variables
  // ------------------------------
  let current = '0';
  let operator = null;
  let operand = null;
  let waitingForOperand = false;

  // ------------------------------
  // Screen Update Function
  // ------------------------------
  function updateScreen(value) {
    screen.textContent = value;
    screen.setAttribute('aria-live', 'polite');
  }

  // ------------------------------
  // Core Calculator Functions
  // ------------------------------
  function clear() {
    current = '0';
    operator = null;
    operand = null;
    waitingForOperand = false;
    updateScreen(current);
  }

  function inputDigit(digit) {
    if (waitingForOperand) {
      current = digit;
      waitingForOperand = false;
    } else {
      current = current === '0' ? digit : current + digit;
    }
    updateScreen(current);
  }

  function inputOperator(nextOperator) {
    if (operator && !waitingForOperand) {
      calculate();
    }
    operand = parseFloat(current);
    operator = nextOperator;
    waitingForOperand = true;
  }

  function calculate() {
    if (operator && operand !== null) {
      const inputValue = parseFloat(current);
      let result = operand;
      switch (operator) {
        case '+':
          result += inputValue;
          break;
        case '-':
          result -= inputValue;
          break;
        case '×':
        case 'x':
        case '*':
          result *= inputValue;
          break;
        case '÷':
        case '/':
          result = inputValue === 0 ? 'Error' : result / inputValue;
          break;
        default:
          break;
      }
      current = String(result);
      operator = null;
      operand = null;
      waitingForOperand = false;
      updateScreen(current);
    }
  }

  function backspace() {
    if (!waitingForOperand && current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = '0';
    }
    updateScreen(current);
  }

  function handleButton(button) {
    const value = button.textContent.trim();
    if (button.classList.contains('CALCULATOR-_button--double')) {
      clear();
    } else if (button.classList.contains('CALCULATOR-_button--triple')) {
      inputDigit('0');
    } else if (/^[0-9]$/.test(value)) {
      inputDigit(value);
    } else if (value === 'C') {
      clear();
    } else if (value === '←' || value === '←' || value === '\u2190') {
      backspace();
    } else if (['+', '-', '×', '÷'].includes(value)) {
      inputOperator(value);
    } else if (value === '=') {
      calculate();
    }
  }

  // Keyboard support
  calculator.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'BUTTON') return; // Let button handle its own
    if (/^[0-9]$/.test(e.key)) {
      inputDigit(e.key);
    } else if (['+', '-', '*', 'x', 'X'].includes(e.key)) {
      inputOperator('+*-xX'.includes(e.key) ? (e.key === '*' || e.key.toLowerCase() === 'x' ? '×' : e.key) : e.key);
    } else if (e.key === '/' || e.key === '÷') {
      inputOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
      calculate();
    } else if (e.key === 'Backspace') {
      backspace();
    } else if (e.key.toLowerCase() === 'c') {
      clear();
    }
  });

  // ARIA roles and attributes
  calculator.setAttribute('role', 'region');
  calculator.setAttribute('aria-label', 'Calculator');
  screen.setAttribute('role', 'status');
  screen.setAttribute('aria-live', 'polite');
  screen.setAttribute('tabindex', '0');

  // Button event listeners
  buttons.forEach((button) => {
    button.setAttribute('tabindex', '0');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      handleButton(button);
      button.setAttribute('aria-pressed', 'true');
      setTimeout(() => button.setAttribute('aria-pressed', 'false'), 150);
    });
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButton(button);
        button.setAttribute('aria-pressed', 'true');
        setTimeout(() => button.setAttribute('aria-pressed', 'false'), 150);
      }
    });
  });

  // Initial screen update
  updateScreen(current);
});
