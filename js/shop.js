var selectData = {};
function init() {   //用来存储所有的商品信息，以及所有的商品
   
    selectData = JSON.parse(localStorage.getItem("shopsetItem", selectData)) || {}; //第一次的时候取到的为空,但是JSON.parse返回的结果为Null
    console.log(selectData)
    shopmai();
}


//请求数据
ajax("http://127.0.0.1:5500/js/shoppingData.json", function (data) {
    Randdom(data);
    addEvent()
})
init();
//创建商品结构
function Randdom(data) {
    var str = "";
    var tbody1 = document.querySelector(".product tbody");
    data.forEach(function (ele, index) {
        var colors = "";//用来存储每条数据里面的所有颜色信息
        ele.list.forEach(function (ele) {
            colors += '<span data-id="' + ele.id + '">' + ele.color + '</span>'
        })
        str += '<tr>' +
            '<td>' +
            '<img src="' + ele.list[index].img + '" />' +
            '</td>' +
            '<td>' +
            '<p>' + ele.name + '</p>' +
            '<div class="color">' + colors +
            '</div>' +
            '</td>' +
            '<td>' + ele.list[0].price + '.00元</td>' +
            '<td>' +
            '<span>-</span>' +
            '<strong>0</strong>' +
            '<span>+</span>' +
            '</td>' +
            '<td><button>加入购物车</button></td>' +
            '</tr>'
    })
    tbody1.innerHTML = str;
}
function addEvent() {
    var trs = document.querySelectorAll(".product tbody tr");//获取到所有的行
    for (var i = 0; i < trs.length; i++) {
        active(trs[i], i)
    }
}


//添加商品操作事件
function active(dom, n) {
    var tds = dom.children, //当前行里所有的td
        img = tds[0].children[0], //商品图片
        imgSrc = img.getAttribute('src'), //商品图片的地址
        name = tds[1].children[0].innerHTML,  //商品的名字
        colors = tds[1].children[1].children, // 所有颜色按钮
        money = parseFloat(tds[2].innerHTML),//价格
        spans = tds[3].querySelectorAll("span"), //加减按钮
        strong = tds[3].querySelector("strong"), //数量
        but = tds[4].children[0],//加入购物车的按钮
        num = 0; //选中商品的数量

    //颜色按钮点击功能
    var last = null, //上一次选中的按钮
        colorValue = "",//选中的颜色
        colorId = ""; //选中商品对应的id
    for (var i = 0; i < colors.length; i++) {
        colors[i].index = i;//添加一个自定义的属性为索引值
        colors[i].onclick = function () {
            last && last != this && (last.className = "");
            this.className = this.className ? "" : "active";
            colorId = this.className ? this.dataset.id : "";
            colorValue = this.className ? this.innerHTML : "";
            imgSrc = this.className ? ' images/img_0' + (n + 1) + '-' + (this.index + 1) + '.png' : 'images/img_0' + (n + 1) + '-1.png';
            img.src = imgSrc;
            last = this;//把当前次点击的对象赋值给last。当前次点击的对象相对于下次要点击的时候它是上一个对象（last）
        }
    }
    //减按钮点击
    spans[0].onclick = function () {
        num--;
        if (num < 0) {
            num = 0;
        }
        strong.innerHTML = num;
    }
    //加按钮点击
    spans[1].onclick = function () {
        num++;
        strong.innerHTML = num;
    }
    //加入购物车功能
    but.onclick = function () {
        if (colorValue == "") {
            alert("请添加颜色");
            return;
        }
        if (num == 0) {
            alert("请添加数量");
            return;
        }
        //selectData对象赋值
        selectData[colorId] = {
            "id": colorId,
            "name": name,
            "color": colorValue,
            "price": money,
            "src": imgSrc,
            "time": new Date().getTime(),
            "num": num,
        }
        localStorage.setItem("shopsetItem", JSON.stringify(selectData));
        //加入购物车后让所有已经选择的内容还原
        img.src = 'images/img_0' + (n + 1) + '-1.png';
        last.className = "";
        strong.innerHTML = num = 0;
        shopmai()//存储完数据后要渲染购物车里商品的结构
    }
}

//创建购物车商品结构
function shopmai() {
    var money = document.querySelector(".selected strong");
    var tbody = document.querySelector(".selected tbody");
    var str = "";
    var contmoney = 0; //总共多少钱
    var newArray = Object.values(selectData);//ES7里面的方法,用来取到对象里的所有value，并把取到的内容放到一个数组里
    //对已选择的商品进行排序
    newArray.sort(function (g1, g2) {
        return g2.time - g1.time
    })
    newArray.forEach(function (ele, index) {
        str += '<tr>' +
            '<td>' +
            '<img src=" ' + ele.src + '" />' +
            '</td>' +
            '<td>' +
            '<p> ' + ele.name + ' </p>' +
            '</td>' +
            '<td>' + ele.color + '</td>' +
            '<td>' + ele.price + '.00元</td>' +
            '<td>x' + ele.num + '</td>' +
            '<td><button data-id = "' + ele.id + '">删除</button></td>' +
            '</tr> '
        contmoney += ele.price * ele.num;
    })
    money.innerHTML = contmoney + ".00元";
    tbody.innerHTML = str;
    del() //结构创建完成了，添加删除功能
}


function del() {
    var tbody = document.querySelector('.selected tbody');
    var buts = document.querySelectorAll(".selected tbody button");
    for (var i = 0; i < buts.length; i++) {
        buts[i].onclick = function () {
            //删除对象里的数据
            delete selectData[this.dataset.id];
            //删除DOM结构
            localStorage.setItem("shopsetItem", JSON.stringify(selectData));
            tbody.removeChild(this.parentNode.parentNode);
            //更新总价格
            var strong = document.querySelector(".selected strong");
            strong.innerHTML = parseFloat(strong.innerHTML) - parseFloat(this.parentNode.parentNode.children[3].innerHTML) * this.parentNode.parentNode.children[4].innerHTML.charAt(1) + ".00元"
        }
    }
}

window.addEventListener("storage", function () {
    init();
})