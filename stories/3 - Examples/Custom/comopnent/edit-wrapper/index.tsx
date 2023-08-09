import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

export interface IEditorProps {
  id: string;
  childrenId?: string[];
  children: React.ReactNode;
}

export default function EditWrapper({id, childrenId, children}: IEditorProps) {
  const {isDragging, setNodeRef, listeners, attributes, transform, transition} =
    useSortable({
      id,
      data: {
        childrenId,
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    margin: '60px 20px',
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
