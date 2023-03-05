import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useCallback } from 'react';
import { changePaneProportion, DockPane, DockType, isHorizontalDock } from './store';
import { DragHandleHorizontalIcon, DragHandleVerticalIcon } from '@radix-ui/react-icons';

interface DockResizeHandleProps {
  type: DockType;
  index: number;
  paneIndex: number;
  data: DockPane;
  nextData: DockPane;
}

export const PaneResizeHandle: React.FC<DockResizeHandleProps> = (props) => {
  const isHorizontal = isHorizontalDock(props.type);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      console.log(event);
      const delta = Math.round(isHorizontal ? event.delta.x : event.delta.y);
      console.log(delta);
      const panes = document.querySelectorAll(`#dock-${props.index}-${props.type} > .pane`);
      const sizes = [...panes].map((pane) => {
        const { width, height } = pane.getBoundingClientRect();
        return isHorizontal ? width : height;
      });
      console.log(sizes);
      const totalSize = sizes[props.paneIndex] + sizes[props.paneIndex + 1];
      const totalProportion = props.data.proportion + props.nextData.proportion;

      const newSize = sizes[props.paneIndex] + delta;
      const newProportion = Math.round((newSize / totalSize) * totalProportion);
      console.log({
        newSize,
        totalSize,
        totalProportion,
        newProportion,
      });
      changePaneProportion(props.index, props.type, props.paneIndex, newProportion);

      const nextNewSize = sizes[props.paneIndex + 1] - delta;
      const nextNewProportion = Math.round((nextNewSize / totalSize) * totalProportion);
      changePaneProportion(props.index, props.type, props.paneIndex + 1, nextNewProportion);
      console.log(newProportion, nextNewProportion);
    },
    [props.type, props.index, props.paneIndex, props.data.proportion, props.nextData.proportion]
  );
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[isHorizontal ? restrictToHorizontalAxis : restrictToVerticalAxis]}
    >
      <PaneResizeHandleBase {...props}></PaneResizeHandleBase>
    </DndContext>
  );
};

export const PaneResizeHandleBase: React.FC<DockResizeHandleProps> = ({ type, index }) => {
  const id = `resize-handle-${type}-${index}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  const className = `pane-resize-handle ${type}`;
  const isHorizontal = isHorizontalDock(type);

  return (
    <div className={className} ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {isHorizontal ? <DragHandleVerticalIcon /> : <DragHandleHorizontalIcon />}
    </div>
  );
};
