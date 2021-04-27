const http = require('http')
const express = require('express')
const { response } = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./model/phonebook')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('message', (req) => req.message)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :message'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}


app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      console.log('received')
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      const personsCount = persons.length
      const dateNow = new Date()
      const output = `Phonebook has info for ${personsCount} people ${dateNow}`
      response.send(output)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.send(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      if (result) {
        console.log('Person deleted')
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = { 
    name: request.body.name, 
    number: request.body.number 
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(person => {
      if (person) {
        console.log('Person updated')
        response.send(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  })
  if (!person.name) {
    const error = { error: 'name required' }
    request.message = JSON.stringify(error)
    response.status(400).send(error)
  } else if (!person.number) {
    const error = { error: 'number required' }
    request.message = JSON.stringify(error)
    response.status(400).send(error)
  } else {
    person.save().then(person => {
      console.log('Person added')
      response.send(person)
    })
  }
}) 

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)