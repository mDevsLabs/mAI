import { Icon } from '@lobehub/ui';
import { Badge, Button, Card, Divider, Flex,Input, List, message, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, LogOut, Play, Plus,Users } from 'lucide-react';
import { useEffect,useState } from 'react';

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
  clanItem: css`
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #f0f0f0;
    margin-bottom: 12px;
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: #1677ff;
    }
  `,
  memberBox: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    margin-bottom: 8px;
  `
}));

interface ClansProps {
  onBack: () => void;
}

const Clans = ({ onBack }: ClansProps) => {
  const { styles } = useStyles();
  const { 
    clan, 
    availableClans, 
    createClan, 
    joinClan, 
    leaveClan, 
    simulateClanActivity,
    syncWithServer
  } = useQuizzlyStore();
  
  const [newClanName, setNewClanName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncWithServer();
  }, []);

  const handleCreate = async () => {
    if (!newClanName.trim()) {
      message.error('Veuillez entrer un nom de clan.');
      return;
    }
    setLoading(true);
    await createClan(newClanName);
    message.success(`Clan "${newClanName}" créé en ligne avec succès ! 🎉`);
    setNewClanName('');
    setLoading(false);
  };

  const handleJoin = async (id: string, name: string) => {
    setLoading(true);
    await joinClan(id);
    message.success(`Vous avez rejoint le clan "${name}" ! ⚡`);
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    await leaveClan();
    message.info('Vous avez quitté le clan.');
    setLoading(false);
  };

  const handleSimulateOthers = async () => {
    setLoading(true);
    await simulateClanActivity();
    message.success("Activité du clan synchronisée et simulée en ligne ! 🚀");
    setLoading(false);
  };

  return (
    <Card className={styles.card}>
      <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
        <Button icon={<Icon icon={ArrowLeft} />} type="text" onClick={onBack} />
        <Icon icon={Users} size={{ fontSize: 24 }} />
        <Typography.Title level={3} style={{ margin: 0 }}>Clans & Défis Collectifs (Réseau)</Typography.Title>
      </Flex>

      {clan ? (
        <div>
          <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>{clan.name}</Typography.Title>
              <Typography.Text type="secondary">Série Collective : {clan.collectiveStreak} jours</Typography.Text>
            </div>
            <Badge color="#ff4d4f" count={`${clan.collectiveStreak} 🔥`} />
          </Flex>

          <Typography.Paragraph>
            Si tous les membres du clan complètent un quiz aujourd'hui, la streak collective et votre série personnelle augmentent de 1 jour !
          </Typography.Paragraph>

          <Divider style={{ margin: '12px 0' }} />

          <Typography.Title level={5} style={{ marginBottom: 12 }}>Membres du clan :</Typography.Title>
          <div>
            {clan.members.map((member) => (
              <div className={styles.memberBox} key={member.id}>
                <Flex align="center" gap={12}>
                  <span style={{ fontSize: '1.8rem' }}>{member.avatar}</span>
                  <div>
                    <Typography.Text strong>{member.name}</Typography.Text>
                    <div>
                      <Typography.Text style={{ fontSize: '0.8rem' }} type="secondary">
                        Streak: {member.streak} jours
                      </Typography.Text>
                    </div>
                  </div>
                </Flex>
                <Badge 
                  status={member.hasPlayedToday ? 'success' : 'default'} 
                  text={member.hasPlayedToday ? 'Quiz Fait' : 'En attente'} 
                />
              </div>
            ))}
          </div>

          <Divider />

          <Flex vertical gap={12}>
            {clan.members.some(m => !m.hasPlayedToday) && (
              <Button block icon={<Icon icon={Play} />} loading={loading} type="dashed" onClick={handleSimulateOthers}>
                Simuler l'activité du clan (Test Réseau)
              </Button>
            )}
            <Button block danger icon={<Icon icon={LogOut} />} loading={loading} type="primary" onClick={handleLeave}>
              Quitter le Clan
            </Button>
          </Flex>
        </div>
      ) : (
        <div>
          <Typography.Paragraph>
            Rejoignez un clan ou créez-en un nouveau pour participer aux streaks collectives et progresser ensemble en réseau !
          </Typography.Paragraph>

          <Card size="small" style={{ marginBottom: 24, background: '#fcfcfc' }} title="Créer un Clan">
            <Flex gap={12}>
              <Input 
                placeholder="Nom du clan (ex: Les Rois du Quiz)" 
                value={newClanName}
                onChange={(e) => setNewClanName(e.target.value)}
              />
              <Button icon={<Icon icon={Plus} />} loading={loading} type="primary" onClick={handleCreate}>
                Créer
              </Button>
            </Flex>
          </Card>

          <Typography.Title level={5} style={{ marginBottom: 12 }}>Clans disponibles :</Typography.Title>
          <List
            dataSource={availableClans}
            loading={loading}
            renderItem={(c) => (
              <div className={styles.clanItem} key={c.id}>
                <Flex align="center" justify="space-between">
                  <div>
                    <Typography.Title level={5} style={{ margin: '0 0 4px 0' }}>{c.name}</Typography.Title>
                    <Typography.Text type="secondary">
                      Membres: {c.members.length} • Streak: {c.collectiveStreak} jours
                    </Typography.Text>
                  </div>
                  <Button ghost loading={loading} type="primary" onClick={() => handleJoin(c.id, c.name)}>
                    Rejoindre
                  </Button>
                </Flex>
              </div>
            )}
          />
        </div>
      )}
    </Card>
  );
};

export default Clans;
