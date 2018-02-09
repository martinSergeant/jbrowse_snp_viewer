define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'dojo/Deferred',
    'JBrowse/Store/SeqFeature/VCFTabix',
    'JBrowse/Model/SimpleFeature'
],
function(
    declare,
    lang,
    array,
    all,
    Deferred,
    VCFTabix,
    SimpleFeature
) {

    return declare(VCFTabix, {
      
    constructor: function( args ) {
         var config= this.config;
        //this is a hack
        //the only way i could find to overide the method
        this.indexedData.parseLine= function(line) {
            var fields = line.split( "\t" );
            fields[fields.length-1] = fields[fields.length-1].replace(/\n$/,''); // trim off the newline
            var start = parseInt(fields[this.index.columnNumbers.start-1])-1;
            var len = fields[3].length;
            if (fields[4]==='<DEL>'){
                len=20000;
            }
            var arr = fields[7].split(";");
            var info={};
            for (var i  in arr){
                var arr2=arr[i].split("=");
                info[arr2[0]]=arr2[1];
            }
         
            
            //indels have base before therefore actual length is 1 less
            if (len>1){
                len-=1;
                start+=1;
            }
            var end = start+len;
           
        var item = { // note: index column numbers are 1-based
            ref:   fields[this.index.columnNumbers.ref-1],
            _regularizedRef: this.browser.regularizeReferenceName( fields[this.index.columnNumbers.ref-1] ),
            start: start,
            end:   end,
            fields: fields,
            info:info
        };
        return item;
    };
     
    },
    _getFeatures: function( query, featureCallback, finishedCallback, errorCallback ) {
        var thisB = this;
        var samples =this.header.samples;
        samples[samples.length-1]=samples[samples.length-1].trim();
        thisB.getVCFHeader().then( function() {
            thisB.indexedData.getLines(
                query.ref || thisB.refSeq.name,
                query.start,
                query.end,
                function( line ) {
                    if (thisB.filters){
                        for (var i in thisB.filters){
                            for (var ii in thisB.filters[i]){
                                if (thisB.filters[i][line.info[i]]){
                            return;
                            }
                            }
                        }
                    }
                        var alts = line.fields[4].split(",");
                        var ref_base=line.fields[3];
                        var r_len= ref_base.length;
                        var a_len= alts[0].length;
                        var del=false;
                        var mut_type="SUB";
                        if (alts[0]==='<DEL>'){
                            del=true;
                        }
                        //small indel
                        if (a_len !== r_len){
                            if (alts[0].length>ref_base.length){
                                mut_type="INS";
                            }
                            else{
                                mut_type="DEL";
                            }
                        }
                    
			for (var a =9;a<line.fields.length;a++){
                            var gt= parseInt(line.fields[a]);
                            if (gt!==0){
                                var sample=samples[a-9];
                                var end = line.end;
                                var desc=ref_base+">"+alts[gt-1];
                                if (del){
                                    end=parseInt(line.fields[a].split(":")[1]);
                                    if (end-line.start<200){
                                        continue;
                                    }
                                    desc = (end-line.start)+" bp deletion"
                                }
                              
                                var name =sample;
                                if (thisB.config.strain_label){
                                    name = thisB.metadata[sample][thisB.config.strain_label];
                                }
                                var data = {
                                 	start:line.start,
                                	end:end,
                                        mut_type:mut_type,
                        		name:name,
                                        tree_id:sample,
                        		seq_id:line.fields[0] ,
                                        base:alts[gt-1],
                        		description: desc,
                                        uniqueID: sample+"_"+line.fields[2]
                                        
				}
                                for (var id in line.info){
                                    data[id]=line.info[id];
                                }
                               
                               
                                var nf = new SimpleFeature({
                                    data:data
                                });
                           featureCallback( nf );
                                
                            }
                
                    
			}
                    //return f;
                },
                finishedCallback,
                errorCallback
            );
        }, errorCallback );
    },
    
      /** fetch and parse the VCF header lines */
    getVCFHeader: function() {
        var thisB = this;
        return this._parsedHeader || ( this._parsedHeader = function() {
            var d = new Deferred();
            var reject = lang.hitch( d, 'reject' );

            thisB.indexedData.indexLoaded.then( function() {
                var maxFetch = thisB.indexedData.index.firstDataLine
                    ? thisB.indexedData.index.firstDataLine.block + thisB.indexedData.data.blockSize - 1
                    : null;

                thisB.indexedData.data.read(
                    0,
                    maxFetch,
                    function( bytes ) {
                        thisB.parseHeader( new Uint8Array( bytes ) );
                        if (thisB.header.metadata){
                              thisB.metadata=JSON.parse(thisB.header.metadata);
                              delete thisB.header.metadata;
                        }
                        thisB.info_types={};
                        if (thisB.config.info){
                        for (var id in thisB.config.info){
                            var desc= thisB.header.info[id].description[0];
                            thisB.info_types[id]={
                                description:desc,
                                types:thisB.config.info[id]
                                };
                            }
                        }
                      
                        d.resolve( thisB.header );
                    },
                    reject
                );
             },
             reject
            );

            return d;
        }.call(this));
    },
     
    
    


     
    });
});
