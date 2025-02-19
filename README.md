# nodejs-course

# Task 1: Voting System

Develop a voting system with backend services to provide answer options, accept votes, and return vote statistics. The frontend should display options as buttons, show current statistics, and update them after each vote.

# Task 2: Server-side Validation Form

Simple form with server-side validation that uses EJS to render HTML from the server. Upon successful validation, the server will display the submitted data. If validation fails, an error message will be shown, and the form will be re-displayed with the previously entered data.

# Task 3: Content-Type & Accept Headers

Develop a service to retrieve voting results from Task 1, returning the results in XML, HTML, or JSON format based on the `Accept` request header. Ensure the response includes the appropriate `Content-Type` headers for each format. Additionally, add buttons below the voting block to allow users to download the voting results in all three formats.

# Task 4: 
Simplified tool for working with APIs, similar to Postman, that allows you to send HTTP requests and view the responses. It enables configuring requests by setting the URL (without query parameters), choosing the HTTP method (GET, POST, PUT, DELETE), adding parameters (key-value pairs), specifying Content-Type, providing the request body, and setting additional headers.

# Task 5: 
Enhance a validated form by ensuring it submits data using the POST method. After a successful submission, the user is redirected to a GET request, preventing duplicate submissions when the page is refreshed. These improvements provide a smoother user experience and eliminate unintended resubmissions caused by browser behavior.

# Task 6: 
Using Handlebars simplifies form rendering by dynamically generating fields, labels, and validation messages. This improves flexibility, reduces redundancy, and ensures a clear separation of logic and presentation.

# Task 7: 
AutoCompressor is a Node.js script that takes a folder path as a command-line argument and automatically manages compressed versions of the files within it. It scans the specified directory, including all subdirectories, to identify files and check for existing compressed versions with the .gz extension. If a compressed version does not exist, it is created using the zlib module. If a compressed version is found, the script compares its timestamp with the original file and updates it if it is outdated. All operations are performed asynchronously, ensuring efficient execution without blocking the event loop. The script logs key actions to the console, such as scanning directories, starting or updating compression, and completing the process. To maintain clarity in execution, only one file is compressed at a time, with console messages reflecting this sequential processing.

# Task 8: 
SQLExplorer is a web-based tool that allows users to execute arbitrary SQL queries and view the results. If the query is a SELECT statement, the results are displayed in a table format with headers. If the query modifies data, the page shows the number of affected rows. In case of an error, the corresponding error message is displayed.

# Task 9: 
FileStorage is a web application that allows users to upload files with accompanying comments. All uploaded files are displayed in a list and can be downloaded with their original names, including those with non-Latin characters. When a user selects a file, enters a comment, and clicks the "Upload" button, the file upload process begins, accompanied by a detailed progress bar. The progress updates are communicated between the server and client using WebSockets. The server supports multiple clients simultaneously and remains stable even if a client disconnects. Similarly, the client handles server disconnections or network failures gracefully by displaying an error message and allowing the user to retry the upload later.
