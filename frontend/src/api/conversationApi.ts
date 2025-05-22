import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";

const API_URL = __API_BASE_URL__;

export const fetchConversation = async (id: string | undefined): Promise<Conversation> => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_URL}/api/conversation/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
};

export const sendMessage = async (message: Message): Promise<{ status: string; message: string }> => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_URL}/api/conversation/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });

  return res.json();
};