"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, CheckCircle2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const addTask = async () => {
    if (!title || !description || !dueDate) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post("/api/tasks", {
        title,
        description,
        dueDate,
      });
      setTasks((prevTasks) => [...prevTasks, res.data]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditClick = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setCurrentTask(task);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setCurrentTask("");
    setIsEditing(false);
  };

  const editTask = async () => {
    if (!title || !description || !dueDate) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.put("/api/tasks", {
        id: currentTask._id,
        title,
        description,
        dueDate,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === currentTask._id ? res.data : task
        )
      );
      resetForm();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setIsEditing(false);
    setCurrentTask(null);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      const sortedTasks = res.data.sort((a, b) => {
        if (a.completed === b.completed) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return a.completed ? 1 : -1;
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await axios.put("/api/tasks", { id, completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete("/api/tasks", { data: { id } });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Task Manager</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {/* ADD-TASK */}
        <div className="bg-gray-200 rounded-lg p-5 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit task" : "Create a Task"}</CardTitle>
            </CardHeader>

            <form action={isEditing ? editTask : addTask} className="space-y-4">
              <CardContent className="space-y-4">
                {/* Task Title */}
                <Input
                  name="title"
                  placeholder="Task Title"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                {/* Task Description */}
                <Textarea
                  name="description"
                  placeholder="Task Description"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Due Date */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="dueDate">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700 text-white">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <input type="hidden" name="dueDate" value={dueDate} />
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <div
                  className={`${isEditing ? "flex gap-2 w-full" : "w-full"}`}
                >
                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-zinc-200"
                  >
                    {isEditing ? "Edit" : "Add Task"}
                  </Button>
                  {isEditing && (
                    <Button onClick={cancelEdit}>Cancel Edit</Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* TASK-LIST */}
        <div className="space-y-4 p-5 bg-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          <div className="overflow-y-scroll max-h-[70vh] space-y-5">
            {tasks.map((task) => (
              <>
                <Card key={task.id} className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className={`text-lg text-white`}>
                      <span className="flex gap-2 justify-center items-center">
                        {task.title}
                        {task.completed && (
                          <CheckCircle2Icon
                            className="text-green-500"
                            size={18}
                          />
                        )}
                      </span>
                    </CardTitle>
                    <span className="text-sm text-zinc-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300">{task.description}</p>
                  </CardContent>
                  <Separator className="my-2 bg-zinc-800" />
                  <CardFooter className="justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-zinc-700 hover:bg-green-700 ${
                        task.completed
                          ? "bg-gray-300 hover:bg-gray-500"
                          : "bg-green-500 hover:bg-green-700"
                      }`}
                      onClick={() => toggleComplete(task._id, task.completed)}
                    >
                      {task.completed ? "Undo" : "Mark Complete"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`bg-yellow-300 border-zinc-700 hover:bg-yellow-500 ${
                        task.completed && "bg-gray-300 hover:bg-gray-500"
                      }`}
                      disabled={task.completed}
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
