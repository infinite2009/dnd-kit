import React from 'react';
import styles from './index.module.css';

export default function Item({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.label}>
      <span>{text}</span>
      {children}
    </div>
  );
}
