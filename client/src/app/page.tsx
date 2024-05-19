'use client';


import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();

  const createRoom = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/getNewRoomId');
    const data = await res.text();
    router.push(`${data}`);
  }

  const joinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roomId = (e.currentTarget as HTMLFormElement).roomId.value;
    const amt = (e.currentTarget as HTMLFormElement).amt.value;
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/checkRoomId/${roomId}`);
    const data = await res.text();
    if (data === 'true') {
      router.push(`${roomId}?amt=${amt}`);
    } else {
      alert('Room does not exist');
    }
  }

  return (
    <>
      <div className='w-screen flex flex-col items-center'>
        <div className='w-80'>
          <button type='button' onClick={createRoom} className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Create Room</button>
        </div>
        <div className='w-80 mt-4'>
          <form onSubmit={joinRoom}>
            <input type='text' name='roomId' placeholder='Enter Room ID' className='w-full border border-gray-300 rounded p-2' />
            <input type='number' name='amt' defaultValue='1000' className='w-full border border-gray-300 rounded p-2' />
            <button type='submit' className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2'>Join Room</button>
          </form>
        </div>
      </div>
    </>
  );
}
