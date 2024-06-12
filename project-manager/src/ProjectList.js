import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectEndDate, setNewProjectEndDate] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  const addProject = () => {
    if (newProjectName.trim() === '' || newProjectEndDate.trim() === '') return;

    fetch('http://localhost:5001/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newProjectName, end_date: newProjectEndDate }),
    })
    .then(response => response.json())
    .then(data => {
      setProjects([...projects, { id: data.id, name: newProjectName, end_date: newProjectEndDate }]);
      setNewProjectName('');
      setNewProjectEndDate('');
    })
    .catch(error => console.error('Error adding project:', error));
  };

  const deleteProject = (projectId) => {
    fetch(`http://localhost:5001/projects/${projectId}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        setProjects(projects.filter(project => project.id !== projectId));
      }
    })
    .catch(error => console.error('Error deleting project:', error));
  };

  const getProjectColor = (endDate) => {
    const currentDate = new Date();
    const end = new Date(endDate);
    const timeDiff = end.getTime() - currentDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff <= 3) {
      return 'list-group-item-danger';
    } else if (daysDiff <= 7) {
      return 'list-group-item-warning';
    } else {
      return 'list-group-item-success';
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ul className="list-group mb-4">
        {projects.map(project => (
          <li key={project.id} className={`list-group-item d-flex justify-content-between align-items-center ${getProjectColor(project.end_date)}`}>
            <Link to={`/projects/${project.id}`} className="text-dark">{project.name} - {project.end_date}</Link>
            <button 
              className="btn btn-danger"
              onClick={() => deleteProject(project.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        className="form-control mb-2"
        value={newProjectName}
        onChange={e => setNewProjectName(e.target.value)}
        placeholder="New Project Name"
      />
      <input
        type="date"
        className="form-control mb-2"
        value={newProjectEndDate}
        onChange={e => setNewProjectEndDate(e.target.value)}
      />
      <button 
        className="btn btn-primary w-100"
        onClick={addProject}
      >
        Add Project
      </button>
    </div>
  );
}

export default ProjectList;
