define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/on',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Select',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'JBrowse/View/Dialog/WithActionBar'
],
function(
    declare,
    dom,
    on,
    focus,
    NumberSpinner,
    Select,
    Button,
    CheckBox,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        title: 'SNP Options',

        constructor: function(args) {
            this.tree= args.tree;
            this.color_by=args.color_by;
            this.setCallback     = args.setCallback || function() {};
            this.info=args.info;
            this.tree_type=args.tree.tree_layout;
            this.filters=args.filters;
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: dojo.hitch(this, function() {
                     var tree_height = this.treeHeightSpinner.getValue();
                     var filters={};
                     for (var i=0;i<this.filters.length;i++){
                         if (this.checkBoxes[i].get("checked")){
                             var obj = filters[this.filters[i][0]];
                             if (!obj){
                                 obj={};
                                 filters[this.filters[i][0]]=obj;
                             }
                             obj[this.filters[i][2]]=true;
                         }
                     }
                     this.setCallback && this.setCallback(tree_height,this.colorBySelect.getValue(),this.treeTypeSelect.getValue(),filters);
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: dojo.hitch(this, function() {
                    this.cancelCallback && this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function(/* callback */) {
            //dojo.addClass(this.domNode, 'windowSizeDialog');

            this.treeHeightSpinner = new NumberSpinner({
                value: this.tree.height,
                smallDelta: 50
            });
            var options = [
                    { label: 'Base', value: 'base', selected: true }
                ];
            for (var id in this.info){
                options.push({label:this.info[id]['description'],value:id});
            }
            this.colorBySelect = new Select({
                name: 'gc_mode_select',
                options:options ,
                value: this.color_by
            });
            this.treeTypeSelect=new Select({
                name:'tree_type_select',
                options:[{label:"Standard",value:"standard"},
                    {label:"Step",value:"step"}
                ],
                value:this.tree_type
            });
            this.checkBoxes=[];
            for (var i in this.filters){
                var filter = this.filters[i];
                this.checkBoxes.push(new CheckBox({
                    name:filter[0]+filter[2],
                    checked:filter[3]
                }) );
            }

         
            var elements = [
                
                dom.create('label', { for: 'window_size', innerHTML: 'Tree Height', style: {"font-size":"14px",display: 'inline-block', width: '100px'} }),
                this.treeHeightSpinner.domNode,
                dom.create('br'),
                dom.create('br'),
                dom.create('label', { for: 'window_delta', innerHTML: 'Color By', style: {"font-size":"14px",display: 'inline-block', width: '100px' } }),
                this.colorBySelect.domNode,
                dom.create('br'),
                dom.create('br'),
                dom.create('label', { for: 'window_delta', innerHTML: 'Tree Layout', style: {"font-size":"14px",display: 'inline-block', width: '100px' } }),
                this.treeTypeSelect.domNode,
                dom.create('br'),
                dom.create('br'),
                dom.create('label', { for: 'gc_mode_select', innerHTML: 'Filters', style: {"font-size":"14px",display: 'inline-block', width: '100px' } }),
                dom.create('br'),
                dom.create('br'),
                dom.create('label', { for: 'gc_mode_select', innerHTML: 'Field', style: {"font-weight":"bold",display: 'inline-block', width: '150px' } }),
                dom.create('label', { for: 'gc_mode_select', innerHTML: 'Value', style: {"font-weight":"bold",display: 'inline-block', width: '100px' } }),
                dom.create('label', { for: 'gc_mode_select', innerHTML: 'Filter', style: { "font-weight":"bold",display: 'inline-block',width: '100px' } })
     
           
            ];
            for (var i=0;i<this.filters.length;i++){
                var filter= this.filters[i];
                elements.push(dom.create('br'));
                elements.push( dom.create('label', { for: 'gc_mode_select', innerHTML:filter[1] , style: {display: 'inline-block', width: '150px' } }));
                elements.push( dom.create('label', { for: 'gc_mode_select', innerHTML:filter[2] , style: {display: 'inline-block', width: '100px' } }));
                elements.push(this.checkBoxes[i].domNode);
            }
            
            this.set('content',elements );

            this.inherited(arguments);
        },

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
 