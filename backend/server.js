import mysql from 'mysql2/promise'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

const pool = mysql.createPool({
  user: 'root',
  password: 'root',
  host: 'localhost',
  database: 'bank',
  port: 8889,
})

async function query(sql, params) {
  const [results] = await pool.execute(sql, params)
  return results
}

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000)
  return otp.toString()
}

// Din kod här. Skriv dina routes:

async function getSessionFromToken(token) {
  const sql = 'SELECT * FROM sessions WHERE token = ?'
  const params = [token]

  const sessions = await query(sql, params)

  return sessions[0]
}

async function getAccountFromUserId(userId) {
  const sql = 'SELECT * FROM accounts WHERE user_id = ?'
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
    console.error(error)
    res.status(500).send('Error creating user')
  }
})

//login

app.post('/sessions', async (req, res) => {
  const { username, password } = req.body

  console.log('Login:', username, password)

  try {
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?'
    const params = [username, password]

    const users = await query(sql, params)
    console.log('Users from database:', users)

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Fel användarnamn eller lösenord',
      })
    }

    const user = users[0]

    console.log('Found user:', user)

    const token = generateOTP()

    const sessionSql = 'INSERT INTO sessions (user_id, token) VALUES (?, ?)'
    const sessionParams = [user.id, token]

    await query(sessionSql, sessionParams)

    console.log('Session created:', token)

    res.status(200).json({
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error logging in')
  }
})

//saldo

app.post('/me/accounts', async (req, res) => {
  const { token } = req.body

  try {
    const session = await getSessionFromToken(token)

    console.log('Session:', session)
    if (!session) {
      return res.status(401).json({
        message: 'Ogiltig token',
      })
    }

    const account = await getAccountFromUserId(session.user_id)
    console.log('Account:', account)
    if (!account) {
      return res.status(404).json({
        message: 'Inget konto hittades',
      })
    }

    res.status(200).json({
      amount: account.amount,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error getting account')
  }
})
//sätta in

app.post('/me/accounts/transactions', async (req, res) => {
  const { token, amount } = req.body

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

    const newAmount = Number(account.amount) + Number(amount)

    const sql = 'UPDATE accounts SET amount = ? WHERE id = ?'
    const params = [newAmount, account.id]

    await query(sql, params)

    res.status(200).json({
      amount: newAmount,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error making transaction')
  }
})

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`)
})
