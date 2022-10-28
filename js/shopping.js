function init() {
    selectData = JSON.parse(localStorage.getItem('shoppingCart')) || {};  //第一次的时候取到的为空,但是JSON.parse返回的结果为Null

	createSelectDom();
}
var selectData = {};
ajax("http://127.0.0.1:5500/js/shoppingData.json", function success(data) {
    Renderdom(data);
    addEvent()
})
init()
function Renderdom(data) {
    var str = "";
    data.forEach(function (ele, index) {
        var color = "";
        ele.list.forEach(function (ele, index) {
            color += '<span data-id="' + ele.id + '">' + ele.color + '</span>';
        })
        str += '<tr>' +
            '<td>' +
            '<img src=' + ele.list[0].img + ' />' +
            '</td>' +
            '<td>' +
            '<p>' + ele.name + '</p>' +
            '<div class="color">' + color +
            '</div>' +
            '</td>' +
            '<td>' + ele.list[0].price + ".00元" + '</td>' +
            '<td>' +
            '<span>-</span>' +
            '<strong>0</strong>' +
            '<span>+</span>' +
            '</td>' +
            '<td><button>加入购物车</button></td>' +
            '</tr>';
    })
    var tbody1 = document.getElementsByTagName("tbody")[0];
    tbody1.innerHTML = str;
}

function addEvent() {
    var tbody1 = document.getElementsByTagName("tbody")[0];
    var tr = tbody1.getElementsByTagName("tr");
    console.log(tr)
    for (var i = 0; i < tr.length; i++) {
        active(tr[i], i)
    }
}

function active(tr, n) {
    var tds = tr.children,    //当前行里所有的td
        img = tds[0].children[0], //商品图片
        imgSrc = img.getAttribute('src'), //商品图片的地址
        name = tds[1].children[0].innerHTML,  //商品的名字
        colors = tds[1].children[1].children,  //所有颜色按钮
        price = parseFloat(tds[2].innerHTML), //价格
        spans = tds[3].querySelectorAll('span'), //加减按钮
        strong = tds[3].querySelector('strong'), //数量
        joinBtn = tds[4].children[0], //加入购物车的按钮
        selectNum = 0;    //选中商品的数量


    var last = null,  //上一次选中的按钮
        colorValue = '',  //选中的颜色
        colorId = ''; //选中商品对应的id
        for(var i = 0 ; i < colors.length; i ++){
            colors[i].index = i; 
            colors[i].onclick = function(){  
                last && last != this && (last.className = '');
				this.className = this.className ? '' : 'active';
                colorValue = this.className ? this.innerHTML : '';
                colorId = this.className ? this.dataset.id : '';
                imgSrc = this.className ? 'images/img_0' + (n + 1) + '-' + (this.index + 1) + '.png' : 'images/img_0' + (n + 1) + '-1.png';
                img.src = imgSrc;
                last = this;
            }
        }
    spans[0].onclick = function(){
        selectNum --;
       if(selectNum < 0){
        selectNum = 0;
       }
       strong.innerHTML = selectNum
    }
    spans[1].onclick = function(){
        selectNum ++;
        strong.innerHTML = selectNum
    }
    joinBtn.onclick = function(){
        if(colorValue == ''){
            alert("请添加颜色");
            return;
        }
        if(selectNum == 0){
            alert("请添加数量");
            return;
        }
        selectData[colorId] = {
            "color" : colorValue,
            "id" : colorId,
            "name" : name,
            "price" : price,
            "src" : imgSrc,
            "num" : selectNum,
            "time" : new Date().getTime()
        }
        localStorage.setItem("shoppingCart",JSON.stringify(selectData))
        img.src = 'images/img_0' + (n + 1) + '-1.png';
        last.className = "";
        strong.innerHTML = selectNum = 0;
        createSelectDom()
    }
}
function createSelectDom(){
    var tbody2 = document.getElementsByTagName("tbody")[1];
    var money = document.querySelector(".selected thead tr th strong");
    var str = "";
    var contmoney = 0;
    var goods = Object.values(selectData);
    goods.forEach(function(ele,index){
        str += '<tr>' +
        '<td>' +
            '<img src=" '+ ele.src+ '" />' +
        '</td>' +
        '<td>' +
            '<p>'+ ele.name +'</p>' +
        '</td>' +
        '<td>'+ ele.color +'</td>' +
        '<td>'+ ele.price +'</td>' +
        '<td>x' + ele.num +'</td>' +
        '<td><button data-id = "' + ele.id +' ">删除</button></td>' +
    '</tr>' 
    contmoney += ele.num * ele.price;
    })
    tbody2.innerHTML = str;
   money.innerHTML = contmoney  + ".00元";
   del();
}
function del(){
    var but = document.querySelectorAll(".selected tbody td button");
    var tbody3 =  document.querySelector('.selected tbody');
    for( var i = 0; i < but.length; i ++){
        but[i].onclick = function(){
            
            delete selectData[this.dataset.id];
            localStorage.setItem('shoppingCart', JSON.stringify(selectData));
            tbody3.removeChild(this.parentNode.parentNode);
            var totalPrice = document.querySelector('.selected th strong');
            totalPrice.innerHTML=parseFloat(totalPrice.innerHTML) - parseFloat(this.parentNode.parentNode.children[3].innerHTML)+'.00元';
        }
    }

}
window.addEventListener("storage",function(){
    init()
})

