document.getElementById("execute").addEventListener("click", async () => {
  const query = document.getElementById("query").value;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // Clear previous results

  try {
    const response = await fetch("/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.type === "select") {
      const table = document.createElement("table");

      const headerRow = document.createElement("tr");
      result.fields.forEach((field) => {
        const th = document.createElement("th");
        th.textContent = field.name;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      result.data.forEach((row) => {
        const dataRow = document.createElement("tr");
        Object.values(row).forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value === null ? "NULL" : value;
          dataRow.appendChild(td);
        });
        table.appendChild(dataRow);
      });

      resultDiv.appendChild(table);
    } else if (result.type === "modification") {
      resultDiv.innerHTML = `<p style="color: green;">Rows affected: ${result.data.affectedRows}</p><p style="color: green;">Rows changed: ${result.data.changedRows}</p>`;
    } else if (result.type === "show" || result.type === "describe") {
      const p = document.createElement("p");
      p.innerText = JSON.stringify(result.data);
      resultDiv.appendChild(p);
    } else if (result.type === "error") {
      resultDiv.innerHTML = `<p style="color: red;">Error: ${result.message}</p>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
});
