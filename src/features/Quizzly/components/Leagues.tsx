import { Card, Typography, Button, Steps } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Trophy, ArrowLeft, Star, Shield, Crown } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';
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
}));

interface LeaguesProps {
  onBack: () => void;
}

const Leagues = ({ onBack }: LeaguesProps) => {
  const { styles } = useStyles();
  const points = useQuizzlyStore(s => s.points);

  const getCurrentLeague = () => {
    if (points >= 1000) return 2; // Or
    if (points >= 500) return 1; // Argent
    return 0; // Bronze
  };

  return (
    <Card className={styles.card}>
      <Flexbox align="center" gap={12} style={{ marginBottom: 32 }}>
        <Button type="text" icon={<Icon icon={ArrowLeft} />} onClick={onBack} />
        <Icon icon={Trophy} size={{ fontSize: 24 }} style={{ color: '#faad14' }} />
        <Typography.Title level={3} style={{ margin: 0 }}>Ligues & Progression</Typography.Title>
      </Flexbox>

      <Typography.Paragraph style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: 40 }}>
        Gagnez des points en répondant correctement aux questions pour grimper dans les ligues ! 
        Vous avez actuellement <strong>{points} points</strong>.
      </Typography.Paragraph>

      <Steps
        direction="vertical"
        current={getCurrentLeague()}
        items={[
          {
            title: <Typography.Text strong style={{ fontSize: '1.2rem', color: '#cd7f32' }}>Ligue Bronze</Typography.Text>,
            description: '0 - 499 points. Le début du voyage !',
            icon: <Icon icon={Star} size={{ fontSize: 32 }} style={{ color: '#cd7f32' }} />,
          },
          {
            title: <Typography.Text strong style={{ fontSize: '1.2rem', color: '#c0c0c0' }}>Ligue Argent</Typography.Text>,
            description: '500 - 999 points. L\'apprentissage s\'accélère.',
            icon: <Icon icon={Shield} size={{ fontSize: 32 }} style={{ color: '#c0c0c0' }} />,
          },
          {
            title: <Typography.Text strong style={{ fontSize: '1.2rem', color: '#ffd700' }}>Ligue Or</Typography.Text>,
            description: '1000+ points. Maître du Savoir !',
            icon: <Icon icon={Crown} size={{ fontSize: 32 }} style={{ color: '#ffd700' }} />,
          },
        ]}
      />
    </Card>
  );
};

export default Leagues;
