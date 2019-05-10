$(function(){
  const penImage = 'images/pen1_b.png';
  const eraserImage = 'images/pen1_w.png';
  const hightTexImage = 'images/map_height.png';
  const downloadFileName = 'anothermap_image';
  const penScales = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];
  const penSize = 50.0;

  let penScale = 1.0;
  let isEraser = false;
  let c_width  = $('#content').width();
  let c_height = $('#content').height();

  const canvas = $('#canv-draw').get(0);
  const ctx = canvas.getContext('2d');
  canvas.width = c_width;
  canvas.height = c_height; 

  var bg = new Image();
  bg.src = "images/bg1.jpg";
  bg.onload = function(){
    ctx.drawImage(bg, 0, 0);
    initCanvas();
  };

  var pen = new Image();
  pen.src = penImage;
  var eraser = new Image();
  eraser.src = eraserImage;

  let prevSec = new Date() * 1;
  function draw(e) {
    const now = new Date() * 1;
    const delta = now - prevSec;
    prevSec = now;
    if(delta < 9) {
      return;
    }
    const drawSize = penSize * penScale;

    const x = e.offsetX - (drawSize / 2);
    const y = e.offsetY - (drawSize / 2);;
    const penImage = (isEraser) ? eraser : pen;
    ctx.drawImage(penImage, 0, 0, penSize, penSize, x, y, drawSize, drawSize);
  }

  let isDrag = false;
  $('#canv-draw').on('mousedown', function(e) {
    isDrag = true;
  });
  $('#canv-draw').on('mouseup', function(e) {
    isDrag = false;
    draw(e);
    updateCanvas();
  });
  $('#canv-draw').on('mousemove', function(e){
    $('#pointer').css('top', e.offsetY + 'px');
    $('#pointer').css('left', e.offsetX + 'px');
    if(!isDrag) {
      return;
    }
    draw(e);
    // updateCanvas();
  });
  $('#canv-draw').on('mouseover', function(){
    $('#pointer').css('opacity', '1');
  });
  $('#canv-draw').on('mouseleave', function(){
    $('#pointer').css('opacity', '0');
  });

  function doResize() {
    const saveBg = new Image();
    saveBg.src = canvas.toDataURL("image/png");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    c_width  = $('#content').width();
    c_height = $('#content').height();
    canvas.width = c_width;
    canvas.height = c_height; 
    ctx.drawImage(saveBg, 0, 0, 640, 640, 0, 0, c_width, c_height);
    app.view.width = c_width;
    app.view.height = c_height; 
    updateCanvas();
  }

  // PIXI -------------------------------------
  const app = new PIXI.Application({
    width: c_width,
    height: c_height,
    preserveDrawingBuffer: true
  });
  $('#canv-shade').append(app.view);

  // Set Filter
  const tex = PIXI.Sprite.from(hightTexImage);
  let myFilter = new PIXI.filters.MyFilter(tex.texture);
  app.stage.filters = [myFilter];

  // Init Background
  let layer1 = null;
  let layer2 = null;
  const initBackground = function(loader, resources) {
    layer1 = new PIXI.Sprite(resources.img.texture);
    layer2 = new PIXI.Sprite(resources.img.texture);
    app.stage.addChild(layer2);
    app.stage.addChild(layer1);
  };

  function initCanvas() {
    const loader = new PIXI.Loader();
    loader.reset();
    loader.add('img', canvas.toDataURL("image/png"));
    loader.load(initBackground);
  }

  let updateTimer = null;
  let newTex = null;
  function updateCanvas() {
    newTex = PIXI.Texture.from(canvas.toDataURL("image/png"));
    layer1.texture = newTex;

    if(updateTimer) {
      window.clearTimeout(updateTimer);
      updateTimer = null;
    }
    setTimeout(function(){
      layer2.texture = newTex;
    }, 30);
  }
  // PIXI -------------------------------------

  // Controls -------------------------------------
  $("#btn-pen-up").on('click', function(){
    isEraser = false;
    if($("#btn-pen-up").hasClass('active')){
      return;
    } else {
      $("#btn-pen-up").addClass('active');
      $("#btn-pen-down").removeClass('active');
    }
  });
  $("#btn-pen-down").on('click', function(){
    isEraser = true;
    if($("#btn-pen-down").hasClass('active')){
      return;
    } else {
      $("#btn-pen-down").addClass('active');
      $("#btn-pen-up").removeClass('active');
    }
  });

  $( "#slider-pen-size" ).slider({
    min: 0,
    max: 14,
    value: 7,
    step: 1
  });
  $("#slider-pen-size").on("slidechange", function(e, ui){
    const num = ui.value;
    penScale = penScales[num];
    $('#pointer').width(penSize * penScale).height(penSize * penScale);
  });

  $('#btn-download').on('click', function(){
    const anchor = document.createElement('a');
    anchor.href = app.view.toDataURL("image/png");
    anchor.download = downloadFileName + '.png';
    $('body').append(anchor);
    anchor.click();
    anchor.remove();
  });

  $('#btn-resize').on('click', function(){
    $('#resize-control').slideToggle('fast');
    $('#resize-w').val(c_width);
    $('#resize-h').val(c_height);
  });
  $('#btn-resize-exec').on('click', function(){
    const inputW = parseInt($('#resize-w').val());
    const inputH = parseInt($('#resize-h').val());
    $('#wrapper').width(inputW);
    $('#content').width(inputW);
    $('#content').height(inputH);
    doResize();
  });
  $('#btn-resize-cancel').on('click', function(){
    $('#resize-control').slideUp('fast');
  });

  $('#btn-flat').on('click', function(){
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, c_width, c_height);
    updateCanvas();
  });
  // Controls -------------------------------------


});
