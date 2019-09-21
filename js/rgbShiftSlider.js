  /*!
 * rbgShiftSlider :  little plugin to create slides with rgba glitch transition
 * (c) 2019 Hadrien Mongouachon
 * MIT Licensed.
 *
 * Author URI: http://hmongouachon.com
 * Plugin URI: https://github.com/hmongouachon/GlitchrbgShiftSlider

 * Version: 1.0.0
 */
  ;
  (function() {

      window.rbgShiftSlider = function(options) {

          ///////////////////////////////    

          //  OPTIONS

          /////////////////////////////// 

          options = options || {};
          options.slideImages = options.hasOwnProperty('slideImages') ? options.slideImages : [];
          options.stageWidth = options.hasOwnProperty('stageWidth') ? options.stageWidth : 1920;
          options.stageHeight = options.hasOwnProperty('stageHeight') ? options.stageHeight : 1080;
          options.displacementImage = options.hasOwnProperty('displacementImage') ? options.displacementImage : '';
          options.fullScreen = options.hasOwnProperty('fullScreen') ? options.fullScreen : true;
          options.transitionDuration = options.hasOwnProperty('transitionDuration') ? options.transitionDuration : 0.25;
          options.transitionGhostDuration = options.hasOwnProperty('transitionGhostDuration') ? options.transitionGhostDuration : 0.25;
          options.transitionFilterIntensity = options.hasOwnProperty('transitionFilterIntensity') ? options.transitionFilterIntensity : 350;
          options.transitioSpriteIntensity = options.hasOwnProperty('transitioSpriteIntensity') ? options.transitioSpriteIntensity : 2;
          options.mouseDispIntensity = options.hasOwnProperty('mouseDispIntensity') ? options.mouseDispIntensity : 3;
          options.nav = options.hasOwnProperty('nav') ? options.nav : true;
          options.navElement = options.hasOwnProperty('navElement') ? options.navElement : '.scene-nav';
          options.interactive = options.hasOwnProperty('interactive') ? options.interactive : true;
          options.autoPlay = options.hasOwnProperty('autoPlay') ? options.autoPlay : true;
          options.autoPlaySpeed = options.hasOwnProperty('autoPlaySpeed') ? options.autoPlaySpeed : 3000;

          ///////////////////////////////    

          //  METHODS

          // create 3 containers, set rgb colors with filterMatrix
          // each container will have the same background img, same filters and displacement img
          // for transition between slides, a fake object named "ghostEl" will be animate with easing by gsap
          // the x value of this object will be use to create transition effect and fake user gesture for slide transition

          /////////////////////////////// 

          ///////////////////////////////    

          //  VARS

          ///////////////////////////////

          var canvas = document.getElementById("rbgShiftSlider");

          // remove pixi message in console
          PIXI.utils.skipHello();
          var stage = new PIXI.Container();
          var renderer = PIXI.autoDetectRenderer(options.stageWidth, options.stageHeight, {
              transparent: true
          }); // transparent: true

          var render;
          var slidesContainer = new PIXI.Container();

          var bgs = [],
              texture_bg = [],
              containers = [],
              channelsContainer = [],
              displacementFilters = [],
              displacementSprites = [];

          var redChannelFilter, greenChannelFilter, blueChannelFilter;
          var containerRed, containerGreen, containerBlue;

          const ghostEl = {
              x: 0,
              y: 0,
          };

          var posx = 0,
              posy = 0;
          var node_xp = 0,
              node_yp = 0;

          var rafId_gestureMove, rafId_transition;
          var baseTimeline;

          // slide index
          var currentIndex = 0;

          var isPlaying = false;
          
          // autoplay
          var interval, autoplay;

          ///////////////////////////////    

          //  Build pixi scene

          ///////////////////////////////

          function build_scene() {

              // append render to canvas
              canvas.appendChild(renderer.view);

              // Add children containers to the stage = canvas 
              stage.addChild(slidesContainer);

              // Fit renderer to the screen
              if (options.fullScreen === true) {
                  renderer.view.style.objectFit = 'cover';
                  renderer.view.style.width = '100%';
                  renderer.view.style.height = '100%';
                  renderer.view.style.top = '50%';
                  renderer.view.style.left = '50%';
                  renderer.view.style.webkitTransform = 'translate( -50%, -50% ) scale(1.2)';
                  renderer.view.style.transform = 'translate( -50%, -50% ) scale(1.2)';
              } else {
                  renderer.view.style.maxWidth = '100%';
                  renderer.view.style.top = '50%';
                  renderer.view.style.left = '50%';
                  renderer.view.style.webkitTransform = 'translate( -50%, -50% )';
                  renderer.view.style.transform = 'translate( -50%, -50% )';
              }

              render = new PIXI.ticker.Ticker();
              render.autoStart = true;
              render.add(function(delta) {
                  renderer.render(stage);
              });

              slidesContainer.interactive = true;

          }

          ///////////////////////////////    

          //  Build rgb containers

          ///////////////////////////////
          function build_RGBcontainers() {

              redChannelFilter = new PIXI.filters.ColorMatrixFilter();
              redChannelFilter.matrix = [
                  1, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 1, 0
              ];

              greenChannelFilter = new PIXI.filters.ColorMatrixFilter();
              greenChannelFilter.matrix = [
                  0, 0, 0, 0, 0,
                  0, 1, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 1, 0
              ];

              blueChannelFilter = new PIXI.filters.ColorMatrixFilter();
              blueChannelFilter.matrix = [
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 1, 0, 0,
                  0, 0, 0, 1, 0
              ];

              channelsContainer.push(redChannelFilter, greenChannelFilter, blueChannelFilter);

              // CONTAINERS 
              containerRed = new PIXI.Container();
              containerRed.position.x = 0;
              containerGreen = new PIXI.Container();
              containerGreen.position.x = 0;
              containerBlue = new PIXI.Container();
              containerBlue.position.x = 0;

              containers.push(containerRed, containerGreen, containerBlue);

              // set texture for each background (used later for slide transition)
              for (var i = 0; i < options.slideImages.length; ++i) {
                  texture_bg[i] = new PIXI.Texture.fromImage(options.slideImages[i]);
              }

              // set displacement filter and displacement sprite for each container
              for (var i = 0, len = containers.length; i < len; i++) {

                  slidesContainer.addChild(containers[i]);
                  texture = new PIXI.Texture.fromImage(options.displacementImage);

                  // push sprites & filters to array
                  displacementSprites.push(new PIXI.Sprite(texture));
                  displacementFilters.push(new PIXI.filters.DisplacementFilter(displacementSprites[i]));

                  // set first image texture background and push to array
                  var bg = new PIXI.Sprite(texture_bg[0]); //new PIXI.Sprite(texture2);
                  bgs.push(bg);
                  bgs[i].width = renderer.view.width;
                  bgs[i].height = renderer.view.height;
                  bgs[i].anchor.set(0.5)
                  bgs[i].x = renderer.view.width / 2;
                  bgs[i].y = renderer.view.height / 2;
                  bgs[i].alpha = 0;

                  // add bg array + displacement sprites array to container 
                  containers[i].addChild(displacementSprites[i], bgs[i]);

                  // addchannel container filter array + displacement filter array to container 
                  containers[i].filters = [displacementFilters[i], channelsContainer[i]];

                  // init x y value 
                  displacementFilters[i].scale.x = 0;
                  displacementFilters[i].scale.y = 0;

                  // set autofit
                  displacementFilters[i].autoFit = true;

              }

              // add different anchor value to each displacementSprite
              displacementSprites[0].anchor.set(0.0);
              displacementSprites[1].anchor.set(0.5);
              displacementSprites[2].anchor.set(0.3);

              // add blend mode
              // containers[0].filters[1].blendMode = PIXI.BLEND_MODES.ADD;
              containers[1].filters[1].blendMode = PIXI.BLEND_MODES.ADD;
              containers[2].filters[1].blendMode = PIXI.BLEND_MODES.ADD;

          }

          ///////////////////////////////    

          //  Next slide transition

          ///////////////////////////////
          function next_slide(next) {

              // init ghost x value
              TweenMax.set(ghostEl, {
                  x: 0,
                  ease: Power0.easeOut,

              });

              // init basetimeline
              baseTimeline = new TimelineMax({
                  onStart: function() {

                      isPlaying = true;

                      // fake user gesture from left to right
                      TweenMax
                          .to(ghostEl, options.transitionGhostDuration , {
                              x: screen.width,
                              ease: Power0.easeOut,
                          })
                  },

                  onComplete: function() {

                      // update current index
                      currentIndex = next;

                      isPlaying = false;

                      if (options.interactive === true) {
                          // init mouse gesture
                          gestureEffect();
                      }
                  },

                  onUpdate: function() {
                      // make transition displacement effect
                      node_xp += ((ghostEl.x - node_xp) / 3);
                      node_yp += ((ghostEl.x - node_yp) / 3);

                      for (var i = 0, len = containers.length; i < len; i++) {
                          displacementFilters[i].scale.x = Math.atan(node_xp - (displacementSprites[i].x)) * (baseTimeline.progress() * options.transitionFilterIntensity);
                          displacementSprites[i].position.x = node_yp * (baseTimeline.progress() * options.transitionSpriteIntensity);
                      }

                      // console.log(ghostEl.x)

                  }

              });

              // baseTimeline.clear();

              // if (baseTimeline.isActive()) {
              //     return;
              // }

              baseTimeline
                  // hide all 3 containers backgrounds 
                  .to([bgs[0], bgs[1], bgs[2]], options.transitionDuration, {
                      alpha: 0,
                      ease: Power2.easeOut
                  }, options.transitionDuration)

                  // add fn for container bg texture update
                  .add(updateTextureBgs, options.transitionDuration);

              function updateTextureBgs() {
                  for (var i = 0; i < options.slideImages.length; ++i) {
                      if (i == next) {
                          for (var j = 0, len = containers.length; j < len; j++) {

                              // update texture
                              bgs[j].texture = texture_bg[i];

                              // show background with new texture
                              baseTimeline
                                  .to(bgs[j], options.transitionDuration, {
                                      alpha: 1,
                                      ease: Power2.easeOut
                                  }, options.transitionDuration);

                          }

                      }
                  }

              }
          };

          ///////////////////////////////    

          //  gesture effect 

          ///////////////////////////////

          function gestureEffect() {

              // re init animation
              cancelAnimationFrame(rafId_transition);

              // make sure basetimeline is not running
              if (baseTimeline.isActive()) {
                  return;
              }

              // reinit x/y value for sprites and filters
              for (var i = 0, len = containers.length; i < len; i++) {

                  displacementSprites[i].x = 0;
                  displacementSprites[i].y = 0;

                  displacementFilters[i].scale.x = 0;
                  displacementFilters[i].scale.y = 0;
              }

              // add mouse / touch event
              slidesContainer
                  .on('mousemove', onPointerMove)
                  .on('touchmove', onPointerMove);

              function onPointerMove(eventData) {

                  // get mouse value
                  posx = eventData.data.global.x;
                  posy = eventData.data.global.y;

              }

              // use raf for smooth sprites / filters animation
              ticker();

              function ticker() {

                  rafId_gestureMove = requestAnimationFrame(ticker);

                  // make sure transition is done
                  if (ghostEl.x >= screen.width) {

                      // get new mouse positions with dumping intensity ( between [1-10] : 1 is faster)
                      node_xp += ((posx - node_xp) / options.mouseDispIntensity);
                      node_yp += ((posy - node_yp) / options.mouseDispIntensity);

                      for (var i = 0, len = containers.length; i < len; i++) {

                          // update disp scale x / y values
                          displacementFilters[i].scale.x = (node_xp - (displacementSprites[i].x));
                          displacementFilters[i].scale.y = (node_yp - (displacementSprites[i].y));

                          // update sprite x / y values
                          displacementSprites[i].position.x = node_xp;
                          displacementSprites[i].position.y = node_yp;

                      }

                  } else {
                      cancelAnimationFrame(rafId_gestureMove);
                  }

              }
          };
          

          ///////////////////////////////    

          //  navigation

          ///////////////////////////////

          if(options.nav === true) {

            var nav = document.querySelectorAll(options.navElement);

              for (var i = 0; i < nav.length; i++) {

                  var navItem = nav[i];

                  navItem.onclick = function(event) {

                      // Make sure the previous transition has ended
                      if (isPlaying) {
                          return false;
                      }

                      if (this.getAttribute('data-nav') === 'next') {

                          if (currentIndex >= 0 && currentIndex < options.slideImages.length - 1) {
                              next_slide(currentIndex + 1);
                          } else {
                              next_slide(0);
                          }
                          if(options.autoPlay === true) {
                            // re init autoplay
                            clearInterval(interval);
                            autoplay();
                          }
                      } else {
                          if (currentIndex > 0 && currentIndex < options.slideImages.length) {
                              next_slide(currentIndex - 1);
                          } else {
                              next_slide(options.slideImages.length - 1);
                          }

                          if(options.autoPlay === true) {
                            // re init autoplay
                            clearInterval(interval);
                            autoplay();
                          }
                      }
                      return false;
                  }

              }
          }


          ///////////////////////////////    

          //  autoplay

          ///////////////////////////////

          function autoplay(){
              interval = setInterval(function() {

                  // if (isPlaying) {
                  //         return false;
                  //     }

                  currentIndex = currentIndex + 1;

                  if (currentIndex === options.slideImages.length) {
                      currentIndex = 0;
                      next_slide(currentIndex);
                  } else {
                      next_slide(currentIndex);
                  }

                  // // clear after x seconds
                  // if (Date.now() - started > 15000) {
                  //   // pause it
                  //   // clearInterval(interval);
                  // } 
                  // else {
                  //   // the thing to do every 100ms
                  // }


              }, options.autoPlaySpeed); // default 3000ms
          };


          ///////////////////////////////    

          //  init slider

          ///////////////////////////////

          function init_slider() {
              build_scene();
              build_RGBcontainers();

              if (options.autoPlay === true) {

                  var started = Date.now();
                  currentIndex = 0;
                  next_slide(currentIndex);
                  autoplay();

              } else {
                  next_slide(0);
              }
          };
          
          // let's go
          init_slider();
      };

  })();