const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;

const readBooks = () => {
  const data = fs.readFileSync('books.json');
  return JSON.parse(data);
};

const writeBooks = (books) => {
  fs.writeFileSync('books.json', JSON.stringify(books, null, 2));
};

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (req.method === 'GET' && pathname === '/books') {
    
    const books = readBooks();
    res.end(JSON.stringify(books));
  } else if (req.method === 'GET' && pathname.startsWith('/books/')) {
    // GET - /books/:id
    const id = parseInt(pathname.split('/')[2], 10);
    const books = readBooks();
    const book = books.find(b => b.id === id);
    
    if (book) {
      res.end(JSON.stringify(book));
    } else {
      res.end('Ma\'lumot topilmadi');
    }
  } else if (req.method === 'POST' && pathname === '/books') {
    // POST books
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newBook = JSON.parse(body);
      const books = readBooks();

      
      const existingBook = books.find(b => b.title === newBook.title);
      if (existingBook) {
        res.end('bu kitob bazada mavjud');
      } else {
        newBook.id = books.length ? books[books.length - 1].id + 1 : 1;
        books.push(newBook);
        writeBooks(books);
       
        res.end(JSON.stringify(newBook));
      }
    });
  } else if (req.method === 'PUT' && pathname.startsWith('/books/')) {
    
    const id = parseInt(pathname.split('/')[2], 10);
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const updatedData = JSON.parse(body);
      const books = readBooks();
      const index = books.findIndex(b => b.id === id);
      
      if (index !== -1) {
        books[index] = { ...books[index], ...updatedData };
        writeBooks(books);
        res.end(JSON.stringify(books[index]));
      } else {
        res.end('Ma\'lumot topilmadi');
      }
    });
  } else if (req.method === 'DELETE' && pathname.startsWith('/books/')) {
  
    const id = parseInt(pathname.split('/')[2], 10);
    const books = readBooks();
    const index = books.findIndex(b => b.id === id);
    
    if (index !== -1) {
      books.splice(index, 1);
      writeBooks(books);
      res.writeHead(204);
      res.end();
    } else {
      res.end('Ma\'lumot topilmadi');
    }
  } else {
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`server ${PORT} porta ishga tushdi.`);
});
