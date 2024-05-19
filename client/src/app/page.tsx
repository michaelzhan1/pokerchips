'use client';


import { useRouter } from 'next/navigation';
import { useState } from 'react';


const DEFAULT_AMOUNT = 1000;


export default function Home() {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);

  const checkName = (): boolean => { return name.length > 0; }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => { setName(e.target.value); }
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => { setAmount(parseInt(e.target.value)); }

  const createRoom = async (): Promise<void> => {
    if (!checkName()) {
      alert('Enter a name');
      return;
    }
    const res: Response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/getNewRoomId');
    const roomId: string = await res.text();
    router.push(`${roomId}?amt=${amount}&name=${name}`);
  }

  const joinRoom = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!checkName()) {
      alert('Enter a name');
      return;
    }
    const roomId: string  = (e.currentTarget as HTMLFormElement).roomId.value;
    const res: Response   = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/checkRoomId/${roomId}`);
    const roomExists: string    = await res.text();
    if (roomExists === 'true') {
      router.push(`${roomId}?amt=${amount}&name=${name}`);
    } else {
      alert('Room does not exist');
    }
  }

  return (
    <>
      <div className='w-screen flex flex-col items-center'>
        <div className='w-80'>
          <input type='text' name='name' placeholder='Enter Name' onChange={handleNameChange} className='w-full border border-gray-300 rounded p-2' />
          <input type='number' name='amount' defaultValue={DEFAULT_AMOUNT} onChange={handleAmountChange} className='w-full border border-gray-300 rounded p-2 mt-2' />
        </div>



        <div className='w-80'>
          <button type='button' onClick={createRoom} className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Create Room</button>
        </div>
        <div className='w-80 mt-4'>
          <form onSubmit={joinRoom}>
            <input type='text' name='roomId' placeholder='Enter Room ID' className='w-full border border-gray-300 rounded p-2' />
            <button type='submit' className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2'>Join Room</button>
          </form>
        </div>
      </div>
    </>
  );
}
