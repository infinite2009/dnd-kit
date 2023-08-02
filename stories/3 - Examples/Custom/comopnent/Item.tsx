import React from 'react';
import styles from './index.module.css';

export default function Item({text}: {text: string}) {
  return (
    <div className={styles.label}>
      <span>{text}</span>
    </div>
  );
}
