//REQUIRES
const express           = require("express");
const cors              = require("cors");
const { v4, validate }  = require("uuid");

//APP
const app = express();

//APP USES
app.use(express.json());
app.use(cors());
app.use(logRegister);
app.use("/repositories/:id", validadeInvalidID);

//LOG REGISTER FUNCTIONS MIDDLEWARE
function logRegister(request, respose, next) {
  //Get utilized method e requested url
  const { method, url } = request;
  //Build string with request infos
  const requestInfo = `[${method.toUpperCase()}] ${url}`;

  //Perform the next action and record the execution time
  console.time(requestInfo);
    next();
  console.timeEnd(requestInfo);
}

function validadeInvalidID(request, response, next) {
  const { id } = request.params;

  if(!validate(id))
    return response.status(400).json({error: true, message: "Invalid repository ID."});
  
  next();
} 

//Repositories :)
const repositories = [];

//[GET] [LIST] Repositories
app.get("/repositories", (request, response) => {
  const { title, id } = request.query;

  //if uuid was sent we will validate it
  if(id && !validate(id))
    return response.status(400).json({error: true, message: "Invalid repository ID."});

  //and now let's search for repositories filtering by id OR title
  const results = id 
    ? repositories.filter(repository => repository.id == id) 
    : (title) 
      ? repositories.filter(repository => repository.title.includes(title)) 
      : repositories;
  
  return response.status(200).json(results);
});

//[POST] [INSERT] Repository
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  //New repository object
  const newRepository = {
    "id": v4(),
    title,
    url,
    "likes": 0,
    techs
  };

  //Validates if the url is in use
  if(repositories.findIndex(repository => repository.url == url) > -1)
    return response.status(400).json({error: true, message: "The requested url is already in use"});

  repositories.push(newRepository);

  return response.status(200).json(newRepository);
});

//[PUT] [EDIT] Repositories
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  //Validates if the url is in use
  if(repositories.findIndex(repository => repository.url == url) > -1)
    return response.status(400).json({error: true, message: "The requested url is already in use"});

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  const editRepository = {
    id,
    title,
    url,
    "likes": repositories[repositoryIndex].likes,
    techs
  };
  
  //Validates if the repository index was found
  if(repositoryIndex < 0)
    return response.status(400).json({error: true, message: "The reported repository was not found"});

  repositories[repositoryIndex] = editRepository;

  return response.status(200).json(editRepository);
});

//[DELETE] Repository
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  //Validates if the repository index was found
  if(repositoryIndex < 0)
    return response.status(400).json({error: true, message: "The reported repository was not found"});

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

//[POST] [LIKE] Repository
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  //Validates if the repository index was found
  if(repositoryIndex < 0)
    return response.status(400).json({error: true, message: "The reported repository was not found"});

  repositories[repositoryIndex].likes++;

  return response.status(200).send(repositories[repositoryIndex]);
});

module.exports = app;
