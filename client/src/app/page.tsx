'use client';


import { useState, useEffect } from 'react';
import { socket } from '@/app/socket';


export default function Home() {
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log(`[client]: ${socket.id} connected`);

      socket.on('message', (message: string) => {
        console.log(`[client]: ${message}`);
      })
    })

    return () => {
      socket.disconnect();
      socket.off('connect');
    }
  })

  return (
    <main>
      <p>
        Hello, world!
      </p>
    </main>
  );
}
