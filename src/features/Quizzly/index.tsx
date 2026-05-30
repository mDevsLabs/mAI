'use client';

import { Avatar, Icon } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { Gamepad2, User, Store, Trophy, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { createStaticStyles } from 'antd-style';

import Play from './components/Play';
import Profile from './components/Profile';
import Setup from './components/Setup';
import Shop from './components/Shop';
import Leagues from './components/Leagues';

const useStyles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    height: 100%;
    padding: 24px;
    background: linear-gradient(135deg, #1f1c2c 0%, #928dab 100%);
    color: white;
  `,
  menuBox: css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 48px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    border: 1px solid rgba(255, 255, 255, 0.18);
    min-width: 400px;
    text-align: center;
  `,
  title: css`
    margin-top: 16px;
    font-size: 3rem !important;
    font-weight: 800 !important;
    color: white !important;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  `,
  button: css`
    height: 56px;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 12px;
    margin-bottom: 16px;
    width: 100%;
  `,
}));

const QuizzlyMain = () => {
  const { styles } = useStyles();
  const [currentView, setCurrentView] = useState<'menu' | 'setup' | 'play' | 'profile' | 'shop' | 'leagues'>('menu');
  const [quizConfig, setQuizConfig] = useState({ count: 5, level: 'Collège', topic: 'Culture Générale' });

  const goMenu = () => setCurrentView('menu');

  if (currentView === 'setup') {
    return (
      <Flexbox className={styles.container} align={'center'} justify={'center'}>
        <Setup 
          onBack={goMenu} 
          onStart={(config) => {
            setQuizConfig(config);
            setCurrentView('play');
          }} 
        />
      </Flexbox>
    );
  }

  if (currentView === 'play') {
    return (
      <Flexbox className={styles.container} align={'center'} justify={'center'}>
        <Button 
          icon={<Icon icon={ArrowLeft} />} 
          onClick={goMenu}
          style={{ position: 'absolute', top: 24, left: 24 }}
          ghost
        >
          Quitter le Quiz
        </Button>
        <Play config={quizConfig} onFinish={goMenu} />
      </Flexbox>
    );
  }

  if (currentView === 'profile') {
    return (
      <Flexbox className={styles.container} align={'center'} justify={'center'}>
        <Button 
          icon={<Icon icon={ArrowLeft} />} 
          onClick={goMenu}
          style={{ position: 'absolute', top: 24, left: 24 }}
          ghost
        >
          Retour au Menu
        </Button>
        <Profile />
      </Flexbox>
    );
  }

  if (currentView === 'shop') {
    return (
      <Flexbox className={styles.container} align={'center'} justify={'center'}>
        <Shop onBack={goMenu} />
      </Flexbox>
    );
  }

  if (currentView === 'leagues') {
    return (
      <Flexbox className={styles.container} align={'center'} justify={'center'}>
        <Leagues onBack={goMenu} />
      </Flexbox>
    );
  }

  return (
    <Flexbox className={styles.container} align={'center'} justify={'center'}>
      <Flexbox className={styles.menuBox} align={'center'} justify={'center'} direction={'column'}>
        <Avatar src="/avatars/quizzly.png" size={120} style={{ border: '4px solid white' }} />
        <Typography.Title className={styles.title}>Quizzly</Typography.Title>
        <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 32, fontSize: '1.1rem' }}>
          Apprendre en s'amusant avec l'IA
        </Typography.Text>

        <Flexbox direction={'column'} width={'100%'}>
          <Button 
            type={'primary'} 
            className={styles.button} 
            icon={<Icon icon={Gamepad2} />}
            onClick={() => setCurrentView('setup')}
          >
            Jouer
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={User} />}
            onClick={() => setCurrentView('profile')}
          >
            Profil
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Trophy} />}
            onClick={() => setCurrentView('leagues')}
          >
            Ligues
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Store} />}
            onClick={() => setCurrentView('shop')}
          >
            Boutique
          </Button>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default QuizzlyMain;
