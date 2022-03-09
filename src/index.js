const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  if(!user){
    return response.status(404).json({error:"User not found!"})
  }

  request.user = user
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const checkNameExists = users.some(user => user.name === name);
  if(checkNameExists){return response.status(400).json({error:"Usuário já existe"})}
  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
  users.push(user);
  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user}  = request;
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  const {title, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(todo);
  return response.json(users.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoExists = user.todos.find((todos) => todos.title === id)
  
  if(todoExists){
    const {title, deadline} = request.body;
    todoExists.title=title;
    todoExists.deadline = new Date(deadline)
    return response.status(201).send();
  }else{
    return response.status(404).json({error: "Essa tarefa não existe!"})
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoExists = user.todos.find((todos) => todos.title === id)
  if(todoExists){
    todoExists.done=true;
    return response.status(201).send();
  }else{
    return response.status(404).json({error: "Essa tarefa não existe!"})
  }
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoExists = user.todos.filter((todos) => todos.title !== id)
  if(todoExists){
    console.log(todoExists);
    return response.status(204).send();
  }else{
    return response.status(404).json({error: "Essa tarefa não existe!"})
  }
});

module.exports = app;