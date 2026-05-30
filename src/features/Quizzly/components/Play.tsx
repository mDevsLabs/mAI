import { Icon } from '@lobehub/ui';
import { Button, Card, Typography, Spin, Radio, Space, message, Progress, Badge, Flex } from 'antd';
import { createStaticStyles } from 'antd-style';
import { CheckCircle2, XCircle, Lightbulb, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { generateQuiz } from '../services/api';
import { useQuizzlyStore } from '../store/useQuizzlyStore';
import { playSound } from '../utils/sound';

const useStyles = createStaticStyles(({ css }) => ({
  card: css`
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    width: 600px;
    max-width: 90vw;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  `,
  question: css`
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    margin-bottom: 24px !important;
  `,
  option: css`
    font-size: 1.1rem;
    padding: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    width: 100%;
    margin-bottom: 12px;
    transition: all 0.2s;
    
    &:hover {
      background: #f0f0f0;
    }
  `,
  progressContainer: css`
    margin-bottom: 24px;
  `
}));

interface PlayProps {
  config: { count: number; level: string; topic: string };
  onFinish: () => void;
}

const Play = ({ config, onFinish }: PlayProps) => {
  const { styles } = useStyles();
  const apiKey = useQuizzlyStore(s => s.apiKey);
  const addPoints = useQuizzlyStore(s => s.addPoints);
  const hints = useQuizzlyStore(s => s.hints);
  const useHintStore = useQuizzlyStore(s => s.useHint);
  const pointMultipliers = useQuizzlyStore(s => s.pointMultipliers);
  const completeQuiz = useQuizzlyStore(s => s.completeQuiz);
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [animateState, setAnimateState] = useState<'idle' | 'success' | 'error'>('idle');
  
  // États de Boosters
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hasUsedHintThisQuestion, setHasUsedHintThisQuestion] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const data = await generateQuiz({ ...config, apiKey });
      setQuestions(data);
    } catch (e) {
      message.error("Erreur lors de la génération du quiz");
      onFinish();
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = () => {
    if (hints <= 0) {
      message.warning("Vous n'avez pas d'indices ! Achetez-en dans la boutique.");
      return;
    }
    if (hasAnswered) return;
    if (hasUsedHintThisQuestion) return;

    const currentQ = questions[currentIndex];
    const incorrectIndices = currentQ.options
      .map((_: any, idx: number) => idx)
      .filter((idx: number) => idx !== currentQ.answer);
    
    // Choisir 2 options incorrectes au hasard à cacher
    const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, 2);
    
    if (useHintStore()) {
      setHiddenOptions(toHide);
      setHasUsedHintThisQuestion(true);
      playSound('buy');
      message.success("L'IA a éliminé deux mauvaises réponses ! 💡");
    }
  };

  const handleActivateMultiplier = () => {
    if (pointMultipliers <= 0) {
      message.warning("Aucun multiplicateur disponible !");
      return;
    }
    if (isMultiplierActive) return;
    
    // Déduire un multiplicateur du store
    useQuizzlyStore.setState((state) => ({
      pointMultipliers: (state.pointMultipliers || 1) - 1
    }));
    setIsMultiplierActive(true);
    playSound('buy');
    message.success("Multiplicateur x2 activé pour ce quiz ! ⚡");
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setHasAnswered(true);
    const currentQ = questions[currentIndex];
    
    if (selectedAnswer === currentQ.answer) {
      setScore(s => s + 1);
      setAnimateState('success');
      playSound('success');
      message.success("Bonne réponse ! 🎉");
      
      const basePoints = 10;
      const finalPoints = isMultiplierActive ? basePoints * 2 : basePoints;
      addPoints(finalPoints);
    } else {
      setAnimateState('error');
      playSound('error');
      message.error("Mauvaise réponse... 😢");
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnimateState('idle');
      setHiddenOptions([]);
      setHasUsedHintThisQuestion(false);
    } else {
      message.success(`Quiz terminé ! Score final: ${score}/${questions.length}`);
      await completeQuiz(questions.length, score);
      onFinish();
    }
  };

  if (loading) {
    return (
      <Card className={styles.card}>
        <Flex vertical align="center" justify="center" style={{ height: 300 }} gap={16}>
          <Spin size="large" />
          <Typography.Text>L'IA prépare tes questions sur {config.topic}...</Typography.Text>
        </Flex>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <Card className={styles.card}>
      <div className={styles.progressContainer}>
        <Progress percent={Math.round((currentIndex / questions.length) * 100)} showInfo={false} strokeColor="#1677ff" />
        <Flex justify="space-between" style={{ marginTop: 8 }}>
          <Typography.Text type="secondary">Question {currentIndex + 1}/{questions.length}</Typography.Text>
          <Typography.Text type="secondary">Score: {score}</Typography.Text>
        </Flex>
      </div>

      {/* Barre de Boosters tactiques */}
      <Flex justify="space-between" align="center" style={{ background: 'rgba(0,0,0,0.03)', padding: '8px 16px', borderRadius: 8, marginBottom: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: '0.85rem' }}>Boosters :</Typography.Text>
        <Space>
          <Badge count={hints} size="small">
            <Button 
              size="small" 
              icon={<Icon icon={Lightbulb} />} 
              onClick={handleUseHint}
              disabled={hasAnswered || hasUsedHintThisQuestion || hints <= 0}
            >
              Indice
            </Button>
          </Badge>
          <Badge count={pointMultipliers} size="small">
            <Button 
              size="small" 
              type={isMultiplierActive ? 'primary' : 'default'} 
              icon={<Icon icon={Sparkles} />}
              onClick={handleActivateMultiplier}
              disabled={isMultiplierActive || pointMultipliers <= 0}
            >
              x2 Points
            </Button>
          </Badge>
        </Space>
      </Flex>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: 1, 
            x: animateState === 'error' ? [-10, 10, -10, 10, 0] : 0 
          }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Flex vertical padding={16}>
            <Typography.Title level={3} className={styles.question}>
              {currentQ.question}
            </Typography.Title>
            
            <Radio.Group 
              onChange={(e) => setSelectedAnswer(e.target.value)} 
              value={selectedAnswer}
              disabled={hasAnswered}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQ.options.map((opt: string, idx: number) => {
                  if (hiddenOptions.includes(idx)) return null;
                  
                  return (
                    <Radio key={idx} value={idx} className={styles.option}>
                      {opt}
                      {hasAnswered && idx === currentQ.answer && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'inline-block', marginLeft: 8 }}>
                          <Icon icon={CheckCircle2} style={{ color: 'green' }} />
                        </motion.span>
                      )}
                      {hasAnswered && selectedAnswer === idx && idx !== currentQ.answer && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'inline-block', marginLeft: 8 }}>
                          <Icon icon={XCircle} style={{ color: 'red' }} />
                        </motion.span>
                      )}
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>

            <Flex justify="flex-end" style={{ marginTop: 32 }} gap={12}>
              {hasAnswered ? (
                <Button type="primary" size="large" onClick={nextQuestion}>
                  {currentIndex < questions.length - 1 ? 'Question Suivante' : 'Terminer'}
                </Button>
              ) : (
                <Button type="primary" size="large" onClick={handleSubmit} disabled={selectedAnswer === null}>
                  Valider
                </Button>
              )}
            </Flex>
          </Flex>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default Play;
