/* Progressive enhancement for the two-step claim form.
 *
 * With JavaScript the form behaves as specified: the mobile number is entered
 * first, checked against the server, and only then do the name/state/district
 * fields appear. With JavaScript off, step two is never hidden in the first
 * place (see .js .step[data-locked] in the stylesheet) and the whole form
 * posts in one go -- the server validates every field either way, so nothing
 * here is a security boundary.
 */
(function () {
  "use strict";

  var form = document.getElementById("claim-form");
  if (!form) return;

  var mobile = document.getElementById("mobile");
  var mobileError = document.getElementById("mobile-error");
  var continueBtn = document.getElementById("continue-btn");
  var stepTwo = document.getElementById("step-two");
  var submitBtn = document.getElementById("submit-btn");
  var stateSelect = document.getElementById("state");
  var districtInput = document.getElementById("district");
  var districtOptions = document.getElementById("district-options");
  var dataTag = document.getElementById("districts-data");

  var districtsByState = {};
  try {
    districtsByState = JSON.parse(dataTag.textContent || "{}");
  } catch (err) {
    districtsByState = {};
  }

  var checkUrl = form.getAttribute("action").replace(/\/claim$/, "/check-mobile");

  function setError(message) {
    mobileError.textContent = message || "";
    mobile.classList.toggle("field__input--bad", Boolean(message));
    if (message) mobile.setAttribute("aria-invalid", "true");
    else mobile.removeAttribute("aria-invalid");
  }

  function revealStepTwo() {
    if (!stepTwo.hasAttribute("data-locked")) return;
    stepTwo.removeAttribute("data-locked");
    continueBtn.setAttribute("hidden", "hidden");
    stepTwo.scrollIntoView({ behavior: "smooth", block: "start" });
    var firstField = document.getElementById("name");
    if (firstField) window.setTimeout(function () { firstField.focus(); }, 260);
  }

  /* Keep only digits, so a pasted "+91 98765-43210" becomes usable. */
  mobile.addEventListener("input", function () {
    var digits = mobile.value.replace(/\D+/g, "");
    if (digits.length > 12) digits = digits.slice(0, 12);
    if (mobile.value !== digits) mobile.value = digits;
    setError("");
  });

  /* Enter on the number field should advance, not submit a half-empty form. */
  mobile.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      continueBtn.click();
    }
  });

  continueBtn.addEventListener("click", function () {
    var value = mobile.value.trim();
    if (!value) {
      setError("Please enter your mobile number.");
      mobile.focus();
      return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Checking…";

    var body = new FormData();
    body.append("mobile", value);

    fetch(checkUrl, {
      method: "POST",
      body: body,
      headers: { "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { status: response.status, data: data };
        });
      })
      .then(function (result) {
        if (result.data && result.data.ok) {
          setError("");
          revealStepTwo();
          return;
        }
        /* A coupon claimed elsewhere while this page was open. */
        if (result.data && result.data.redirect) {
          window.location.href = result.data.redirect;
          return;
        }
        setError((result.data && result.data.error) || "Please check the number.");
        mobile.focus();
      })
      .catch(function () {
        /* Offline or a flaky connection: let them through rather than
           stranding a real participant. The server revalidates on submit. */
        setError("");
        revealStepTwo();
      })
      .finally(function () {
        continueBtn.disabled = false;
        continueBtn.textContent = "Continue";
      });
  });

  function refreshDistricts() {
    var names = districtsByState[stateSelect.value] || [];
    districtOptions.textContent = "";
    var fragment = document.createDocumentFragment();
    names.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      fragment.appendChild(option);
    });
    districtOptions.appendChild(fragment);

    /* A district left over from a different state is not worth keeping. */
    if (districtInput.value && names.indexOf(districtInput.value) === -1) {
      districtInput.value = "";
    }
  }

  if (stateSelect && districtInput && districtOptions) {
    stateSelect.addEventListener("change", refreshDistricts);
    refreshDistricts();
  }

  /* Guard against a double tap creating two POSTs for one coupon. */
  form.addEventListener("submit", function () {
    window.setTimeout(function () {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";
    }, 0);
  });

  /* Coming back to a re-rendered form with errors: show step two already. */
  if (form.querySelector(".field__input--bad") || (mobile.value && mobile.value.length >= 10)) {
    if (document.querySelector("#step-two .field__input--bad")) revealStepTwo();
  }
})();
