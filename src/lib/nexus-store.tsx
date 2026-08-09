import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialTasks, notifications as seedNotifications, type Notification, type Status, type Task } from "./nexus-data";

type Ctx = {
  tasks: Task[];
  setTaskStatus: (id: string, status: Status) => void;
  toggleTaskDone: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTask: (task: Partial<Task> & { title: string }) => void;
  notifications: Notification[];
  markAllRead: () => void;
  toggleRead: (id: string) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
};

const NexusContext = createContext<Ctx | null>(null);

export function NexusProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const setTaskStatus = useCallback((id: string, status: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const toggleTaskDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "in-progress" : "done" } : t)),
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) }
          : t,
      ),
    );
  }, []);

  const addTask = useCallback((task: Partial<Task> & { title: string }) => {
    setTasks((prev) => [
      {
        id: "t" + Math.random().toString(36).slice(2, 8),
        description: "Created from the NexusFlow workspace.",
        projectId: "p3",
        status: "todo",
        priority: "medium",
        assigneeId: "u1",
        due: "Jun 01",
        comments: 0,
        attachments: 0,
        subtasks: [],
        tags: [],
        ...task,
      } as Task,
      ...prev,
    ]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      setTaskStatus,
      toggleTaskDone,
      toggleSubtask,
      addTask,
      notifications,
      markAllRead,
      toggleRead,
      paletteOpen,
      setPaletteOpen,
    }),
    [tasks, notifications, paletteOpen, setTaskStatus, toggleTaskDone, toggleSubtask, addTask, markAllRead, toggleRead],
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside NexusProvider");
  return ctx;
}
