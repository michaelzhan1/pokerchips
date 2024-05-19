'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';
import { RoomInfoType } from '@/type/room';


export default function Page({params}: {params: {slug: string}}) {
  const router = useRouter();
  const roomId = params.slug;

  const [players, setPlayers] = useState<string[]>([]);
  const [chips, setChips] = useState<number[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [ownAmount, setOwnAmount] = useState<number>(0);

  const parseRoomInfo = (data: RoomInfoType, socketId: string | undefined) => {
    const playerData = Object.values(data);
    const players = playerData.map(player => player.name);
    const chips = playerData.map(player => player.amount);
    const ownAmount = (socketId !== undefined) ? data[socketId].amount : 0;
    setPlayers(players);
    setChips(chips);
    setOwnAmount(ownAmount);
  }

  const parsePotInfo = (data: number) => {
    setPot(data);
  }

  useEffect(() => {
    console.log(socket.id);
    const searchParams = new URLSearchParams(window.location.search);
    const amount = searchParams.get('amt') || '1000';
    const name = searchParams.get('name') || 'First joiner';

    socket.connect();
    socket.on('connect', () => {
      console.log(`[client]: Connected with id ${socket.id}`);
      socket.emit('joinRoom', {roomId: roomId, amount: amount, name: name});
      socket.on('roomError', (data: string) => {
        alert(data);
        router.push('/');
      });
    })
    
    return () => {
      socket.disconnect();
      socket.off('connect');
    }
  }, []);
  
  socket.on('roomInfo', (data) => parseRoomInfo(data, socket.id));
  socket.on('roomPot', parsePotInfo);

  return (
    <main>
      <div className='w-screen flex flex-col items-center'>
        <div className='w-80'>
          <h1 className='text-2xl font-bold'>Room {roomId}</h1>
          <p>Players: {players.join(', ')}</p>
          <p>Chips: {chips.join(', ')}</p>
          <p>Pot: {pot}</p>
          <p>Your chips: {ownAmount}</p>
        </div>
      </div>
    </main>
  );
}
