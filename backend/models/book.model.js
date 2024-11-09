const connection = require('../config/database');

module.exports = {
    getAllBooks: async () => {
        try {
            const [rows] = await connection.query(`
                SELECT
                    b.*,
                    a.name as authorName,
                    p.pu_name as publisherName,
                    g.gen_id as genreID,
                    g.genre_name as genreName
                FROM 
                    BOOK b
                LEFT JOIN 
                    AUTHOR a ON b.author_id = a.author_id
                LEFT JOIN 
                    PUBLISHER p ON b.pu_id = p.pu_id
                LEFT JOIN 
                    BOOK_GENRE bg ON b.book_id = bg.book_id
                LEFT JOIN 
                    GENRE g ON bg.gen_id = g.gen_id;
            `)
            return rows;
        } catch (error) {
            console.log(error);
        }
    },
    filterBook: async ({ title, minPrice, maxPrice, author_id, author_name, pu_id }) => {
        try {
            let query = 'SELECT * FROM book WHERE 1=1';
            const queryParams = [];

            if (title) {
                query += ' AND title LIKE ?';
                queryParams.push(`%${title}%`);
            }
            if (minPrice !== undefined && maxPrice !== undefined) {
                query += ' AND price BETWEEN ? AND ?';
                queryParams.push(minPrice, maxPrice);
            }
            if (author_id) {
                query += ' AND author_id = ?';
                queryParams.push(author_id);
            }
            if (author_name) {
                query += ' AND author_id IN (SELECT author_id FROM author WHERE name LIKE ?)';
                queryParams.push(`%${author_name}%`);
            }
            if (pu_id) {
                query += ' AND pu_id = ?';
                queryParams.push(pu_id);
            }

            const [rows] = await connection.query(query, queryParams);
            return rows;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getBookByID: async (book_id) => {
        try {
            const [rows] = await connection.query(`
                SELECT
                    b.*,
                    a.name AS authorName,
                    p.pu_name AS publisherName,
                    g.gen_id AS genreID,
                    g.genre_name AS genreName
                FROM 
                    BOOK b
                LEFT JOIN 
                    AUTHOR a ON b.author_id = a.author_id
                LEFT JOIN 
                    PUBLISHER p ON b.pu_id = p.pu_id
                LEFT JOIN 
                    BOOK_GENRE bg ON b.book_id = bg.book_id
                LEFT JOIN 
                    GENRE g ON bg.gen_id = g.gen_id
                WHERE 
                    b.book_id = ?
            `, [book_id])
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    createABook: async (title, price, author_id, pu_id) => {
        try {
            const [rows] = await connection.query('INSERT INTO book (title, price, author_id, pu_id) VALUE(?, ?, ?, ?)',
                [title, price, author_id, pu_id]);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateABook: async (book_id, title, price, author_id, pu_id) => {
        try {
            const [rows] = await connection.query('UPDATE book SET title = ?, price = ?, author_id = ?, pu_id = ? WHERE book_id = ?', [title, price, author_id, pu_id, book_id]);
            if (rows.affectedRows === 0) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    deleteABook: async (book_id) => {
        try {
            const [rows] = await connection.query('DELETE FROM book WHERE book_id = ?', [book_id]);
            console.log(rows);
            if (rows.affectedRows === 0) {
                return false;
            }
            else {
                return true;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    deleteAllofBooks: async () => {
        try {
            await connection.query('DELETE FROM book');
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}