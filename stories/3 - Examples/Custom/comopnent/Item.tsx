import React, {CSSProperties} from 'react';
import styles from './index.module.css';

export default function Item({
  text,
  children,
  direction
}: {
  text: string;
  children?: React.ReactNode;
  direction?: 'column' | 'row';
}) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: direction || 'column',
    flexWrap: 'wrap',
  }

  return (
    <div className={styles.label} style={style}>
      <span style={{ backgroundColor: '#f2f4cc'}}>{text}</span>
      {children}
    </div>
  );
}
