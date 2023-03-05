import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useCallback } from 'react';
import { changeDockSize, DockType, isHorizontalDock, LayerDock } from './store';
import { DragHandleHorizontalIcon, DragHandleVerticalIcon } from '@radix-ui/react-icons';

interface DockResizeHandleProps {
  type: DockType;
  index: number;
  data?: LayerDock;
}

export const DockResizeHandle: React.FC<DockResizeHandleProps> = (props) => {
  const isHorizontal = isHorizontalDock(props.type);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const delta = Math.round(isHorizontal ? event.delta.y : event.delta.x);
      changeDockSize(props.index, props.type, delta);
    },
    [props.type, props.index]
  );
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[isHorizontal ? restrictToVerticalAxis : restrictToHorizontalAxis]}
    >
      <DockResizeHandleBase {...props}></DockResizeHandleBase>
    </DndContext>
  );
};

export const DockResizeHandleBase: React.FC<DockResizeHandleProps> = ({ type, data, index }) => {
  const id = `resize-handle-${type}-${index}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  if (!data) return null;
  const className = `resize-handle ${type}`;
  const isHorizontal = isHorizontalDock(type);

  return (
    <div className={className} ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {isHorizontal ? <DragHandleHorizontalIcon /> : <DragHandleVerticalIcon />}
    </div>
  );
};
