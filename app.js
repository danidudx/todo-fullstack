document.addEventListener('DOMContentLoaded', () => {
  const addTaskBtn = document.getElementById('addTaskBtn');
  addTaskBtn.addEventListener('click', addTask);

  // Fetch tasks and render them
  fetchTasks();
});

// Function to fetch tasks and render them
function fetchTasks() {
  fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(tasks => {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = ''; // Clear existing task list
      tasks.forEach(task => {
        renderTask(task);
      });
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

// Function to add a new task
function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateinput');
  const priorityInput = document.getElementById('priority');
  const task = {
    title: taskInput.value,
    date: dateInput.value,
    priority: priorityInput.value,
    completed: false
  }; // Set completed status to false
  fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
  .then(response => response.json())
  .then(newTask => {
    renderTask(newTask);
    taskInput.value = '';
    dateInput.value = '';
  })
  .catch(error => console.error('Error adding task:', error));
}

function renderTask(task) {
  const taskList = document.getElementById('taskList');
  const taskItem = document.createElement('li');
  taskItem.textContent = task.title;
  taskItem.dataset.taskId = task._id; // Use _id property from the database
  if (task.completed) {
    taskItem.classList.add('completed');
  }
  taskItem.addEventListener('click', () => {
    toggleTaskCompletion(task._id, !task.completed); // Toggle completion status
  });
  taskList.appendChild(taskItem);

  // Add delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event bubbling to the task item
    deleteTask(task._id);
  });
  taskItem.appendChild(deleteButton);

  // Add edit button
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event bubbling to the task item
    openEditForm(task);
  });
  taskItem.appendChild(editButton);
}

function openEditForm(task) {
  //form for editing task details
  const form = document.createElement('form');
form.innerHTML = `
  <label for="editTitle">Title:</label>
  <input type="text" id="editTitle" value="${task.title}">
  <label for="editDate">Date:</label>
  <input type="date" id="editDate" value="${task.date}">  <label for="editPriority">Priority:</label>
  <select id="editPriority">
    <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
    <option value="Mid" ${task.priority === 'Mid' ? 'selected' : ''}>Mid</option>
    <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
  </select>
  <button type="submit">Save</button>
`;

  // Prevent form collapse when clicking on form fields
  form.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });

  // Submit form handler
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const editedTask = {
      title: form.querySelector('#editTitle').value,
      date: form.querySelector('#editDate').value,
      priority: form.querySelector('#editPriority').value,
      completed: task.completed
    };
    editTask(task._id, editedTask);
  });

  // Append form to the task item
  const taskItem = document.querySelector(`[data-task-id="${task._id}"]`);
  taskItem.innerHTML = ''; // Clear existing content
  taskItem.appendChild(form);
}


// Function to toggle task completion status
function toggleTaskCompletion(taskId, completed) {
  fetch(`http://localhost:3000/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed }) // Send updated completion status
  })
  .then(() => {
    fetchTasks(); // Fetch updated tasks after toggling completion
  })
  .catch(error => console.error('Error updating task completion status:', error));
}

// Function to delete a task
function deleteTask(taskId) {
  fetch(`http://localhost:3000/tasks/${taskId}`, {
    method: 'DELETE'
  })
  .then(() => {
    fetchTasks(); // Fetch updated tasks after deletion
  })
  .catch(error => console.error('Error deleting task:', error));
}

// Function to edit a task
function editTask(taskId, updatedFields) {
  // Fetch the current task to merge with updatedFields
  fetch(`http://localhost:3000/tasks/${taskId}`)
    .then(response => response.json())
    .then(task => {
      // Merge updatedFields with the existing task object
      const editedTask = { ...task, ...updatedFields };

      // Send the edited task to the server
      fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedTask)
      })
      .then(response => response.json())
      .then(updatedTask => {
        fetchTasks(); // Fetch updated tasks after editing
      })
      .catch(error => console.error('Error editing task:', error));
    })
    .catch(error => console.error('Error fetching task for editing:', error));
}






