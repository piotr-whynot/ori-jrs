
function textinPopup(H,W,ID){ 
    $.get("./popup.php?f=textinPopup&ID="+ID,
    function(data){
        popup(H,W,data);
    });
}

function pageinPopup(H,W,page){ 
$.get(page,
    function(data){
        popup(H,W,data);
    });
}

/***************************/
//@Author: Adrian "yEnS" Mato Gondelle
//@website: www.yensdesign.com
//@email: yensamg@gmail.com
//@license: Feel free to use it, but keep this credits please!                    
/***************************/

//SETTING UP OUR POPUP
//0 means open; 1 means closed;
var popupStatus = 0;

function popup(H, W, data){
    //centering with css
    centerPopup(H, W);
    if (popupStatus){
    }
    //load popup
    loadPopup(data);
    //CLOSING POPUP
    //Click the x event!
    $("#popupWindowClose").click(function(){
        closePopup();
    });
    //Click out event!
    $("#popupBackground").click(function(){
        closePopup();
    });
    //Press Escape event!
    $(document).keypress(function(e){
        if(e.keyCode==27 && popupStatus==1){
            closePopup();
        }
    });
}

//loading popup with jQuery magic!
function loadPopup(data){
    //loads popup only if not yet open
    if(popupStatus==0){
        $("#popupBackground").css({
            "opacity": "0.7"
        });
        $("#popupBackground").fadeIn("slow");
        $("#popupWindowContents").html(data);
        //adjusting contents height
        $("#popupWindow").toggle('slide',{direction: "left" });
       // $("#popupWindow").show();
        popupStatus = 1;
        totalH = $('#popupWindowContents')[0].scrollHeight;
        totalH=Math.min(totalH, $(window).height()*0.9);
        $("#popupWindowContents").css({
            "height":totalH,
        });


    }else{
        $("#popupWindowContents").html(data);
    }
}

//disabling popup with jQuery magic!
function closePopup(){
    //disables popup only if it is opened
    if(popupStatus==1){
        $("#popupWindow").toggle('slide',{direction: "left" });
        $("#popupBackground").fadeOut("slow");
        popupStatus = 0;
    }
}

function centerPopup(H, W){
    // H and W are fraction of window size
    wh=$(window).height();
    ww=$(window).width();
    if(H>1){
        // if H and W are given in pixels
        H=Math.min(0.9, H/wh);
        W=Math.min(0.8, W/ww);
    }
    popupheight=wh;
    popupwidth=ww*W;
    $("#popupWindow").css({
        "height":popupheight,
        "width":popupwidth,
    });
    contentsheight=(wh)*H; //first guess, as prescribed
    console.log(contentsheight);

//    $("#popupWindowContents").css({
//        "height":contentsheight,
//    });
    //only need force for IE6
    $("#popupBackground").css({
        "height": wh
    });
}       
  
