import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./sortable_item";

const selfStyle = {
    background: "#0060af",
  }

const containerNameStyle = {
    color: "#FFFFFF",
    fontSize: "24px",
    paddingTop: "30px",
};

const containerStyle = {
    background: "#0060af",
    padding: 10,
    margin: 10,
    flex: 1,
    display: "flex", // Add flex display
    flexDirection: "column", // Adjust the direction to column
    alignItems: "center", // Center items horizontally
};

const buttonStyle = {
    marginLeft: "20px"
}

export default function Container(props) {
  const { id, items, removeContainer, removeItem } = props;

  const { setNodeRef } = useDroppable({
    id
  });

  return (
    <div style={selfStyle}>
        <div style={containerNameStyle}>
            {id}
            <button style={buttonStyle} onClick={() => removeContainer(id)}>X</button>
        </div>
        <SortableContext
        id={id}
        items={items}
        strategy={verticalListSortingStrategy}
        >
        <div ref={setNodeRef} style={containerStyle}>
            {items.map((id) => (
            <SortableItem key={id} id={id} removeItem={removeItem}/>
            ))}
        </div>
        </SortableContext>
    </div>
    
  );
}
