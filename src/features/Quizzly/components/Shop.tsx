import { Card, Typography, Button, Row, Col, Badge, message } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Store, Trophy, ArrowLeft, Unlock, Lock } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';
import { Icon, Avatar } from '@lobehub/ui';

import { useQuizzlyStore } from '../store/useQuizzlyStore';
import { playSound } from '../utils/sound';

const useStyles = createStaticStyles(({ css }) => ({
  card: css`
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    width: 800px;
    max-width: 90vw;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  `,
  itemCard: css`
    background: white;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
  `
}));

const SHOP_ITEMS = [
  { id: 'avatar_nerd', name: 'Nerd', cost: 50, icon: '🤓' },
  { id: 'avatar_ninja', name: 'Ninja', cost: 100, icon: '🥷' },
  { id: 'avatar_wizard', name: 'Sorcier', cost: 200, icon: '🧙' },
  { id: 'avatar_robot', name: 'Robot', cost: 500, icon: '🤖' },
];

interface ShopProps {
  onBack: () => void;
}

const Shop = ({ onBack }: ShopProps) => {
  const { styles } = useStyles();
  const { points, unlockedAvatars, currentAvatar, unlockAvatar, setCurrentAvatar } = useQuizzlyStore();

  const handleUnlock = (id: string, cost: number) => {
    if (unlockAvatar(id, cost)) {
      playSound('buy');
      message.success('Avatar débloqué avec succès !');
    } else {
      playSound('error');
      message.error("Points insuffisants !");
    }
  };

  const handleSelect = (id: string) => {
    setCurrentAvatar(id);
    message.success('Avatar équipé !');
  };

  return (
    <Card className={styles.card}>
      <Flexbox align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Flexbox align="center" gap={12}>
          <Button type="text" icon={<Icon icon={ArrowLeft} />} onClick={onBack} />
          <Icon icon={Store} size={{ fontSize: 24 }} />
          <Typography.Title level={3} style={{ margin: 0 }}>Boutique Quizzly</Typography.Title>
        </Flexbox>
        <Badge count={`${points} pts`} style={{ backgroundColor: '#faad14' }}>
          <Icon icon={Trophy} size={{ fontSize: 24 }} style={{ color: '#faad14' }} />
        </Badge>
      </Flexbox>

      <Typography.Title level={4}>Avatars</Typography.Title>
      <Row gutter={[16, 16]}>
        {SHOP_ITEMS.map(item => {
          const isUnlocked = unlockedAvatars.includes(item.id);
          const isSelected = currentAvatar === item.id;
          
          return (
            <Col span={6} key={item.id}>
              <div className={styles.itemCard} style={{ borderColor: isSelected ? '#1677ff' : '#f0f0f0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>{item.icon}</div>
                <Typography.Text strong>{item.name}</Typography.Text>
                <div style={{ margin: '12px 0' }}>
                  {isUnlocked ? (
                    <Typography.Text type="success"><Icon icon={Unlock} /> Débloqué</Typography.Text>
                  ) : (
                    <Typography.Text type="warning">{item.cost} pts <Icon icon={Lock} /></Typography.Text>
                  )}
                </div>
                <Button 
                  type={isSelected ? 'primary' : 'default'}
                  block 
                  onClick={() => isUnlocked ? handleSelect(item.id) : handleUnlock(item.id, item.cost)}
                  disabled={isSelected}
                >
                  {isSelected ? 'Équipé' : isUnlocked ? 'Équiper' : 'Acheter'}
                </Button>
              </div>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default Shop;
