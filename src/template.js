(function() {
  var defaults = <% template_defaults %>;
  var options = utils.defaults(config.template || {}, defaults);

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

    addStyle('.framer-template-decorated-body { '+ objectToCSS(properties) +' }');
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
    root = Framer._rootElement;
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

    var overlay = new View({
      x: 0,
      y: 0,
      width: contentWidth,
      height: contentHeight,
      style: { backgroundColor: 'rgba(0, 0, 0, 0.50)' }
    });
    overlay.index = 9999;

    var view = new ImageView({
      y: bgTop,
      x: bgLeft,
      width: promptWidth * vpToScreenRatio,
      height: promptHeight * vpToScreenRatio,
      image: addToHomescreenPromptImage,
      scale: 0.35,
      opacity: 0
    });
    view.index = 9999;

    view.animate({
      properties: {
        scale: 1,
        opacity: 1
      },
      origin: promptAnchorLeft + 'px ' + promptAnchorTop + 'px',
      curve: 'spring(300, 20, 200)'
    });

    view.on(Events.TouchStart, function() {
      view.animate({
        properties: {
          scale: 0.35,
          opacity: 0
        },
        origin: promptAnchorLeft + 'px ' + promptAnchorTop + 'px',
        curve: 'spring(300, 20, 200)'
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
        utils.delay(10, loadAddToHomescreenPrompt);
      }
    } else {
      isPresentationMode = !isPresentationMode;
      togglePresentationMode();
    }

    window.addEventListener('keydown', handleKeydown, false);
  }

  initialize();
})();
