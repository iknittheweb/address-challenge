// ------------------------------------------------------------
// BEGINNER-FRIENDLY EXPLANATORY COMMENTS
// ------------------------------------------------------------
// This file handles the "Alien Abduction" form submission using JavaScript.
// It prevents the default form submission, collects form data, and sends it using AJAX (XMLHttpRequest).
//
// Key concepts:
// - Event listeners: Run code when the user submits the form.
// - Prevent default: Stops the browser from reloading the page on submit.
// - AJAX: Sends form data to the server without reloading the page.
// - Data encoding: Prepares form fields for safe transmission.
// ------------------------------------------------------------

// Get the first <form> element on the page
var form = document.getElementsByTagName('form')[0];

// Listen for the form's submit event
form.addEventListener('submit', function (e) {
  // Prevent the browser's default form submission (no page reload)
  e.preventDefault();
  // Call our custom function to send the data
  sendData();
});

// Function to collect form data and send it using AJAX
// Reference: https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
function sendData() {
  // Create a new XMLHttpRequest object for AJAX
  var XHR = new XMLHttpRequest();
  var urlEncodedData = '';
  var urlEncodedDataPairs = [];

  // Collect each form field and encode its value
  urlEncodedDataPairs.push(
    encodeURIComponent('name') + '=' + encodeURIComponent(form.querySelector('[name=\'name\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('send_to') + '=' + encodeURIComponent(form.querySelector('[name=\'send_to\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('email') + '=' + encodeURIComponent(form.querySelector('[name=\'email\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('phone') + '=' + encodeURIComponent(form.querySelector('[name=\'phone\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('date') + '=' + encodeURIComponent(form.querySelector('[name=\'date\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('qty') + '=' + encodeURIComponent(form.querySelector('[name=\'qty\']').value)
  );

  // Collect radio button value for 'ufotype'
  let radio = document.getElementsByName('ufotype');
  for (var i = 0, length = radio.length; i < length; i++) {
    if (radio[i].checked) {
      urlEncodedDataPairs.push(
        encodeURIComponent('ufotype') + '=' + encodeURIComponent(radio[i].value)
      );
    }
  }

  // dropdown menu
  var dropdown = form.querySelector('[name=\'abtype\']');
  urlEncodedDataPairs.push(
    encodeURIComponent('abtype') +
      '=' +
      encodeURIComponent(dropdown.options[dropdown.selectedIndex].text)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('comments') +
      '=' +
      encodeURIComponent(form.querySelector('[name=\'comments\']').value)
  );
  urlEncodedDataPairs.push(
    encodeURIComponent('subscribe') +
      '=' +
      encodeURIComponent(form.querySelector('[name=\'subscribe\']').checked)
  );

  // Combine the pairs into a single string and replace all %-encoded spaces to
  // the '+' character; matches the behaviour of browser form submissions.
  urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

  // Define what happens on successful data submission
  XHR.addEventListener('load', function (event) {
    if (XHR.readyState === XHR.DONE) {
      if (XHR.status === 200) {
        alert('Your order has been received! Check your email.');
      } else {
        alert('Oh oh! We have a problem! ' + XHR.responseText + '.');
      }
    }
  });

  // Define what happens in case of error
  XHR.addEventListener('error', function (event) {
    // This is normally a timeout or connection error.
    alert('Oops! Something went wrong.');
  });

  // Set up our request
  XHR.open(form.getAttribute('method'), form.getAttribute('action'));

  // Add the required HTTP header for form data POST requests
  XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  // Finally, send our data.
  XHR.send(urlEncodedData);
}
