var bg, layerA, originX, originY;

bg = new Layer({
  width: 640,
  height: 1136,
  backgroundColor: '#456'
});

layerA = new Layer({
  width: 128,
  height: 128
});

layerA.center();
Utils.labelLayer(layerA, 'Drag me');

originX = layerA.x;
originY = layerA.y;

layerA.style = {
  borderRadius: '50%',
  boxShadow: 'inset 0 0 0 4px #fff, 0 4px 12px rgba(0,0,0,0.35)'
};

/* Make the layer draggable */

layerA.draggable.enabled = true;

/* Add an animation to the end of a drag */

layerA.on(Events.DragStart, function(event, layer) {
  this.animate({ properties: { scale: 1.2 }, curve: 'spring(400,20,20)' });
})

layerA.on(Events.DragEnd, function(event, layer) {
  /* Snap back to origin */
  layer.animate({
    properties: {
      scale: 1,
      x: originX,
      y: originY
    },
    curve: "spring",
    curveOptions: {
      friction: 20,
      tension: 400,
      velocity: 20
    }
  });
});
