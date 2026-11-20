import { randomBytes } from 'node:crypto'
import { validateAmount } from './src/validateAmount.js'

import mysql from 'mysql2/promise'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

// connect to DB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bank',
  port: Number(process.env.DB_PORT || 3306),
  timezone: 'Z',
})

async function query(sql, params) {
  const [results] = await pool.execute(sql, params)
  return results
}

// Middleware
app.use(cors())
app.use(bodyParser.json())

async function getSessionFromToken(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return
  const sql = 'SELECT * FROM sessions WHERE token = ?'
  const params = [token]

  const sessions = await query(sql, params)

  return sessions[0]
}

async function getAccountFromUserId(userId) {
  const sql = 'SELECT * FROM accounts WHERE user_id = ? ORDER BY id LIMIT 1'
  const params = [userId]

  const accounts = await query(sql, params)

  return accounts[0]
}

// Skapa användare

app.post('/users', async (req, res) => {
  const { username, password } = req.body

  try {
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'
    const params = [username, password]

    const result = await query(sql, params)

    const userId = result.insertId

    const accountSql = 'INSERT INTO accounts (user_id, amount) VALUES (?, ?)'
    const accountParams = [userId, 0]

    await query(accountSql, accountParams)

    console.log('User created:', userId)

    res.send('User created')
  } catch (error) {
    console.error(error.code ?? error.name)
    res.status(500).send('Error creating user')
  }
})

//login

app.post('/sessions', async (req, res) => {
  const { username, password } = req.body


  try {
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?'
    const params = [username, password]

    const users = await query(sql, params)

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Fel användarnamn eller lösenord',
      })
    }

    const user = users[0]


    const token = randomBytes(32).toString('hex')

    const sessionSql = 'INSERT INTO sessions (user_id, token) VALUES (?, ?)'
    const sessionParams = [user.id, token]

    await query(sessionSql, sessionParams)


    res.status(200).json({
      token,
    })
  } catch (error) {
    console.error(error.code ?? error.name)
    res.status(500).send('Error logging in')
  }
})

//saldo

app.post('/me/accounts', async (req, res) => {
  const { token } = req.body ?? {}

  try {
    const session = await getSessionFromToken(token)

    if (!session) {
      return res.status(401).json({
        message: 'Ogiltig token',
      })
    }

    const account = await getAccountFromUserId(session.user_id)
    if (!account) {
      return res.status(404).json({
        message: 'Inget konto hittades',
      })
    }

    res.status(200).json({
      amount: account.amount,
    })
  } catch (error) {
    console.error(error.code ?? error.name)
    res.status(500).send('Error getting account')
  }
})
app.get('/me/accounts/transactions', async (req, res) => {
  const session = await getSessionFromToken(req.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1])
  if (!session) {
    return res.status(401).json({ message: 'Inloggningstoken saknas eller är ogiltig' })
  }

  const transactions = await query(
    `SELECT t.id, t.amount, t.created_at AS createdAt
     FROM transactions t JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = ?
     ORDER BY t.created_at DESC, t.id DESC`,
    [session.user_id],
  )

  res.set('Cache-Control', 'no-store').json({ transactions })
})

app.post('/me/accounts/transactions', async (req, res) => {
  const { token, amount } = req.body ?? {}
  const session = await getSessionFromToken(token)
  if (!session) {
    return res.status(401).json({ message: 'Inloggningstoken saknas eller är ogiltig' })
  }
  if (!validateAmount(amount)) {
    return res.status(400).json({ message: 'Ange ett positivt belopp med högst två decimaler.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [accounts] = await connection.execute(
      'SELECT id, amount FROM accounts WHERE user_id = ? ORDER BY id LIMIT 1 FOR UPDATE',
      [session.user_id],
    )
    const account = accounts[0]
    if (!account) {
      await connection.rollback()
      return res.status(404).json({ message: 'Inget konto hittades' })
    }

    const newBalanceInOre = Math.round(Number(account.amount) * 100) + Math.round(amount * 100)
    if (newBalanceInOre > 9_999_999_999) {
      await connection.rollback()
      return res.status(400).json({ message: 'Insättningen överskrider högsta tillåtna saldo.' })
    }

    const newAmount = (newBalanceInOre / 100).toFixed(2)
    await connection.execute('UPDATE accounts SET amount = ? WHERE id = ?', [newAmount, account.id])
    await connection.execute('INSERT INTO transactions (account_id, amount) VALUES (?, ?)', [
      account.id, amount.toFixed(2),
    ])
    await connection.commit()
    res.json({ amount: Number(newAmount) })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

app.get('/health', async (_req, res) => {
  await query('SELECT 1')
  res.sendStatus(200)
})

app.use((error, _req, res, _next) => {
  console.error(error.code ?? error.name)
  const status = error.status === 400 ? 400 : 500
  res.status(status).json({ message: status === 400 ? 'Ogiltig förfrågan' : 'Ett serverfel uppstod' })
})

async function migrateDatabase() {
  const [tokenColumn] = await query("SHOW COLUMNS FROM sessions LIKE 'token'")
  if (tokenColumn.Type === 'varchar(6)') {
    await query('ALTER TABLE sessions MODIFY token VARCHAR(64) NOT NULL')
  }

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      account_id INT UNSIGNED NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      INDEX transactions_account_date (account_id, created_at, id),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    ) ENGINE=InnoDB
  `)
}

await migrateDatabase()
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`)
})
