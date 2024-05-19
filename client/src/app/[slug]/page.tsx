'use client';


import { useState, useEffect } from 'react';
import { socket } from '@/app/socket';


export default function Page({params}: {params: {slug: string}}) {
  const roomId = params.slug;

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log(`[client]: Connected with id ${socket.id}`);
      socket.on('message', (message: string) => {
        console.log(`[client]: ${message}`);
      })
      socket.emit('joinRoom', roomId);

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
