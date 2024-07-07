const express = require('express');
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/assets', express.static('assets'));

app.get('/api/entries', (req, res) => {
    const entriesDir = path.join(__dirname, 'entries');

    fs.readdir(entriesDir, async (err, files) => {
        if (err) {
            console.error('Error reading the entries directory:', err);
            return res.status(500).send('Error reading entries directory');
        }

        try {
            const filesWithStats = await Promise.all(files.map(file => {
                return new Promise((resolve, reject) => {
                    fs.stat(path.join(entriesDir, file), (err, stats) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ file, mtime: stats.mtime.getTime() });
                        }
                    });
                });
            }));

            filesWithStats.sort((a, b) => a.mtime - b.mtime);

            const sortedFiles = filesWithStats.map(fws => fws.file);

            res.json(sortedFiles);
        } catch (error) {
            console.error('Error sorting files:', error);
            res.status(500).send('Error processing files');
        }
    });
});

app.get('/api/entries/content', (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).send('File name is required');
    }

    const filePath = path.join(__dirname, 'entries', fileName);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).send('Error reading file');
        }
        res.send(data);
    });
});

app.get('/api/entries/date', (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).send('File name is required');
    }

    const filePath = path.join(__dirname, 'entries', fileName);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('Error getting file stats:', err);
            return res.status(500).send('Error reading file stats');
        }
        const mtime = stats.mtime; // Modification time
        const formattedDate = `${mtime.getDate()}/${mtime.getMonth() + 1}/${mtime.getFullYear()}`;
        res.send(formattedDate);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});