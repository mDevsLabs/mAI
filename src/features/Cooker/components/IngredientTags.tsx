'use client';

import { Input, Tag } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface IngredientTagsProps {
  color?: string;
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  tags: string[];
}

const useStyles = createStaticStyles(({ css }) => ({
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  `,
  inputRow: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  input: css`
    flex: 1;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    color: white !important;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4) !important;
    }

    &:focus {
      border-color: rgba(210, 105, 30, 0.7) !important;
      box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.2) !important;
    }
  `,
  addBtn: css`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #D2691E, #8B4513);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.4);

    &:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(210, 105, 30, 0.6);
    }

    &:active {
      transform: scale(0.95);
    }
  `,
  tagsContainer: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 16px;
  `,
  tag: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.82rem;
    font-weight: 600;
    border: none !important;
    cursor: default;
    transition: all 0.2s ease;

    &:hover {
      filter: brightness(1.1);
    }
  `,
  removeBtn: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.15s;
    margin-left: 2px;

    &:hover {
      opacity: 1;
    }
  `,
}));

const IngredientTags = ({
  tags,
  onAdd,
  onRemove,
  placeholder = 'Ajouter un ingrédient...',
  color = '#D2691E',
}: IngredientTagsProps) => {
  const { styles } = useStyles();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <Input
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.addBtn} style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }} onClick={handleAdd}>
          <Plus size={16} />
        </button>
      </div>
      <div className={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <Tag
            className={styles.tag}
            key={index}
            style={{
              background: `linear-gradient(135deg, ${color}33, ${color}55)`,
              color,
              border: `1px solid ${color}66`,
            }}
          >
            {tag}
            <span
              className={styles.removeBtn}
              onClick={() => onRemove(index)}
            >
              <X size={12} />
            </span>
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default IngredientTags;
