import { Avatar } from '@lobehub/ui';
import { Card, Typography, Divider, Statistic, Row, Col } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { Trophy, Star, Flame } from 'lucide-react';

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
}));

const Profile = () => {
  const { styles } = useStyles();

  return (
    <Card className={styles.card}>
      <Flexbox direction="column" align="center" gap={16} padding={24}>
        <Avatar src="/avatars/quizzly.png" size={100} style={{ border: '3px solid #1677ff' }} />
        <Typography.Title level={2} style={{ margin: 0 }}>Joueur IA</Typography.Title>
        <Typography.Text type="secondary">Ligue Bronze I</Typography.Text>
        
        <Divider />

        <Row gutter={16} style={{ width: '100%' }}>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Score Total" value={1250} prefix={<Trophy size={20} color="#faad14" style={{ marginRight: 8 }}/>} />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Précision" value={85} suffix="%" prefix={<Star size={20} color="#1677ff" style={{ marginRight: 8 }}/>} />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.statBox}>
              <Statistic title="Série" value={5} suffix="🔥" prefix={<Flame size={20} color="#ff4d4f" style={{ marginRight: 8 }}/>} />
            </div>
          </Col>
        </Row>
      </Flexbox>
    </Card>
  );
};

export default Profile;
