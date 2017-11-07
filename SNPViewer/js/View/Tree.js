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
                this._calculateX(0,this.tree_root);
                this.tree_layout="standard";
                
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
                var factor = height/this.leaf_number;
                height= this.height=this.leaf_number*factor; 
               
                this.row_height = (((this.height/this.leaf_number)));
                this.row_offset =(this.row_height/2)-1.1;
            
              
                var cluster =  d3.cluster()
                .size([height,width]);
                cluster(this.tree_root);
                this.nodes=this.tree_root.descendants();
                this.terminal_nodes=[];
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
                        this.terminal_nodes.push(node)
			this.leaf_y_positions[node.data.name]=node.y;
                    }
                }
                this.terminal_nodes.sort(function(a,b){
                    return a.y-b.y;
                });
                var pos=5;
                for (var i in this.terminal_nodes){
                    var node=this.terminal_nodes[i];
                    node.y=pos;
                    this.leaf_y_positions[node.data.name]=pos;
                    pos+=this.row_height;
                    if (i>0){
                        var prev_node=this.terminal_nodes[i-1];
                        if (node.parent === prev_node.parent){
                            node.parent.y = prev_node.y+(this.row_height/2);
                        }
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