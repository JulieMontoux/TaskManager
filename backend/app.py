from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///projects.db'
db = SQLAlchemy(app)
CORS(app)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(120), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    severity = db.Column(db.String(10), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    project = db.relationship('Project', back_populates='tasks')

Project.tasks = db.relationship('Task', order_by=Task.id, back_populates='project')

@app.route('/projects', methods=['GET', 'POST'])
def manage_projects():
    if request.method == 'POST':
        data = request.json
        new_project = Project(name=data['name'])
        db.session.add(new_project)
        db.session.commit()
        return jsonify(new_project.id), 201
    projects = Project.query.all()
    return jsonify([{'id': p.id, 'name': p.name} for p in projects])

@app.route('/projects/<int:project_id>/tasks', methods=['GET', 'POST'])
def manage_tasks(project_id):
    if request.method == 'POST':
        data = request.json
        new_task = Task(
            description=data['description'],
            due_date=data['due_date'],
            severity=data['severity'],
            project_id=project_id
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.id), 201
    tasks = Task.query.filter_by(project_id=project_id).all()
    return jsonify([{
        'id': t.id, 'description': t.description, 'due_date': t.due_date, 'severity': t.severity
    } for t in tasks])

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
