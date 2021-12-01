import express from 'express';

const app = express()
const port = 8000

const todos = [
  {
    id: '1cea0bfe-4e2a-4038-b3fc-a5d3a83f1fefb',
    title: 'Coding',
    created: '2021-10-14T17:10:20Z',
    ended: null,
    description: 'Fancy program!',
    status: 'ACTIVE',
  },
  {
    id: 'ce4ab3c5-d1bb-4289-8710-e11e5d291b5e',
    title: 'Read book',
    created: '2021-10-13T17:10:20Z',
    ended: '2021-10-13T17:10:20Z',
    description: 'Fancy program!',
    status: 'DONE',
  },
  {
    id: 'ce4ab3c5-d1bb-4289-8750-e11e5d291b5z',
    title: 'Training',
    created: '2021-10-12T17:10:20Z',
    ended: '2021-10-13T17:10:20Z',
    description: 'Fancy program!',
    status: 'DONE',
  },
  {
    id: 'ce4ab3c5-d1bb-4289-8750-e11e5d291b5y',
    title: 'RUN',
    created: '2021-10-10T17:10:20Z',
    ended: null,
    description: 'Fancy program!',
    status: 'ACTIVE',
  },
  {
    id: 'ce4ab3c5-d1bb-4289-8750-e11e5d291b5a',
    title: 'train',
    created: '2021-10-09T17:10:20Z',
    ended: null,
    description: 'Fancy program!',
    status: 'ACTIVE',
  }
  ,
  {
    id: 'ce4ab3c5-d1bb-4289-8750-e11e5d291b5e',
    title: 'eat',
    created: '2021-10-07T17:10:20Z',
    ended: '2021-10-07T17:10:20Z',
    description: 'Fancy program!',
    status: 'DONE',
  }
  ,
  {
    id: 'ce4ab3c5-d1bb-4289-8750-e11e5d291b5t',
    title: 'sleep',
    created: '2021-10-05T17:10:20Z',
    ended: null,
    description: 'Fancy program!',
    status: 'ACTIVE',
  }
];
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const middleware = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new Error('missing title or description'));A
  }

  return next();
}
app.get('/', (_, res)=> {
  console.log('Got request')
  res.send('ok')
})

app.get('/todos', (req, res) => {
  const  page = req.params.page ?? 1;
  const  limit = req.params.limit ?? 2;
  const  status = req.params.status ?? 'DONE';

  const start = page * limit;
  const end = start + limit;
  const total = todos.filter(({ status: s }) => !status || s === status)
  const data = todos
    .filter(({ status: s }) => !status || s === status)
    .slice(start, end);

  return res
    .status(200)
    .json({ page, limit, total: total.length, data });
})

app.post('/todos', [middleware], (req, res) => {
  const { title, description } = req.body;
  // Mysql query

  res.json(todolist);
})

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(404).send(error.message)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

