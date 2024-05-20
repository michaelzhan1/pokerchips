'use client';


import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';
import { RoomInfoType } from '@/type/room';
import { PlayerContext } from '@/contexts/PlayerContext';
import Image from 'next/image';


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
    // if (name === '') router.push('/');
    //DEBUG
    setAmount(DEFAULT_POT_AMOUNT);
    setAllPlayers(['player1', 'player2', 'player3']);
    setAllChips([1000, 2000, 3000]);
    setPot(0);
    setOwnChips(1000);
    setActions(['player1 bet 100', 'player2 take 200']);
    //END DEBUG

    socket.connect();
    socket.on('connect', () => {
      // console.log(`[client]: Connected with id ${socket.id}`); // todo: ADD BACK
      // socket.emit('joinRoom', {roomId: roomId, amount: amount, name: name});
      // socket.on('roomError', (data: string) => {
      //   alert(data);
      //   router.push('/');
      // });
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
    <>
      <div className='w-screen flex flex-col items-center'>
        {/* Header */}
        <div className='bg-neutral-500 w-full flex justify-center'>
          <div className='w-full md:w-5/6 flex justify-between'>
            <div className="w-1/2 flex">
              <div className='flex flex-col justify-center relative w-1/4 ms-3'>
                <Image src='/poker-chip.png' fill alt='poker chip' objectFit='cover' className=''/>
              </div>
              <h1 className='text-white text-xl md:text-3xl p-4 align-middle'>PokerChips</h1>
            </div>
            <div className='flex justify-center items-center w-1/2'>
              <div className='text-white text-xl'>
                Room: {roomId}
              </div>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className='grid grid-cols-2 divide-x divide-neutral-400 w-full md:w-5/12 mt-24'>
          <div className='flex flex-col items-center'>
            {/* Player info */}
            <div className='w-full text-center rounded-md border p-3 border-neutral-400 overflow-y-auto'>
              <div className='w-full text-center font-bold text-lg'>
                Players
              </div>
              {allPlayers.map((player, index) => (
                <>
                  <div key={index} className='flex flex-row justify-between'>
                    <p>{player}</p>
                    <p>{allChips[index]}</p>
                  </div>
                  {index < allPlayers.length - 1 && <hr className='h-px' />}
                </>
              ))}
            </div>
            {/* Action info */}
            <div className='w-full text-center mt-10 rounded-md border p-3 border-neutral-400 overflow-y-auto'>
              <div className='w-full text-center font-bold text-lg'>
                Events
              </div>
              {actions.map((action, index) => <p key={index}>{action}</p>)}
            </div>
          </div>
          <div className='flex flex-col items-center'>
            {/* Pot and chip info */}
            <div className='w-full flex flex-col items-center'>
              <p className='w-full text-center font-bold text-lg'>Pot</p>
              <p className='w-full text-center'>{pot}</p>
            </div>
            <div className='flex flex-col items-center'>
              <p className='w-full text-center font-bold text-lg'>Your Chips</p>
              <p className='w-full text-center'>{ownChips}</p>
            </div>
            {/* Bet and Take buttons */}
            <div className='flex flex-col'>
              <div className='flex flex-row'>
                <button type='button' onClick={() => modifyTransactionAmt(-10)} className='w-1/4 border border-gray-300 rounded p-2'>-10</button>
                <input type='number' name='transactionAmt' onChange={handleTransactionAmtChange} value={transactionAmt} inputMode='numeric' className='w-1/2 border border-gray-300 rounded p-2' />
                <button type='button' onClick={() => modifyTransactionAmt(10)} className='w-1/4 border border-gray-300 rounded p-2'>+10</button>
              </div>
              <div className='flex flex-col'>
                <button type='button' onClick={handleBet} className='w-full mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Bet</button>
                <button type='button' onClick={handleTake} className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Take</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
