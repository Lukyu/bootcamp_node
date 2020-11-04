//REQUIRES
const express           = require("express");
const cors              = require("cors");
const { v4: uuid }      = require('uuid');
// const { uuid, isUuid }  = require("uuidv4");

//APP
const app = express();

//APP USES
app.use(express.json());
app.use(cors());
app.use(logRegister);

//LOG REGISTER FUNCTIONS MIDDLEWARE
function logRegister(request, respose, next) {
  //Get utilized method e requested url
  const { method, url } = request;
  //Build string with request infos
  const requestInfo = `[${method.toUpperCase()}] ${url}`;

  //Execute next action and register execution time
  console.time(requestInfo);
    next();
  console.timeEnd(requestInfo);
}

//Repositories :)
const repositories = [];

//[GET] [LIST] Repositories
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

//[POST] [INSERT] Repository
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  //New repository object
  const newRepository = {
    "id": uuid(),
    title,
    url,
    "likes": 0,
    techs
  };

  repositories.push(newRepository);

  return response.json(newRepository);
});

//[PUT] [EDIT] Repositories
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex === -1)
    return response.status(400).json();

  repositories[repositoryIndex].title = title;
  repositories[repositoryIndex].url = url;
  repositories[repositoryIndex].techs = techs;

  return response.json(repositories[repositoryIndex]);
});

//[DELETE] Repository
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0)
    return response.status(400).json();

  repositories.splice(repositoryIndex, 1);

  return response.status(204).json();
});

//[POST] [LIKE] Repository
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0)
    return response.status(400).json();
    
  repositories[repositoryIndex].likes += 1;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
