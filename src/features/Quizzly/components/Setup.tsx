import { Button, Card, Form, Input, Select, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Settings, ArrowLeft } from 'lucide-react';
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

interface SetupProps {
  onStart: (config: { count: number; level: string; topic: string }) => void;
  onBack: () => void;
}

const Setup = ({ onStart, onBack }: SetupProps) => {
  const { styles } = useStyles();
  const apiKey = useQuizzlyStore((s) => s.apiKey);
  const setApiKey = useQuizzlyStore((s) => s.setApiKey);

  const [form] = Form.useForm();

  return (
    <Card className={styles.card}>
      <Flexbox align="center" gap={12} style={{ marginBottom: 24 }}>
        <Button type="text" icon={<Icon icon={ArrowLeft} />} onClick={onBack} />
        <Icon icon={Settings} size={{ fontSize: 24 }} />
        <Typography.Title level={3} style={{ margin: 0 }}>Configuration du Quiz</Typography.Title>
      </Flexbox>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          count: 5,
          level: 'Collège',
          topic: 'Culture Générale'
        }}
        onFinish={onStart}
      >
        <Form.Item label="Clé API OpenAI (Optionnel pour tester l'IA réelle)" extra="La clé est stockée localement sur votre navigateur.">
          <Input.Password 
            placeholder="sk-..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </Form.Item>

        <Form.Item name="count" label="Nombre de questions">
          <Select options={[
            { value: 3, label: '3 questions (Rapide)' },
            { value: 5, label: '5 questions (Classique)' },
            { value: 10, label: '10 questions (Défi)' }
          ]} />
        </Form.Item>

        <Form.Item name="level" label="Niveau Scolaire">
          <Select options={[
            { value: 'Primaire', label: 'Primaire' },
            { value: 'Collège', label: 'Collège' },
            { value: 'Lycée', label: 'Lycée' },
            { value: 'Supérieur', label: 'Supérieur' }
          ]} />
        </Form.Item>

        <Form.Item name="topic" label="Thème ou Matière">
          <Input placeholder="Ex: Histoire de France, Mathématiques, Géographie..." />
        </Form.Item>

        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" size="large" block style={{ height: 50, fontSize: '1.2rem' }}>
            Lancer le Quiz !
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Setup;
