'use client';

import { Button, Card, Divider,Form, Select, Slider, Switch, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Bell, Cpu, GraduationCap, Star,Trophy } from 'lucide-react';
import { useState } from 'react';


const useStyles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    max-width: 720px;
  `,
  card: css`
    margin-bottom: 16px;
    border-radius: 12px;
  `,
  cardTitle: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 15px;
  `,
  formItem: css`
    margin-bottom: 16px;
  `,
  description: css`
    font-size: 12px;
    color: rgba(128, 128, 128, 0.8);
    margin-top: 4px;
  `,
  badge: css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-left: 8px;
  `,
}));

const AI_MODELS = [
  { label: 'GPT-5.5 (OpenAI)', value: 'gpt-5.5' },
  { label: 'GPT-4.5 Turbo (OpenAI)', value: 'gpt-4.5-turbo' },
  { label: 'Gemini 3.5 Flash (Google)', value: 'gemini-3.5-flash' },
  { label: 'Claude Sonnet 4 (Anthropic)', value: 'claude-sonnet-4' },
  { label: 'Qwen 3.7 Max (Alibaba)', value: 'qwen-3.7-max' },
];

const CLASS_LEVELS = [
  { label: '🏫 Primaire (CP – CM2)', value: 'primaire' },
  { label: '📚 Collège (6e – 3e)', value: 'college' },
  { label: '🎓 Lycée (2de – Terminale)', value: 'lycee' },
  { label: '🏛️ Université / Supérieur', value: 'universite' },
  { label: '💼 Professionnel', value: 'professionnel' },
];

const DIFFICULTY_MARKS = {
  1: '🟢 Facile',
  2: 'Moyen',
  3: '🔶 Difficile',
  4: '🔴 Expert',
};

const QUIZ_COUNT_MARKS = {
  5: '5',
  10: '10',
  15: '15',
  20: '20',
};

const QuizzlySettingsPage = () => {
  const { styles } = useStyles();
  const [defaultModel, setDefaultModel] = useState('gpt-5.5');
  const [notifications, setNotifications] = useState(true);
  const [classLevel, setClassLevel] = useState('college');
  const [difficulty, setDifficulty] = useState(2);
  const [quizCount, setQuizCount] = useState(10);
  const [showStreak, setShowStreak] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className={styles.container}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        <GraduationCap size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Paramètres Quizzly
        <span className={styles.badge}>OFFICIEL</span>
      </Typography.Title>
      <Typography.Text style={{ display: 'block', marginBottom: 24 }} type="secondary">
        Configurez votre expérience d&apos;apprentissage interactif avec l&apos;IA.
      </Typography.Text>

      {/* Bloc IA */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Cpu size={16} />
            Modèle d&apos;IA
          </div>
        }
      >
        <div className={styles.formItem}>
          <Form.Item label="Modèle par défaut" style={{ marginBottom: 0 }}>
            <Select
              options={AI_MODELS}
              placeholder="Choisir un modèle d'IA..."
              style={{ width: '100%' }}
              value={defaultModel}
              onChange={setDefaultModel}
            />
          </Form.Item>
          <p className={styles.description}>
            Ce modèle sera utilisé pour générer les questions de quiz et valider vos réponses.
          </p>
        </div>
      </Card>

      {/* Bloc Niveau */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Star size={16} />
            Niveau et Difficulté
          </div>
        }
      >
        <div className={styles.formItem}>
          <Form.Item label="Classe scolaire" style={{ marginBottom: 12 }}>
            <Select
              options={CLASS_LEVELS}
              style={{ width: '100%' }}
              value={classLevel}
              onChange={setClassLevel}
            />
          </Form.Item>
          <p className={styles.description}>
            Adapte la complexité du vocabulaire et des concepts abordés dans les quiz.
          </p>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className={styles.formItem}>
          <Form.Item label="Difficulté par défaut" style={{ marginBottom: 0 }}>
            <Slider
              marks={DIFFICULTY_MARKS}
              max={4}
              min={1}
              step={1}
              tooltip={{ formatter: (v) => DIFFICULTY_MARKS[v as keyof typeof DIFFICULTY_MARKS] }}
              value={difficulty}
              onChange={setDifficulty}
            />
          </Form.Item>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className={styles.formItem}>
          <Form.Item label="Nombre de questions par quiz" style={{ marginBottom: 0 }}>
            <Slider
              marks={QUIZ_COUNT_MARKS}
              max={20}
              min={5}
              step={5}
              value={quizCount}
              onChange={setQuizCount}
            />
          </Form.Item>
        </div>
      </Card>

      {/* Bloc Notifications */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Bell size={16} />
            Notifications et Interface
          </div>
        }
      >
        <Form.Item
          extra="Rappels pour maintenir votre série de quiz journalière."
          label="Notifications quotidiennes"
          style={{ marginBottom: 12 }}
        >
          <Switch checked={notifications} onChange={setNotifications} />
        </Form.Item>

        <Form.Item
          extra="Affichez votre progression journalière dans l'interface."
          label="Afficher le suivi de série (streak)"
          style={{ marginBottom: 12 }}
        >
          <Switch checked={showStreak} onChange={setShowStreak} />
        </Form.Item>

        <Form.Item
          extra="Activez les sons de réussite et d'erreur pendant les quiz."
          label="Effets sonores"
          style={{ marginBottom: 0 }}
        >
          <Switch checked={soundEffects} onChange={setSoundEffects} />
        </Form.Item>
      </Card>

      {/* Bloc Ligues */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Trophy size={16} />
            Ligues et Compétition
          </div>
        }
      >
        <Form.Item
          extra="Rejoindre automatiquement une ligue après chaque quiz complété."
          label="Participer aux ligues automatiquement"
          style={{ marginBottom: 12 }}
        >
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item
          extra="Recevez des mises à jour sur votre position dans la ligue."
          label="Afficher le classement dans les notifications"
          style={{ marginBottom: 0 }}
        >
          <Switch defaultChecked />
        </Form.Item>
      </Card>

      <Button size="large" style={{ width: '100%', borderRadius: 8, height: 44 }} type="primary">
        Enregistrer les paramètres
      </Button>
    </div>
  );
};

QuizzlySettingsPage.displayName = 'QuizzlySettingsPage';

export default QuizzlySettingsPage;
