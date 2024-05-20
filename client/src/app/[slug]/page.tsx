'use client';


import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';
import { RoomInfoType } from '@/type/room';
import { PlayerContext } from '@/contexts/PlayerContext';


const DEFAULT_POT_AMOUNT: number = 0;

export default function Page({params}: {params: {slug: string}}) {
  // ===== DATA AND ROUTING HOOKS =====
  const router = useRouter();
  const {name, amount, setAmount, setRoomId} = useContext(PlayerContext);
  // ===== END DATA AND ROUTING HOOKS =====


  // ===== STATE VARIABLES =====
  const roomId: string = params.slug;
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [allChips, setAllChips] = useState<number[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [ownChips, setOwnChips] = useState<number>(0);
  const [transactionAmt, setTransactionAmt] = useState<number>(0);
  const [actions, setActions] = useState<string[]>([]);
  // ===== END STATE VARIABLES =====


  // ===== FIELD FUNCTIONS =====
  const handleTransactionAmtChange = (e: React.ChangeEvent<HTMLInputElement>): void => { setTransactionAmt(parseInt(e.target.value)); }
  const modifyTransactionAmt = (amt: number): void => { setTransactionAmt(transactionAmt + amt); }

  const handleBet = (): void => {
    if (transactionAmt > ownChips) {
      alert('Not enough chips');
      return;
    }
    socket.emit('bet', {amt: transactionAmt, roomId: roomId, socketId: socket.id});
    setTransactionAmt(0);
  }

  const handleTake = (): void => {
    if (transactionAmt > pot) {
      alert('Not enough chips in pot');
      return;
    }
    socket.emit('take', {amt: transactionAmt, roomId: roomId, socketId: socket.id});
    setTransactionAmt(0);
  }
  // ===== END FIELD FUNCTIONS =====


  // ===== SOCKET EVENT HELPER FUNCTIONS =====
  const parseRoomInfo = (data: RoomInfoType, socketId: string | undefined) => {
    const playerData: {name: string, amount: number}[] = Object.values(data);
    const players: string[] = playerData.map(player => player.name);
    const chips: number[] = playerData.map(player => player.amount);
    const ownChips: number = (socketId !== undefined) ? data[socketId].amount : 0;
    setAllPlayers(players);
    setAllChips(chips);
    setOwnChips(ownChips);
    setAmount(ownChips);
  }

  const parsePotInfo = (data: number) => { setPot(data); }
  // ===== END SOCKET EVENT HELPER FUNCTIONS =====


  // ===== SOCKET EVENTS =====
  useEffect(() => {
    setRoomId(roomId);
    if (name === '') router.push('/');

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
  socket.on('roomAction', (data: string) => setActions([...actions, data]));
  // ===== END SOCKET EVENTS =====

  return (
    <main>
      <div className='w-screen flex flex-col items-center'>
        <div className='w-80'>
          <h1 className='text-2xl font-bold'>Room {roomId}</h1>
          <p>You are: {name}</p>
          <p>Players: {allPlayers.join(', ')}</p>
          <p>Chips: {allChips.join(', ')}</p>
          <p>Pot: {pot}</p>
          <p>Your chips: {ownChips}</p>
        </div>
        <hr className='h-px mb-3' />
        <div>
          {actions.map((action, index) => <p key={index}>{action}</p>)}
        </div>
        <hr className='h-px mb-3' />
        <div className='flex flex-row'>
          <button type='button' onClick={() => modifyTransactionAmt(-10)} className='w-20 border border-gray-300 rounded p-2'>-10</button>
          <input type='number' name='transactionAmt' onChange={handleTransactionAmtChange} value={transactionAmt} inputMode='numeric' className='w-40 border border-gray-300 rounded p-2' />
          <button type='button' onClick={() => modifyTransactionAmt(10)} className='w-20 border border-gray-300 rounded p-2'>+10</button>
        </div>
        <div className='flex flex-col'>
          <button type='button' onClick={handleBet} className='w-80 mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Bet</button>
          <button type='button' onClick={handleTake} className='w-80 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Take</button>
        </div>
      </div>
    </main>
  );
}
