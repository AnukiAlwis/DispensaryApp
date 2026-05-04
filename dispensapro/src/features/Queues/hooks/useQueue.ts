import { useState, useEffect } from "react";
import { queueService } from "../services/QueueService";
import { Queue } from "../types";

export function useQueue() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);

//   const fetchQueues = async () => {
//     setLoading(true);
//     try {
//       const data = await queueService.getAll();
//       setQueues(data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchQueueById = async (id: string) => {
//     setLoading(true);
//     try {
//       const data = await queueService.getById(id);
//       setSelectedQueue(data);
//       return data;
//     } finally {
//       setLoading(false);
//     }
//   };

  const addQueue = async (data: {
    patientId: string;
    doctorId: string;
    remarks?: string;
  }) => {
    try {
      setLoading(true);
      const newQueue = await queueService.create(data);
      setQueues((prev) => [newQueue]);
      return newQueue;
    } finally {
      setLoading(false);
    }
  };

//   const editQueue = async (id: string, updates: Partial<Queue>) => {
//     return await queueService.update(id, updates);
//   };

//   const deleteQueue = async (id: string) => {
//     await queueService.delete(id);
//   };

//   useEffect(() => {
//     fetchQueues();
//   }, []);

  return {
    queues,
    selectedQueue,
    loading,
    // fetchQueues,
    // fetchQueueById,
    addQueue,
    // editQueue,
    // deleteQueue,
  };
}
