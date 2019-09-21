# rgbShiftSlider

rgbShiftSlider is a tiny js slider with rgb displacement animations. 
Check the demo of this project on codepen : View the demo of this project on [codepen](https://codepen.io/hmongouachon/pen/eYObzPq) 


## Dependencies :
```
https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js
https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js
js/rgbShiftSlider.min.js
```

## Markups :
```
<!-- slider -->
<div id="rbgShiftSlider" class="rgbShiftSlider"></div>

<!-- slider nav -->
<nav>
    <a href="#" class="scene-nav prev" data-nav="previous">Prev</a>
    <a href="#" class="scene-nav next" data-nav="next">Next</a>
</nav>
```

## Plugin parameters
```
nav : true,
navElement: '.scene-nav',
slideImages: images,
stageWidth: 1920,
stageHeight: 1080,
displacementImage: 'assets/displace-circle.png',
fullScreen: true,
transitionDuration: 0.35, // must be 0.1 > transitionGhostDuration
transitionGhostDuration : 0.25,
transitionFilterIntensity: 350,
transitionSpriteIntensity: 2,
mouseDispIntensity: 3,
interactive : true,
autoPlay : true,
autoPlaySpeed : 5000,
```
