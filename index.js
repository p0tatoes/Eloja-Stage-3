// Import modules
const express = require("express");
const database = require("mysql2");

// Init Express.js app
const app = express();

// Fields for hostname and port used by the app
const HOST = "127.0.0.1";
const PORT = "3000";

// Favourite programming language
const favLang = "Javascript";

// Establishes connection to MySQL database
const conn_pool = database.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sysdev_recruitment",
});

// Routes
// Home route (Shows cat)
app.get("/", (request, response) => {
    response.send(
        'Blank page; proceed to <a href="http://localhost:3000/programming-language">http://localhost:3000/programming-language</a>'
    );
});

// Shows favorite programming language in a webpage
app.get("/programming-language", (request, response) => {
    response.send(favLang);
});

// Adds a new favorite programming language to the database if the "favorite" query string/parameter has a value
app.get("/programming-language/new", (request, response) => {
    // Stores the value of the query string/parameter
    let newFavLang = request.query.favorite;

    // Prints warning when newFavLang is not present in the URL or null
    if (!newFavLang) {
        response.send(
            '<h1>Please include the "favorite" query parameter containing your favorite programming language</h1>\n' +
                "<h3>Example: http://localhost:3000/programming-language/new?favorite=[Insert Programming Language]</h3>"
        );
        return;
    }

    // Inserts newFavLang into the database if it is not null
    let insert_query = `INSERT INTO programming_languages(favorites) VALUES("${newFavLang}")`;
    conn_pool.getConnection((err, connection) => {
        // Throws an error if there is an issue with getting a connection to the database
        if (err) throw err;

        connection.query(insert_query, (err, results) => {
            // Discards the connection after the query is executed and throws an error message, if there are any
            connection.destroy();
            if (err) throw err;

            // Sends the OK status and logs to the console to confirm successful insertion into the database
            response.sendStatus(200);
            console.log(
                `Added ${newFavLang} as a new favorite programming language to the database`
            );
        });
    });
});

// Shows favorite programming languages that are stored in the MySQL database
app.get("/programming-languages", (request, response) => {
    conn_pool.getConnection((err, connection) => {
        // Throws an error if there is an issue with getting a connection to the database
        if (err) throw err;

        let pl_query = "SELECT favorites FROM programming_languages";
        connection.query(pl_query, (err, rows, fields) => {
            // Stores the values of the returned objects into an array
            let favLangs = rows.map((row) => {
                return row.favorites;
            });
            // Displays in the webpage your favorite languages from the database
            response.send(`<p>${favLangs}</p>`);

            // Discards the connection after the query is executed and throws an error message, if there are any
            connection.destroy();
            if (err) throw err;
        });
    });
});

// Just logs to console when the app is started
app.listen(PORT, HOST, () =>
    console.log(`NodeJS app running on ${HOST}:${PORT}`)
);

/**
 * Query used to create MySQL schema/database:
 *
 * CREATE DATABASE sysdev_recruitment;
 */

/**
 * Query used to create programming_languages table:
 *
 * CREATE TABLE programming_languages(id INT NOT NULL AUTO_INCREMENT, favorites VARCHAR(255), primary key(id));
 */
