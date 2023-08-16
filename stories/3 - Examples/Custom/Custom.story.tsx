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
  const [top, setTop] = useState<number>(200);
  const [left, setLeft] = useState<number>(600);
  const [width, setWidth] = useState<number>(100);
  const [height, setHeight] = useState<number>(2);

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
    {data: {value: a}}: CollisionDescriptor,
    {data: {value: b}}: CollisionDescriptor
  ) {
    return b - a;
  }

  /**
   * 计算重叠的类型：
   * return 0 | 1 | 2. 0 表示没有重叠，1 表示左上角落在另一个矩形的内部边缘，2 表示左上角落在另一个矩形的核心区域
   */
  function calcIntersectionType(rect, collisionRect) {
    const pointer = {
      top: collisionRect.top,
      left: collisionRect.left,
    };
    if (!isInRect(pointer, rect)) {
      return 0;
    }
    if (isInRect(pointer, rect, 4)) {
      return 2;
    }
    return 1;
  }

  function isInRect(point, rect, offset: number = 0) {
    const {top: pointerTop, left: pointerLeft} = point;
    const {top, left, width, height} = rect;
    const correctedTop = top + offset;
    const correctedLeft = left + offset;
    const correctedWidth = width - offset;
    const correctedHeight = height - offset;
    return (
      pointerTop > correctedTop &&
      pointerTop < correctedTop + correctedHeight &&
      pointerLeft > correctedLeft &&
      pointerLeft < correctedLeft + correctedWidth
    );
  }

  /**
   * collisionRect: 碰撞矩形的尺寸数据
   * droppableRects: 所有可以放入的矩形尺寸数据 map
   * droppableContainers: 所有可以放入的矩形的节点信息，包括 id，data 等
   */
  const customDetection = useCallback(
    ({active, collisionRect, droppableRects, droppableContainers}) => {
      const collisions: CollisionDescriptor[] = [];

      for (const droppableContainer of droppableContainers) {
        // 查出每一个容器的矩形尺寸
        const {id} = droppableContainer;
        const rect = droppableRects.get(id);

        if (rect && active.id !== id) {
          // 这里的 collisionRect 就是移动的矩形
          const intersectionType = calcIntersectionType(rect, collisionRect);
          console.log('intersectionType: ', intersectionType);
          if (intersectionType === 2) {
            collisions.push({
              id,
              data: {
                droppableContainer,
                value: intersectionType,
                childrenId: droppableContainer.data.current.childrenId,
              },
            });
          }
        }
      }

      const result = collisions.sort(sortCollisionsDesc);

      if (result.length) {
        const childrenIds = result[0].data.childrenId;
        // 从结果中过滤出子节点
        const childrenRects = childrenIds?.map((item: string) => {
          return droppableRects.get(item);
        });

        console.log('碰撞检测到的父组件：', result[0]);
        console.log(
          '所有的碰撞：',
          result.map((item) => `${item.id}碰撞类型:${item.data.value}`)
        );
        // 找出插入的 index，并计算出锚点的位置
        return result;
      }
      return [];
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
        <EditWrapper id="A" childrenId={['A1']}>
          <Item text="A">
            <EditWrapper id="A1" childrenId={['A11']}>
              <Item text="A1">
                <EditWrapper id="A11" childrenId={['A111, A112, A113']}>
                  <Item text="A11">
                    <EditWrapper id="A111">
                      <Item text="A111" />
                    </EditWrapper>
                    <EditWrapper id="A112">
                      <Item text="A112" />
                    </EditWrapper>
                    <EditWrapper id="A113">
                      <Item text="A113" />
                    </EditWrapper>
                  </Item>
                </EditWrapper>
              </Item>
            </EditWrapper>
          </Item>
        </EditWrapper>
        <EditWrapper id="C" childrenId={['C1', 'C2']}>
          <Item text="C">
            <EditWrapper id="C1" childrenId={['C11']}>
              <Item text="C1">
                <EditWrapper id="C11" childrenId={['C111', 'C112', 'C113']}>
                  <Item text="C11">
                    <EditWrapper id="C111">
                      <Item text="C111" />
                    </EditWrapper>
                    <EditWrapper id="C112">
                      <Item text="C112" />
                    </EditWrapper>
                    <EditWrapper id="C113">
                      <Item text="C113" />
                    </EditWrapper>
                  </Item>
                </EditWrapper>
              </Item>
            </EditWrapper>
            <EditWrapper id="C2" childrenId={['C21']}>
              <Item text="C2">
                <EditWrapper id="C21" childrenId={['C211', 'C212', 'C213']}>
                  <Item text="C21">
                    <EditWrapper id="C211">
                      <Item text="C211" />
                    </EditWrapper>
                    <EditWrapper id="C212">
                      <Item text="C212" />
                    </EditWrapper>
                    <EditWrapper id="C213">
                      <Item text="C213" />
                    </EditWrapper>
                  </Item>
                </EditWrapper>
              </Item>
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
