var Node = function (x, y){

  EventMachine.apply(this);

  function domWalk_ (node, func, catchSiblings){
    func (node);
    if (node.firstChild) { domWalk_ (node.firstChild, func, true);}
    if (node.nextSibling && catchSiblings){ domWalk_ (node.nextSibling, func, true);}
  };

  var this_ = this;

  this.childList = [];
  this.parentNode;

  this.outEdges  = [];
  this.inEdge;

  this.startEdit = function(){
    console.log("Edit");
  };

  this.endEdit = function(){
    console.log("End edit");
  }

  this.moveTo = function (x,y){
    this.container.setBBox ({x:x,y:y});

    // Move edges
    for (var i = 0 ; i < this_.outEdges.length; i++){
      this_.outEdges[i].setAttribute("x1", x );
      this_.outEdges[i].setAttribute("y1", y );
    };
    if (this_.inEdge){
      this_.inEdge.setAttribute("x2",x);
      this_.inEdge.setAttribute("y2",y);
    }
  };

  this.remove = function (deep){
    //Remove edges
    for (var i = this_.outEdges.length-1; i>=0; i--){ this_.outEdges[i].parentNode.removeChild(this_.outEdges[i]); }
    if (this_.inEdge.parentNode){ this_.inEdge.parentNode.removeChild(this_.inEdge);}

    if (deep) { //Remove childs
      for (var i = this_.childList.length-1; i>=0; i--){ this_.childList[i].remove(deep);}
    } else { //Relocate childs
      for (var i = this_.childList.length-1; i>=0; i--){ this_.parentNode.addChild(this_.childList[i])}
    }

    this_.container.parentNode.removeChild(this_.container);
    this_.trigger("delete", this_);
    delete (this_);
  }

  var removeChild_ = function(node){
    for (var i = this_.childList.length; i >= 0; i--){
      if (this_.childList[i] == node){ this_.childList.splice(i,1); }
    }
  }

  this.addChild = function (child){
    var childBox = child.container.getBBox();
    var thisBox  = this_.container.getBBox();

    //Draw edges
    var edge = document.createElementNS(XMLNS, "line");
    edge.setAttribute("x1", thisBox.x + thisBox.width/2 );
    edge.setAttribute("y1", thisBox.y + thisBox.height/2);
    edge.setAttribute("x2", childBox.x + childBox.width/2 );
    edge.setAttribute("y2", childBox.y + childBox.height/2 );

    document.getElementById("edges").appendChild(edge);

    child.bind("delete", removeChild_);

    this_.outEdges.push(edge);
    this_.childList.push (child);

    child.setParent(this_, edge);
  };

  this.setParent = function(node, edge){
    this_.parentNode = node;
    this_.inEdge = edge;
  }

  function init_ (){
    // Init content
    var contentBlock = document.createElement ("div")
    contentBlock.className = this_.className;
    contentBlock.innerHTML = "" +
        "<div class='shadow'></div>"+
        "<div class='wrapper'>" +
          "<h3>Scale & Rhythm</h3>" +
          "<p>" +
            "This page falls somewhere between a tool and an essay." +
            " It sets out to explore how the intertwined typographic" +
            " concepts of scale and rhythm can be encouraged to shake" +
            " a leg on web pages. Drag the colored boxes along the" +
            " scale to throw these words anew. For the most part, this" +
            " text is just a libretto for the performance you can play" +
            " upon it." +
          "</p>" +
        "</div>"

    document.getElementById("content").appendChild(contentBlock);
    this_.contentElement = contentBlock;

    // Create node;
    this_.container = contentBlock;
    this_.moveTo(x,y);

  };
  init_();
}

var nodeConfig = {
  radius    : 100,
  className : "node-content"
};

Node.prototype = nodeConfig;

