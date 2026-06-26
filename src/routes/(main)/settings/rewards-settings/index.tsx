'use client';

import { Card, Switch, Typography, Button, Modal, message, Divider, Collapse, Table } from 'antd';
import { useTheme } from 'antd-style';
import { Settings, RefreshCw, HelpCircle, Bell, Sparkles, Power, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from '@lobehub/ui';

import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { useGamificationStore } from '@/store/gamification';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SettingsPage = () => {
  const theme = useTheme();
  const {
    settings,
    updateSettings,
    resetProgression,
    loading,
  } = useGamificationStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleReset = async () => {
    try {
      await resetProgression();
      message.success('Progression réinitialisée avec succès ! ✨');
      setIsResetModalOpen(false);
    } catch (error) {
      message.error('Erreur lors de la réinitialisation de la progression.');
    }
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Gain XP',
      dataIndex: 'xp',
      key: 'xp',
      render: (xp: number) => <Tag color="blue">+{xp} XP</Tag>
    },
    {
      title: 'Limite',
      dataIndex: 'limit',
      key: 'limit',
    }
  ];

  const rulesData = [
    {
      key: '1',
      action: 'Message IA réussi',
      xp: 5,
      limit: 'Aucune'
    },
    {
      key: '2',
      action: 'Création d\'une tâche',
      xp: 15,
      limit: 'Aucune'
    },
    {
      key: '3',
      action: 'Création d\'un agent',
      xp: 20,
      limit: 'Aucune'
    },
    {
      key: '4',
      action: 'Compagnon modifié/activé',
      xp: 10,
      limit: 'Max 5 par jour'
    },
    {
      key: '5',
      action: 'Quêtes quotidiennes toutes complétées',
      xp: 100,
      limit: '1 fois par jour'
    }
  ];

  return (
    <>
      <SettingHeader title="Configuration ⚙️" />
      <Flexbox gap={24} style={{ width: '100%' }}>
        {/* Paramètres d'activation */}
        <Card title={<><Settings size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Préférences</>} bordered={false} style={{ borderRadius: 12 }}>
          <Flexbox gap={20}>
            {/* Activer/Désactiver la gamification */}
            <Flexbox horizontal justify="space-between" align="center">
              <Flexbox gap={4} style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15 }}>
                  <Power size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Activer le système de récompenses
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Active ou désactive entièrement le gain d'XP, les quêtes, les badges et la progression de niveau.
                </Text>
              </Flexbox>
              <Switch
                checked={settings.enableGamification}
                onChange={(checked) => updateSettings({ enableGamification: checked })}
              />
            </Flexbox>

            <Divider style={{ margin: '8px 0' }} />

            {/* Activer les toasts */}
            <Flexbox horizontal justify="space-between" align="center">
              <Flexbox gap={4} style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  <Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Notifications à l'écran (Toasts)
                </Text>
                <Text type="secondary" style={{ fontSize: 12, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  Affiche un toast ou un popup de succès à chaque passage de niveau ou déblocage de badge.
                </Text>
              </Flexbox>
              <Switch
                disabled={!settings.enableGamification}
                checked={settings.enableToasts}
                onChange={(checked) => updateSettings({ enableToasts: checked })}
              />
            </Flexbox>

            <Divider style={{ margin: '8px 0' }} />

            {/* Activer les confettis */}
            <Flexbox horizontal justify="space-between" align="center">
              <Flexbox gap={4} style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  <Sparkles size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Célébrations & Confettis
                </Text>
                <Text type="secondary" style={{ fontSize: 12, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  Déclenche une pluie festive de confettis lors des accomplissements ou des réclamations de quêtes.
                </Text>
              </Flexbox>
              <Switch
                disabled={!settings.enableGamification}
                checked={settings.enableConfetti}
                onChange={(checked) => updateSettings({ enableConfetti: checked })}
              />
            </Flexbox>
          </Flexbox>
        </Card>

        {/* Règles de gain d'XP */}
        <Card title={<><HelpCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Guide d'obtention de l'XP</>} bordered={false} style={{ borderRadius: 12 }}>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Voici les règles standardisées de notre barème d'XP pour progresser dans LobeHub. Vos actions récurrentes vous permettent d'accumuler de la puissance !
          </Paragraph>
          <Table
            dataSource={rulesData}
            columns={columns}
            pagination={false}
            size="small"
            style={{ marginBottom: 16 }}
          />
          <Collapse ghost>
            <Panel header="En savoir plus sur les paliers de progression" key="1">
              <Text type="secondary" style={{ fontSize: 13 }}>
                Chaque niveau requiert exactement 100 XP multiplié par votre niveau actuel (par exemple, le passage du niveau 1 au niveau 2 requiert 100 XP, du niveau 2 au 3 requiert 200 XP). Atteindre les niveaux 10, 20 et 30 débloque des célébrations exclusives !
              </Text>
            </Panel>
          </Collapse>
        </Card>

        {/* Zone de Danger (Reset) */}
        <Card
          title={<><ShieldAlert size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Zone de Danger</>}
          bordered
          style={{
            borderColor: theme.colorErrorBorder,
            background: `${theme.colorErrorBg}1a`,
            borderRadius: 12
          }}
        >
          <Flexbox gap={16}>
            <Text type="danger" strong>
              Réinitialiser l'intégralité de la progression de gamification
            </Text>
            <Paragraph style={{ fontSize: 12, margin: 0 }}>
              Cette action supprimera de façon irréversible votre XP cumulée, votre niveau actuel, ainsi que tous vos badges débloqués et l'historique de vos quêtes complétées.
            </Paragraph>
            <div>
              <Button
                type="primary"
                danger
                onClick={() => setIsResetModalOpen(true)}
                icon={<RefreshCw size={14} />}
                loading={loading}
              >
                Réinitialiser ma progression
              </Button>
            </div>
          </Flexbox>
        </Card>
      </Flexbox>

      {/* Modale de confirmation de réinitialisation */}
      <Modal
        title="⚠️ Confirmer la réinitialisation"
        open={isResetModalOpen}
        onOk={handleReset}
        onCancel={() => setIsResetModalOpen(false)}
        okText="Oui, tout réinitialiser"
        cancelText="Annuler"
        okButtonProps={{ danger: true, loading }}
        centered
      >
        <Paragraph style={{ marginTop: 12 }}>
          Êtes-vous absolument sûr de vouloir réinitialiser vos récompenses ? 
        </Paragraph>
        <Paragraph type="danger" strong>
          Cette action est définitive et toutes vos données de gamification seront perdues.
        </Paragraph>
      </Modal>
    </>
  );
};

export default SettingsPage;
