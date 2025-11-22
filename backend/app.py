from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from dateutil import parser
import os

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "worktask.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)
    assigned_date = db.Column(db.Date)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='todo')  # todo, in_progress, done, blocked
    jira_id = db.Column(db.String(100))
    jira_url = db.Column(db.String(500))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    checklist_items = db.relationship('ChecklistItem', backref='task', lazy=True, cascade='all, delete-orphan')
    dependencies = db.relationship('TaskDependency', foreign_keys='TaskDependency.task_id', backref='task', lazy=True, cascade='all, delete-orphan')
    dependents = db.relationship('TaskDependency', foreign_keys='TaskDependency.depends_on_id', backref='depends_on_task', lazy=True)

class ChecklistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    stage = db.Column(db.String(50))  # development, testing, merge, deployment, etc.
    git_branch = db.Column(db.String(200))
    completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TaskDependency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    depends_on_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)

# Initialize database
with app.app_context():
    db.create_all()

# API Routes

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks with optional filters"""
    status = request.args.get('status')
    priority = request.args.get('priority')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    search = request.args.get('search')
    
    query = Task.query
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if date_from:
        query = query.filter(Task.assigned_date >= parser.parse(date_from).date())
    if date_to:
        query = query.filter(Task.assigned_date <= parser.parse(date_to).date())
    if search:
        query = query.filter(
            db.or_(
                Task.title.contains(search),
                Task.description.contains(search),
                Task.jira_id.contains(search)
            )
        )
    
    tasks = query.order_by(Task.assigned_date, Task.priority).all()
    
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'assigned_date': t.assigned_date.isoformat() if t.assigned_date else None,
        'priority': t.priority,
        'status': t.status,
        'jira_id': t.jira_id,
        'jira_url': t.jira_url,
        'notes': t.notes,
        'created_at': t.created_at.isoformat(),
        'updated_at': t.updated_at.isoformat(),
        'checklist_count': len(t.checklist_items),
        'completed_checklist_count': len([c for c in t.checklist_items if c.completed])
    } for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.json
    
    task = Task(
        title=data.get('title'),
        description=data.get('description'),
        due_date=parser.parse(data['due_date']).date() if data.get('due_date') else None,
        assigned_date=parser.parse(data['assigned_date']).date() if data.get('assigned_date') else None,
        priority=data.get('priority', 'medium'),
        status=data.get('status', 'todo'),
        jira_id=data.get('jira_id'),
        jira_url=data.get('jira_url'),
        notes=data.get('notes')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'assigned_date': task.assigned_date.isoformat() if task.assigned_date else None,
        'priority': task.priority,
        'status': task.status,
        'jira_id': task.jira_id,
        'jira_url': task.jira_url,
        'notes': task.notes,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat()
    }), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a single task with checklist and dependencies"""
    task = Task.query.get_or_404(task_id)
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'assigned_date': task.assigned_date.isoformat() if task.assigned_date else None,
        'priority': task.priority,
        'status': task.status,
        'jira_id': task.jira_id,
        'jira_url': task.jira_url,
        'notes': task.notes,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
        'checklist_items': [{
            'id': c.id,
            'title': c.title,
            'stage': c.stage,
            'git_branch': c.git_branch,
            'completed': c.completed,
            'order': c.order
        } for c in sorted(task.checklist_items, key=lambda x: x.order)],
        'dependencies': [{
            'id': d.depends_on_id,
            'title': d.depends_on_task.title,
            'status': d.depends_on_task.status
        } for d in task.dependencies]
    })

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.due_date = parser.parse(data['due_date']).date() if data.get('due_date') else None
    task.assigned_date = parser.parse(data['assigned_date']).date() if data.get('assigned_date') else None
    task.priority = data.get('priority', task.priority)
    task.status = data.get('status', task.status)
    task.jira_id = data.get('jira_id', task.jira_id)
    task.jira_url = data.get('jira_url', task.jira_url)
    task.notes = data.get('notes', task.notes)
    task.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'assigned_date': task.assigned_date.isoformat() if task.assigned_date else None,
        'priority': task.priority,
        'status': task.status,
        'jira_id': task.jira_id,
        'jira_url': task.jira_url,
        'notes': task.notes,
        'updated_at': task.updated_at.isoformat()
    })

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

@app.route('/api/tasks/<int:task_id>/checklist', methods=['POST'])
def add_checklist_item(task_id):
    """Add a checklist item to a task"""
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    # Get max order
    max_order = db.session.query(db.func.max(ChecklistItem.order)).filter_by(task_id=task_id).scalar() or 0
    
    item = ChecklistItem(
        task_id=task_id,
        title=data.get('title'),
        stage=data.get('stage'),
        git_branch=data.get('git_branch'),
        completed=data.get('completed', False),
        order=max_order + 1
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'id': item.id,
        'title': item.title,
        'stage': item.stage,
        'git_branch': item.git_branch,
        'completed': item.completed,
        'order': item.order
    }), 201

@app.route('/api/checklist/<int:item_id>', methods=['PUT'])
def update_checklist_item(item_id):
    """Update a checklist item"""
    item = ChecklistItem.query.get_or_404(item_id)
    data = request.json
    
    item.title = data.get('title', item.title)
    item.stage = data.get('stage', item.stage)
    item.git_branch = data.get('git_branch', item.git_branch)
    item.completed = data.get('completed', item.completed)
    item.order = data.get('order', item.order)
    
    db.session.commit()
    
    return jsonify({
        'id': item.id,
        'title': item.title,
        'stage': item.stage,
        'git_branch': item.git_branch,
        'completed': item.completed,
        'order': item.order
    })

@app.route('/api/checklist/<int:item_id>', methods=['DELETE'])
def delete_checklist_item(item_id):
    """Delete a checklist item"""
    item = ChecklistItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

@app.route('/api/tasks/<int:task_id>/dependencies', methods=['POST'])
def add_dependency(task_id):
    """Add a dependency to a task"""
    data = request.json
    depends_on_id = data.get('depends_on_id')
    
    if depends_on_id == task_id:
        return jsonify({'error': 'Task cannot depend on itself'}), 400
    
    # Check if dependency already exists
    existing = TaskDependency.query.filter_by(task_id=task_id, depends_on_id=depends_on_id).first()
    if existing:
        return jsonify({'error': 'Dependency already exists'}), 400
    
    dependency = TaskDependency(task_id=task_id, depends_on_id=depends_on_id)
    db.session.add(dependency)
    db.session.commit()
    
    return jsonify({
        'id': dependency.id,
        'task_id': dependency.task_id,
        'depends_on_id': dependency.depends_on_id
    }), 201

@app.route('/api/dependencies/<int:dependency_id>', methods=['DELETE'])
def delete_dependency(dependency_id):
    """Delete a dependency"""
    dependency = TaskDependency.query.get_or_404(dependency_id)
    db.session.delete(dependency)
    db.session.commit()
    return '', 204

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    total_tasks = Task.query.count()
    todo_tasks = Task.query.filter_by(status='todo').count()
    in_progress_tasks = Task.query.filter_by(status='in_progress').count()
    done_tasks = Task.query.filter_by(status='done').count()
    
    today = date.today()
    overdue_tasks = Task.query.filter(
        Task.due_date < today,
        Task.status != 'done'
    ).count()
    
    upcoming_tasks = Task.query.filter(
        Task.assigned_date >= today,
        Task.assigned_date <= date.fromordinal(today.toordinal() + 7)
    ).count()
    
    total_checklist_items = ChecklistItem.query.count()
    completed_checklist_items = ChecklistItem.query.filter_by(completed=True).count()
    
    return jsonify({
        'total_tasks': total_tasks,
        'todo_tasks': todo_tasks,
        'in_progress_tasks': in_progress_tasks,
        'done_tasks': done_tasks,
        'overdue_tasks': overdue_tasks,
        'upcoming_tasks': upcoming_tasks,
        'total_checklist_items': total_checklist_items,
        'completed_checklist_items': completed_checklist_items,
        'checklist_completion_rate': (completed_checklist_items / total_checklist_items * 100) if total_checklist_items > 0 else 0
    })

@app.route('/api/jira/import', methods=['POST'])
def import_jira_ticket():
    """Import a task from Jira (mock implementation)"""
    data = request.json
    
    task = Task(
        title=data.get('title', f"Jira: {data.get('jira_id', 'Unknown')}"),
        description=data.get('description', ''),
        jira_id=data.get('jira_id'),
        jira_url=data.get('jira_url'),
        priority=data.get('priority', 'medium'),
        status='todo',
        assigned_date=parser.parse(data['assigned_date']).date() if data.get('assigned_date') else date.today(),
        due_date=parser.parse(data['due_date']).date() if data.get('due_date') else None
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'jira_id': task.jira_id,
        'jira_url': task.jira_url
    }), 201

if __name__ == '__main__':
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", debug=True, port=port)

