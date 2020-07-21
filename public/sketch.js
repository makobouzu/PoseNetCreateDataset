let img_dom; //読み込んだimgのDom
let img; //読み込んだimgのp5.Image
let images;  //assets内の全ての画像の名前
let img_dir = "/assets" //choose default: /assets or /img
let net;  //posenet.model
let poses = {}; //pose格納用
let points = []; //変更可能なxy特徴点
let initial_points = []; //推論結果のxy特徴点
let points_name = []; //特徴点の名前
let output_json  = {}; //複数人用のjson
let json_array = []; //複数人用のjson_array
let drag_flg = false;
let image_name = ""; //image_name格納用

function setup(){
  frameRate(0); // block call draw() before init()
  init();
}

function draw(){
  resizeImage(img, img_dom.height);
  image(img, 0, 0);
  drawKeypoints(points);
  dragKeypoints(points);
}

/* draw function ---------------------------------- */
//keypointsの描画
function drawKeypoints(_points){
  for(let i = 0; i < _points.length; i++){
    fill(255, 0, 0);
    ellipse(_points[i].x, _points[i].y, 10, 10);
    textAlign(CENTER, CENTER);
    text(points_name[i], _points[i].x, _points[i].y-8);
  }
}

/* initialize functinos -----------------------------
** 同期処理
*/
async function init() {
  console.log("[START]");
  img_dom = document.getElementById("img");
  console.log("loading dataset...");
  const all_data = await doGet("/data/dataset.json");
  console.log("loaded data is",all_data);
  if(all_data.imgInfo.length > 0){
    for(let i = 0; i < all_data.imgInfo.length; i++){
      json_array.push(all_data.imgInfo[i]);
    }
  }
  
  images = await doGet(img_dir+"/all");
  image_name = images[0];
  img = loadImage(img_dir+"/"+image_name);
  for(let i = 0; i < images.length ; i++){
      let option = document.createElement("option");
      option.setAttribute("value", images[i]);
      option.text = images[i];
      document.getElementById("img_select").appendChild(option);
  }

  net = await loadPosenet();

  const img_size = await loadImgsrc(img_dir+"/"+image_name);
  createCanvas(img_size.x, img_size.y);
  
  if(all_data.length > 0){
    let fullPath = await doGet(img_dir+"/u/"+image_name);
    let searched = await searchData(all_data.imgInfo, fullPath[0]);
    json_array = await deleteData(json_array, fullPath[0]);
    if(searched.length == 1){
      poses = searched[0].pose;
    }else{  
      poses = await getPose(img_dom);
    }
  }else{
    poses = await getPose(img_dom);
  }
  initial_points = await setinitial_points(img_dom);
  
  console.log("show now (saved data or posenst)", poses);
  console.log("[READY]");
  frameRate(30);
  
  setKeypoints(poses);
}

async function loadPosenet() {
  return new Promise(resolve =>{
   console.log("loading model ...");
    resolve(posenet.load());
    console.log("loaded model!"); 
  })
}

async function loadImgsrc(_path) {
  return new Promise(resolve =>{
      img_dom.src = _path
      img_dom.onload = function(){
      resolve({x: img_dom.width, y: img_dom.height})
    }
  })
}

async function getPose(_img) {
  return new Promise(resolve =>{
    let poses = net.estimateSinglePose(_img, {flipHorizontal: false});
    resolve(poses);
  })
}

function resizeImage(_img, _window_size){
  let scale = _window_size/_img.height;
  _img.width = _img.width*scale;
  _img.height = _img.height*scale;
}

/* events ----------------------------------------*/
function mouseDragged(){ 
  drag_flg = true;                        
}

function mouseReleased(){ 
  drag_flg = false;
}

//ドラッグした時の挙動
function dragKeypoints(_points){
  for(let i = 0; i < _points.length; i++){
    let distance = Math.sqrt(Math.pow(_points[i].x - mouseX, 2) + Math.pow(_points[i].y - mouseY, 2));
    
    if(distance < 8){
      if(drag_flg){
        _points[i].x = mouseX;
        _points[i].y = mouseY;
      }else{
        return;
      }
    }
  }
}

function keyTyped() {
  if(key === "z"){ //デフォルトの人型にkeypointsを配置
    points = [];
    let defalt = defaltPoints(img_dom.height);
    points = defalt;
  }else if(key === "a"){
    points = [];
    points = initial_points;
  }
}

async function imgSelect(_image_name){
  // save json
  let fullPath = await doGet(img_dir+"/u/"+image_name);
  const jt = createJson(fullPath[0], img, poses, points);
  json_array.push(jt);
  output_json.imgInfo = json_array;
  console.log("saving...", output_json);
  let s = await doPost("/data/dataset.json", output_json);
  console.log("saved!");
  
  //新しいimageを代入
  image_name = _image_name;
  img = loadImage(img_dir+"/"+image_name);
  const img_size = await loadImgsrc(img_dir+"/"+image_name);
  resizeCanvas(img_size.x, img_size.y);
  
  fullPath = await doGet(img_dir+"/u/"+image_name);
  let searched = await searchData(json_array, fullPath[0]);
  json_array = await deleteData(json_array, fullPath[0]);
  if(searched.length == 1){
    poses = searched[0].pose;
  }else{
    poses = await getPose(img_dom);
  }
  
  initial_points = await setinitial_points(img_dom);
  
  console.log("show now (saved data or posenst)", poses);
  
  setKeypoints(poses);
}


/*  dataset (json, get, post) ------------------------------------- */
async function doGet(_url) {
  return new Promise(resolve =>{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", _url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      resolve(JSON.parse(xhr.response));
    };
    xhr.onerror = () => {
     console.log(xhr.status);
     console.log("error!");
    };
    xhr.send();
  })
}

async function doPost(_url, _data) {
  return new Promise(resolve =>{
    var xhr = new XMLHttpRequest();
    var jsonText = JSON.stringify(_data);
    xhr.open("POST", _url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
     resolve("saved");
    };
    xhr.onerror = () => {
     resolve(xhr.status);
     console.log("error!");
    };
    xhr.send(jsonText);
  })
}

async function searchData(_json, _url) {
  return new Promise((resolve, reject) =>{
    let array = _json.filter(function(asset, index, array) {
      return asset.meta.url == _url
    });
      resolve(array);
  })
}

async function deleteData(_json, _url) {
  return new Promise(resolve =>{
    let array = _json.filter(function(asset, index, array) {
      return asset.meta.url != _url
    });
      resolve(array);
  })
}

//json書き出し, 1画像の保存(複数をまとめる場合はこれを[]に入れてpushする。)
function createJson(_url, _img, _poses, _points){ 
  let json = {};
  let metaInfo = {};
  let pose   = {};
  let keypoint = [];
  
  for(let i = 0; i < _poses.keypoints.length; i++){
    let pointInfo = {};
    let positionInfo = {};
    pointInfo.part     = _poses.keypoints[i].part;
    positionInfo.x     = _points[i].x;
    positionInfo.y     = _points[i].y;
    pointInfo.position = positionInfo;
    pointInfo.score    = 1;
    keypoint.push(pointInfo);
  }
  
  pose.score      = 1;
  pose.keypoints  = keypoint;
  
  metaInfo.url    = _url;
  metaInfo.img_width  = _img.width;
  metaInfo.img_height = _img.height;
  
  json.meta = metaInfo;
  json.pose = pose;
  
  return json;
}

//推論結果の特徴点を整形
async function setinitial_points(_img){
  const init_pose = await getPose(_img);
  let init_points  = [];
  for(let i = 0; i < init_pose.keypoints.length; i++){
    let keypoint = init_pose.keypoints[i];
    let point = {};
    point.x = keypoint.position.x;    
    point.y = keypoint.position.y;
    init_points.push(point); //initial_pointsに推論結果を[{x,y}, {x,y}...]で格納
  }
  console.log("posenet", init_points);
  return init_points;
}

//推論されたkeypoints
function setKeypoints(_poses){
  if(_poses != null){
    points         = [];
    points_name     = [];
    for (let i = 0; i < _poses.keypoints.length; i++) {
      let keypoint = _poses.keypoints[i];
      let point = {};
      point.x = keypoint.position.x;    
      point.y = keypoint.position.y;
      points.push(point); //変更可能なkeypoints
      points_name.push(keypoint.part); //keypointの名前
    }
  }
}


//デフォルトの人型のkeyPoints
function defaltPoints(_img_dom_height){
  let scale = _img_dom_height / 600;
  let defalt_points = [];
  let point = {};
  point.x = 145.93384074051556 *scale;
  point.y = 84.88433778517906 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 158.94615606760703 *scale;
  point.y = 79.21558484029214 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 140.5660896746565 *scale;
  point.y = 73.14461437180813 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 181.9026657876338 *scale;
  point.y = 90.91994289294291 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 133.3637215580922 *scale;
  point.y = 81.57989858189445 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 199.83734772084756 *scale;
  point.y = 159.6984091435889 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 107.3622106411114 *scale;
  point.y = 159.71107334478356 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 210.55019322258028 *scale;
  point.y = 248.48954612642876 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 83.281543776219 *scale;
  point.y = 237.16744745751765 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 204.86679896491978 *scale;
  point.y = 318.94147702228236 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 83.81899751299551 *scale;
  point.y = 323.6777813981943 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 180.08774860545356 *scale;
  point.y = 314.97553368950634 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 125.55639292201181 *scale;
  point.y = 313.1492525687014 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 179.59322134530038 *scale;
  point.y = 420.1893966021705 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 128.4412302692577 *scale;
  point.y = 421.89541234116615 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 166.79778269014474 *scale;
  point.y = 516.4427404737659 *scale;
  defalt_points.push(point);
  point = {};
  point.x = 143.20343183821745 *scale;
  point.y = 512.255218149623 *scale;
  defalt_points.push(point);
  return defalt_points;
}