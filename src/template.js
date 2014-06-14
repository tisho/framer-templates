(function() {
  var defaults = <% template_defaults %>;
  var options = _.defaults(Framer.Config.template || {}, defaults);

  var body,
      isMobile = navigator.userAgent.match(/(iPad|iPhone|Android)/),
      isStandalone = ('standalone' in navigator) && navigator.standalone,
      isPresentationMode = window.location.hash.indexOf('dev') === -1,
      zoomFactorInHash = window.location.hash.match(/z(\d+)/),
      deviceWidth = options.deviceWidth,
      deviceHeight = options.deviceHeight,
      screenWidth = options.screenWidth,
      screenHeight = options.screenHeight,
      contentWidth = options.contentWidth,
      contentHeight = options.contentHeight,
      cursorWidth = options.cursorWidth,
      backgroundImage = options.backgroundImage,
      deviceImage = options.deviceImage,
      cursorImage1x = options.cursorImage1x,
      cursorImage2x = options.cursorImage2x,
      cursorPressedImage1x = options.cursorPressedImage1x,
      cursorPressedImage2x = options.cursorPressedImage2x,
      shouldShowAddToHomescreenPrompt = options.shouldShowAddToHomescreenPrompt,
      addToHomescreenPromptImage = options.addToHomescreenPromptImage,
      addToHomescreenPromptImageWidth,
      addToHomescreenPromptImageHeight,
      promptAnchorTop = options.promptAnchorTop,
      promptAnchorLeft = options.promptAnchorLeft,
      preventBounce = options.preventBounce,
      zoomControlElement,
      zoomFactor = (zoomFactorInHash ? parseInt(zoomFactorInHash[1])/100 : null) || options.zoomFactor,
      scaleOverriddenByZoomFactor = !!zoomFactor,
      viewportWidth = document.documentElement.clientWidth,
      viewportHeight = document.documentElement.clientHeight,
      sidePadding = 50,
      root,
      scale;

  if (scaleOverriddenByZoomFactor) {
    scale = zoomFactor / (screenWidth / contentWidth);
  }

  // We need to patch the default centerFrame method, because it uses the
  // window's innerWidth/innerHeight to figure out where the center of the screen is.
  // Since in our templates the "screen" is the screen in the template, we need to
  // override the method to use contentWidth/contentHeight instead.
  Layer.prototype.centerFrame = function() {
    var frame;
    if (this.superLayer) {
      frame = this.frame;
      frame.midX = parseInt(this.superLayer.width / 2.0);
      frame.midY = parseInt(this.superLayer.height / 2.0);
      return frame;
    } else {
      frame = this.frame;
      frame.midX = parseInt(contentWidth / 2.0);
      frame.midY = parseInt(contentHeight / 2.0);
      return frame;
    }
  };

  function addStyle(css) {
    var styleSheet = document.createElement('style');
    styleSheet.innerHTML = css;
    return document.head.appendChild(styleSheet);
  }

  function objectToCSS(obj) {
    var parts = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        parts.push(prop + ': ' + obj[prop] + '; ');
      }
    }
    return parts.join('');
  }

  function showDeviceBackground() {
    document.getElementsByTagName('html')[0].style.height = '100%';

    var properties = {
      height: '100%',
      'background-repeat': 'no-repeat',
      'background-position': '50% 50%',
      'background-image': 'url(' + deviceImage + '), url(' + backgroundImage + ')',
      'background-color': '#f4f4f4',
      cursor: '-webkit-image-set(url(' + cursorImage1x + ') 1x, url(' + cursorImage2x + ') 2x) ' + cursorWidth/2 + ' ' + cursorWidth / 2 + ', auto'
    };

    var pressedProperties = {
      cursor: '-webkit-image-set(url(' + cursorPressedImage1x + ') 1x, url(' + cursorPressedImage2x + ') 2x) ' + cursorWidth/2 + ' ' + cursorWidth / 2 + ', auto'
    };

    addStyle('.framer-template-decorated-body { '+ objectToCSS(properties) +' }');
    addStyle('.framer-template-decorated-body:active { '+ objectToCSS(pressedProperties) +' }');
    document.body.classList.add('framer-template-decorated-body');
  }

  function calculateScale() {
    if (deviceWidth > deviceHeight) {
      scale = viewportWidth / (deviceWidth + 2 * sidePadding);
    } else {
      scale = viewportHeight / (deviceHeight + 2 * sidePadding);
    }
  }

  function positionDeviceBackground() {
    var top = (viewportHeight - deviceHeight * scale) / 2,
        left = (viewportWidth - deviceWidth * scale) / 2;

    top = top < sidePadding ? sidePadding : top;

    body.style.backgroundPosition = left + 'px ' + top + 'px, 50% 50%';
    body.style.backgroundSize = deviceWidth * scale + 'px ' + deviceHeight * scale + 'px, cover';
  }

  function positionFramerRoot() {
    root = document.getElementById('FramerRoot');
    if (!root) {
      return setTimeout(positionFramerRoot, 10);
    }

    var deviceTop = (viewportHeight - deviceHeight * scale) / 2;
    deviceTop = deviceTop < sidePadding ? sidePadding : deviceTop;

    var top = deviceTop + (deviceHeight - screenHeight) * scale / 2,
        left = (viewportWidth - screenWidth * scale)/2;

    var properties = {
      width: contentWidth + 'px',
      height: contentHeight + 'px',
      position: 'absolute',
      left: left+'px',
      top: top+'px',
      '-webkit-transform': 'scale(' + screenWidth/contentWidth * scale + ')',
      '-webkit-transform-origin': '0 0',
      'overflow': 'hidden'
    };

    addStyle('.framer-template-positioned { ' + objectToCSS(properties) +' }');
    root.classList.add('framer-template-positioned');

    document.body.style.minHeight = (deviceHeight * scale + 2 * sidePadding)+'px';
  }

  function togglePresentationMode() {
    if (isPresentationMode) {
      document.body.classList.remove('framer-template-decorated-body');
      document.body.style.backgroundSize = '';
      if (root) {
        root.classList.remove('framer-template-positioned')
      }

      window.removeEventListener('resize', layout, false);
      scale = 1 / (screenWidth / contentWidth);
      isPresentationMode = false;
    } else {
      showDeviceBackground();
      layout();

      if (scaleOverriddenByZoomFactor) {
        updateZoomControl();
      }

      window.addEventListener('resize', layout, false);
      isPresentationMode = true;
    }
  }

  function loadAddToHomescreenPrompt() {
    if (!shouldShowAddToHomescreenPrompt) return;

    var img = new Image();
    img.onload = function() {
      addToHomescreenPromptImageWidth = img.width;
      addToHomescreenPromptImageHeight = img.height;
      showAddToHomescreenPrompt();
    };
    img.src = addToHomescreenPromptImage;
  }

  function showAddToHomescreenPrompt() {
    if (!shouldShowAddToHomescreenPrompt) return;

    var vp = document.querySelector('meta[name="viewport"]'),
        vpContent = vp.getAttribute('content'),
        vpWidth = vpContent.match(/width=(\d+)/);

    if (vpWidth) {
      vpWidth = vpWidth[1];
    } else {
      vpWidth = contentWidth;
    }

    var vpToScreenRatio = vpWidth / screenWidth,
        promptWidth = addToHomescreenPromptImageWidth / 2,
        promptHeight = addToHomescreenPromptImageHeight / 2;

    promptAnchorTop = (promptAnchorTop / 2) * vpToScreenRatio;
    promptAnchorLeft = (promptAnchorLeft / 2) * vpToScreenRatio;

    if (window.navigator.userAgent.match(/iPad/)) {
      var targetPointTop = 0,
          targetPointLeft = 143 * vpToScreenRatio;
    } else {
      var targetPointTop = (screenHeight - 100) * vpToScreenRatio,
          targetPointLeft = (screenWidth / 2) * vpToScreenRatio;
    }

    var bgTop = targetPointTop - promptAnchorTop,
        bgLeft = targetPointLeft - promptAnchorLeft;

    var overlay = new Layer({
      x: 0,
      y: 0,
      width: contentWidth,
      height: contentHeight,
      backgroundColor: 'rgba(0, 0, 0, 0.50)'
    });
    overlay.index = 9999;

    var view = new Layer({
      y: bgTop,
      x: bgLeft,
      width: promptWidth * vpToScreenRatio,
      height: promptHeight * vpToScreenRatio,
      image: addToHomescreenPromptImage,
      scale: 0.35,
      opacity: 0,
      originX: promptAnchorLeft / (promptWidth * vpToScreenRatio),
      originY: promptAnchorTop / (promptHeight * vpToScreenRatio)
    });
    view.index = 9999;

    view.animate({
      properties: {
        scale: 1,
        opacity: 1
      },
      curve: 'spring(300, 20, 0)'
    });

    view.on(Events.TouchStart, function() {
      view.animate({
        properties: {
          scale: 0.35,
          opacity: 0
        },
        curve: 'spring(300, 20, 0)'
      }).on('end', function() { view.destroy(); });

      overlay.animate({
        properties: {
          opacity: 0
        },
        curve: 'spring(300, 20, 200)'
      }).on('end', function() { overlay.destroy(); });
    });
  }

  function preventScrollBounce() {
    patchScrollingLayers();
    preventScrollingOnRootElement();
  }

  function preventScrollingOnRootElement() {
    root = document.getElementById('FramerRoot');
    if (!root) {
      return setTimeout(preventScrollingOnRootElement, 10);
    }

    var properties = {
      width: contentWidth + 'px',
      height: contentHeight + 'px',
      position: 'absolute',
      left: 0,
      top: 0
    };

    addStyle('.framer-template-scroll-fix { ' + objectToCSS(properties) +' }');
    root.classList.add('framer-template-scroll-fix');

    root.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
  }

  function patchScrollingLayers() {
    var originalSetPropertyValue = Layer.prototype._setPropertyValue;

    Layer.prototype._setPropertyValue = function(k, v) {
      if (k === 'scrollVertical') {
        // We're checking for the existence of _eventListener, because
        // Framer seems to throw an exception if you try to remove a listener
        // that hasn't been added in the first place.
        if (this._eventListeners) {
          this.off('touchmove', handleScrollingLayerTouchMove);
          this.off('touchstart', handleScrollingLayerTouchStart);
        }

        if (v) {
          this.on('touchmove', handleScrollingLayerTouchMove);
          this.on('touchstart', handleScrollingLayerTouchStart);
        }
      }

      originalSetPropertyValue.call(this, k, v);
    }

    if (Framer.Session) {
      // Patch layers that have already been initialized
      var layers = Framer.Session._LayerList, i = layers.length;
      while(i--) {
        layers[i]._setPropertyValue = Layer.prototype._setPropertyValue.bind(layers[i]);
        if(layers[i].scrollVertical) {
          layers[i].scrollVertical = layers[i].scrollVertical;
        }
      }
    }
  }

  // Ensures that the clientX and clientY we get from touch events
  // respect the current zoom level. Makes it possible for draggables to
  // accurately track touch events.

  function patchTouchEvents() {
    var originalTouchEvent = Events.touchEvent;
    Events.touchEvent = function(event) {
      var e = _.extend({}, originalTouchEvent(event));
      var zoomFactorFromScale = scale * (screenWidth/contentWidth);
      e.clientX = e.clientX / zoomFactorFromScale;
      e.clientY = e.clientY / zoomFactorFromScale;
      return e;
    }
  }

  function handleScrollingLayerTouchMove(event) {
    event.stopPropagation();
  }

  function handleScrollingLayerTouchStart(event) {
    var element = this._element,
        startTopScroll = element.scrollTop;

    if (startTopScroll <= 0) {
      element.scrollTop = 1;
    }

    if (startTopScroll + element.offsetHeight >= element.scrollHeight) {
      element.scrollTop = element.scrollHeight - element.offsetHeight - 1;
    }
  }

  function zoomTo(factor) {
    scaleOverriddenByZoomFactor = true;
    scale = factor / (screenWidth/contentWidth);
    zoomFactor = factor;

    layout();
    updateZoomControl();
  }

  function zoomToFit() {
    scaleOverriddenByZoomFactor = false;
    layout();
    updateZoomControl();
  }

  function zoomIn() {
    var zoomFactorFromScale = scale * (screenWidth/contentWidth);

    if (zoomFactorFromScale >= 2) {
      zoomToFit();
    } else {
      targetZoomFactor = zoomFactorFromScale + 0.25 - (zoomFactorFromScale % 0.25)
      zoomTo(targetZoomFactor);
    }
  }

  function zoomOut() {
    var zoomFactorFromScale = scale * (screenWidth/contentWidth);

    if (zoomFactorFromScale <= 0.25) {
      zoomToFit();
    } else {
      if (zoomFactorFromScale % 0.25) {
        targetZoomFactor = zoomFactorFromScale - (zoomFactorFromScale % 0.25)
      } else {
        targetZoomFactor = zoomFactorFromScale - 0.25;
      }

      zoomTo(targetZoomFactor);
    }
  }

  function updateZoomControl() {
    if (!zoomControlElement) {
      zoomControlElement = document.createElement('span');
      zoomControlElement.className = 'framer-template-zoom-control'

      var properties = {
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        background: 'rgba(0, 0, 0, 0.45)',
        'border-radius': '3px',
        'color': '#fff',
        padding: '4px 6px',
        opacity: '0.35',
        font: 'normal 14px/20px sans-serif',
        '-webkit-transition': 'all 0.35s'
      };

      var hoverProperties = {
        opacity: 1
      };

      addStyle('.framer-template-zoom-control { ' + objectToCSS(properties) +' }');
      addStyle('.framer-template-zoom-control:hover { ' + objectToCSS(hoverProperties) +' }');
      document.body.appendChild(zoomControlElement);
    }

    if (scaleOverriddenByZoomFactor) {
      zoomControlElement.innerHTML = Math.round(zoomFactor * 100) + '%';
    } else {
      zoomControlElement.innerHTML = 'Fit to Screen';
    }

  }

  function layout() {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;

    if (!scaleOverriddenByZoomFactor) {
      calculateScale();
    }

    positionDeviceBackground();
    positionFramerRoot();
  }

  function handleKeydown() {
    var charCode = event.which,
        key = String.fromCharCode(charCode).toLowerCase();

    if (event.altKey && key === 'p') {
      togglePresentationMode();
    }

    if (event.altKey && isPresentationMode) {
      if(key === '1') {
        zoomTo(1);
      }

      if(key === '2') {
        zoomTo(0.75);
      }

      if(key === '3') {
        zoomTo(0.5);
      }

      if(key === '4') {
        zoomTo(0.25);
      }

      if(key === '0') {
        zoomToFit();
      }

      // Alt -
      if(charCode === 189) {
        zoomOut();
      }

      // Alt +
      if(charCode === 187) {
        zoomIn();
      }
    }
  }

  function initialize() {
    body = document.body;

    if(isMobile) {
      if (!isStandalone) {
        setTimeout(loadAddToHomescreenPrompt, 10);
      }

      if(preventBounce) {
        preventScrollBounce();
      }
    } else {
      isPresentationMode = !isPresentationMode;
      togglePresentationMode();
      patchTouchEvents();
    }

    window.addEventListener('keydown', handleKeydown, false);
  }

  if(document.body) {
    initialize();
  } else {
    Utils.domComplete(initialize);
  }
})();
