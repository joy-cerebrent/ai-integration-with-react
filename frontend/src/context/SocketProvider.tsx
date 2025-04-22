import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocketContext = (): Socket | null => {
  return useContext(SocketContext);
}

export const SocketProvider = ({
  children,
  serverUrl
}: {
  children: React.ReactNode;
  serverUrl: string;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const authUser = true;

  useEffect(() => {
    if (authUser) {
      const socketInstance = io(serverUrl);
      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      }
    } else {
      setSocket(null);
    }
  }, [authUser, serverUrl]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}