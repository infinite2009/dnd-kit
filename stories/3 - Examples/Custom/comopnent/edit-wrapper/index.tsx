import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

export interface IEditorProps {
  id: string;
  children: React.ReactNode;
}

export default function EditWrapper({id, children}: IEditorProps) {
  const {setNodeRef, listeners, attributes, transform, transition} =
    useSortable({
      id,
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };



  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
