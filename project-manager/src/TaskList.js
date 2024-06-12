import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function TaskList() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskSeverity, setNewTaskSeverity] = useState('1');

  useEffect(() => {
    fetch(`http://localhost:5001/projects/${projectId}/tasks`)
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, [projectId]);

  const addTask = () => {
    if (newTaskDescription.trim() === '' || newTaskDueDate.trim() === '') return;

    fetch(`http://localhost:5001/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: newTaskDescription, due_date: newTaskDueDate, severity: newTaskSeverity }),
    })
    .then(response => response.json())
    .then(data => {
      setTasks([...tasks, { id: data.id, description: newTaskDescription, due_date: newTaskDueDate, severity: newTaskSeverity }]);
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskSeverity('1');
    })
    .catch(error => console.error('Error adding task:', error));
  };

  const deleteTask = (taskId) => {
    fetch(`http://localhost:5001/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    })
    .catch(error => console.error('Error deleting task:', error));
  };

  const getTaskColor = (severity) => {
    if (severity === '1') {
      return 'list-group-item-success';
    } else if (severity === '2') {
      return 'list-group-item-warning';
    } else {
      return 'list-group-item-danger';
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <ul className="list-group mb-4">
        {tasks.map(task => (
          <li key={task.id} className={`list-group-item d-flex justify-content-between align-items-center ${getTaskColor(task.severity)}`}>
            <span className="text-dark">{task.description} - {task.due_date}</span>
            <button 
              className="btn btn-danger"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        className="form-control mb-2"
        value={newTaskDescription}
        onChange={e => setNewTaskDescription(e.target.value)}
        placeholder="Nom de la nouvelle tâche"
      />
      <input
        type="date"
        className="form-control mb-2"
        value={newTaskDueDate}
        onChange={e => setNewTaskDueDate(e.target.value)}
      />
      <select
        className="form-control mb-2"
        value={newTaskSeverity}
        onChange={e => setNewTaskSeverity(e.target.value)}
      >
        <option value="1">Faible</option>
        <option value="2">Moyenne</option>
        <option value="3">Haute</option>
      </select>
      <button 
        className="btn btn-primary w-100"
        onClick={addTask}
      >
        Ajouter une tâche
      </button>
    </div>
  );
}

export default TaskList;
