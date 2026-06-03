'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import AgentSelect from './AgentSelect';
import InputArea from './InputArea';
import WelcomeText from './WelcomeText';

const Home = memo(() => {
  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <AgentSelect />
        <WelcomeText />
      </Flexbox>
<<<<<<< HEAD

      {isLogin && <DailyBrief />}
=======
      <InputArea />
>>>>>>> origin
    </Flexbox>
  );
});

export default Home;
