'use client';


import { useState, useEffect } from 'react';
import { socket } from '@/app/socket';


export default function Page({params}: {params: {slug: string}}) {
  const roomId = params.slug;
  
  useEffect(() => {
    const amount = new URLSearchParams(window.location.search).get('amt');

    socket.connect();
    socket.on('connect', () => {
      console.log(`[client]: Connected with id ${socket.id}`);
      socket.on('message', (message: string) => {
        console.log(`[client]: ${message}`);
      })
      socket.emit('joinRoom', {roomId: roomId, amount: amount}); // todo: make button join with certain amount

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
