import { Icon } from '@lobehub/ui';
import { Button, Card, Flex,Form, Input, Select, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft,Settings } from 'lucide-react';

import { useQuizzlyStore } from '../store/useQuizzlyStore';

const styles = createStaticStyles(({ css }) => ({
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
  onBack: () => void;
  onStart: (config: { count: number; level: string; topic: string }) => void;
}

const Setup = ({ onStart, onBack }: SetupProps) => {
  const apiKey = useQuizzlyStore((s) => s.apiKey);
  const setApiKey = useQuizzlyStore((s) => s.setApiKey);

  const [form] = Form.useForm();

  return (
    <Card className={styles.card}>
      <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
        <Button icon={<Icon icon={ArrowLeft} />} type="text" onClick={onBack} />
        <Icon icon={Settings} size={{ fontSize: 24 }} />
        <Typography.Title level={3} style={{ margin: 0 }}>Configuration du Quiz</Typography.Title>
      </Flex>

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
        <Form.Item extra="La clé est stockée localement sur votre navigateur." label="Clé API OpenAI (Optionnel pour tester l'IA réelle)">
          <Input.Password 
            placeholder="sk-..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </Form.Item>

        <Form.Item label="Nombre de questions" name="count">
          <Select options={[
            { value: 3, label: '3 questions (Rapide)' },
            { value: 5, label: '5 questions (Classique)' },
            { value: 10, label: '10 questions (Défi)' }
          ]} />
        </Form.Item>

        <Form.Item label="Niveau Scolaire" name="level">
          <Select options={[
            { value: 'Primaire', label: 'Primaire' },
            { value: 'Collège', label: 'Collège' },
            { value: 'Lycée', label: 'Lycée' },
            { value: 'Supérieur', label: 'Supérieur' }
          ]} />
        </Form.Item>

        <Form.Item label="Thème ou Matière" name="topic">
          <Input placeholder="Ex: Histoire de France, Mathématiques, Géographie..." />
        </Form.Item>

        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
          <Button block htmlType="submit" size="large" style={{ height: 50, fontSize: '1.2rem' }} type="primary">
            Lancer le Quiz !
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Setup;
