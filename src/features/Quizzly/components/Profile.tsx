import { Card, Typography, Divider, Statistic, Row, Col, Flex } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Trophy, Star, Flame, Shield } from 'lucide-react';
import { Icon } from '@lobehub/ui';

import { useQuizzlyStore } from '../store/useQuizzlyStore';

const useStyles = createStaticStyles(({ css }) => ({
  card: css`
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    width: 600px;
    max-width: 90vw;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  `,
  statBox: css`
    text-align: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
  `,
  avatarDisplay: css`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #1677ff15;
    border: 3px solid #1677ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
  `
}));

const AVATAR_MAP: Record<string, string> = {
  default: '👤',
  avatar_nerd: '🤓',
  avatar_ninja: '🥷',
  avatar_wizard: '🧙',
  avatar_robot: '🤖',
};

const Profile = () => {
  const { styles } = useStyles();
  const { 
    points, 
    streak, 
    streakShields,
    currentAvatar, 
    quizzesPlayed, 
    totalQuestions, 
    correctAnswers,
    clan
  } = useQuizzlyStore();

  const precision = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  const getLeagueName = () => {
    if (points >= 1000) return 'Ligue Or 👑';
    if (points >= 500) return 'Ligue Argent 🛡️';
    return 'Ligue Bronze ⭐️';
  };

  return (
    <Card className={styles.card}>
      <Flex vertical align="center" gap={16} style={{ padding: 24 }}>
        <div className={styles.avatarDisplay}>
          {AVATAR_MAP[currentAvatar] || '👤'}
        </div>
        <Typography.Title level={2} style={{ margin: 0 }}>Joueur IA</Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '1.1rem' }}>
          {getLeagueName()} {clan ? `• Clan: ${clan.name}` : ''}
        </Typography.Text>
        
        <Divider />

        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Score Total" value={points} prefix={<Trophy size={20} color="#faad14" style={{ marginRight: 8 }}/>} suffix="pts" />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Précision" value={precision} suffix="%" prefix={<Star size={20} color="#1677ff" style={{ marginRight: 8 }}/>} />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Série" value={streak} suffix=" jours" prefix={<Flame size={20} color="#ff4d4f" style={{ marginRight: 8 }}/>} />
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={12}>
            <div className={styles.statBox}>
              <Statistic title="Quiz Joués" value={quizzesPlayed} />
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.statBox}>
              <Statistic title="Boucliers" value={streakShields} prefix={<Icon icon={Shield} style={{ color: '#ff4d4f', marginRight: 8 }} />} />
            </div>
          </Col>
        </Row>
      </Flex>
    </Card>
  );
};

export default Profile;
