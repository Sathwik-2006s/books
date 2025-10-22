const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const BOOKS_FILE = path.join(__dirname, 'books.json');

// Helper to read books.json
function readBooks() {
  try {
    const data = fs.readFileSync(BOOKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Helper to write books.json
function writeBooks(books) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

// GET /books - return all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});

// Bonus: GET /books/available - return only available books
app.get('/books/available', (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(book => book.available === true);
  res.json(availableBooks);
});

// POST /books - add a new book
app.post('/books', (req, res) => {
  const books = readBooks();
  const { title, author, available } = req.body;

  if (!title || !author || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);

  writeBooks(books);

  res.status(201).json(newBook);
});

// PUT /books/:id - update book
app.put('/books/:id', (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);
  const { title, author, available } = req.body;

  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (title !== undefined) books[bookIndex].title = title;
  if (author !== undefined) books[bookIndex].author = author;
  if (available !== undefined) books[bookIndex].available = available;

  writeBooks(books);

  res.json(books[bookIndex]);
});

// DELETE /books/:id - delete book
app.delete('/books/:id', (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);

  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  writeBooks(books);

  res.json(deletedBook);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
