'use client';

import { Icon } from '@lobehub/ui';
import { Alert, Button, Flex,Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, Gamepad2, Store, Trophy, User, Users } from 'lucide-react';
import { useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';

import Clans from './components/Clans';
import Leagues from './components/Leagues';
import Play from './components/Play';
import Profile from './components/Profile';
import Setup from './components/Setup';
import Shop from './components/Shop';
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
  const { t } = useTranslation('extensions');
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
  }, [syncWithServer]);

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
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
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
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
        <Button 
          ghost 
          icon={<Icon icon={ArrowLeft} />}
          style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}
          onClick={goMenu}
        >
          {t('quizzly.quitQuiz')}
        </Button>
        <Play config={quizConfig} onFinish={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'profile') {
    return (
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
        <Button 
          ghost 
          icon={<Icon icon={ArrowLeft} />}
          style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}
          onClick={goMenu}
        >
          {t('quizzly.backMenu')}
        </Button>
        <Profile />
      </Flex>
    );
  }

  if (currentView === 'shop') {
    return (
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
        <Shop onBack={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'leagues') {
    return (
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
        <Leagues onBack={goMenu} />
      </Flex>
    );
  }

  if (currentView === 'clans') {
    return (
      <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
        <Clans onBack={goMenu} />
      </Flex>
    );
  }

  return (
    <Flex align={'center'} className={styles.container} justify={'center'} style={bgStyle}>
      <Flex vertical align={'center'} className={styles.menuBox} justify={'center'}>
        {showNotification && (
          <Alert
            closable
            showIcon
            description={t('quizzly.clanReminder', { name: clan.name })}
            message={t('quizzly.dailyReminder')}
            style={{ marginBottom: 24, textAlign: 'left', width: '100%' }}
            type="warning"
          />
        )}

        <div className={styles.avatarDisplay}>
          {AVATAR_MAP[currentAvatar] || '👤'}
        </div>
        <Typography.Title className={styles.title}>{t('quizzly.title')}</Typography.Title>
        <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 32, fontSize: '1.1rem' }}>
          {t('quizzly.subtitle')}
        </Typography.Text>

        <Flex vertical style={{ width: '100%' }}>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Gamepad2} />} 
            type={'primary'}
            onClick={() => setCurrentView('setup')}
          >
            {t('quizzly.play')}
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={User} />}
            onClick={() => setCurrentView('profile')}
          >
            {t('quizzly.profile')}
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Trophy} />}
            onClick={() => setCurrentView('leagues')}
          >
            {t('quizzly.leagues')}
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Users} />}
            onClick={() => setCurrentView('clans')}
          >
            {t('quizzly.clans')}
          </Button>
          <Button 
            className={styles.button} 
            icon={<Icon icon={Store} />}
            onClick={() => setCurrentView('shop')}
          >
            {t('quizzly.shop')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default QuizzlyMain;
