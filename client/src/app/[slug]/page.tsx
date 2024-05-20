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
  const modifyTransactionAmt = (amt: number): void => {
    if (amt > 0) setTransactionAmt(Math.min(ownChips, transactionAmt + amt));
    else setTransactionAmt(Math.max(0, transactionAmt + amt));
  }
  const clearTransactionAmt = (): void => { setTransactionAmt(0); }
  const maxTransactionAmt = (): void => { setTransactionAmt(ownChips); }

  const handleBet = (): void => {
    if (transactionAmt > ownChips) {
      alert('Not enough chips');
      return;
    }
    if (transactionAmt === 0) return;
    socket.emit('bet', {amt: transactionAmt, roomId: roomId, socketId: socket.id});
    setTransactionAmt(0);
  }

  const handleTake = (): void => {
    if (transactionAmt > pot) {
      alert('Not enough chips in pot');
      return;
    }
    if (transactionAmt === 0) return;
    socket.emit('take', {amt: transactionAmt, roomId: roomId, socketId: socket.id});
    setTransactionAmt(0);
  }

  const handleTakeAll = (): void => {
    if (pot === 0) return;
    socket.emit('take', {amt: pot, roomId: roomId, socketId: socket.id});
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
    // //DEBUG
    // setAmount(DEFAULT_POT_AMOUNT);
    // setAllPlayers(['player1', 'player2', 'player3']);
    // setAllChips([1000, 2000, 3000]);
    // setPot(0);
    // setOwnChips(1000);
    // setActions(['player1 bet 100', 'player2 take 200']);
    // //END DEBUG

    socket.connect();
    socket.on('connect', () => {
      // console.log(`[client]: Connected with id ${socket.id}`);
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
        <div className='flex flex-wrap justify-center w-full md:w-3/4 mt-3 md:mt-10'>
          <div className='flex flex-col items-center w-full md:w-1/4'>
            {/* Player info */}
            <div className='w-11/12 text-center rounded-md border p-3 border-neutral-400'>
              <div className='w-full text-center font-bold text-lg'>
                Players
              </div>
              <div className="h-[20vh] md:h-[33vh] flex flex-col items-center overflow-auto">
                {allPlayers.map((player, index) => (
                  <>
                    <div key={index} className='w-full flex flex-row justify-between'>
                      <p>{player}</p>
                      <p>{allChips[index]}</p>
                    </div>
                    {index < allPlayers.length - 1 && <hr className='h-px' />}
                  </>
                ))}
              </div>
            </div>
            {/* Action info */}
            <div className='w-11/12 text-center mt-2 md:mt-10 rounded-md border p-3 border-neutral-400'>
              <div className='w-full text-center font-bold text-lg'>
                Events
              </div>
              <div className="h-[20vh] md:h-[33vh] flex flex-col items-center overflow-auto">
                {actions.map((action, index) => <p key={index}>{action}</p>)}
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center'>
            {/* Pot and chip info */}
            <div className='w-11/12 mt-3 md:mt-[20vh] flex flex-col'>
              <div className='w-full flex flex-col items-center'>
                <p className='w-full text-center font-bold text-lg'>Pot</p>
                <p className='w-full text-center'>{pot}</p>
              </div>
              <div className='flex flex-col items-center'>
                <p className='w-full text-center font-bold text-lg'>Your Chips</p>
                <p className='w-full text-center'>{ownChips}</p>
              </div>
            </div>
            {/* Bet and Take buttons */}
            <div className='flex flex-col w-11/12 mt-3'>
              <div className='flex flex-row justify-around'>
                <button type='button' onClick={clearTransactionAmt} className='w-1/6 bg-green-500 hover:bg-green-700 rounded p-2'>Clear</button>
                <button type='button' onClick={() => modifyTransactionAmt(-10)} className='w-1/6 bg-green-500 hover:bg-green-700 rounded p-2'>-10</button>
                <input type='number' name='transactionAmt' onChange={handleTransactionAmtChange} value={transactionAmt} inputMode='numeric' className='w-1/4 border border-gray-300 rounded p-2 text-center' />
                <button type='button' onClick={() => modifyTransactionAmt(10)} className='w-1/6 p-2 bg-green-500 hover:bg-green-700 rounded'>+10</button>
                <button type='button' onClick={maxTransactionAmt} className='w-1/6 bg-green-500 hover:bg-green-700 rounded p-2'>Max</button>
              </div>
              <div className='flex flex-col items-center mt-3'>
                <div className='w-full flex flex-col items-center justify-center'>
                  <button type='button' onClick={handleBet} className='w-11/12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Bet</button>
                </div>
                <div className='w-full flex flex-row justify-around mt-3'>
                  <button type='button' onClick={handleTake} className='w-5/12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Take</button>
                  <button type='button' onClick={handleTakeAll} className='w-5/12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Take all</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
