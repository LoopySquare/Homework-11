const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set GET routes
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/db/db.json'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//POST route for adding new notes
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);
  
    // Destructuring items in request body
    const { title, text } = req.body;
  
    //if title and text exist -> read current notes -> add new note to saved note array -> give note id based on array position
    if (title && text ) {
      // Variable for our new note
      const newNote = {
        title,
        text,
      };
  
      // Obtain existing notes
      fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);

          //assign id based on array position
          let uniqueId = (parsedNotes.length).toString();
          newNote.id = uniqueId;
          parsedNotes.push(newNote);
  
          // Write updated notes back to the file
          fs.writeFile(
            'db/db.json',
            JSON.stringify(parsedNotes, null, 4),
            (writeErr) =>
              writeErr
                ? console.error(writeErr)
                : console.info('Successfully updated notes!')
          );
        }
      });
  
      const response = {
        status: 'success',
        body: newNote,
      };
  
      console.log(response);
      res.status(201).json(response);
    } else {
      res.status(500).json('Error in posting note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received to delete note`);
    let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json"));
    let noteId = req.params.id;
    let newId = 0;

    parsedNotes = parsedNotes.filter(currNote => {
      return currNote.id != noteId;
    });

    for (currNote of parsedNotes) {
      currNote.id = newId.toString();
      newId++;
    }

    fs.writeFile(
      'db/db.json',
      JSON.stringify(parsedNotes, null, 4),
      (writeErr) =>
        writeErr
          ? console.error(writeErr)
          : console.info('Successfully deleted note!')
    );
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);