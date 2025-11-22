# WorkTask Planner

A comprehensive task management application designed for organizing and planning work-related tasks, especially those from Jira tickets. Features include interactive calendar views, drag-and-drop checklists, task dependencies, and a beautiful dark/light theme toggle.

## Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- ✅ **Calendar Integration**: Visual calendar with FullCalendar.js for date-based task management
- ✅ **Interactive Checklists**: Drag-and-drop checklist items with stages (development, testing, merge, deployment)
- ✅ **Git Branch Linking**: Link Git branches to checklist items
- ✅ **Task Dependencies**: Link related tasks and visualize dependencies
- ✅ **Priority & Status**: Color-coded priorities (low, medium, high, urgent) and statuses (todo, in_progress, done, blocked)
- ✅ **Jira Integration**: Import tasks from Jira (mock implementation ready for real integration)
- ✅ **Search & Filter**: Search tasks by title, description, or Jira ID; filter by status, priority, and date range
- ✅ **Dashboard**: Overview with statistics, progress tracking, and recent tasks
- ✅ **Dark/Light Theme**: Beautiful theme toggle with smooth transitions
- ✅ **Responsive Design**: Works on desktop and mobile devices

### Visual Features
- Smooth animations and transitions
- Progress indicators for tasks and checklists
- Color-coded priorities and statuses
- Overdue task highlighting
- Visual progress bars
- Modern, clean UI design

## Technology Stack

### Backend
- **Python 3.8+**
- **Flask**: Lightweight web framework
- **Flask-SQLAlchemy**: ORM for database operations
- **SQLite**: Database (can be easily switched to PostgreSQL)
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library
- **React Router**: Client-side routing
- **Vite**: Build tool and dev server
- **FullCalendar.js**: Calendar component
- **react-beautiful-dnd**: Drag-and-drop functionality
- **Axios**: HTTP client
- **date-fns**: Date manipulation
- **lucide-react**: Icon library

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** to `http://localhost:3000`
3. **Create tasks** by clicking "New Task" button
4. **Assign dates** to tasks for calendar view
5. **Add checklist items** to track workflow stages
6. **Link Git branches** to checklist items
7. **Set priorities and statuses** for better organization
8. **Use the calendar view** to see tasks visually
9. **Toggle theme** using the moon/sun icon in the navbar
10. **Search and filter** tasks using the search bar and filters

## Project Structure

```
WorkTask Planner/
├── backend/
│   ├── app.py              # Flask application and API routes
│   ├── requirements.txt    # Python dependencies
│   └── worktask.db         # SQLite database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Theme)
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
└── README.md
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Checklist
- `POST /api/tasks/:id/checklist` - Add checklist item
- `PUT /api/checklist/:id` - Update checklist item
- `DELETE /api/checklist/:id` - Delete checklist item

### Dependencies
- `POST /api/tasks/:id/dependencies` - Add dependency
- `DELETE /api/dependencies/:id` - Remove dependency

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Jira
- `POST /api/jira/import` - Import task from Jira

## Customization

### Adding Real Jira Integration

To integrate with a real Jira instance, modify the `import_jira_ticket` function in `backend/app.py`:

```python
@app.route('/api/jira/import', methods=['POST'])
def import_jira_ticket():
    # Replace with actual Jira API calls
    # Example using jira library:
    # from jira import JIRA
    # jira = JIRA(server='https://your-jira-instance.atlassian.net', basic_auth=('user', 'api_token'))
    # issue = jira.issue(data.get('jira_id'))
    # ...
```

### Switching to PostgreSQL

Update `backend/app.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/worktask'
```

### Customizing Themes

Edit CSS variables in `frontend/src/index.css` under the `body.light` and `body.dark` sections.

## Future Enhancements

- [ ] Real Jira API integration
- [ ] Git repository integration
- [ ] File attachments
- [ ] Email notifications
- [ ] Export to PDF/CSV
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

