import { useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DemoTaskItemProps {
  task: { id: string; text: string };
}

function DemoTaskItem({ task }: DemoTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const clampedTransform = transform ? { ...transform, x: 0 } : transform

const style = {
  transform: CSS.Transform.toString(clampedTransform),
  transition: isDragging ? 'none' : undefined,
  opacity: 1,
}

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="demo-task"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} />
      <span>{task.text}</span>
    </div>
  )
}

export default function OnboardingDragDemo() {
  const [demoTasks, setDemoTasks] = useState([
    { id: 'demo-1', text: 'Tarefa 1 - Arraste-me!' },
    { id: 'demo-2', text: 'Tarefa 2 - Eu também!' },
    { id: 'demo-3', text: 'Tarefa 3 - Organize!' }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    setDemoTasks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={demoTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="intro-demo-box">
          {demoTasks.map((task) => (
            <DemoTaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}