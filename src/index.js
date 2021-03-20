const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username)

  if(!userExists) return response.status(404).json({ error: "User not found" })

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({ error: "User already exists"})
  }

  if(!name || !username) {
    return response.status(400).json({ error: 'Required properties missing' })
  }
  
    const userObject = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(userObject)
  
    response.status(201).json(userObject)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const currentUser = users.find(user => user.username === username)
  response.json(currentUser.todos).status(200)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  const currentUser = users.find(user => user.username === username);

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline, 
    created_at: new Date(),
  }

  currentUser.todos.push(todo);

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers
  const { title, deadline } = request.body

  const currentUser = users.find(user => user.username === username);

  const currentTodo = currentUser.todos.find(todo => todo.id === id);

  if(!currentTodo) {
    return response.status(404).json({ error: "Not Found"})
  }

  currentTodo.title = title
  currentTodo.deadline = deadline

  response.json(currentTodo).status(200)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers

  const currentUser = users.find(user => user.username === username);

  const currentTodo = currentUser.todos.find(todo => todo.id === id);

  if(!currentTodo) {
    return response.status(404).json({ error: "Not Found"})
  }

  currentTodo.done = true

  response.json(currentTodo).status(200)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers

  const currentUser = users.find(user => user.username === username);

  const filteredTodos = currentUser.todos.filter(todo => todo.id !== id);
  const currentTodo = currentUser.todos.find(todo => todo.id === id);

  if(!currentTodo) {
    return response.status(404).json({ error: "Not Found"})
  }
  
  currentUser.todos = filteredTodos

  response.status(204).json({ message: "No Content"})
});

module.exports = app;