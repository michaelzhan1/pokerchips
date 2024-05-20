'use client';


import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { PlayerContext } from '@/contexts/PlayerContext'; 
import Image from 'next/image';


const DEFAULT_AMOUNT: number = 1000;


export default function Home() {
  // ===== DATA AND ROUTING HOOKS =====
  const router = useRouter();
  const {name, setName, setAmount, roomId, setRoomId} = useContext(PlayerContext);
  // ===== END DATA AND ROUTING HOOKS =====


  // ===== FIELD FUNCTIONS =====
  const checkName = (): boolean => { return name.length > 0; }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => { setName(e.target.value); }
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => { setAmount(parseInt(e.target.value)); }
  // ===== END FIELD FUNCTIONS =====


  // ===== ROOM FUNCTIONS =====
  const createRoom = async (): Promise<void> => {
    if (!checkName()) {
      alert('Enter a name');
      return;
    }
    const res: Response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/getNewRoomId');
    const roomId: string = await res.text();
    setRoomId(roomId);
    console.log(roomId);
    router.push(`${roomId}`);
  }

  const joinRoom = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!checkName()) {
      alert('Enter a name');
      return;
    }
    const roomId: string  = (e.currentTarget as HTMLFormElement).roomId.value;
    const res: Response   = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/checkRoomId/' + roomId);
    const roomExists: string    = await res.text();
    if (roomExists === 'true') {
      router.push(`${roomId}`);
    } else {
      alert('Room does not exist');
    }
  }
  // ===== END ROOM FUNCTIONS =====

  return (
    <>
      <div className='w-screen flex flex-col items-center'>
        {/* Header */}
        <div className='bg-neutral-500 w-full flex justify-center'>
          <div className='w-full md:w-5/6 flex'>
            <div className='flex flex-col justify-center relative w-1/4 ms-3'>
              <Image src='/poker-chip.png' fill alt='poker chip' objectFit='cover' className=''/>
            </div>
            <h1 className='text-white text-xl md:text-3xl p-4 align-middle'>PokerChips</h1>
          </div>
        </div>

        {/* Body */}
        <div className='mt-3 flex flex-col items-center w-full md:w-5/12'>
          {/* Title */}
          <div className='mt-36'>
            <h2 className='text-4xl md:text-5xl text-center'>Poker without poker chips, but again</h2>
          </div>

          {/* Name and chip field */}
          <div className='flex flex-wrap w-full justify-center md:justify-between mt-6'>
            <div className='w-5/6 md:w-7/12'>
              <input type='text' name='name' placeholder='Enter Name' onChange={handleNameChange} className='w-full border border-gray-300 rounded p-2' />
            </div>
            <div className='w-1/3 flex justify-around mt-3 md:mt-0'>
              <input type='number' name='amount' defaultValue={DEFAULT_AMOUNT} onChange={handleAmountChange} className='w-7/12 border border-gray-300 rounded p-2' />
              <div className='flex items-center w-1/3'>
                <div>
                  Chips
                </div>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className='mt-6 md:mt-10 w-full grid grid-cols-2 divide-x divide-neutral-400'>
            <div className='w-full flex flex-col items-center justify-center py-3'>
              <button type='button' onClick={createRoom} className='w-2/3 bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded'>Create Room</button>
            </div>
            <div className='w-full flex flex-col items-center py-3'>
              <form onSubmit={joinRoom} className='w-2/3'>
                <input type='text' name='roomId' defaultValue={roomId} placeholder='Enter Room ID' className='w-full border border-gray-300 rounded p-2' />
                <button type='submit' className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2'>Join Room</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
