import { Icon } from '@lobehub/ui';
import { Alert, Badge, Button, Card, Col, Divider, Flex,message, Row, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, Lightbulb, Lock, Palette,Shield, Sparkles, Store, Trophy, Unlock } from 'lucide-react';

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
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
  `
}));

const SHOP_AVATARS = [
  { id: 'avatar_nerd', name: 'Nerd', cost: 50, icon: '🤓' },
  { id: 'avatar_ninja', name: 'Ninja', cost: 100, icon: '🥷' },
  { id: 'avatar_wizard', name: 'Sorcier', cost: 200, icon: '🧙' },
  { id: 'avatar_robot', name: 'Robot', cost: 500, icon: '🤖' },
];

const SHOP_ITEMS = [
  { id: 'item_shield', name: 'Bouclier de Streak', cost: 150, description: 'Sauve votre streak quotidienne si vous oubliez de faire un quiz.', icon: Shield, color: '#ff4d4f' },
  { id: 'item_multiplier', name: 'Multiplicateur x2', cost: 200, description: 'Double tous les points gagnés lors du prochain quiz.', icon: Sparkles, color: '#faad14' },
  { id: 'item_hint', name: 'Indice de Quiz', cost: 100, description: 'Vous permet d\'utiliser un indice pour éliminer de fausses options.', icon: Lightbulb, color: '#1890ff' },
];

const EXCLUSIVE_THEMES = [
  { id: 'theme_royal', name: 'Or Royal 👑', cost: 300, requiredStreak: 5, description: 'Un thème majestueux digne des rois de la culture générale.', previewColor: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)' },
  { id: 'theme_cyberpunk', name: 'Cyberpunk Néon 🌌', cost: 500, requiredStreak: 10, description: 'Plongez dans le futur avec des contrastes néons électriques.', previewColor: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
  { id: 'theme_cosmic', name: 'Sorcier Cosmique 🧙‍♂️', cost: 800, requiredStreak: 15, description: 'Explorez l\'infini du savoir parmi les étoiles.', previewColor: 'linear-gradient(135deg, #3f2b96 0%, #a8c0ff 100%)' },
];

interface ShopProps {
  onBack: () => void;
}

const Shop = ({ onBack }: ShopProps) => {
  const { styles } = useStyles();
  const { 
    points, 
    unlockedAvatars, 
    currentAvatar, 
    unlockAvatar, 
    setCurrentAvatar,
    buyItem,
    streakShields,
    pointMultipliers,
    hints,
    clan,
    unlockedThemes,
    currentTheme,
    buyTheme,
    selectTheme
  } = useQuizzlyStore();

  const clanStreak = clan ? clan.collectiveStreak : 0;

  const handleUnlockAvatar = (id: string, cost: number) => {
    if (unlockAvatar(id, cost)) {
      playSound('buy');
      message.success('Avatar débloqué avec succès !');
    } else {
      playSound('error');
      message.error("Points insuffisants !");
    }
  };

  const handleBuyItem = (id: string, cost: number) => {
    if (buyItem(id, cost)) {
      playSound('buy');
      message.success('Objet acheté avec succès !');
    } else {
      playSound('error');
      message.error("Points insuffisants !");
    }
  };

  const handleBuyTheme = async (id: string, cost: number, requiredStreak: number) => {
    if (clanStreak < requiredStreak) {
      message.error(`Série de clan insuffisante ! Requise : ${requiredStreak} jours.`);
      return;
    }
    const success = await buyTheme(id, cost, requiredStreak);
    if (success) {
      playSound('buy');
      message.success('Thème visuel débloqué !');
    } else {
      playSound('error');
      message.error('Achat impossible. Vérifiez vos points.');
    }
  };

  const handleSelectTheme = async (id: string) => {
    await selectTheme(id);
    message.success('Thème visuel appliqué avec succès !');
  };

  const handleSelectAvatar = (id: string) => {
    setCurrentAvatar(id);
    message.success('Avatar équipé !');
  };

  const getItemCount = (id: string) => {
    if (id === 'item_shield') return streakShields || 0;
    if (id === 'item_multiplier') return pointMultipliers || 0;
    if (id === 'item_hint') return hints || 0;
    return 0;
  };

  return (
    <Card className={styles.card}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <Button icon={<Icon icon={ArrowLeft} />} type="text" onClick={onBack} />
          <Icon icon={Store} size={{ fontSize: 24 }} />
          <Typography.Title level={3} style={{ margin: 0 }}>Boutique Quizzly</Typography.Title>
        </Flex>
        <Badge count={`${points} pts`} style={{ backgroundColor: '#faad14' }}>
          <Icon icon={Trophy} size={{ fontSize: 24 }} style={{ color: '#faad14' }} />
        </Badge>
      </Flex>

      {/* Section Objets/Power-ups */}
      <Typography.Title level={4} style={{ marginBottom: 16 }}>Objets & Boosters</Typography.Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {SHOP_ITEMS.map(item => {
          const count = getItemCount(item.id);
          return (
            <Col key={item.id} span={8}>
              <div className={styles.itemCard}>
                <Flex vertical align="center" gap={8} style={{ width: '100%' }}>
                  <Badge color="#52c41a" count={count} offset={[0, 5]}>
                    <div style={{ 
                      background: `${item.color}15`, 
                      padding: 16, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64
                    }}>
                      <Icon icon={item.icon} size={{ fontSize: 32 }} style={{ color: item.color }} />
                    </div>
                  </Badge>
                  <Typography.Text strong style={{ fontSize: '1.1rem', marginTop: 8 }}>{item.name}</Typography.Text>
                  <Typography.Paragraph style={{ fontSize: '0.85rem', height: 40, margin: '8px 0 0 0', textAlign: 'center' }} type="secondary">
                    {item.description}
                  </Typography.Paragraph>
                </Flex>
                
                <div style={{ marginTop: 16 }}>
                  <Typography.Paragraph strong style={{ color: '#faad14', margin: '0 0 12px 0', textAlign: 'center' }}>
                    {item.cost} pts
                  </Typography.Paragraph>
                  <Button 
                    block
                    disabled={points < item.cost} 
                    type="primary"
                    onClick={() => handleBuyItem(item.id, item.cost)}
                  >
                    Acheter
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <Divider />

      {/* Section Thèmes Cosmétiques Exclusifs de Clan */}
      <Typography.Title level={4} style={{ marginBottom: 8 }}><Icon icon={Palette} style={{ marginRight: 8 }} /> Thèmes Visuels de Clan Exclusifs</Typography.Title>
      <Typography.Paragraph style={{ marginBottom: 16 }} type="secondary">
        Débloquez ces thèmes uniques uniquement en augmentant la série (streak) de votre clan ! Série de clan actuelle : <strong>{clanStreak} jours</strong>.
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {EXCLUSIVE_THEMES.map(theme => {
          const isUnlocked = unlockedThemes.includes(theme.id);
          const isSelected = currentTheme === theme.id;
          const isStreakLocked = clanStreak < theme.requiredStreak;

          return (
            <Col key={theme.id} span={8}>
              <div className={styles.itemCard} style={{ borderColor: isSelected ? '#52c41a' : '#f0f0f0' }}>
                <Flex vertical align="center" gap={8}>
                  <div style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 8,
                    background: theme.previewColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                  }}>
                    Preview
                  </div>
                  <Typography.Text strong style={{ fontSize: '1rem', marginTop: 8 }}>{theme.name}</Typography.Text>
                  <Typography.Paragraph style={{ fontSize: '0.8rem', height: 40, margin: '4px 0 0 0', textAlign: 'center' }} type="secondary">
                    {theme.description}
                  </Typography.Paragraph>
                </Flex>

                <div style={{ marginTop: 16 }}>
                  {isStreakLocked && !isUnlocked ? (
                    <Alert 
                      showIcon 
                      message={`Série de clan ${theme.requiredStreak}j requise`} 
                      style={{ padding: '4px 8px', fontSize: '0.75rem', marginBottom: 12 }} 
                      type="warning" 
                    />
                  ) : (
                    <Typography.Paragraph strong style={{ color: '#faad14', margin: '0 0 12px 0', textAlign: 'center' }}>
                      {isUnlocked ? 'Débloqué' : `${theme.cost} pts`}
                    </Typography.Paragraph>
                  )}
                  
                  <Button
                    block
                    disabled={isSelected || (isStreakLocked && !isUnlocked)}
                    type={isSelected ? 'primary' : 'default'}
                    onClick={() => isUnlocked ? handleSelectTheme(theme.id) : handleBuyTheme(theme.id, theme.cost, theme.requiredStreak)}
                  >
                    {isSelected ? 'Appliqué' : isUnlocked ? 'Appliquer' : 'Acheter'}
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <Divider />

      {/* Section Avatars */}
      <Typography.Title level={4} style={{ marginBottom: 16 }}>Avatars de profil</Typography.Title>
      <Row gutter={[16, 16]}>
        {SHOP_AVATARS.map(item => {
          const isUnlocked = unlockedAvatars.includes(item.id);
          const isSelected = currentAvatar === item.id;
          
          return (
            <Col key={item.id} span={6}>
              <div className={styles.itemCard} style={{ borderColor: isSelected ? '#1677ff' : '#f0f0f0' }}>
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: 8 }}>{item.icon}</div>
                  <Typography.Text strong>{item.name}</Typography.Text>
                </div>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ margin: '12px 0' }}>
                    {isUnlocked ? (
                      <Typography.Text type="success"><Icon icon={Unlock} /> Débloqué</Typography.Text>
                    ) : (
                      <Typography.Text type="warning">{item.cost} pts <Icon icon={Lock} /></Typography.Text>
                    )}
                  </div>
                  <Button 
                    block
                    disabled={isSelected} 
                    type={isSelected ? 'primary' : 'default'}
                    onClick={() => isUnlocked ? handleSelectAvatar(item.id) : handleUnlockAvatar(item.id, item.cost)}
                  >
                    {isSelected ? 'Équipé' : isUnlocked ? 'Équiper' : 'Acheter'}
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default Shop;
