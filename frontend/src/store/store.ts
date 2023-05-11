'use client';

import { configureStore } from '@reduxjs/toolkit';
import statusSlice from './statusSlice';
import gameInfoSlice from './gameInfoSlice';
import guestSlice from './guestSlice';
import readyInfoSlice from './readyInfoSlice';

// redux 생성 함수
const store = configureStore({
  reducer: {
    status: statusSlice,
    gameinfo: gameInfoSlice,
    guest: guestSlice,
    readyInfo: readyInfoSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
