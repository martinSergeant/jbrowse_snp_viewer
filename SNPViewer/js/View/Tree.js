define(
    ['dojo/_base/declare','https://d3js.org/d3.v4.min.js'],
    function(declare, d3 ) {
        return declare( null,{
            constructor:function(args){
                this.nwk=args;
                this.max_x=0;
                this.max_depth=0;
                this.leaf_number=0;
                this.tree_root = d3.hierarchy(this._parseNewick(this.nwk));
                this._calculateX(0,this.tree_root)
                
            },
            
            calculateTree:function(height,width,layout){
                if (!layout){
                    layout="standard";
                }
                this.height=height;
                this.width=width;
               
                if (layout === 'standard'){
                    this.xScale = d3.scaleLinear().domain([0,this.max_x]).range([0,this.width]);
                }
                else{
                    this.xScale = d3.scaleLinear().domain([0,this.max_depth]).range([0,this.width]);
                }
                
                this.leaf_y_positions={};
                
                this.row_height = Math.round(((this.height/this.leaf_number)-1));
                this.row_offset = Math.round(this.row_height/2)
              
               var cluster =  d3.cluster()
                .size([height,width]);
                cluster(this.tree_root);
                this.nodes=this.tree_root.descendants();
             
                for (var i in this.nodes){
                    var node = this.nodes[i];
                    node.y= Math.round(node.x);
                    if (layout === 'standard'){
                        node.x=this.xScale(node.x_pos);
                    }
                    else{
                        node.x=this.xScale(node.depth);
                    }
                    if (! node.children){				
			this.leaf_y_positions[node.data.name]=node.y;
                    }
                }    
            },
            drawTree:function(context){  
                context.beginPath();
                for (var i in  this.nodes){
                    var d = this.nodes[i];
                    var p=d.parent;
                    if (!p){
			p=d;
                    }
                    context.moveTo(d.x,d.y);
                    context.lineTo(p.x,d.y);
                    context.lineTo(p.x,p.y);
                }   
                context.stroke(); 
            },
            
            _calculateX:function(x_pos,node){
              
                if (node.data.length){	
                    x_pos+=node.data.length;
                }
                node.x_pos=x_pos;
                if (x_pos>this.max_x){
                    this.max_x=x_pos;
                }
                if (node.depth>this.max_depth){
                    this.max_depth=node.depth;
                }
                var children = node.children;
                if (children){
                    for (var i in children){
			this._calculateX(x_pos,children[i]);
                    }                  
                }
                else{
                    this.leaf_number++;
                }
            },
            
            _parseNewick:function (a){
                for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){
                    var n=s[t];
                    switch(n){
			case"(":var c={};r.children=[c],e.push(r),r=c;break;
			case",":var c={};e[e.length-1].children.push(c),r=c;break;
			case")":r=e.pop();break;case":":break;
			default:var h=s[t-1];")"===h||"("===h||","===h?r.name=n:":"===h&&(r.length=parseFloat(n));
                    }
                }
                return r;
            }      
        });
});