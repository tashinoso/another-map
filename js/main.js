$(function(){
  const version = '0.0.1';
  const penImage = 'images/pen1_b.png';
  const eraserImage = 'images/pen1_w.png';
  const hightTexImage = 'images/map_height.png';
  const bgImagePath = 'images/bg/';
  const bgImageNum = 30;
  const downloadFileName = 'anothermap_image';
  const penScales = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];
  const penSize = 50.0;
  const flatConfirmText = 'You sink all land to the sea.\nIs it OK?\n';
  const flatStyle = 'rgb(245, 245, 245)';
  const footerText = 'made by Another Map';

  let penScale = 1.0;
  let isEraser = false;
  let c_width  = $('#content').width();
  let c_height = $('#content').height();

  const canvas = $('#canv-draw').get(0);
  const ctx = canvas.getContext('2d');
  canvas.width = c_width;
  canvas.height = c_height; 

  console.log('version:' + version);

  const bg = new Image();
  bg.src = getBgName();
  const pen = new Image();
  pen.src = penImage;
  const eraser = new Image();
  eraser.src = eraserImage;

  function getBgName() {
    let hash = (location.hash.length >= 2) ? parseInt(location.hash.replace('#', '')) : null;
    if(hash) {
      hash = Math.max(1, hash);
      hash = Math.min(bgImageNum, hash);
    }
    const num = (hash) ? hash : getRandomInt(bgImageNum);
    $('#map-num').html('#' + num);
    console.log('map #' + num);
    return bgImagePath + 'bg' + num + '.jpg';
  }
  function getRandomInt(max) {
    const result =  Math.floor(Math.random() * Math.floor(max));
    return Math.max(1, result);
  }
  bg.onload = function(){
    ctx.drawImage(bg, 0, 0);
    initCanvas();
  };

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
    setupFooter();
  }

  // PIXI -------------------------------------
  const app = new PIXI.Application({
    width: c_width,
    height: c_height,
    preserveDrawingBuffer: true
  });
  $('#canv-shade').append(app.view);

  const stage = new PIXI.Container();
  const footer = new PIXI.Text(footerText, {fontSize:11, fontFamily:'Arial', fontWeight:100, fill:'#465682'});
  let layer1 = null;
  let layer2 = null;
  // Init Background
  const initBackground = function(loader, resources) {
    layer1 = new PIXI.Sprite(resources.img.texture);
    layer2 = new PIXI.Sprite(resources.img.texture);
    stage.addChild(layer2);
    stage.addChild(layer1);
    app.stage.addChild(stage);
    app.stage.addChild(footer);
    setupFilter(resources.tex.texture);
    setupFooter();
  };
  function setupFilter(tex){
    const utex = tex;
    let myFilter = new PIXI.filters.MyFilter(utex);
    stage.filters = [myFilter];
  }
  function setupFooter() {
    footer.position.x = c_width - 115;
    footer.position.y = c_height - 15;
  }

  function initCanvas() {
    const loader = new PIXI.Loader();
    loader.reset();
    loader.add('img', canvas.toDataURL("image/png"));
    loader.add('tex', hightTexImage);
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
    let result = window.confirm(flatConfirmText);
    if(result){
      ctx.fillStyle = flatStyle;
      ctx.fillRect(0, 0, c_width, c_height);
      updateCanvas();
    }
  });

  $('#btn-rotate').on('click', function(){
    const saveBg = new Image();
    saveBg.src = canvas.toDataURL("image/png");
    ctx.save();
    ctx.translate(c_width/2, c_height/2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-c_height/2, -c_width/2);
    ctx.drawImage(saveBg, 0, 0, c_width, c_height, 0, 0, c_height, c_width);
    ctx.restore();
    updateCanvas();
  });

  $('#show-grayscale').on('change', function(){
    const checked = $(this).prop('checked');
    const opacity = ($(this).prop('checked')) ? 1.0 : 0;
    $('#canv-draw').css('opacity', opacity);
  });
  // Controls -------------------------------------


});
