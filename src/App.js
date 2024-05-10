import './App.css';
import logo from './logo.svg';

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Container from "./container";
import { Item } from "./sortable_item";

const wrapperStyle = {
  flexDirection: "row"
};

export default function App() {
  const [items, setItems] = useState({
    Campers: ["Ashe", "Brandi", "Catrina", "Daniel", "Elanor", "Fisher", "Gladys"],
    Maple: [],
    Oak: [],
    Pine: []
  });
  const [activeId, setActiveId] = useState();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const [newContainerID, setNewContainerID] = useState('');
  const [newItemID, setNewItemID] = useState('');

  function addContainer() {
    // Check if a container with the given ID already exists
    if (items.hasOwnProperty(newContainerID)) {
    console.log(`Container with ID "${newContainerID}" already exists.`);
    return; // Exit the function early
    }

    setItems(prevItems => ({
      ...prevItems,
      [newContainerID]: []
    }));
    setNewContainerID('');
  }

  function removeContainer(containerID) {
    // Check if a container with the given ID exists
    if (!items.hasOwnProperty(containerID)) {
      console.log(`Container with ID "${containerID}" does not exist.`);
      return; // Exit the function early
    }
    if (containerID === "Campers") {
      console.log(`Removing container with ID "${containerID}" is not allowed.`);
      return; // Exit the function early
    }
  
    // If the container exists, remove it from the state
    setItems(prevItems => {
      const { [containerID]: removedContainer, ...rest } = prevItems;
      const campersItems = prevItems.Campers || []; // Get the current items in Campers, or an empty array if Campers doesn't exist
      const newCampers = campersItems.concat(removedContainer); // Merge the removed container items with Campers items
      return {
        ...rest, // Keep all other containers
        Campers: newCampers // Update Campers with the merged items
      };
    });
  }

  function addItemToRoot() {
    for (const containerName in items) {
      if (items.hasOwnProperty(containerName)) {
        const container = items[containerName];
        if (container.includes(newItemID)) {
          // Handle duplicate item, you can show a message or take appropriate action
          console.log(`Item already exists in ${containerName} array.`);
          return items; // Return previous state without modification
        }
      }
    }
    
    setItems(prevItems => {
      // Clone the "root" container array and append the new item
    const rootContainer = [...prevItems.Campers, newItemID];
    setNewItemID('');
    
    // Update the state with the modified "root" container
    return {
      ...prevItems,
      Campers: rootContainer
    };
  });
}

  function removeItem(itemID) {
    console.log("Running removeItem");
    // Iterate over each container in the items state
    const updatedItems = Object.keys(items).reduce((acc, containerKey) => {
      // Filter out the item from the current container
      const updatedContainer = items[containerKey].filter(item => item !== itemID);
      // Add the updated container to the accumulator
      acc[containerKey] = updatedContainer;
      return acc;
    }, {});
  
    // Update the state with the containers that have the item removed
    setItems(updatedItems);
  }

  return (
    <div className="App" style={wrapperStyle}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Cabin Assignments
        </p>
      </header>
      <body>
        <div class="Edit">
          <div class="form-container">
            <label for="cabin-input">Add a cabin:</label>
            <div class="input-container">
              <input
                type="text"
                id="cabin-input"
                value={newContainerID}
                onChange={(e) => setNewContainerID(e.target.value)}
              />
              <button onClick={addContainer}>Submit</button>
            </div>
          </div>
          <div class="form-container">
            <label for="camper-input">Add a camper:</label>
            <div class="input-container">
              <input
                type="text"
                id="camper-input"
                value={newItemID}
                onChange={(e) => setNewItemID(e.target.value)}
              />
              <button onClick={addItemToRoot}>Submit</button>
            </div>
          </div>
        </div>
        <div className='Assignment-field'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {Object.keys(items).map(key => (
            <div>
              <Container key={key} id={key} items={items[key]} removeContainer={removeContainer} removeItem={removeItem}/>
            </div>
            ))}
            <DragOverlay className='drag-overlay'>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
          </DndContext>
        </div>
      </body>
    </div>
  );

  function findContainer(id) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event) {
    const { active, over, draggingRect } = event;
    const { id } = active;
    const { id: overId } = over;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          draggingRect &&
          draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
      }));
    }

    setActiveId(null);
  }
}