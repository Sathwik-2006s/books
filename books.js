const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
const FILE_PATH = path.join(__dirname, 'books.json');
function readBooks() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}
function writeBooks(books) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));
}
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});
app.get('/books/available', (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(book => book.available === true);
  res.json(availableBooks);
});
app.post('/books', (req, res) => {
  const { title, author, available } = req.body;
  if (typeof title !== 'string' || typeof author !== 'string' || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Invalid book data' });
  }
  const books = readBooks();
  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});
app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }
  const { title, author, available } = req.body;
  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid title' });
  }
  if (author !== undefined && typeof author !== 'string') {
    return res.status(400).json({ error: 'Invalid author' });
  }
  if (available !== undefined && typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Invalid available status' });
  }
  const books = readBooks();
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const book = books[bookIndex];
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (available !== undefined) book.available = available;
  books[bookIndex] = book;
  writeBooks(books);
  res.json(book);
});
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }
  const books = readBooks();
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  books.splice(bookIndex, 1);
  writeBooks(books);
  res.json({ message: 'Book deleted' });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
