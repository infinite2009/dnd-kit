import {
  closestCenter, CollisionDescriptor,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  rectIntersection,
} from '@dnd-kit/core';
import {rectSortingStrategy, SortableContext} from '@dnd-kit/sortable';
import React, {useCallback, useMemo, useState} from 'react';
import Item from './comopnent/Item';
import EditWrapper from './comopnent/edit-wrapper';
import {createPortal} from 'react-dom';
import {sortCollisionsDesc} from '@dnd-kit/core/src/utilities/algorithms/helpers';
import {getIntersectionRatio} from '@dnd-kit/core/src/utilities/algorithms/rectIntersection';

export default {
  title: 'Examples/Custom/Custom',
};

const data: {[key: string]: string[]} = {
  A: ['A1', 'A2', 'A3'],
  B: ['B1', 'B2', 'B3'],
  C: ['C1', 'C2', 'C3'],
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const Basic = () => {
  const [activeId, setActiveId] = useState<string>('');

  const items = useMemo(() => {
    return Object.keys(data);
  }, [data]);

  function handleDraggingStart({active}) {
    setActiveId(active.id);
  }

  function handleDraggingOver({active, over}) {
    // console.log('active element is: ', active.id);
    console.log('I\'m over on: ', over.id);
  }

  function handleDraggingEnd({active, over}) {
    console.log('active: ', active);
    console.log('over: ', over);
  }

  const customDetection = useCallback(({
                                         collisionRect,
                                         droppableRects,
                                         droppableContainers,
                                       }) => {
    const collisions: CollisionDescriptor[] = [];

    for (const droppableContainer of droppableContainers) {
      // 查出每一个容器的矩形尺寸
      const {id} = droppableContainer;
      const rect = droppableRects.get(id);


      if (rect) {
        // 这里的 collisionRect 就是移动的矩形
        const intersectionRatio = getIntersectionRatio(rect, collisionRect);
        debugger;
        // TODO: 替换为用左上角来计算落在哪个容器上


        if (intersectionRatio > 0) {
          collisions.push({
            id,
            data: {droppableContainer, value: intersectionRatio},
          });
        }
      }
    }

    const result = collisions.sort(sortCollisionsDesc);

    console.log(result.map(item => `${item.id}: ${item.data.value}`));

    return result;
  }, []);

  return (
    <DndContext
      collisionDetection={customDetection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDraggingStart}
      onDragOver={handleDraggingOver}
      onDragEnd={handleDraggingEnd}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 678,
          flexWrap: 'wrap',
        }}
      >
        <SortableContext
          items={['A', 'B', 'C', 'D', 'E', 'F']}
          strategy={rectSortingStrategy}
        >
          <EditWrapper id='A'>
            <Item text='A'>
              <SortableContext
                items={['A1', 'A2', 'A3', 'A4']}
                strategy={rectSortingStrategy}
              >
                <EditWrapper id='A1'>
                  <Item text='A1' />
                </EditWrapper>
                <EditWrapper id='A2'>
                  <Item text='A2' />
                </EditWrapper>
                <EditWrapper id='A3'>
                  <Item text='A3' />
                </EditWrapper>
                <EditWrapper id='A4'>
                  <Item text='A4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
          <EditWrapper id='B'>
            <Item text='B'>
              <SortableContext items={['B1', 'B2', 'B3', 'B4']}>
                <EditWrapper id='B1'>
                  <Item text='B1' />
                </EditWrapper>
                <EditWrapper id='B2'>
                  <Item text='B2' />
                </EditWrapper>
                <EditWrapper id='B3'>
                  <Item text='B3' />
                </EditWrapper>
                <EditWrapper id='B4'>
                  <Item text='B4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
          <EditWrapper id='C'>
            <Item text='C'>
              <SortableContext items={['C1', 'C2', 'C3', 'C4']}>
                <EditWrapper id='C1'>
                  <Item text='C1' />
                </EditWrapper>
                <EditWrapper id='C2'>
                  <Item text='C2' />
                </EditWrapper>
                <EditWrapper id='C3'>
                  <Item text='C3' />
                </EditWrapper>
                <EditWrapper id='C4'>
                  <Item text='C4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
          <EditWrapper id='D'>
            <Item text='D'>
              <SortableContext items={['D1', 'D2', 'D3', 'D4']}>
                <EditWrapper id='D1'>
                  <Item text='D1' />
                </EditWrapper>
                <EditWrapper id='D2'>
                  <Item text='D2' />
                </EditWrapper>
                <EditWrapper id='D3'>
                  <Item text='D3' />
                </EditWrapper>
                <EditWrapper id='D4'>
                  <Item text='D4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
          <EditWrapper id='E'>
            <Item text='E'>
              <SortableContext items={['E1', 'E2', 'E3', 'E4']}>
                <EditWrapper id='E1'>
                  <Item text='E1' />
                </EditWrapper>
                <EditWrapper id='E2'>
                  <Item text='E2' />
                </EditWrapper>
                <EditWrapper id='E3'>
                  <Item text='E3' />
                </EditWrapper>
                <EditWrapper id='E4'>
                  <Item text='E4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
          <EditWrapper id='F'>
            <Item text='F'>
              <SortableContext items={['F1', 'F2', 'F3', 'F4']}>
                <EditWrapper id='F1'>
                  <Item text='F1' />
                </EditWrapper>
                <EditWrapper id='F2'>
                  <Item text='F2' />
                </EditWrapper>
                <EditWrapper id='F3'>
                  <Item text='F3' />
                </EditWrapper>
                <EditWrapper id='F4'>
                  <Item text='F4' />
                </EditWrapper>
              </SortableContext>
            </Item>
          </EditWrapper>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          <Item text={activeId}></Item>
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};
