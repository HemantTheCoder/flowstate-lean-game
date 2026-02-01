import { useState } from "react";
import { GameState, UpdateGameRequest } from "@shared/schema";
import { motion } from "framer-motion";
import { Plus, GripVertical, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  kanbanState: NonNullable<GameState["kanbanState"]>;
  onUpdate: (newState: NonNullable<GameState["kanbanState"]>) => void;
}

export function KanbanBoard({ kanbanState, onUpdate }: KanbanBoardProps) {
  const { toast } = useToast();
  
  // Simple DND simulation (in a real app, use dnd-kit or react-beautiful-dnd)
  // Since we don't have those packages installed, we'll build a simple click-to-move for MVP
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleTaskClick = (taskId: string, currentColumnId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      return;
    }
    setSelectedTaskId(taskId);
  };

  const handleColumnClick = (targetColumnId: string) => {
    if (!selectedTaskId) return;

    // Find source column
    const sourceColumn = kanbanState.columns.find(c => c.taskIds.includes(selectedTaskId));
    if (!sourceColumn) return;

    // Don't move if same column
    if (sourceColumn.id === targetColumnId) {
      setSelectedTaskId(null);
      return;
    }

    // Check WIP limits
    const targetColumn = kanbanState.columns.find(c => c.id === targetColumnId);
    if (targetColumn && targetColumn.taskIds.length >= targetColumn.wipLimit) {
      toast({
        title: "WIP Limit Reached!",
        description: `Cannot move card. ${targetColumn.title} is full.`,
        variant: "destructive"
      });
      return;
    }

    // Perform move
    const newColumns = kanbanState.columns.map(col => {
      if (col.id === sourceColumn.id) {
        return { ...col, taskIds: col.taskIds.filter(id => id !== selectedTaskId) };
      }
      if (col.id === targetColumnId) {
        return { ...col, taskIds: [...col.taskIds, selectedTaskId] };
      }
      return col;
    });

    onUpdate({ ...kanbanState, columns: newColumns });
    setSelectedTaskId(null);
    toast({
      title: "Task Moved",
      description: `Moved to ${targetColumn?.title}`,
    });
  };

  return (
    <div className="w-full h-full overflow-x-auto p-4 md:p-8">
      <div className="flex gap-6 h-full min-w-max">
        {kanbanState.columns.map((column) => {
          const isOverLimit = column.taskIds.length > column.wipLimit;
          const isFull = column.taskIds.length >= column.wipLimit;

          return (
            <motion.div 
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                w-72 flex flex-col rounded-3xl backdrop-blur-md border-2 transition-colors cursor-pointer
                ${selectedTaskId ? 'ring-2 ring-primary/20 hover:ring-primary' : ''}
                ${isOverLimit ? 'bg-red-50/80 border-red-200' : 'bg-white/60 border-white/40'}
              `}
              onClick={() => handleColumnClick(column.id)}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-display font-bold text-lg text-gray-700">{column.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOverLimit ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {column.taskIds.length} / {column.wipLimit}
                </span>
              </div>

              {/* Tasks Area */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
                {column.taskIds.map((taskId) => {
                  const task = kanbanState.tasks[taskId];
                  if (!task) return null;
                  
                  const isSelected = selectedTaskId === taskId;

                  return (
                    <motion.div
                      key={taskId}
                      layoutId={taskId}
                      onClick={(e) => { e.stopPropagation(); handleTaskClick(taskId, column.id); }}
                      className={`
                        p-4 rounded-xl shadow-sm border cursor-pointer group relative overflow-hidden
                        ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white border-white/50 hover:border-primary/50'}
                      `}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{task.type}</span>
                        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{task.title}</p>
                      
                      {/* Difficulty Dots */}
                      <div className="mt-3 flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${i < task.difficulty ? 'bg-primary' : 'bg-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
                
                {selectedTaskId && !isFull && (
                   <div className="h-24 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center text-primary/50 font-bold text-sm">
                     Move Here
                   </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
