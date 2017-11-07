/**
 * Just an HTMLFeatures track that uses the VariantDetailsMixin to
 * provide a variant-specific feature detail dialog.
 */

define([
    'dojo/_base/declare',
    'dojo/request/xhr',
    'dojo/_base/array',
    'JBrowse/View/Track/CanvasFeatures',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'JBrowse/Util',
    'SNPViewer/View/SNPLayout',
    'SNPViewer/View/SNPGlyph',
    'SNPViewer/View/Tree',
    'SNPViewer/View/Dialog/SNPDialog',
    'dojo/dom-style'
    ],
    function(
        declare,
        xhr,
	array,
        CanvasFeatures,
        lang,
	domConstruct,
	Util,
	SNPLayout,
	SNPGlyph,
        Tree,
        SNPDialog,
        domStyle
      ){
    
    return declare( CanvasFeatures, {
        constructor: function(args) {
            var self = this;
            this.showLabels=false;
            this.nwk_file = this.config.nwk_file;
            var url = this.config.baseUrl+ this.nwk_file;
            
            
           
         
            this.config.style.strandArrow=false;
            this.config.maxFeatureScreenDensity=200;
            xhr.get(url,{sync:true})
            .then( function( data ) {
                self.tree = new Tree(data);
                if (self.config.tree_height===0){
                    var height=self.tree.leaf_number*10;
                    if (height>600){
                        height=600;
                    }
                    self.config.tree_height=height;
                }
                self.tree.calculateTree(self.config.tree_height,200,"standard");      
            });
            
        },
         _defaultConfig: function() {
            return Util.deepUpdate(lang.clone(this.inherited(arguments)), {
                tree_height:0,
                color_by:"base"
            });
        },
        
        _trackMenuOptions: function() {
            var track = this;
            var options = this.inherited(arguments);
            options.push({
                label: 'SNP Options',
                onClick: function() {
                    new SNPDialog({
                        tree:track.tree,
                        color_by:track.config.color_by,
                        setCallback: function(tree_height,color_by) {
                            track.tree.calculateTree(tree_height,200,"standard");
                            track.treeCanvas.height=track.tree.height;
                            var ctx = track.treeCanvas.getContext("2d");
                            track.tree.drawTree(ctx);
                            track.config.tree_height=tree_height;
                            track.config.color_by=color_by;
                            track.browser.publish('/jbrowse/v1/v/tracks/replace', [track.config]);
                            //track.layout.rectangles={};   
                           // track.redraw();
                            //need to expunge all saved features
                        
                         
                        },
                        info:track.store.info_types
                    }).show();
                }
            });
            return options;
        },
           
        
         

        setViewInfo: function( genomeView, heightUpdate, numBlocks, trackDiv, widthPct, widthPx, scale ) {
        this.inherited( arguments );
     
        this.treeCanvas = domConstruct.create('canvas', { style: {cursor: "default", position: "absolute", zIndex: 50 }}, trackDiv);
      
        this.treeCanvas.width = this.tree.width;
        this.treeCanvas.height=this.tree.height;
        var ctx = this.treeCanvas.getContext("2d");
        this.tree.drawTree(ctx);
     
       

       
    },
    updateStaticElements: function( coords ) {
        this.inherited( arguments );
        this.treeCanvas.style.left = coords.x+"px";
        var id =  "label_"+this.config.label;
        var el = document.getElementById(id);
        if (el){
            domStyle.set(id,"z-index",100);
        }
        
    },
 _getLayout: function( scale ) {
        if( ! this.layout || this._layoutpitchX != 4/scale ) {
            // if no layoutPitchY configured, calculate it from the
            // height and marginBottom (parseInt in case one or both are functions), or default to 3 if the
            // calculation didn't result in anything sensible.
            var pitchY = this.getConf('layoutPitchY') || 4;
            this.layout = new SNPLayout({ pitchX: 4/scale,tree:this.tree, maxHeight: this.getConf('maxHeight') });
            this._layoutpitchX = 4/scale;
        }
       // this.layout.height = this.tree.height+this.tree.row_height;

        return this.layout;
   },
 getGlyph: function( viewArgs, feature, callback, errorCallback ) {
        var glyphClassName = 'SNPViewer/View/SNPGlyph'; //this.getConfForFeature( 'glyph', feature );
        var glyph, interestedParties;
        if(( glyph = this.glyphsLoaded[glyphClassName] )) {
            callback( glyph );
        }
        else if(( interestedParties = this.glyphsBeingLoaded[glyphClassName] )) {
            interestedParties.push( callback );
        }
        else {
            var thisB = this;
            this.glyphsBeingLoaded[glyphClassName] = [callback];
            require( [glyphClassName], function( GlyphClass ) {

                         glyph = thisB.glyphsLoaded[glyphClassName] =
                             new GlyphClass({ track: thisB, config: thisB.config, browser: thisB.browser });

                         array.forEach( thisB.glyphsBeingLoaded[glyphClassName], function( cb ) {
                                            cb( glyph );
                                        });

                         delete thisB.glyphsBeingLoaded[glyphClassName];

                     });
        }
    }




});
});