import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function Item(props) {
  const { id, removeItem } = props;

  const style = {
    container: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // Adjusts the space between items
      border: "1px solid black",
      margin: "10px 0",
      background: "white",
      color: "black",
      minWidth: "200px", // Set minimum width here
      padding: "8px",
    },
    text: {
      flex: 1, // Takes the remaining space
    },
    itemStyle: {
      minWidth: "200px", // Set minimum width here
      padding: "8px",
      margin: "4px",
      background: "#FFFFFF",
      border: "1px solid #000000"
    }
  };

  return (
    <div style={style.container}>
      <div style={style.text}>{id}</div>
      <button onClick={() => removeItem(id)}>X</button>
    </div>
  )
  
}

export default function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: props.id });

  const {id, removeItem} = props;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item id={id} removeItem={removeItem}/>
    </div>
  );
}
