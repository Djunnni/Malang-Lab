import { checkGuestInfoApi } from '@/apis/apis';
import { useSocket } from '@/context/SocketContext';
import { setImageAction, setNicknameAction } from '@/store/guestSlice';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { isGeneratorFunction } from 'util/types';

export default function NicknameForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [nickname, setNickname] = useState('');
  const guest = useSelector((state: RootState) => state.guest);
  const { publish } = useSocket();
  const [imagePath, setImagePath] = useState('');

  // step3 - 닉네임 입력하기
  const handleChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  // 닉네임 저장하기
  const handleClickComplete = () => {
    dispatch(setNicknameAction(nickname));
  };

  // 닉네임 저장 후 실행
  useEffect(() => {
    const checkGuestInfo = async () => {
      // 닉네임 및 이미지 확인 api 전송
      let tmp = await checkGuestInfoApi(guest);
      setImagePath(tmp);
    };
    // 닉네임 준비 완료?
    if (guest.nickname !== '') {
      checkGuestInfo();
    }
  }, [guest.nickname]);

  useEffect(() => {
    if (imagePath.length) {
      // 메세지 전송
      const destination = `/topic/room.${guest.pin}`;
      const type = 'JOIN';
      const message = {
        id: guest.pin,
        nickname: guest.nickname,
        imagePath,
      };
      publish(destination, type, message);
      setTimeout(() => {
        router.push('/ready');
      }, 5000);
    }
  }, [imagePath]);

  // const setGuestInfoFunction = async () => {
  //     // 이미지 저장하기
  //     let tmp = await setGuestInfo(guest)
  //     await setImagePath(tmp)
  // }

  // useEffect(() => {
  //     if (guest.nickname.trim() && imagePath) {
  //         // 메세지 전송
  //         console.log(guest.pin);
  //         const destination = `/topic/room.${guest.pin}`;
  //         const type = 'JOIN';
  //         const message = {
  //             id: guest.pin,
  //             nickname: guest.nickname,
  //             imagePath,
  //         };
  //         publish(destination, type, message);
  //         // router.push('/ready')
  //     }
  // }, [guest.nickname, imagePath])

  return (
    <section className="w-[70%] sm:w-[50%] md:w-[40%] lg:w-[30%] flex flex-col justify-center align-middle gap-5">
      <p className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold mb-5">
        닉네임 설정하기
      </p>
      <input
        type="text"
        placeholder="닉네임 입력"
        onChange={handleChangeNickname}
        className="block w-[80%] sm:w-[60%] h-12 mx-auto pl-5 rounded-[5px] text-lg"
      />
      <button
        className="button-black w-[80%] sm:w-[60%]]"
        onClick={handleClickComplete}
      >
        완료
      </button>
    </section>
  );
}
