import { setReadyMember, guestOutAction } from '@/store/readyInfoSlice';
import { setFinish, setRoundInfo } from '@/store/roundInfoSlice';
import { useRouter } from 'next/navigation';

const HandleTopic = (dispatch, router) => message => {
  var joinAudio = new Audio('/audio/hello.mp3');
  if (message.body) {
    console.debug(message);
    const quote = JSON.parse(message.body);
    // 유저 참여
    if (quote.type === 'JOIN') {
      const member = {
        nickname: quote.body.nickname,
        imagePath: quote.body.imagePath,
      };
      dispatch(setReadyMember(member));
      joinAudio?.play();
    }
    // 라운드 시작
    if (quote.type === 'ROUND_START') {
      dispatch(setRoundInfo(quote.body));
    }
    // 라운드 종료
    if (quote.type === 'ROUND_FINISH') {
      dispatch(setFinish());
    }
    // 유저 이탈
    if (quote.type === 'EXIT') {
      alert(message.body);
      dispatch(guestOutAction(quote.body.nickname));
    }
    // 호스트 이탈
    if (quote.type === 'DESTROY') {
      console.debug('호스트가 퇴장했어요');
      // router.push('/');
    }
    if (quote.type === 'GUEST_LIST') {
      alert(message.body);
    }
  } else {
    alert('got empty message');
  }
};

export { HandleTopic };
