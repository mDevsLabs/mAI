'use client';

import { Card, Switch, Typography, Button, Modal, message, Divider, Collapse, Table, Tag, Slider } from 'antd';
import { useTheme } from 'antd-style';
import { Settings, RefreshCw, HelpCircle, Bell, Sparkles, Power, ShieldAlert, Volume2 } from 'lucide-react';
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
      message.success('Progression réinitialisée avec succès !');
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
      <SettingHeader title={
        <Flexbox horizontal align="center" gap={8}>
          <Settings size={24} color={theme.colorPrimary} />
          <span>Configuration</span>
        </Flexbox>
      } />
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

            <Divider style={{ margin: '8px 0' }} />

            {/* Activer les effets sonores */}
            <Flexbox horizontal justify="space-between" align="center">
              <Flexbox gap={4} style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  <Volume2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Effets sonores
                </Text>
                <Text type="secondary" style={{ fontSize: 12, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  Joue de subtils effets sonores rétro et cristallins (carillons, harpe) lors des accomplissements.
                </Text>
              </Flexbox>
              <Switch
                disabled={!settings.enableGamification}
                checked={settings.enableSoundEffects}
                onChange={(checked) => updateSettings({ enableSoundEffects: checked })}
              />
            </Flexbox>

            {settings.enableSoundEffects && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <Flexbox horizontal justify="space-between" align="center">
                  <Flexbox gap={4} style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 15, opacity: settings.enableGamification ? 1 : 0.5 }}>
                      Volume des effets sonores
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, opacity: settings.enableGamification ? 1 : 0.5 }}>
                      Ajustez la puissance sonore des récompenses.
                    </Text>
                  </Flexbox>
                  <div style={{ width: 120 }}>
                    <Slider
                      disabled={!settings.enableGamification || !settings.enableSoundEffects}
                      min={0}
                      max={100}
                      value={Math.round((settings.soundVolume ?? 0.7) * 100)}
                      onChange={(val) => updateSettings({ soundVolume: val / 100 })}
                      tooltip={{ formatter: (v) => `${v}%` }}
                    />
                  </div>
                </Flexbox>
              </>
            )}

            <Divider style={{ margin: '8px 0' }} />

            {/* Activer les animations de badges */}
            <Flexbox horizontal justify="space-between" align="center">
              <Flexbox gap={4} style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  <Sparkles size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Animations des badges
                </Text>
                <Text type="secondary" style={{ fontSize: 12, opacity: settings.enableGamification ? 1 : 0.5 }}>
                  Active les reflets brillants, paillettes et effets animés premium sur les badges de rareté exceptionnelle.
                </Text>
              </Flexbox>
              <Switch
                disabled={!settings.enableGamification}
                checked={settings.showBadgeAnimations ?? true}
                onChange={(checked) => updateSettings({ showBadgeAnimations: checked })}
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

        {/* Guide des Quêtes */}
        <Card title={<><HelpCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Guide des Quêtes</>} bordered={false} style={{ borderRadius: 12 }}>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Découvrez comment fonctionnent les quêtes au sein de l'application mAI et optimisez vos gains d'expérience !
          </Paragraph>
          
          <Collapse ghost defaultActiveKey={['quests-info']}>
            <Panel header="Fonctionnement et Rotation des Quêtes" key="quests-info">
              <Flexbox gap={12}>
                <div>
                  <Tag color="cyan">Quêtes Journalières</Tag>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Chaque jour à <strong>minuit CET</strong>, vous recevez <strong>3 nouvelles quêtes quotidiennes</strong>. Chaque quête quotidienne complétée vous rapporte un montant fixe de <strong>20 XP</strong>.
                    </Text>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple">Quêtes Hebdomadaires</Tag>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Chaque lundi à <strong>minuit CET</strong>, vous obtenez <strong>5 quêtes hebdomadaires</strong> plus complexes qui récompensent votre assiduité. L'XP gagnée dépend de leur difficulté :
                    </Text>
                  </div>
                  <div style={{ marginTop: 6, paddingLeft: 12 }}>
                    <ul>
                      <li><Text type="secondary" style={{ fontSize: 13 }}><strong>Facile</strong> : 50 XP</Text></li>
                      <li><Text type="secondary" style={{ fontSize: 13 }}><strong>Normal</strong> : 75 XP</Text></li>
                      <li><Text type="secondary" style={{ fontSize: 13 }}><strong>Difficile</strong> : 100 XP</Text></li>
                      <li><Text type="secondary" style={{ fontSize: 13 }}><strong>Élite</strong> : 150 XP</Text></li>
                      <li><Text type="secondary" style={{ fontSize: 13 }}><strong>Légendaire</strong> : 250 XP</Text></li>
                    </ul>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">Système Anti-Répétition</Tag>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Pour garder le jeu dynamique, notre algorithme intelligent s'assure qu'une quête quotidienne ne peut pas vous être réattribuée pendant <strong>30 jours</strong>, et qu'une quête hebdomadaire ne peut pas revenir avant <strong>8 semaines</strong> !
                    </Text>
                  </div>
                </div>
              </Flexbox>
            </Panel>
            
            <Panel header="Guide des Raretés et Catégories" key="quests-rarity">
              <Flexbox gap={12}>
                <div>
                  <Text strong>Tags & Raretés :</Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag color="red">Légendaire</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Quête à haut rendement extrêmement difficile ou longue.</Text>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Tag color="gold">Secret</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Quête masquée dont l'objectif se débloque en effectuant des actions mystères.</Text>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text strong>Catégories d'activités :</Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag>Message</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Discussions avec l'IA et interactions linguistiques.</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag>Agent</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Conception et gestion d'agents personnalisés.</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag>Tâche</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Planification et productivité.</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag>Exploration</Tag> <Text type="secondary" style={{ fontSize: 12 }}>Découverte des fonctionnalités et plugins.</Text>
                  </div>
                </div>
              </Flexbox>
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
        title={
          <Flexbox horizontal align="center" gap={8}>
            <ShieldAlert size={20} color={theme.colorError} />
            <span>Confirmer la réinitialisation</span>
          </Flexbox>
        }
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
