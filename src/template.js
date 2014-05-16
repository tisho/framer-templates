(function() {
  var defaults = <% template_defaults %>;
  var options = _.defaults(Framer.Config.template || {}, defaults);

  var body = document.body,
      isMobile = navigator.userAgent.match(/(iPad|iPhone|Android)/),
      isStandalone = ('standalone' in navigator) && navigator.standalone,
      isPresentationMode = window.location.hash.indexOf('dev') === -1,
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
      sidePadding = 0.1,
      viewportWidth,
      viewportHeight,
      root,
      scale;

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
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;

    if (deviceWidth > deviceHeight) {
      scale = viewportWidth / deviceWidth * (1 - sidePadding);
    } else {
      scale = viewportHeight / deviceHeight * (1 - sidePadding);
    }
  }

  function positionDeviceBackground() {
    body.style.backgroundSize = deviceWidth * scale + 'px ' + deviceHeight * scale + 'px, cover';
  }

  function positionFramerRoot() {
    root = document.getElementById('FramerRoot');
    if (!root) {
      return setTimeout(positionFramerRoot, 10);
    }

    var properties = {
      width: contentWidth + 'px',
      height: contentHeight + 'px',
      position: 'absolute',
      left: (viewportWidth - screenWidth * scale)/2+'px',
      top: (viewportHeight - screenHeight * scale)/2+'px',
      '-webkit-transform': 'scale(' + screenWidth/contentWidth * scale + ')',
      '-webkit-transform-origin': '0 0',
      'overflow': 'hidden'
    };

    addStyle('.framer-template-positioned { ' + objectToCSS(properties) +' }');
    root.classList.add('framer-template-positioned');
  }

  function togglePresentationMode() {
    if (isPresentationMode) {
      document.body.classList.remove('framer-template-decorated-body')
      if (root) {
        root.classList.remove('framer-template-positioned')
      }

      window.removeEventListener('resize', layout, false);
      isPresentationMode = false;
    } else {
      showDeviceBackground();
      layout();
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

  function layout() {
    calculateScale();
    positionDeviceBackground();
    positionFramerRoot();
  }

  function handleKeydown() {
    var key = String.fromCharCode(event.which).toLowerCase();
    if(event.altKey && key === 'p') {
      togglePresentationMode();
    }
  }

  function initialize() {
    if(isMobile) {
      if (!isStandalone) {
        setTimeout(loadAddToHomescreenPrompt, 10);
      }
    } else {
      isPresentationMode = !isPresentationMode;
      togglePresentationMode();
    }

    window.addEventListener('keydown', handleKeydown, false);
  }

  initialize();
})();
