var layer = new Layer({ image: 'images/Icon.png' })
layer.center()

layer.states.add('a', { scale: 2, y: 300, rotationZ: 90 })
layer.states.animationOptions = { curve: 'spring(200,20,0)' }
layer.on(Events.Click, function(){
  layer.states.next()
})
