const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Password missing')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.5g6ah.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
 })

const personSchema = mongoose.Schema({
  name: String,
  number: String,
})

const Person = new mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else {
  person.save().then(result => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })

}
