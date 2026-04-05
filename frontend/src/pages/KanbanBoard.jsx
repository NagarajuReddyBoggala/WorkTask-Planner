import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { taskService } from '../services/api'
import TaskCard from '../components/TaskCard'
import './KanbanBoard.css'

const columnsConfig = {
  todo: { title: 'To Do', id: 'todo' },
  in_progress: { title: 'In Progress', id: 'in_progress' },
  done: { title: 'Completed', id: 'done' },
  blocked: { title: 'Blocked', id: 'blocked' }
}

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    blocked: [],
    done: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll()
      // Group tasks by status
      const grouped = {
        todo: [],
        in_progress: [],
        blocked: [],
        done: []
      }
      
      response.data.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task)
        } else {
          // fallback for unknown states
          grouped.todo.push(task)
        }
      })
      
      setTasks(grouped)
    } catch (error) {
      console.error('Error loading tasks for board:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped exactly where it started
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceStatus = source.droppableId
    const destStatus = destination.droppableId

    // Move task locally (optimistically)
    const sourceTasks = Array.from(tasks[sourceStatus])
    const destTasks = sourceStatus === destStatus 
      ? sourceTasks 
      : Array.from(tasks[destStatus])
      
    const [movedTask] = sourceTasks.splice(source.index, 1)
    
    // Update the task's local status before inserting to the new list
    movedTask.status = destStatus
    
    destTasks.splice(destination.index, 0, movedTask)

    setTasks(prev => ({
      ...prev,
      [sourceStatus]: sourceTasks,
      [destStatus]: destTasks
    }))

    // Save to backend
    if (sourceStatus !== destStatus) {
      try {
        await taskService.update(parseInt(draggableId), { status: destStatus })
      } catch (error) {
        console.error('Failed to update task status:', error)
        // Option: Re-fetch or revert on error
        loadTasks()
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading board...</div>
  }

  return (
    <div className="board-view fade-in">
      <div className="board-header">
        <h1>Kanban Board</h1>
        <p className="subtitle">Drag and drop tasks to update their status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-container">
          {Object.entries(columnsConfig).map(([columnId, column]) => (
            <div key={columnId} className={`board-column col-${columnId}`}>
              <div className="column-header">
                <h2>{column.title}</h2>
                <span className="column-count">{tasks[columnId]?.length || 0}</span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    className={`column-content ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {tasks[columnId]?.map((task, index) => (
                      <Draggable 
                        key={task.id.toString()} 
                        draggableId={task.id.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`draggable-task ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style
                            }}
                          >
                            <TaskCard task={task} disableLink={true} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard
