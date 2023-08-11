import {
  ClientRect,
  CollisionDescriptor,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
} from '@dnd-kit/core';
import React, {useCallback, useState} from 'react';
import Item from './comopnent/Item';
import EditWrapper from './comopnent/edit-wrapper';
import {createPortal} from 'react-dom';
import DropAnchor from './comopnent/drop-anchor';

export default {
  title: 'Examples/Custom/Custom',
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
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  function handleDraggingStart({active}) {
    setActiveId(active.id);
  }

  function handleDraggingOver({active, over}) {
    console.log("I'm over on: ", over?.id);
  }

  function handleDraggingEnd({active, over}) {
    console.log('active: ', active);
    console.log('over: ', over);
  }

  function setAnchor(top: number, left: number, width: number, height: number) {
    setTop(top);
    setLeft(left);
    setWidth(width);
    setHeight(height);
  }

  function calIntersectionArea(entry: ClientRect, target: ClientRect) {
    const top = Math.max(target.top, entry.top);
    const left = Math.max(target.left, entry.left);
    const right = Math.min(
      target.left + target.width,
      entry.left + entry.width
    );
    const bottom = Math.min(
      target.top + target.height,
      entry.top + entry.height
    );
    const width = right - left;
    const height = bottom - top;

    if (left < right && top < bottom) {
      const targetArea = target.width * target.height;
      const entryArea = entry.width * entry.height;
      const intersectionArea = width * height;
      const intersectionRatio =
        intersectionArea / (targetArea + entryArea - intersectionArea);

      return {
        area: intersectionArea,
        ratio: Number(intersectionRatio.toFixed(4)),
      };
    }

    // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
    return {
      area: 0,
      ratio: 0,
    };
  }

  function sortCollisionsDesc(
    {data: {value: a, ratio: ratioA}}: CollisionDescriptor,
    {data: {value: b, ratio: ratioB}}: CollisionDescriptor
  ) {
    if (b !== a) {
      return b - a;
    }
    return ratioB - ratioA;
  }

  /**
   * collisionRect: 碰撞矩形的尺寸数据
   * droppableRects: 所有可以放入的矩形尺寸数据 map
   * droppableContainers: 所有可以放入的矩形的节点信息，包括 id，data 等
   */
  const customDetection = useCallback(
    ({active, collisionRect, droppableRects, droppableContainers}) => {
      const collisions: CollisionDescriptor[] = [];
      const cordinatesOfCollisionRect = {
        top: collisionRect.top,
        left: collisionRect.left,
      };

      for (const droppableContainer of droppableContainers) {
        // 查出每一个容器的矩形尺寸
        const {id} = droppableContainer;
        const rect = droppableRects.get(id);

        if (rect && active.id !== id) {
          // 这里的 collisionRect 就是移动的矩形
          // TODO 需要重命名
          const intersectionArea = calIntersectionArea(rect, collisionRect);

          if (intersectionArea.area > 0) {
            // TODO: 替换为用左上角来计算落在哪个容器上
            collisions.push({
              id,
              data: {
                droppableContainer,
                value: intersectionArea.area,
                ratio: intersectionArea.ratio,
                childrenId: droppableContainer.data.current.childrenId,
              },
            });
          }
        }
      }

      const result = collisions.sort(sortCollisionsDesc);

      const childrenIds = result[0].data.childrenId;
      // 从结果中过滤出子节点
      const childrenRects = childrenIds?.map((item: string) => {
        return droppableRects.get(item);
      });

      console.log('碰撞检测到的父组件：', result[0]);
      // 找出插入的 index，并计算出锚点的位置
      return result;
    },
    []
  );

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
          margin: '40px',
          flexWrap: 'wrap',
        }}
      >
        <EditWrapper id="A" childrenId={['A1', 'A2', 'A3', 'A4']}>
          <Item text="A">
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
          </Item>
        </EditWrapper>
        <EditWrapper id="B" childrenId={['B1', 'B2', 'B3', 'B4']}>
          <Item text="B">
            <EditWrapper id="B1">
              <Item text="B1" />
            </EditWrapper>
            <EditWrapper id="B2">
              <Item text="B2" />
            </EditWrapper>
            <EditWrapper id="B3">
              <Item text="B3" />
            </EditWrapper>
            <EditWrapper id="B4">
              <Item text="B4" />
            </EditWrapper>
          </Item>
        </EditWrapper>
        <EditWrapper id="C" childrenId={['C1', 'C2', 'C3', 'C4']}>
          <Item text="C">
            <EditWrapper id="C1">
              <Item text="C1" />
            </EditWrapper>
            <EditWrapper id="C2">
              <Item text="C2" />
            </EditWrapper>
            <EditWrapper id="C3">
              <Item text="C3" />
            </EditWrapper>
            <EditWrapper id="C4">
              <Item text="C4" />
            </EditWrapper>
          </Item>
        </EditWrapper>
        <EditWrapper id="D" childrenId={['D1', 'D2', 'D3', 'D4']}>
          <Item text="D">
            <EditWrapper id="D1">
              <Item text="D1" />
            </EditWrapper>
            <EditWrapper id="D2">
              <Item text="D2" />
            </EditWrapper>
            <EditWrapper id="D3">
              <Item text="D3" />
            </EditWrapper>
            <EditWrapper id="D4">
              <Item text="D4" />
            </EditWrapper>
          </Item>
        </EditWrapper>
        <EditWrapper id="E" childrenId={['E1', 'E2', 'E3', 'E4']}>
          <Item text="E">
            <EditWrapper id="E1">
              <Item text="E1" />
            </EditWrapper>
            <EditWrapper id="E2">
              <Item text="E2" />
            </EditWrapper>
            <EditWrapper id="E3">
              <Item text="E3" />
            </EditWrapper>
            <EditWrapper id="E4">
              <Item text="E4" />
            </EditWrapper>
          </Item>
        </EditWrapper>
        <EditWrapper id="F" childrenId={['F1', 'F2', 'F3', 'F4']}>
          <Item text="F">
            <EditWrapper id="F1">
              <Item text="F1" />
            </EditWrapper>
            <EditWrapper id="F2">
              <Item text="F2" />
            </EditWrapper>
            <EditWrapper id="F3">
              <Item text="F3" />
            </EditWrapper>
            <EditWrapper id="F4">
              <Item text="F4" />
            </EditWrapper>
          </Item>
        </EditWrapper>
      </div>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          <Item text={activeId}></Item>
        </DragOverlay>,
        document.body
      )}
      {createPortal(
        <DropAnchor top={top} left={left} width={width} height={height} />,
        document.body
      )}
    </DndContext>
  );
};
