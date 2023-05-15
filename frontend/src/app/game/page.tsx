'use client';

import 'animate.css';
import { useEffect, useState, useRef } from 'react';
import Blur from '@/components/common/Blur';
import CountDown from '@/components/game/CountDown';
import GameUserNum from '@/components/game/GameUserNum';
import WordNum from '@/components/game/WordNum';
import Image from 'next/image';
import WordList from '@/components/game/WordList';
import Timer from '@/components/game/Timer';
import AlertBox from '@/components/common/AlertBox';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { wordZeroAction } from '@/store/wordNumSlice';
import { useSocket } from '@/context/SocketContext';
import BgAudioPlayer from '@/components/common/BgAudioPlayer';
import { wordcloundApi } from '@/apis/apis';
import { setWordcloudData } from '@/store/resultInfoSlice';

export default function GamePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { publishUpdate } = useSocket();

  const [countShow, setCountShow] = useState(true);

  // redux에서 가져올 값
  const wordNum = useSelector((state: RootState) => state.wordNum.num);
  const roundInfo = useSelector((state: RootState) => state.roundInfo);
  const gameInfo = useSelector((state: RootState) => state.gameinfo);
  const userNum = useSelector((state: RootState) => state.readyInfo).length;
  const isHost = useSelector((state: RootState) => state.status.isHost);
  const playerRef = useRef<HTMLAudioElement>(null);

  const word =
    'https://s3.ap-northeast-2.amazonaws.com/static.malang-lab.com/static/word.png';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCountShow(false);
    }, 3200);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = async () => {
    // 결과 데이터 가져오기 API 요청하기
    console.log('결과 가져오기 누름');
    const res = await wordcloundApi(gameInfo.id);
    await dispatch(setWordcloudData(res));
    await router.push('/result');
    dispatch(wordZeroAction());
  };

  const handleFinish = () => {
    // publish 라운드 종료 메시지
    const destination = `/topic/room.${gameInfo.id}`;
    const type = 'ROUND_FINISH';
    publishUpdate(destination, type);
  };

  return (
    <div
      className={`min-h-screen bg-cover flex flex-col align-middle bg-bg-1 whitespace-pre-wrap ${
        isHost ? 'justify-center' : ''
      } ${roundInfo.finish ? 'justify-center' : ''} items-center`}
    >
      <BgAudioPlayer src="/audio/gamefull.wav" />
      <audio ref={playerRef} src={'/audio/blop.mp3'} />
      {/* 카운트다운 */}
      {countShow && (
        <>
          <Blur />
          <CountDown />
        </>
      )}

      {/* 카운트다운 끝 & Host */}
      {!countShow && isHost && (
        <>
          <div className="flex fixed top-0 w-screen mr-10">
            <GameUserNum num={userNum} />
            <Timer onFinish={handleFinish} time={roundInfo.timeLimit} />
          </div>
          <WordNum num={wordNum} />
          <h1 className="absolute font-bold text-[4rem] text-[#44474B] top-72 animate__animated animate__heartBeat">
            {roundInfo.keyword}
          </h1>
          <Image src={word} alt="word" width={800} height={500} />
        </>
      )}

      {/* 카운트다운 끝 & Guest */}
      {!countShow && !isHost && (
        <>
          {/* <div className="flex sm:fixed sm:right-10 justify-center">
            <Timer setFinish={setFinish} time={roundInfo.timeLimit} />
          </div> */}
          <h1 className="text-[#44474B] text-[3rem] font-semibold sm:mt-16">
            제시어 : {roundInfo.keyword}
          </h1>
          <h2 className="text-[#44474B] mx-5 my-2 font-semibold">
            떠오르는 단어를 마구마구 입력해주세요!
          </h2>
          <WordList />
        </>
      )}

      {/* 게임 끝 & Host */}
      {roundInfo.finish && isHost && (
        <>
          <Blur />
          <AlertBox text={`${roundInfo.round}라운드 종료!`} />
          <button
            className="bg-black absolute z-20 mx-auto font-semibold rounded text-white px-10 py-2 bottom-48 left-[45%]"
            onClick={handleClick}
          >
            결과 확인하기
          </button>
        </>
      )}

      {/* 게임 끝 & Guest */}
      {roundInfo.finish && !isHost && (
        <>
          <Blur />
          <AlertBox
            text={`${roundInfo.round}라운드 종료!\n 화면을 확인하세요`}
          />
        </>
      )}
    </div>
  );
}
