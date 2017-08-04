const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

require('dotenv').config()

const FBRankModel = {}

// Creating the database file if not exists:
try {
  var fd = fs.openSync(process.env.DATABASE, 'wx', (err, fd) => {
    if (err) {
      console.error('Error on opening or creating database file: ' + err)
    }
  })
  fs.closeSync(fd)
} catch (e) {

}

// Open and prepare database:
const db = new sqlite3.Database(process.env.DATABASE, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  db.serialize(() => {
    // Creates database if not exists:
    db.run('CREATE TABLE IF NOT EXISTS beers_rank (id TEXT PRIMARY KEY, username TEXT, name TEXT, beers INT)', err => { if (err) return console.error(`Error on create table if not exists: ${err}`) })

    // Insert or update beer counter method:
    FBRankModel.addFreeBeer = (user, cb) => {
      console.log('addd')
      console.log(user)
      let stmt = db.prepare('SELECT id, beers FROM beers_rank WHERE id = ?')
      stmt.get(user.id, (err, row) => {
        if (err) return console.error(`Error on select: ${err}`)
        if (!row) { // inserts new entry
          console.log(`This user is not in database, let's add it!`)
          stmt = db.prepare('INSERT INTO beers_rank VALUES(?, ?, ?, 1)')
          stmt.run([user.id, user.name, user.realName], err => {
            if (err) return console.error(`Error on insert new user: ${err}`)
            stmt.finalize()
            console.log(`Inserted new user in beers_rank table: ${user.id}`)
            if (cb) cb()
          })
        } else { // updates that entry
          console.log(`Updating user free beer counter!`)
          stmt = db.prepare('UPDATE beers_rank SET beers = ? WHERE id = ?')
          const updatedBeers = row.beers + 1
          stmt.run([updatedBeers, user.id], err => {
            if (err) return console.error(`Error on updating user beers counter :( ${err}`)
            stmt.finalize()
            console.log(`Updated free beers counter for user ${user.id}`)
            if (cb) cb()
          })
        }
      })
    }

    // Get beers counter by user id:
    FBRankModel.getBeers = (userId, cb) => {
      let stmt = db.prepare('SELECT beers FROM beers_rank WHERE id = ?')
      stmt.get(userId, (err, row) => {
        if (err) return console.error(`Error on select beers for user ${userId}`)
        if (typeof row.beers !== 'undefined') {
          if (cb) cb(row.beers)
        } else {
          if (cb) cb(0)
        }
      })
    }

    // Get beers ranking:
    FBRankModel.getRanking = (cb) => {
      if (!cb) return
      let stmt = db.prepare('SELECT id, username, name, beers FROM beers_rank ORDER BY beers DESC LIMIT 10')
      stmt.all((err, rows) => {
        if (err) {
          console.log(`Error on select ranking ${err}`)
          return
        }
        if (rows.length) {
          const response = rows.reduce((response, row, index) => {
            const n = index + 1
            const name = (typeof row.name === 'string' && row.name.length) ? row.name : row.username
            return `${response}${n}. ${name}: ${row.beers}\n`
          }, '')
          if (cb) cb(response)
        } else {
          if (cb) cb('There is no entries on the ranking :disappointed:')
        }
      })
    }
  })
})

module.exports = FBRankModel
