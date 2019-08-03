
function textinPopup(H,W,ID){ 
    $.get("/ori/common/popup.php?f=textinPopup&ID="+ID,
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
        $("#popupWindow").fadeIn("slow");
        popupStatus = 1;
    }else{
        $("#popupWindowContents").html(data);
    }
}

//disabling popup with jQuery magic!
function closePopup(){
    //disables popup only if it is opened
    if(popupStatus==1){
        $("#popupBackground").fadeOut("slow");
        $("#popupWindow").fadeOut("slow");
        popupStatus = 0;
    }
}


function centerPopup(H, W){
    //request data for centering
    if(H>1){
        H=Math.min(0.8, H/$(window).height());
        W=Math.min(0.8, W/$(window).width());
    }
    popupheight=$(window).height()*H;
    popupwidth=$(window).width()*W;
    $("#popupWindow").css({
        "position": "fixed",
        "height":popupheight,
        "width":popupwidth,
        "top": $(window).height()*(1-H)/2,
        "left": $(window).width()*(1-W)/2,
    });

    $("#popupWindowContents").css({
        "height":popupheight-20,
    });
    //only need force for IE6
    $("#popupBackground").css({
        "height": $(window).height()
    });
}       
   