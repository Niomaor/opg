var mineArray, //地雷数组 
lastNum, //剩余雷数 
countNum, //未被揭开的方块数 
inGame = 0, //游戏状态，0为结束，1为进行中，2为初始化完毕但未开始 
startTime; //开始时间 
//以下操作1表示揭开一个方块，操作2表示标记一个小旗，操作3表示标记一个问号，操作4表示若某个方块周围的地雷全都标记完，则将其周围剩下的方块挖开 
$(function(){ 
$('#main').mouseup(function(e) { 
var clicked = $(e.target), 
id = clicked.attr('id'), 
cX = parseInt(id.substring(1, id.indexOf('-'))), //所点击方格的X坐标 
cY = parseInt(id.substring(id.indexOf('-') + 1)); //所点击方格的Y坐标 
if(inGame == 1) { 
if(e.which == 1) { 
if(clicked.hasClass('hidden') && !clicked.hasClass('flag')) { 
openBlock(cX,cY); //左键点击未揭开且未插旗方块即执行操作1 
} else if(!clicked.hasClass('hidden')) { 
openNearBlock(cX,cY); //由于同时点击左右键实现起来比较麻烦，所以改成用点击左键实现操作4 
} 
} else if(e.which == 3 && clicked.hasClass('hidden')) { //右键点击操作2，如果允许使用问号标记，则可执行操作3 
if(clicked.hasClass('flag')) { 
clicked.removeClass('flag'); 
if($('#check').attr('checked')) clicked.addClass('check'); 
lastNum ++; 
countNum ++; 
} else if(clicked.hasClass('check')) { 
clicked.removeClass('check'); 
} else { 
clicked.addClass('flag'); 
lastNum --; 
countNum --; 
} 
$('#lastnum').text(lastNum); 
} 
if(lastNum == countNum) endGame(1); //因为最后剩下的方块均为雷时应直接结束游戏，因此设置为剩余雷数和未被揭开的方块数相等的时候结束游戏 
} else if(inGame == 2) { 
if(e.which == 1) { //初始化完毕后只允许点击左键开始游戏 
openBlock(cX,cY); 
inGame = 1; 
var now = new Date(); 
startTime = now.getTime(); 
timer(); 
} 
} 
}); 
$('#main').bind('contextmenu', function(){ return false; }); //阻止默认右击事件 
}); 
//初始化 
function init(x, y, mine) { 
countNum = x * y; 
inGame = 2; 
lastNum = mine; 
mineArray = new Array(y + 2); 
$.each(mineArray, function(key) { 
mineArray[key] = new Array(x + 2); 
}); 
for(var i = 1; i <= y; i ++) { 
for(var j = 1; j <= x; j ++) { 
mineArray[i][j] = 0; 
} 
} 
while(mine > 0) { //随机布雷，-1为有雷 
var i = Math.ceil(Math.random() * y); 
var j = Math.ceil(Math.random() * x); 
if(mineArray[i][j] != -1) { 
mineArray[i][j] = -1; 
mine --; 
} 
} 
for(var i = 1; i <= y; i ++) { //遍历地雷数组，统计每个格子四周地雷的数量 
for(var j = 1; j <= x; j ++) { 
if(mineArray[i][j] != -1) { 
if(i > 1 && j > 1 && mineArray[i - 1][j - 1] == -1) mineArray[i][j] ++; 
if(i > 1 && mineArray[i - 1][j] == -1) mineArray[i][j] ++; 
if(i > 1 && j < x && mineArray[i - 1][j + 1] == -1) mineArray[i][j] ++; 
if(j < x && mineArray[i][j + 1] == -1) mineArray[i][j] ++; 
if(i < y && j < x && mineArray[i + 1][j + 1] == -1) mineArray[i][j] ++; 
if(i < y && mineArray[i + 1][j] == -1) mineArray[i][j] ++; 
if(i < y && j > 1 && mineArray[i + 1][j - 1] == -1) mineArray[i][j] ++; 
if(j > 1 && mineArray[i][j - 1] == -1) mineArray[i][j] ++; 
} 
} 
} 
var block = ''; 
for(var i = 1, row = mineArray.length - 1; i < row; i ++) { 
for(var j = 1, col = mineArray[0].length - 1; j < col; j ++) { 
block += '<div id="b' + i + '-' + j + '" style="left:' + (j - 1) * 20 + 'px;top:' + (i - 1) * 20 + 'px;" class="hidden"></div>'; 
} 
} 
$('#main').html(block).width(x * 20 + 1).height(y * 20 + 1).show(); //绘图 
$('#warning').html(''); 
$('#submenu').show(); 
$('#lastnum').text(lastNum); 
} 
//揭开方块 
function openBlock(x, y) { 
var current = $('#b' + x + '-' + y); 
if(mineArray[x][y] == -1) { 
if(inGame == 1) { //触雷时如游戏进行中，则失败结束游戏 
current.addClass('cbomb'); 
endGame(); 
} else if(inGame == 2) { //如游戏初始化后还未开始，则重新初始化地雷阵，再揭开此方块，以保证第一次点击不触雷 
init(mineArray[0].length - 2, mineArray.length - 2, lastNum); 
openBlock(x, y); 
} else { //游戏结束时需揭开全部方块，标记地雷位置 
if(!current.hasClass('flag')) current.addClass('bomb'); 
} 
} else if(mineArray[x][y] > 0) { 
if(current.hasClass('flag')) { //若在无雷的方块上标记了小旗，如果周围的广场执行操作4时波及到此方块，则触发失败结束游戏 
current.addClass('wrong'); 
if(inGame) endGame(); 
} else { 
current.html(mineArray[x][y]).addClass('num' + mineArray[x][y]).removeClass('hidden'); //显示周边的地雷数量 
if(current.hasClass('check')) current.removeClass('check'); 
if(inGame) countNum --; 
} 
} else { 
if(current.hasClass('flag')) { //同上 
current.addClass('wrong'); 
if(inGame) endGame(); 
} else { 
current.removeClass('hidden'); 
if(current.hasClass('check')) current.removeClass('check'); 
if(inGame) { //点击到周边无雷的方块时，自动揭开周围方块 
countNum --; 
var row = mineArray.length - 2, col = mineArray[0].length - 2; 
if(x > 1 && y > 1 && $('#b' + (x - 1) + '-' + (y - 1)).hasClass('hidden')) openBlock(x - 1, y - 1); 
if(x > 1 && $('#b' + (x - 1) + '-' + y).hasClass('hidden')) openBlock(x - 1, y); 
if(x > 1 && y < col && $('#b' + (x - 1) + '-' + (y + 1)).hasClass('hidden')) openBlock(x - 1, y + 1); 
if(y < col && $('#b' + x + '-' + (y + 1)).hasClass('hidden')) openBlock(x, y + 1); 
if(x < row && y < col && $('#b' + (x + 1) + '-' + (y + 1)).hasClass('hidden')) openBlock(x + 1, y + 1); 
if(x < row && $('#b' + (x + 1) + '-' + y).hasClass('hidden')) openBlock(x + 1, y); 
if(x < row && y > 1 && $('#b' + (x + 1) + '-' + (y - 1)).hasClass('hidden')) openBlock(x + 1, y - 1); 
if(y > 1 && $('#b' + x + '-' + (y - 1)).hasClass('hidden')) openBlock(x, y - 1); 
} 
} 
} 
} 
//揭开格子邻近确认无雷的方块 
function openNearBlock(x, y) { 
var flagNum = 0, hiddenNum = 0; 
for(i = x - 1; i < x + 2; i ++) { 
for(j = y - 1; j < y + 2; j ++) { 
if(mineArray[i][j] != undefined) { 
if($('#b' + i + '-' + j).hasClass('flag')) flagNum ++; //统计方块周围的旗帜数和未揭开的方块数 
if($('#b' + i + '-' + j).hasClass('hidden')) hiddenNum ++; 
} 
} 
} 
if(flagNum == mineArray[x][y] && hiddenNum > flagNum) { //旗帜数和雷数相等且有未揭开方块且未插旗的方块时，则揭开它 
for(i = x - 1; i < x + 2; i ++) { 
for(j = y - 1; j < y + 2; j ++) { 
if(mineArray[i][j] >= 0 && $('#b' + i + '-' + j).hasClass('hidden')) openBlock(i, j); 
} 
} 
} 
} 
//计时 
function timer(){ 
if(inGame == 1) { //只在游戏进行中计时 
var now = new Date(), 
ms = now.getTime(); 
$('#time').text(Math.ceil((ms - startTime) / 1000)); 
if(inGame == 1) setTimeout(function() { timer(); }, 500); 
} else if(inGame == 2) { 
$('#time').text('0'); 
} 
} 
//结束游戏 
function endGame(isWin) { 
inGame = 0; 
for(var i = 1, row = mineArray.length - 1; i < row; i ++) { 
for(var j = 1, col = mineArray[0].length - 1; j < col; j ++) { 
if(isWin) { 
if($('#b' + i + '-' + j).hasClass('hidden') && !$('#b' + i + '-' + j).hasClass('flag')) $('#b' + i + '-' + j).addClass('flag'); 
lastNum = 0; 
$('#lastnum').text(lastNum); 
} else { 
openBlock(i, j); 
} 
} 
} 
$('#warning').text(isWin ? 'You Win!' : 'You Lose!'); 
} 