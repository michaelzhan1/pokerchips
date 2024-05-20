'use client';

import { createContext, useState } from 'react';

export const PlayerContext = createContext({
  name: '',
  amount: 0,
  roomId: '',
  setName: (name: string) => {},
  setAmount: (amount: number) => {},
  setRoomId: (roomId: string) => {}
});

export const PlayerContextProvider = (props: any) => {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<number>(1000);
  const [roomId, setRoomId] = useState<string>('');

  return (
    <PlayerContext.Provider value={{name, amount, roomId, setName, setAmount, setRoomId}}>
      {props.children}
    </PlayerContext.Provider>
  );
}