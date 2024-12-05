document
  .getElementById("uploadForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    submitForm();
  });

function submitForm() {
  try {
    const fileInput = document.getElementById("fileInput");
    const commentInput = document.getElementById("commentInput");

    const formData = new FormData();
    formData.append("comment", commentInput.value);
    formData.append("file", fileInput.files[0]);

    const progressContainer = document.getElementById("progressContainer");
    progressContainer.classList.remove("hidden");

    openWebSocketConnection(async () => {
      await fetch("/upload", { method: "POST", body: formData });
      clearForm();
      loadList();
    });
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

function clearForm() {
  const fileInput = document.getElementById("fileInput");
  const commentInput = document.getElementById("commentInput");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const progressPercentage = document.getElementById("progressPercentage");

  fileInput.value = "";
  commentInput.value = "";
  progressContainer.classList.add("hidden");
  progressBar.value = 0;
  progressPercentage.textContent = "0%";
}

async function loadList() {
  try {
    const response = await fetch("/list", { method: "GET" });
    const data = await response.json();

    const fileContainer = document.getElementById("fileListContainer");
    fileContainer.innerHTML = ""; // Clear previous results

    const listContainer = document.createElement("ul");

    data.files.forEach((file) => {
      const element = document.createElement("li");

      const fileInfo = document.createElement("span");
      fileInfo.innerHTML = `<strong>Name:</strong> ${file.name}, <strong>comment:</strong> ${file.comment}`;

      const downloadButton = document.createElement("button");
      downloadButton.className = "download-button";
      const icon = document.createElement("i");
      icon.className = "fas fa-download";
      downloadButton.appendChild(icon);

      downloadButton.addEventListener("click", () => {
        downloadFile(file.name);
      });

      element.appendChild(fileInfo);
      element.appendChild(downloadButton);
      listContainer.appendChild(element);
    });
    fileContainer.innerHTML = "<h2>List of uploaded files</h2>";
    fileContainer.appendChild(listContainer);
  } catch (error) {
    document.getElementById("fileListContainer").innerHTML =
      "<h2>Failed to load files</h2>";
  }
}

async function downloadFile(fileName) {
  try {
    const response = await fetch(`/files/${fileName}`, {
      method: "GET",
    });

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName.split("/").pop();
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

function openWebSocketConnection(onOpenCallback) {
  let connection = new WebSocket("ws://{serverUrl}:{port}");

  connection.onopen = async (event) => {
    console.log("Server connection opened");
    connection.send("hello from client to server!");
    onOpenCallback && onOpenCallback();
  };

  connection.onmessage = function (event) {
    console.log("Server message:", event.data);
    const parsedData = JSON.parse(event.data);

    const progressBar = document.getElementById("progressBar");
    const progressPercentage = document.getElementById("progressPercentage");

    progressBar.value = parsedData.percentage;
    progressPercentage.textContent = `Progress: ${parsedData.percentage.toFixed(
      2
    )}% (${parsedData.transferred} of ${parsedData.total} byte)`;
  };

  connection.onerror = (error) => {
    console.log("WebSocket error:", error);
  };

  connection.onclose = () => {
    console.log("Server connection closed");
    connection = null;
    clearInterval(keepAliveTimer);
  };

  let keepAliveTimer = setInterval(
    () => connection.send("KEEP_ME_ALIVE"),
    5000
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadList();
});
