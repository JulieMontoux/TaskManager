import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import './index.css';

function App() {
    return (
        <Router>
            <div className="container mx-auto p-4">
                <nav className="mb-4">
                    <Link to="/" className="mr-4 text-blue-500">Home</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<ProjectList />} />
                    <Route path="/projects/:projectId" element={<TaskList />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
