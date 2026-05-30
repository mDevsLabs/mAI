'use client';

import { Icon } from '@lobehub/ui';
import { Button, Typography, Alert, Flex } from 'antd';
import { Gamepad2, User, Store, Trophy, ArrowLeft, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createStaticStyles } from 'antd-style';

import Play from './components/Play';
import Profile from './components/Profile';
import Setup from './components/Setup';
import Shop from './components/Shop';
import Leagues from './components/Leagues';
import Clans from './components/Clans';
import { useQuizzlyStore } from './store/useQuizzlyStore';

const useStyles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    height: 100%;
    padding: 24px;
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
    height: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    margin-bottom: 12px;
    width: 100%;
  `,
  avatarDisplay: css`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: 4px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    margin: 0 auto;
  `
}));

const AVATAR_MAP: Record<string, string> = {
  default: '👤',
  avatar_nerd: '🤓',
  avatar_ninja: '🥷',
  avatar_wizard: '🧙',
  avatar_robot: '🤖',
};

const THEME_BACKGROUNDS: Record<string, string> = {
  default: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  theme_royal: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)',
  theme_cyberpunk: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
  theme_cosmic: 'linear-gradient(135deg, #3f2b96 0%, #a8c0ff 100%)',
};

const QuizzlyMain = () => {
  const { styles } = useStyles();
  const [currentView, setCurrentView] = useState<'menu' | 'setup' | 'play' | 'profile' | 'shop' | 'leagues' | 'clans'>('menu');
  const [quizConfig, setQuizConfig] = useState({ count: 5, level: 'Collège', topic: 'Culture Générale' });
  
  const currentAvatar = useQuizzlyStore(s => s.currentAvatar);
  const currentTheme = useQuizzlyStore(s => s.currentTheme) || 'default';
  const clan = useQuizzlyStore(s => s.clan);
  const lastQuizDate = useQuizzlyStore(s => s.lastQuizDate);
  const syncWithServer = useQuizzlyStore(s => s.syncWithServer);

  // Synchroniser avec le serveur TRPC au montage
  useEffect(() => {
    syncWithServer();
  }, []);

  const goMenu = () => {
    syncWithServer();
    setCurrentView('menu');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasPlayedToday = lastQuizDate === todayStr;
  const showNotification = clan && !hasPlayedToday;

  const bgStyle = {
    background: THEME_BACKGROUNDS[currentTheme] || THEME_BACKGROUNDS.default
  };

  if (currentView === 'setup') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Setup 
          onBack={goMenu} 
          onStart={(config) => {
            setQuizConfig(config);
            setCurrentView('play');
          }} 
        />
      </Flex>
    );
  }

  if (currentView === 'play') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Button 
          icon={<Icon icon={ArrowLeft} />} 
          onClick={goMenu}
          style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}
          ghost
        >
          Quitter le Quiz
        </Button>
        <Play config={quizConfig} onFinish={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'profile') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Button 
          icon={<Icon icon={ArrowLeft} />} 
          onClick={goMenu}
          style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}
          ghost
        >
          Retour au Menu
        </Button>
        <Profile />
      </Flex>
    );
  }

  if (currentView === 'shop') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Shop onBack={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'leagues') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Leagues onBack={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'clans') {
    return (
      <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
        <Clans onBack={goMenu} />
      </Flex>
    );
  }

  return (
    <Flex className={styles.container} style={bgStyle} align={'center'} justify={'center'}>
      <Flex className={styles.menuBox} align={'center'} justify={'center'} vertical>
        {showNotification && (
          <Alert
            message="Rappel quotidien !"
            description={`Complète ton quiz du jour pour préserver la série de ton clan (${clan.name}) ! 🔔`}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 24, textAlign: 'left', width: '100%' }}
          />
        )}

        <div className={styles.avatarDisplay}>
          {AVATAR_MAP[currentAvatar] || '👤'}
        </div>
        <Typography.Title className={styles.title}>Quizzly</Typography.Title>
        <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 32, fontSize: '1.1rem' }}>
          Apprendre en s'amusant avec l'IA
        </Typography.Text>

        <Flex vertical style={{ width: '100%' }}>
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
            icon={<Icon icon={Users} />}
            onClick={() => setCurrentView('clans')}
          >
            Clans
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Store} />}
            onClick={() => setCurrentView('shop')}
          >
            Boutique
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default QuizzlyMain;
