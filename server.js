const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://newuser:HvMwNqohAPY692xj@cluster0.36iusci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Task schema
const taskSchema = new mongoose.Schema({
  title: String,
  date: Date,
  priority: String,
  completed: Boolean
});

const Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.json());

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new task
app.post('/tasks', async (req, res) => {
  const { title, date, priority, completed } = req.body;

  // Parse date string into a Date object
  const parsedDate = date ? new Date(date) : null;

  const task = new Task({
    title,
    date: parsedDate,
    priority,
    completed: completed || false // If completed is provided, use its value; otherwise, default to false
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (task) {
      // Update title and completed as before
      if (req.body.title) task.title = req.body.title;
      if (req.body.completed !== undefined) task.completed = req.body.completed;

      // Update date and priority if provided in the request body
      if (req.body.date) task.date = new Date(req.body.date);
      if (req.body.priority) task.priority = req.body.priority;

      await task.save();
      console.log('Task updated successfully:', task);
      res.json(task);
    } else {
      console.log('Task not found');
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: err.message });
  }
});


// DELETE a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
