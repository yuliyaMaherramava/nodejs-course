const CONTENT_TYPES = {
  JSON: "application/json",
  XML: "application/xml",
  HTML: "text/html",
  TEXT: "text/plain",
  BLOB: "application/octet-stream",
  IMG: "image",
};

window.onload = async function () {
  toggleChangeMethod();
  await loadData();
};

// Show or hide Body input & Get parameters depending on the selected method
const toggleChangeMethod = () => {
  const method = document.getElementById("method").value;
  const getParamsDiv = document.getElementById("get-params");
  const bodyFieldDiv = document.getElementById("body-field");

  if (method === "GET") {
    getParamsDiv.style.display = "block";
    bodyFieldDiv.style.display = "none";
  } else {
    bodyFieldDiv.style.display = "block";
    getParamsDiv.style.display = "none";
  }
};

// Show or hide saved request details
function toggleDetails(button) {
  const details = button.parentElement.parentElement.children[1];
  const isExpanded = details.style.display === "block";
  details.style.display = isExpanded ? "none" : "block";
  button.innerHTML = isExpanded ? "Show details" : "Hide details";
}

// Add a new input field for GET parameters
function addGetParam() {
  const paramsContainer = document.getElementById("get-params");
  const paramDiv = document.createElement("div");
  paramDiv.className = "get-param";
  paramDiv.innerHTML = `
        <input type="text" placeholder="Key" class="param-key">
        <input type="text" placeholder="Value" class="param-value">
        <button type="button" onclick="removeGetParam(this)">Remove</button>
    `;
  paramsContainer.appendChild(paramDiv);
}

// Remove input field for GET parameters
function removeGetParam(button) {
  button.parentElement.remove();
}

// Get form data
function getRequestData() {
  const params = [];
  const parameterFields = document.querySelectorAll(".get-param");

  if (parameterFields.length) {
    parameterFields.forEach((paramDiv) => {
      const key = paramDiv.querySelector(".param-key").value;
      const value = paramDiv.querySelector(".param-value").value;
      if (key) {
        params.push({ key, value });
      }
    });
  }

  return {
    url: document.getElementById("url").value,
    method: document.getElementById("method").value,
    headers: document.getElementById("headers").value,
    body: document.getElementById("body").value,
    params,
  };
}

function clearForm() {
  document.getElementById("url").value = "";
  document.getElementById("method").value = "GET";
  document.getElementById("headers").value = "";
  document.getElementById("body").value = "";
  document.getElementById("statusCode").innerText = "";
  document.getElementById("responseHeaders").innerText = "";
  document.getElementById("responseBody").innerText = "";

  const paramElements = document.querySelectorAll(".get-param");

  if (paramElements.length > 0) {
    paramElements.forEach((paramDiv) => paramDiv.remove());
  }
}

const renderSavedRequests = (url, method, headers, body, id) => {
  const savedRequestsList = document.getElementById("savedRequestsList");

  const listItem = document.createElement("li");
  listItem.classList.add("saved-request");
  listItem.style.marginBottom = "15px";

  listItem.innerHTML = `
  <div>
    <div class="request-header">
      <p class="request-url">${method} ${url}</p>
    </div>
    <div class="request-details" style="display: none;">
      <strong>Headers:</strong>
      <pre style="background-color: #f1f1f1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; white-space: pre-wrap;">${
        Object.entries(headers)
          .map(
            ([title, value]) => `<p class="headerItem">${title}: ${value}</p>`
          )
          .join("") || "No headers provided"
      }</pre>
      <strong>Body:</strong>
      <pre style="background-color: #f1f1f1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; white-space: pre-wrap;">${
        Object.entries(body)
          .map(([title, value]) => `<p class="bodyItem">${title}: ${value}</p>`)
          .join("") || "No body provided"
      }</pre>
      </div>
      <div class="request-buttons">
        <button class="toggle-details" onclick="toggleDetails(this)">Show details </button>
   <button class="sendButton" onclick="sendRequest('${url}', '${method}', ${JSON.stringify(
    headers
  ).replace(/"/g, "&quot;")}, ${JSON.stringify(body).replace(
    /"/g,
    "&quot;"
  )})">Send</button>
        <button class="deleteButton" onclick="removeSavedRequest(this, ${id})">Delete</button>
      </div>
    </div>`;
  savedRequestsList.appendChild(listItem);
};

async function saveRequest() {
  try {
    const { url, method, headers, body, params } = getRequestData();

    const paramsString = new URLSearchParams(
      params.map(({ key, value }) => [key, value])
    ).toString();

    const fullUrl = `${url}${paramsString ? `?${paramsString}` : ""}`;

    const response = await fetch("/saveRequest", {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPES.JSON },
      body: JSON.stringify({ url: fullUrl, method, headers, body }),
    });

    const result = await response.json();

    renderSavedRequests(fullUrl, method, headers, body, result.info.id);
  } catch (error) {
    console.error("Error saving request:", error);
  }
}

async function removeSavedRequest(button, id) {
  try {
    await fetch("/deleteRequest", {
      method: "DELETE",
      headers: { "Content-Type": CONTENT_TYPES.JSON },
      body: JSON.stringify({ id }),
    });
    button.parentElement.parentElement.parentElement.remove();
  } catch (error) {
    console.error("Error removing request:", error);
  }
}

async function loadData() {
  try {
    const response = await fetch("/savedRequests", {
      method: "GET",
      headers: { "Content-Type": CONTENT_TYPES.JSON },
    });

    const { info } = await response.json();

    if (info && info.length) {
      info.forEach((request) =>
        renderSavedRequests(
          request.url,
          request.method,
          request.headers,
          request.body,
          request.id
        )
      );
    }
  } catch (error) {
    console.error("Failing getting information:", error);
  }
}

async function sendFormRequest() {
  try {
    const { url, method, headers, body, params } = getRequestData();

    const queryString = params.length
      ? `?${new URLSearchParams(
          params.map(({ key, value }) => [key, value])
        ).toString()}`
      : "";

    sendRequest(`${url}${queryString}`, method, headers, body);
  } catch (error) {
    console.error("Failing sending form request:", error);
  }
}

const sendRequest = async (url, method, headers, body) => {
  try {
    const response = await fetch("/makeRequest", {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPES.JSON },
      body: JSON.stringify({
        url,
        method,
        headers: Object.keys(headers) ? headers : {},
        body: Object.keys(body) ? body : {},
      }),
    });

    // Show results
    document.getElementById("statusCode").innerText = response.status;
    document.getElementById("responseHeaders").innerText = JSON.stringify(
      [...response.headers],
      null,
      2
    );

    const contentType = response.headers.get("Content-Type");
    const responseBodyElement = document.getElementById("responseBody");
    let responseData;

    if (contentType.includes(CONTENT_TYPES.JSON)) {
      responseData = await response.json();
      responseBodyElement.innerText = JSON.stringify(responseData, null, 2);
    } else if (
      contentType.includes(CONTENT_TYPES.BLOB) ||
      contentType.includes(CONTENT_TYPES.IMG)
    ) {
      responseData = await response.blob();
      const imgElement = document.createElement("img");
      imgElement.src = URL.createObjectURL(responseData);
      imgElement.alt = "Response Image";
      imgElement.style.maxWidth = "100%";
      imgElement.style.height = "auto";
      responseBodyElement.innerHTML = "";
      responseBodyElement.appendChild(imgElement);
    } else {
      responseData = await response.text(); // Fallback to text for other types
      responseBodyElement.innerText = responseData;
    }
  } catch (error) {
    document.getElementById("statusCode").innerText = "Error";
    document.getElementById("responseBody").innerText = error.message;
  }
};
