import { closestCenter, closestCorners, DndContext, MeasuringStrategy, rectIntersection } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import React, {useMemo} from 'react';
import DraggableContainer from './comopnent/draggable-container';
import SortableItem from './comopnent/sortable-item';
import Item from './comopnent/Item';
import EditWrapper from './comopnent/edit-wrapper';

export default {
  title: 'Examples/Custom/Custom',
};

const data: {[key: string]: string[]} = {
  A: ['A1', 'A2', 'A3'],
  B: ['B1', 'B2', 'B3'],
  C: ['C1', 'C2', 'C3'],
};

export const Basic = () => {
  const items = useMemo(() => {
    return Object.keys(data);
  }, [data]);

  return (
    <DndContext
      collisionDetection={rectIntersection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 400,
          flexWrap: 'wrap',
        }}
      >
        <SortableContext
          items={['A1', 'A2', 'A3', 'A4', 'A5', 'A6']}
          strategy={rectSortingStrategy}
        >
          <EditWrapper id="A1">
            <Item text="A1" />
          </EditWrapper>
          <EditWrapper id="A2">
            <Item text="A2" />
          </EditWrapper>
          <EditWrapper id="A3">
            <Item text="A3" />
          </EditWrapper>
          <EditWrapper id="A4">
            <Item text="A4" />
          </EditWrapper>
          <EditWrapper id="A5">
            <Item text="A5" />
          </EditWrapper>
          <EditWrapper id="A6">
            <Item text="A6" />
          </EditWrapper>
        </SortableContext>
      </div>
    </DndContext>
  );
};
