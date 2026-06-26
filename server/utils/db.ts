import { promises as fs } from 'fs'
import { join } from 'path'

export interface Author {
  id: number
  name: string
  email: string
  birth_date: string
  bio: string
  profile_photo_url?: string | null
  created_at: string
  updated_at: string
}

export interface Book {
  id: number
  author_id: number
  title: string
  isbn: string
  published_year: number
  description: string
  status: 'AVAILABLE' | 'LOANED' | 'RESERVED'
  genre?: string
  cover_url?: string | null
  created_at: string
  updated_at: string
}

interface DatabaseSchema {
  authors: Author[]
  books: Book[]
}

const DB_DIR = join(process.cwd(), 'server/data')
const DB_FILE = join(DB_DIR, 'db.json')

let dbCached: DatabaseSchema | null = null

// Helper to format date relative to UTC
const getTimestamp = () => new Date().toISOString()

// Seed data
const initialAuthors: Author[] = [
  { id: 1, name: 'Gabriel García Márquez', email: 'gabriel.marquez@literary.com', birth_date: '1927-03-06', bio: 'Colombian novelist, short-story writer, screenwriter, and journalist. Winner of the Nobel Prize in Literature 1982. Known for the novel One Hundred Years of Solitude.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 2, name: 'Haruki Murakami', email: 'murakami.studio@books.jp', birth_date: '1949-01-12', bio: 'Japanese novelist, surrealist writer, known for Kafka on the Shore and Norwegian Wood.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 3, name: 'Chimamanda Ngozi Adichie', email: 'adichie.office@writer.ng', birth_date: '1977-09-15', bio: 'Nigerian author, wrote Half of a Yellow Sun and Purple Hibiscus.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 4, name: 'Kazuo Ishiguro', email: 'kazuo.i@nobelprize.org', birth_date: '1954-11-08', bio: 'Nobel laureate British author, wrote The Remains of the Day and Never Let Me Go.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 5, name: 'Margaret Atwood', email: 'atwood.m@canadawrites.ca', birth_date: '1939-11-18', bio: 'Canadian poet and novelist, best known for The Handmaid\'s Tale.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 6, name: 'Stephen King', email: 'king.s@mainewriter.com', birth_date: '1947-09-21', bio: 'Prolific American horror and suspense fiction writer.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 7, name: 'Zadie Smith', email: 'z.smith@literature.co.uk', birth_date: '1975-10-25', bio: 'British contemporary novelist and essayist, wrote White Teeth.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 8, name: 'Toni Morrison', email: 'morrison.toni@legacy.org', birth_date: '1931-02-18', bio: 'Nobel laureate African-American novelist, wrote Beloved.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 9, name: 'Elena Ferrante', email: 'ferrante.e@napoli.it', birth_date: '1943-04-05', bio: 'Pseudonymous Italian novelist, known for the Neapolitan Novels.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 10, name: 'Salman Rushdie', email: 'rushdie.office@books.com', birth_date: '1947-06-19', bio: 'British-Indian novelist, wrote Midnight\'s Children and The Satanic Verses.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 11, name: 'Elena Richardson', email: 'elena.richardson@books.com', birth_date: '1982-08-14', bio: 'Contemporary tech and architectural fiction writer.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 12, name: 'Marcus Thorne', email: 'marcus.thorne@mystery.com', birth_date: '1976-11-03', bio: 'Mystery and thriller author, creator of the Sarah Cross detective series.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 13, name: 'Sarah Jenkins', email: 's.jenkins@urbandesign.org', birth_date: '1981-05-22', bio: 'Architect and urban planner writing on modern concrete developments.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 14, name: 'Dr. Alan Turing', email: 'alan.turing@cs.edu', birth_date: '1912-06-23', bio: 'Pioneer of computer science, writer on algorithms and computing machinery.', created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 15, name: 'Clara Voigt', email: 'clara.voigt@fiction.de', birth_date: '1990-04-12', bio: 'German contemporary novelist writing about technology and society.', created_at: getTimestamp(), updated_at: getTimestamp() }
]

const initialBooks: Book[] = [
  { id: 1, author_id: 11, title: "The Architect's Logic", isbn: "978-0-061-96436-9", published_year: 2021, status: "AVAILABLE", genre: "Tech", description: "An exploration into structural systems, combining computational models with classical architectural layouts.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 2, author_id: 12, title: "Silent Patterns", isbn: "978-0-743-26341-0", published_year: 2019, status: "LOANED", genre: "Mystery", description: "A gripping mystery novel following detective Sarah Cross as she unravels cryptic disappearances in a quiet coastal town.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 3, author_id: 13, title: "Urban Flow", isbn: "978-0-525-55360-5", published_year: 2020, status: "AVAILABLE", genre: "Architecture", description: "A comprehensive look at circulation and transit systems in dense global cities.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 4, author_id: 14, title: "Data Structures", isbn: "978-0-131-10362-7", published_year: 2018, status: "AVAILABLE", genre: "Education", description: "A foundational text on binary trees, graph theory, and algorithmic complexity analysis.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 5, author_id: 15, title: "Whisper of the Wind", isbn: "978-0-062-31609-7", published_year: 2022, status: "RESERVED", genre: "Fiction", description: "A poetic narrative about a remote Alpine community adjusting to climate changes.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 6, author_id: 14, title: "Neural Networks", isbn: "978-0-262-03384-8", published_year: 2020, status: "AVAILABLE", genre: "Education", description: "Mathematical foundations of neural weights, backpropagation, and artificial learning systems.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 7, author_id: 11, title: "The Last Meridian", isbn: "978-1-501-15609-4", published_year: 2023, status: "LOANED", genre: "Science", description: "An oceanographic thriller tracing a missing survey vessel in the South Pacific.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 8, author_id: 13, title: "Concrete Dreams", isbn: "978-0-385-54734-9", published_year: 2017, status: "AVAILABLE", genre: "Architecture", description: "The visual history of brutalist architecture and its social housing initiatives.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 9, author_id: 12, title: "Shadows in Motion", isbn: "978-0-307-47347-5", published_year: 2021, status: "RESERVED", genre: "Thriller", description: "Fast-paced corporate espionage thriller centering on industrial drone designs.", created_at: getTimestamp(), updated_at: getTimestamp() },
  { id: 10, author_id: 15, title: "Beyond the Binary", isbn: "978-0-593-31012-5", published_year: 2022, status: "AVAILABLE", genre: "Tech", description: "Critical essays regarding the ethics and societal impacts of automation.", created_at: getTimestamp(), updated_at: getTimestamp() }
]

// Initialize database
async function getDb(): Promise<DatabaseSchema> {
  if (dbCached) return dbCached

  try {
    await fs.mkdir(DB_DIR, { recursive: true })
  } catch (e) {}

  try {
    const data = await fs.readFile(DB_FILE, 'utf-8')
    dbCached = JSON.parse(data)
  } catch (error) {
    // If not found, write defaults
    dbCached = {
      authors: initialAuthors,
      books: initialBooks
    }
    await saveDb(dbCached)
  }

  return dbCached!
}

async function saveDb(data: DatabaseSchema): Promise<void> {
  dbCached = data
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export const db = {
  // Authors CRUD
  async getAuthors(): Promise<Author[]> {
    const database = await getDb()
    return database.authors
  },

  async getAuthorById(id: number): Promise<Author | undefined> {
    const authors = await this.getAuthors()
    return authors.find(a => a.id === id)
  },

  async createAuthor(data: Omit<Author, 'id' | 'created_at' | 'updated_at'>): Promise<Author> {
    const database = await getDb()
    
    // Validate unique email
    const emailExists = database.authors.some(a => a.email.toLowerCase() === data.email.toLowerCase())
    if (emailExists) {
      throw new Error('EMAIL_EXISTS')
    }

    const nextId = database.authors.reduce((max, a) => a.id > max ? a.id : max, 0) + 1
    const newAuthor: Author = {
      id: nextId,
      ...data,
      created_at: getTimestamp(),
      updated_at: getTimestamp()
    }
    database.authors.push(newAuthor)
    await saveDb(database)
    return newAuthor
  },

  async updateAuthor(id: number, data: Partial<Omit<Author, 'id' | 'created_at' | 'updated_at'>>): Promise<Author> {
    const database = await getDb()
    const idx = database.authors.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('NOT_FOUND')

    if (data.email) {
      const emailExists = database.authors.some(a => a.id !== id && a.email.toLowerCase() === data.email!.toLowerCase())
      if (emailExists) {
        throw new Error('EMAIL_EXISTS')
      }
    }

    const updated: Author = {
      ...database.authors[idx],
      ...data,
      updated_at: getTimestamp()
    }
    database.authors[idx] = updated
    await saveDb(database)
    return updated
  },

  async deleteAuthor(id: number): Promise<void> {
    const database = await getDb()
    const authorExists = database.authors.some(a => a.id === id)
    if (!authorExists) throw new Error('NOT_FOUND')

    // Cascade delete books belonging to this author
    database.books = database.books.filter(b => b.author_id !== id)
    database.authors = database.authors.filter(a => a.id !== id)
    await saveDb(database)
  },

  // Books CRUD
  async getBooks(): Promise<Book[]> {
    const database = await getDb()
    return database.books
  },

  async getBookById(id: number): Promise<Book | undefined> {
    const books = await this.getBooks()
    return books.find(b => b.id === id)
  },

  async createBook(data: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const database = await getDb()

    // Validate author exists
    const authorExists = database.authors.some(a => a.id === data.author_id)
    if (!authorExists) {
      throw new Error('AUTHOR_NOT_FOUND')
    }

    // Validate unique ISBN
    const isbnExists = database.books.some(b => b.isbn.replace(/[- ]/g, '') === data.isbn.replace(/[- ]/g, ''))
    if (isbnExists) {
      throw new Error('ISBN_EXISTS')
    }

    const nextId = database.books.reduce((max, b) => b.id > max ? b.id : max, 0) + 1
    const newBook: Book = {
      id: nextId,
      ...data,
      created_at: getTimestamp(),
      updated_at: getTimestamp()
    }
    database.books.push(newBook)
    await saveDb(database)
    return newBook
  },

  async updateBook(id: number, data: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>): Promise<Book> {
    const database = await getDb()
    const idx = database.books.findIndex(b => b.id === id)
    if (idx === -1) throw new Error('NOT_FOUND')

    if (data.author_id) {
      const authorExists = database.authors.some(a => a.id === data.author_id)
      if (!authorExists) throw new Error('AUTHOR_NOT_FOUND')
    }

    if (data.isbn) {
      const isbnExists = database.books.some(b => b.id !== id && b.isbn.replace(/[- ]/g, '') === data.isbn!.replace(/[- ]/g, ''))
      if (isbnExists) throw new Error('ISBN_EXISTS')
    }

    const updated: Book = {
      ...database.books[idx],
      ...data,
      updated_at: getTimestamp()
    }
    database.books[idx] = updated
    await saveDb(database)
    return updated
  },

  async deleteBook(id: number): Promise<void> {
    const database = await getDb()
    const bookExists = database.books.some(b => b.id === id)
    if (!bookExists) throw new Error('NOT_FOUND')

    database.books = database.books.filter(b => b.id !== id)
    await saveDb(database)
  },

  // Reset database helper (for Settings page reset)
  async reset(): Promise<void> {
    const freshDb = {
      authors: initialAuthors,
      books: initialBooks
    }
    await saveDb(freshDb)
  }
}
