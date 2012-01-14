var Canvas = function (rootSvgNode){
  var this_ = this;
  var helper_;

  this.nodes = [];

  this.activeNode=null;

  var removeFromList = function (node){
    for (var i = this_.nodes.length-1 ; i >= 0; i-- ){
      if (this_.nodes[i] === node){ this_.nodes.splice(i,1); }
    }
  };

  this.addNode = function (cx,cy, parentNode){

    cx = cx || 450;
    cy = cy || 150;

    var newNode = new Node (cx, cy);

    newNode.bind("delete", removeFromList )
    this_.nodes.push(newNode);

    this_.container.appendChild(newNode.container)
//    this.container.appendChild(newNode.container);

    if (parentNode){ parentNode.addChild (newNode); }

    return newNode;
  };

  function isTargetNode_ (node) {
    var target = node;

    while ( target != this_.container && !target.classList.contains(nodeConfig.className)){
      target = target.parentNode;
    }

    if (target.classList.contains(nodeConfig.className)){
      for (var i = 0; i< this_.nodes.length; i++){
        if (this_.nodes[i].container == target) {
          return this_.nodes[i];
        }
      }
    }

    return false;
  }

  this_.setActiveNode = function(node){
    if (this_.activeNode && this_.activeNode!== node){
      this_.activeNode.container.classList.remove ("active");
    }

    var nodeBox = node.container.getBBox();

    this_.activeNode = node;
    helper_.setAttribute ("cx", nodeBox.x + nodeBox.width/2);
    helper_.setAttribute ("cy", nodeBox.y + nodeBox.height/2);

    this_.activeNode.container.classList.add ("active");

  };

  function drag_ (node, config){
    var position = {};

    function move (e){
      var offset = {};

      if (!position.mouse){ position.mouse = {x : e.clientX, y: e.clientY} }

      offset.x = position.mouse.x - e.clientX;
      offset.y = position.mouse.y - e.clientY;

      node.moveTo (position.el.x - offset.x + position.el.height/2, position.el.y - offset.y + position.el.width/2);
    }

    position.el    = node.container.getBBox();

    document.addEventListener("mousemove", move, false);
    document.addEventListener ("mouseup", function unbind (){

      if (config && config.dragEnd){config.dragEnd(node)}
      document.removeEventListener("mousemove", move ,   false);
      document.removeEventListener("mouseup"  , unbind, false);
    }, false)
  }

  function diveToNode (node, func){
    for (var i = 0 ; i < node.childList.length; i++){
      if (node.childList[i].childList.length){ diveToNode (node.childList[i], func); };
      func(node.childList[i]);
    }
  }

  function mouseDown_ (e){
    var target = isTargetNode_(e.target);
    if (target){
      this_.setActiveNode(target);
      drag_(target);

      if (e.ctrlKey){ diveToNode (target, drag_) }
    }
  };

  this.unsetEdited = function(){
    this_.editedNode.container.classList.remove("edited");
    this_.editedNode = null;
  }

  this.setEdited = function (node){
    if (this_.editedNode && this_.editedNode != node){
      this_.unsetEdited();
    }
    this_.editedNode = node;
    this_.editedNode.container.classList.add("edited");
  }

  var dblclick_ = function (e){
    var targetNode = isTargetNode_(e.target);
    if (targetNode && targetNode != this_.editedNode){
      this_.setEdited (targetNode);
      targetNode.startEdit();
    } else if (targetNode){
      this_.unsetEdited ();
      targetNode.endEdit();
    }
  }

  this.draw = function(obj){
    function dive (nodeProp, parentNode){
      var node = this_.addNode (nodeProp.position.x,nodeProp.position.y,parentNode);
      if (nodeProp.childNodes ){
        for (var i = 0; i < nodeProp.childNodes.length; i++){ dive(nodeProp.childNodes[i],node);}
      }
      return node;
    }
    this_.setActiveNode(dive(obj));


  }
  this.exportToObj = function(){
    var exportObj= {};

    function dive (node, obj){
      obj.position = {x : node.container.getBBox().x , y :node.container.getBBox().y};
      obj.content = "Test";

      if (node.childList.length){
        obj.childNodes = obj.childNodes || []
        for (var i = 0; i < node.childList.length; i++){
          obj.childNodes.push(dive(node.childList[i],{}));
        }
      }
      return obj
    }

    dive (this_.nodes[0], exportObj);
    return exportObj;
  };

  this.save = function (){
    window.localStorage.setItem("mindMap", JSON.stringify(this_.exportToObj()));
  };

  this.load = function (){
    return JSON.parse(window.localStorage.getItem("mindMap"));
  }

  var init_ = function (){
    this_.container = document.getElementById("content");

    this_.svgContainer = rootSvgNode;

    this_.container.addEventListener("mousedown", mouseDown_ , false);
    this_.container.addEventListener("mouseup", function(){
      if (this_.activeNode) this_.setActiveNode(this_.activeNode);
    } , false);

    this_.container.addEventListener("dblclick", dblclick_ , false);



    helper_= document.getElementById("helper");
    helper_.setAttribute("r", this_.helperRadius);
    helper_.setAttribute( "class","helper");

    helper_.addEventListener ("mousedown", function(e){
      var newNode = this_.addNode(e.clientX, e.clientY, this_.activeNode);
      drag_(newNode, {dragEnd: function(node){this_.setActiveNode(node)}});
    },false)

    window.addEventListener("keydown", function(e){
      if (e.keyCode == 46){ // Delete
        var removedNode = this_.activeNode;
        this_.setActiveNode(removedNode.parentNode);

        if (e.ctrlKey && removedNode.parentNode){ // ctrl + delete (deep remove)
          removedNode.remove(true);
        } else if (removedNode.parentNode) {     // delete (Remove with save child)
          removedNode.remove();
        }
      }

    },false)
  }
  init_ ();
}

Canvas.prototype = {
  helperRadius : 130
}