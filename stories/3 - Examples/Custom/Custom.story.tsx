import {
  CollisionDescriptor,
  defaultDropAnimationSideEffects,
  DndContext, DragOverEvent,
  DragOverlay, DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
} from '@dnd-kit/core';
import React, {useCallback, useState} from 'react';
import Item from './comopnent/Item';
import EditWrapper from './comopnent/edit-wrapper';
import {createPortal} from 'react-dom';
import DropAnchor from './comopnent/drop-anchor';
import {getEventCoordinates} from '@dnd-kit/utilities';

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

  const collisionOffset = 10;

  function customModifier({activatorEvent, draggingNodeRect, transform}: any) {
    if (draggingNodeRect && activatorEvent) {
      const activatorCoordinates = getEventCoordinates(activatorEvent);

      if (!activatorCoordinates) {
        return transform;
      }

      const offsetX = activatorCoordinates.x - draggingNodeRect.left;
      const offsetY = activatorCoordinates.y - draggingNodeRect.top;

      return {
        ...transform,
        // x: transform.x + offsetX - draggingNodeRect.width / 2,
        // y: transform.y + offsetY - draggingNodeRect.height / 2,
        // x: transform.x + offsetX - 10,
        // y: transform.y + offsetY - 10,
        x: transform.x + offsetX - 4,
        y: transform.y + offsetY - 4,
      };
    }

    return transform;
  }

  function handleDraggingStart({active}: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDraggingOver({over}: DragOverEvent) {
    console.log("I'm over on: ", over?.id);
  }

  function handleDraggingEnd({active, over}: any) {
    console.log('active: ', active);
    console.log('over: ', over);
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
  function calcIntersectionType(
    rect: {top: number; right: number; bottom: number; left: number},
    collisionRect: {top: number; left: number}
  ) {
    const pointer = {
      top: collisionRect.top,
      left: collisionRect.left,
    };
    if (!isInRect(pointer, rect)) {
      return 0;
    }
    if (isInRect(pointer, rect, collisionOffset)) {
      return 2;
    }
    return 1;
  }

  function isInRect(
    point: {top: any; left: any},
    rect: {top: any; right: any; bottom: any; left: any},
    offset: number = 0
  ) {
    const {top: pointerTop, left: pointerLeft} = point;
    const {top, right, bottom, left} = rect;
    const correctedTop = top + offset;
    const correctedLeft = left + offset;
    const correctedRight = right - offset;
    const correctedBottom = bottom - offset;
    return (
      pointerTop > correctedTop &&
      pointerTop < correctedBottom &&
      pointerLeft > correctedLeft &&
      pointerLeft < correctedRight
    );
  }

  function setAnchor(obj: any) {
    setTop(obj.top);
    setLeft(obj.left);
    setWidth(obj.width);
    setHeight(obj.height);
  }

  function isDescendant(entry: string, target: string, parentDict: {[key: string]: string}) {
    let currentParent = parentDict[entry];
    while (currentParent) {
      if (target === currentParent) {
        return true;
      }
      currentParent = parentDict[currentParent];
    }
    return false;
  }

  /**
   * collisionRect: 碰撞矩形的尺寸数据
   * droppableRects: 所有可以放入的矩形尺寸数据 map
   * droppableContainers: 所有可以放入的矩形的节点信息，包括 id，data 等
   */
  const customDetection = useCallback(
    ({active, collisionRect, droppableRects, droppableContainers}) => {
      const collisions: CollisionDescriptor[] = [];

      const parentDict: {[key: string]: string} = {};

      droppableContainers.forEach(
        (item: {data: {current: {childrenId: any[]}}; id: string}) => {
          if (item.data.current.childrenId?.length) {
            item.data.current.childrenId.forEach((childId) => {
              parentDict[childId] = item.id;
            });
          }
        }
      );

      for (const droppableContainer of droppableContainers) {
        // 查出每一个容器的矩形尺寸
        const {id} = droppableContainer;
        const rect = droppableRects.get(id);

        // 既不是自身，也不是自己的后代节点
        if (rect && active.id !== id  && !isDescendant(id, active.id, parentDict)) {
          // 这里的 collisionRect 就是移动的矩形
          const intersectionType = calcIntersectionType(rect, collisionRect);
          // console.log('intersectionType: ', intersectionType);
          if (intersectionType === 2) {
            collisions.push({
              id,
              data: {
                droppableContainer,
                value: intersectionType,
                ...droppableContainer.data.current,
              },
            });
          }
        }
      }

      const result = collisions.sort(sortCollisionsDesc);

      if (result.length) {
        const {direction, childrenId} = result[0].data;

        // 从结果中过滤出子节点
        const childrenRects = childrenId
          ?.map((item: string) => {
            return droppableRects.get(item);
          })
          .filter((item: any) => !!item);

        if (childrenRects?.length) {
          // 默认插入尾部
          let insertIndex = childrenRects.length;

          let style = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          };

          // TODO: 这块重做
          for (let i = 0, l = childrenRects.length; i < l; i++) {
            const {top, right, bottom, left, height, width} = childrenRects[i];
            const {
              top: collisionTop,
              right: collisionRight,
              bottom: collisionBottom,
              left: collisionLeft,
            } = collisionRect;
            // 判断碰撞左上角和这些矩形的位置关系，落在两者之间的，设下一个 index 为插入位置
            if (direction === 'row') {
              // 如果在当前矩形同行
              if (collisionTop >= top && collisionTop <= bottom) {
                style.top = top;
                style.height = height;
                style.width = 2;

                  if (collisionLeft <= left + collisionOffset) {
                    insertIndex = i;
                    style.left = left;
                    if (i > 0) {
                      const {bottom: preBottom, right: preRight} = childrenRects[i - 1];
                      // 如果和前一个没有换行
                      if (!(top > preBottom && left < preRight)) {
                        style.left = Math.round((preRight + left)/2);
                      }
                    }
                    break;
                  }

                if (i < l - 1) {
                  const {top: nextTop, left: nextLeft} = childrenRects[i + 1];
                  // 如果下一个矩形发生了换行
                  if (bottom < nextTop && nextLeft < right) {
                    if (collisionLeft > right - collisionOffset) {
                      style.left = right;
                      insertIndex = i + 1;
                      break;
                    }
                  }
                } else {
                  if (collisionLeft > right - collisionOffset) {
                    style.left = right;
                    insertIndex = i + 1;
                    break;
                  }
                }
              }
            } else {

              if (collisionTop < top + collisionOffset) {
                style.height = 2;
                style.width = width;
                style.left = left;
                if (i === 0) {
                  style.top = top;
                } else {
                  const {bottom: preBottom} = childrenRects[i - 1];
                  style.top = Math.round((top + preBottom) / 2);
                }
                insertIndex = i;
                break;
              }

              if (i === l - 1 && collisionTop > bottom - collisionOffset) {
                style.height = 2;
                style.width = width;
                style.left = left;
                insertIndex = i + 1;
                style.top = bottom;
              }
            }
          }

          console.log('插入位置：', insertIndex);
          console.log('style.top: ', style.top);
          setAnchor(style);
        } else {
          const rect = droppableRects.get(result[0].id);
          let style;
          if (direction === 'row') {
            style = {
              top: rect.top,
              width: 2,
              height: rect.height,
              left: rect.left + Math.round(rect.width / 2),
            };
          } else {
            style = {
              top: rect.top + Math.round(rect.height / 2),
              width: rect.width,
              height: 2,
              left: rect.left,
            };
          }
          setAnchor(style);
        }
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
      modifiers={[customModifier]}
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
                <EditWrapper
                  id="A11"
                  childrenId={[
                    'A111',
                    'A112',
                    'A113',
                    'A114',
                    'A115',
                    'A116',
                    'A117',
                    'A118',
                  ]}
                  direction="row"
                >
                  <Item text="A11" direction="row">
                    <EditWrapper id="A111">
                      <Item text="A111" />
                    </EditWrapper>
                    <EditWrapper id="A112">
                      <Item text="A112" />
                    </EditWrapper>
                    <EditWrapper id="A113">
                      <Item text="A113" />
                    </EditWrapper>
                    <EditWrapper id="A114">
                      <Item text="A114" />
                    </EditWrapper>
                    <EditWrapper id="A115">
                      <Item text="A115" />
                    </EditWrapper>
                    <EditWrapper id="A116">
                      <Item text="A116" />
                    </EditWrapper>
                    <EditWrapper id="A117">
                      <Item text="A117" />
                    </EditWrapper>
                    <EditWrapper id="A118">
                      <Item text="A118" />
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
          <div style={{height: 40, width: 40, backgroundColor: '#f00'}}></div>
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
